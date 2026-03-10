function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  const appName = "EZ Budget App";
  const supportEmail = "support@ezbudgetapp.com";

  return (
    <>
      <div className="bg-bg1 text-text1 min-h-screen flex flex-col gap-[12px] mx-auto p-8">
        <h1 className="font-bold">Privacy Policy</h1>
        <p>Effective Date: April 26, 2025</p>

        <h2 className="font-bold">Information We Collect</h2>
        <p>
          When you sign in with Google, we collect your basic profile information. Specifically, we collect your name, your email address,
          and your profile picture.
        </p>

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

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-2xl font-semibold tracking-tight">Terms of Service</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
          By accessing or using {appName}, you agree to these Terms of Service.
        </p>

        <div className="mt-8 space-y-10">
          <Section title="1. Description of Service">
            <p>
              {appName} is a budgeting web application designed to help users manage personal financial information entered by the user.
            </p>
            <p>The service is provided on an “as is” and “as available” basis.</p>
          </Section>

          <Section title="2. Accounts">
            <p>You sign in using a valid Google account. You are responsible for maintaining the confidentiality of your account access.</p>
          </Section>

          <Section title="3. User Responsibilities">
            <p>You agree not to:</p>
            <BulletList
              items={[
                <>Use the service for unlawful purposes</>,
                <>Attempt to gain unauthorized access to the system</>,
                <>Interfere with or disrupt the service</>,
              ]}
            />
          </Section>

          <Section title="4. Data Accuracy">
            <p>You are responsible for the accuracy of any budgeting or financial data you enter into the app.</p>
          </Section>

          <Section title="5. Availability">
            <p>We strive to keep the service available, but do not guarantee uninterrupted access or error-free operation.</p>
          </Section>

          <Section title="6. Termination">
            <p>We may suspend or terminate access if these Terms are violated. You may stop using the service at any time.</p>
          </Section>

          <Section title="7. Disclaimer">
            <p>
              {appName} does not provide financial, legal, or tax advice. Any information provided is for general informational purposes
              only.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, {appName} shall not be liable for any damages arising from or related to your use of
              the service.
            </p>
          </Section>

          <Section title="9. Changes to Terms">
            <p>We may update these Terms from time to time. Continued use of the service constitutes acceptance of the updated Terms.</p>
          </Section>

          <Section title="10. Governing Law">
            <p>These Terms are governed by the laws of your applicable jurisdiction.</p>
          </Section>

          <Section title="11. Contact">
            <p>
              For questions regarding these Terms, contact{" "}
              <a className="underline underline-offset-4" href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </>
  );
}
