'use client';

import { NavBar } from '@/components/public/blocks/NavBar';
import { Footer } from '@/components/public/blocks/Footer';

const effectiveDate = 'October 11, 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9F1] text-[#2D3A3A] p-4 md:p-8 lg:p-12 font-sans">
      <NavBar />
      <main className="w-full max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1B4332] mb-4">
            Terms of Use
          </h1>
          <p className="text-sm text-[#2D3A3A]/60">
            Effective date: {effectiveDate} &nbsp;|&nbsp; Version 1.0 (draft)
          </p>
          <div className="mt-4 p-4 bg-[#D4A373]/20 border border-[#D4A373]/40 rounded-xl text-sm">
            <strong>Notice:</strong> These terms are a draft prepared for Concord Landscaping.
            They should be reviewed by qualified legal counsel before publication.
          </div>
        </div>

        <section className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              1. Agreement to Terms
            </h2>
            <p className="leading-relaxed text-sm">
              Welcome to concordlandscaping.com (&quot;the Site&quot;), operated by Concord
              Landscaping (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) of Concord, North
              Carolina. By accessing or using the Site, you agree to be bound by these Terms of
              Use (&quot;Terms&quot;) and our Privacy Policy. If you do not agree to these Terms,
              do not use the Site.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              2. Use of the Site
            </h2>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>
                <strong>Eligibility:</strong> You must be at least 18 years old, or have parental
                or guardian consent, to use the Site.
              </li>
              <li>
                <strong>Licensed access:</strong> We grant you a limited, non-exclusive,
                non-transferable, revocable license to view and use the Site for personal,
                non-commercial purposes.
              </li>
              <li>
                <strong>Prohibited activities:</strong> You may not (a) copy, modify, or distribute
                Site content without permission; (b) use automated systems, scrapers, or bots to
                access the Site without authorization; (c) attempt to gain unauthorized access to
                our systems; (d) interfere with or disrupt the Site or its security; (e) submit
                false or misleading information through our forms; or (f) use the Site for any
                illegal or unauthorized purpose.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              3. Intellectual Property
            </h2>
            <p className="leading-relaxed text-sm">
              The Site and its original content, features, and functionality (including text,
              graphics, logos, photos, and code) are owned by Concord Landscaping and are
              protected by copyright, trademark, and other intellectual property laws. You may not
              reproduce, distribute, or create derivative works without our express written
              permission.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              4. Services and Quotes
            </h2>
            <p className="leading-relaxed text-sm">
              The Site allows you to request information and quotes for landscape design,
              hardscaping, irrigation systems, and lawn maintenance services. Submitting a
              contact form does not create a binding service contract. Services are provided only
              under a written agreement or purchase order issued by Concord Landscaping. Quote
              validity, pricing, availability, and scope are subject to a site evaluation and may
              change. We reserve the right to accept or decline any request for services.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              5. Communications
            </h2>
            <p className="leading-relaxed text-sm">
              By submitting your contact information, you consent to be contacted by Concord
              Landscaping regarding your inquiry or project in the manner and for the purposes you
              authorized at the time of submission, including follow-up by email, phone, or text.
              You may opt out or withdraw consent at any time by using the unsubscribe link in any
              email, replying &quot;STOP&quot; to any text message, or contacting us directly.
              See our Privacy Policy for more information.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              6. Third-Party Links
            </h2>
            <p className="leading-relaxed text-sm">
              The Site may contain links to third-party websites (including social media and
              review platforms). We do not control those sites and are not responsible for their
              content or practices. Links are provided for convenience only and do not constitute
              an endorsement.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              7. Disclaimer of Warranties
            </h2>
            <p className="leading-relaxed text-sm">
              The Site and its content are provided on an &quot;as is&quot; and &quot;as
              available&quot; basis without warranties of any kind, either express or implied,
              including but not limited to implied warranties of merchantability, fitness for a
              particular purpose, and non-infringement. We do not warrant that the Site will be
              uninterrupted, secure, or error-free. Content on the Site (including pricing and
              availability) is for general information only and may change without notice.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              8. Limitation of Liability
            </h2>
            <p className="leading-relaxed text-sm">
              To the fullest extent permitted by law, Concord Landscaping shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages, or any loss
              of profits, revenue, data, or use, arising out of or relating to your use of the
              Site or your reliance on content on the Site, even if advised of the possibility of
              such damages. Our total aggregate liability to you for any claim arising out of or
              relating to these Terms or the Site shall not exceed the amount of $100.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              9. Indemnification
            </h2>
            <p className="leading-relaxed text-sm">
              You agree to indemnify and hold harmless Concord Landscaping, its owners, employees,
              and agents from any claim, loss, damage, liability, expense, or demand (including
              reasonable attorneys&apos; fees) arising out of your use of the Site, your violation
              of these Terms, or your violation of any rights of another.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              10. Modifications to These Terms
            </h2>
            <p className="leading-relaxed text-sm">
              We may update these Terms from time to time. The updated Terms will be posted on the
              Site with a revised effective date. Your continued use of the Site after changes
              constitutes acceptance of the new Terms. We encourage you to review these Terms
              periodically.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              11. Governing Law and Disputes
            </h2>
            <p className="leading-relaxed text-sm">
              These Terms are governed by the laws of the State of North Carolina, without regard
              to its conflict-of-laws principles. Any dispute arising out of or relating to these
              Terms or the Site shall be resolved exclusively in the state or federal courts
              located in Cabarrus County, North Carolina, and you consent to the personal
              jurisdiction of those courts.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">
              12. Contact
            </h2>
            <p className="leading-relaxed text-sm">
              Questions about these Terms may be directed to Concord Landscaping:
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
