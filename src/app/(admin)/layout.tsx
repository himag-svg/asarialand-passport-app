import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/user";
import { isStaffRole } from "@/lib/constants/roles";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Header } from "@/components/layout/header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isStaffRole(user.role)) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
