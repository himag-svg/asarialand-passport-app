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
      <div className="flex flex-1 flex-col min-w-0 relative">
        {/* Subtle tropical ambient glow */}
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-gold/[0.02] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-accent/[0.02] blur-[100px] pointer-events-none" />

        <Header user={user} />
        <main className="relative flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
