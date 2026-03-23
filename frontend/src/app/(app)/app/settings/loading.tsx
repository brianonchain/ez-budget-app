import SettingsShell from "./SettingsShell";
import SettingsCard from "./_components/SettingsCard";
import SettingsField from "./_components/SettingsField";
import SettingsSkeleton from "./_components/SettingsSkeleton";
import SettingsCategoryContainer from "./_components/SettingsCategoryContainer";

export default function Loading() {
  return (
    <SettingsShell>
      {/*--- Active Sheet Settings ---*/}
      <SettingsCard title="Active Sheet Settings">
        <SettingsField label="Active Sheet" className="border-none">
          <SettingsSkeleton size="lg" className="sm:flex-1" />
        </SettingsField>
        <div className="my-3 px-6 pt-4 pb-6 flex flex-col gap-6 rounded-3xl border border-inputOutlineBorder">
          <SettingsCategoryContainer label="Categories" addButtonLabel="Category">
            <SettingsSkeleton size="lg" />
          </SettingsCategoryContainer>
          <SettingsCategoryContainer label="Tags" addButtonLabel="Tag">
            <SettingsSkeleton size="lg" />
          </SettingsCategoryContainer>
        </div>
        <SettingsField label="Default Currency">
          <SettingsSkeleton size="sm" />
        </SettingsField>
        <SettingsField label="Export Sheet">
          <SettingsSkeleton size="sm" />
        </SettingsField>
        <SettingsField label="Share This Sheet">
          <SettingsSkeleton size="sm" />
        </SettingsField>
        <SettingsField label="Delete Sheet">
          <SettingsSkeleton size="sm" />
        </SettingsField>
      </SettingsCard>
      {/*--- Account Settings ---*/}
      <SettingsCard title="Account">
        <SettingsField label="Sign Out">
          <SettingsSkeleton size="sm" />
        </SettingsField>
        <SettingsField label="Email">
          <SettingsSkeleton size="sm" />
        </SettingsField>
        <SettingsField label="Login Method">
          <SettingsSkeleton size="sm" />
        </SettingsField>
        <SettingsField label="Delete Account">
          <SettingsSkeleton size="sm" />
        </SettingsField>
      </SettingsCard>
      {/*--- Display Settings ---*/}
      <SettingsCard title="Display">
        <SettingsField label="Dark" className="border-none">
          <SettingsSkeleton size="sm" />
        </SettingsField>
      </SettingsCard>
    </SettingsShell>
  );
}
