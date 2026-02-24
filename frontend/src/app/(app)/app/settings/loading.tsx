import SettingsShell from "./SettingsShell";
import SettingsCard from "./_components/SettingsCard";
import SettingsField from "./_components/SettingsField";
import SettingsSkeleton from "./_components/SettingsSkeleton";
import SettingsCategoryContainer from "./_components/SettingsCategoryContainer";

export default function Loading() {
  return (
    <SettingsShell>
      <SettingsCard title="Settings">
        <SettingsField label="Email">
          <SettingsSkeleton className="settingsSkeletonSmall" />
        </SettingsField>
        <SettingsField label="Login Method">
          <SettingsSkeleton className="settingsSkeletonSmall" />
        </SettingsField>
        <SettingsField label="Default Currency" className="border-none">
          <SettingsSkeleton className="settingsSkeletonSmall" />
        </SettingsField>
      </SettingsCard>

      <SettingsCard title="Categories & Tags">
        <SettingsCategoryContainer label="Categories">
          <SettingsSkeleton className="settingsSkeletonBig" />
        </SettingsCategoryContainer>
        <SettingsCategoryContainer label="Tags">
          <SettingsSkeleton className="settingsSkeletonBig" />
        </SettingsCategoryContainer>
      </SettingsCard>

      <SettingsCard title="Display">
        <SettingsField label="Dark" className="border-none">
          <SettingsSkeleton className="settingsSkeletonSmall" />
        </SettingsField>
      </SettingsCard>

      <button className="button1Round w-[7em] mx-auto my-12">Sign Out</button>
    </SettingsShell>
  );
}
