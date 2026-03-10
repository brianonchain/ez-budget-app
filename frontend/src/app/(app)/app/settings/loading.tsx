import SettingsShell from "./SettingsShell";
import SettingsCard from "./_components/SettingsCard";
import SettingsField from "./_components/SettingsField";
import SettingsSkeleton from "./_components/SettingsSkeleton";
import SettingsCategoryContainer from "./_components/SettingsCategoryContainer";

export default function Loading() {
  return (
    <SettingsShell>
      <SettingsCard title="Account">
        <SettingsField label="Email">
          <SettingsSkeleton className="settingsSkeletonSmall" />
        </SettingsField>
        <SettingsField label="Login Method">
          <SettingsSkeleton className="settingsSkeletonSmall" />
        </SettingsField>
      </SettingsCard>

      <SettingsCard title="Workspace">
        <SettingsField label="Active Workspace">
          <SettingsSkeleton className="settingsSkeletonSmall" />
        </SettingsField>
        <SettingsField label="Default Currency">
          <SettingsSkeleton className="settingsSkeletonSmall" />
        </SettingsField>
        <SettingsCategoryContainer label="Categories" addButtonLabel="Category">
          <SettingsSkeleton className="settingsSkeletonBig" />
        </SettingsCategoryContainer>
        <SettingsCategoryContainer label="Tags" addButtonLabel="Tag">
          <SettingsSkeleton className="settingsSkeletonBig" />
        </SettingsCategoryContainer>
      </SettingsCard>

      <SettingsCard title="Display">
        <SettingsField label="Dark" className="border-none">
          <SettingsSkeleton className="settingsSkeletonSmall" />
        </SettingsField>
      </SettingsCard>

      <button className="buttonSignOut">Sign Out</button>
    </SettingsShell>
  );
}
