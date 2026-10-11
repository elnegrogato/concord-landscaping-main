'use client';

import { NavBar } from '@/components/public/blocks/NavBar';
import { Footer } from '@/components/public/blocks/Footer';

const effectiveDate = 'October 11, 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8F9F1] text-[#2D3A3A] p-4 md:p-8 lg:p-12 font-sans">
      <NavBar />
      <main className="w-full max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1B4332] mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#2D3A3A]/60">
            Effective date: {effectiveDate} &nbsp;|&nbsp; Version 1.0 (draft)
          </p>
          <div className="mt-4 p-4 bg-[#D4A373]/20 border border-[#D4A373]/40 rounded-xl text-sm">
            <strong>Notice:</strong> This privacy policy is a draft prepared for Concord
            Landscaping based on the site&apos;s current data practices. It should be reviewed
            by qualified legal counsel before publication and updated as practices change.
          </div>
        </div>

        <section className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              1. Who We Are
            </h2>
            <p className="leading-relaxed text-sm">
              Concord Landscaping (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) is a
              landscape design, hardscaping, irrigation, and lawn maintenance company operating
              in Concord, North Carolina, and surrounding Cabarrus County communities since 2001.
              This privacy policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website at concordlandscaping.com (the
              &quot;Site&quot;) and when you contact us about our services.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              2. Information We Collect
            </h2>
            <p className="leading-relaxed text-sm">
              We collect information that you provide directly to us, information collected
              automatically, and information from third-party sources.
            </p>
            <h3 className="font-bold text-base mt-4 mb-2">Information you provide</h3>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>
                <strong>Contact and project information:</strong> when you use our contact form,
                we collect your name, email address, phone number, the service you are interested
                in, and details about your project.
              </li>
              <li>
                <strong>Consent preferences:</strong> we record whether you have consented to be
                contacted about your project via email or phone, the version of this policy you
                agreed to, and the date and page where consent was given.
              </li>
              <li>
                <strong>Communications:</strong> if you email or call us, we retain the content
                of your communication and related metadata.
              </li>
            </ul>

            <h3 className="font-bold text-base mt-4 mb-2">Information collected automatically</h3>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>
                <strong>Usage data:</strong> device information, browser type, IP address, pages
                viewed, time and duration of visits, and referring website.
              </li>
              <li>
                <strong>Analytics cookies:</strong> if you accept analytics, we use Google
                Analytics via Google Tag Manager to understand site usage. You can opt out at
                any time by configuring your browser or using Google&apos;s opt-out tool.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>Respond to your inquiry and provide a quote or consultation.</li>
              <li>Send project updates and follow-up communications you have consented to.</li>
              <li>Improve our Site, services, and customer experience.</li>
              <li>Analyze site usage and performance (via Google Analytics).</li>
              <li>Prevent fraud and enforce our terms.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              4. Legal Basis for Processing (EEA/UK Residents)
            </h2>
            <p className="leading-relaxed text-sm">
              If you are in the European Economic Area or the United Kingdom, we process your
              personal information based on: (a) your consent where you have opted in; (b)
              performance of a contract or steps to enter a contract (e.g., responding to your
              quote request); and (c) our legitimate interests (e.g., improving our services,
              preventing fraud), balanced against your rights.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              5. Sharing and Disclosure
            </h2>
            <p className="leading-relaxed text-sm">
              We do not sell your personal information. We may share information with:
            </p>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>
                Service providers who help us operate our business (email delivery, data hosting,
                CRM/analytics), each bound by confidentiality and data-processing obligations.
              </li>
              <li>
                Legal, regulatory, or law-enforcement authorities when required by law or to
                protect rights and safety.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              6. Cookies and Tracking Technologies
            </h2>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>
                <strong>Necessary cookies:</strong> essential for the Site to function (e.g.,
                session management). These are always on.
              </li>
              <li>
                <strong>Analytics cookies:</strong> Google Analytics cookies are used only if
                enabled in our environment and only if you do not opt out.
              </li>
              <li>
                <strong>Managing cookies:</strong> you can control cookies through your browser
                settings. Blocking essential cookies may break Site functionality.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              7. Data Retention
            </h2>
            <p className="leading-relaxed text-sm">
              We retain your information for as long as needed to provide services and comply
              with legal obligations (including warranty, tax, and contract record-keeping
              requirements), or for as long as you remain a contact in our system without
              opting out or requesting deletion. You may request deletion at any time (see
              Section 10).
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              8. Data Security
            </h2>
            <p className="leading-relaxed text-sm">
              We implement reasonable administrative, technical, and physical safeguards to
              protect your personal information. No method of transmission over the Internet or
              electronic storage is 100% secure, however, and we cannot guarantee absolute
              security.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              9. Children&apos;s Privacy
            </h2>
            <p className="leading-relaxed text-sm">
              Our Site and services are not directed at children under 13. We do not knowingly
              collect personal information from children under 13. If we learn we have collected
              such data, we will delete it promptly.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              10. Your Rights and Choices
            </h2>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>
                <strong>Opt out of marketing:</strong> use the unsubscribe link in any email
                or reply STOP to any text message we send.
              </li>
              <li>
                <strong>Withdraw consent:</strong> you may withdraw consent for project
                communications at any time.
              </li>
              <li>
                <strong>Access/correct/delete:</strong> you may request access to, correction
                of, or deletion of your personal information by contacting us (Section 12). We
                may retain records required for legal or business purposes.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              11. California (CCPA/CPRA)
            </h2>
            <p className="leading-relaxed text-sm">
              California residents have rights to know, correct, delete, and opt out of the
              &quot;sale&quot; or sharing of personal information. We do not sell personal
              information. To exercise these rights, contact us using the details below. We do
              not discriminate against you for exercising your rights.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              12. Contact Us
            </h2>
            <p className="leading-relaxed text-sm">
              To ask questions about this policy or to exercise your rights, contact Concord
              Landscaping:
            </p>
            <ul className="space-y-1 text-sm">
              <li>Email: info@concordlandscaping.com</li>
              <li>Phone: (704) 886-4240</li>
              <li>Location: Concord, North Carolina 28025</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
