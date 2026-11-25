import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ContentBreadcrumb } from "@/components/layout/ContentBreadcrumb";
import { NotificationProvider } from "@/components/common/MobileNotification";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <NotificationProvider>
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar user={session.user} />
        <div className="flex-1 bg-white flex flex-col min-w-0">
          <main className="flex-1 overflow-y-auto px-6 md:px-8 pt-5 pb-8 max-w-[1800px] w-full mx-auto">
            <div className="mb-4">
              <ContentBreadcrumb />
            </div>
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
