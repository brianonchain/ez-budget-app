export default function PrivacyPage() {
  return (
    <div className="bg-lightBg2 dark:bg-darkBg1 text-lightText1 dark:text-darkText1 min-h-screen flex flex-col gap-[12px] mx-auto p-8">
      <h1 className="font-bold">Privacy Policy</h1>
      <p>Effective Date: April 26, 2025</p>

      <h2 className="font-bold">Information We Collect</h2>
      <p>When you sign in with Google, we collect your basic profile information. Specifically, we collect your name, your email address, and your profile picture.</p>

      <h2 className="font-bold">How We Use Your Information</h2>
      <p>We use your information to authenticate your account. We do not share your information with any third parties.</p>

      <h2 className="font-bold">Data Retention</h2>
      <p>We retain your basic profile information only while your account is active.</p>

      <h2 className="font-bold">Contact Us</h2>
      <p>EZ Budget App is an offshoot project of Nulla Pay.</p>

      <p>
        Email: support@nullapay.com
        <br />
        Website: https://www.nullapay.com
      </p>
    </div>
  );
}
