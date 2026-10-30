import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectWizardClient } from "./ProjectWizardClient";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch users for personnel assignment in Step 3
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { name: "asc" },
  });

  return <ProjectWizardClient initialUsers={users} currentUserRole={session.user.role} />;
}
