import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries/user";
import { ClientSidebar } from "@/components/layout/client-sidebar";
import { Header } from "@/components/layout/header";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <ClientSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
