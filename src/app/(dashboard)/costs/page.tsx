import { getBudgetData } from "@/app/actions/phase4";
import { BudgetCostView } from "@/components/finance/BudgetCostView";

interface CostsPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function CostsPage({ searchParams }: CostsPageProps) {
  const { projectId } = await searchParams;
  const data = await getBudgetData(projectId);

  return (
    <BudgetCostView
      allProjects={data.allProjects}
      currentProject={data.currentProject}
      summary={data.summary}
      items={data.items}
    />
  );
}
