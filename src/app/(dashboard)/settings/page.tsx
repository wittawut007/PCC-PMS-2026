import { getSettingsData } from "@/app/actions/phase4";
import { SettingsSystemView } from "@/components/settings/SettingsSystemView";

export default async function SettingsPage() {
  const data = await getSettingsData();

  return (
    <SettingsSystemView
      rolePermissions={data.rolePermissions}
      policyNotice={data.policyNotice}
    />
  );
}
