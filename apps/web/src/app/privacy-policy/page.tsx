import type { Metadata } from "next";
import { HomeHeader } from "@/components/home-header";
import { SiteFooter } from "@/components/site-footer";
import "../home.css";
import "../policy-page.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Shahzadpur Travels",
  description: "Privacy policy for Shahzadpur Travels online bus ticket booking.",
};

const CONTACT_EMAIL = "shahzadpurtravels1980@gmail.com";

export default function PrivacyPolicyPage() {
  return (
    <div className="home-page policy-page">
      <HomeHeader />

      <main className="policy-main">
        <h1 className="policy-title">Privacy Policy</h1>

        <article className="policy-body">
          <section className="policy-section">
            <p>
              We, at Shahzadpur Travels, ensure to maintain the highest standards
              of transactional security and quality so that your information and
              details are secure. To know more about our policies please read the
              following to learn about our information gathering and dissemination
              practices.
            </p>
            <p>
              <strong>Note:</strong> Kindly note that our privacy policy is subject
              to change at any time without prior notice. To ensure that you are
              aware of any changes, please review this policy at regular intervals.
            </p>
            <p>
              By visiting this website you agree to be bound by the terms and
              conditions of this Privacy Policy. Any disagreement will be subject
              to the jurisdiction of Dhaka, Bangladesh.
            </p>
            <p>
              By mere use of the Website, you express consent to our use and
              disclosure of your personal information in accordance with this
              Privacy Policy. This Privacy Policy is incorporated into and subject
              to the Terms of Use.
            </p>
          </section>

          <section className="policy-section">
            <h2>
              Collection of Personally Identifiable Information and other
              Information
            </h2>
            <p>
              When you use our Website, we store your browsing information so that
              we can provide services and features that meet your needs.
            </p>
            <p>
              In general, you can browse the Website without telling us who you
              are or revealing any personal information about yourself. Once you
              give us your personal information, you are not anonymous to us. You
              always have the option to not provide information by choosing not to
              use a particular service or feature on the Website. We compile your
              usage behavior and personal information and the information on an
              aggregate basis to internal research to better enhance our product
              offerings to serve you better. This information may include the URL
              that you just came from (whether this URL is on our Website or not),
              which URL you next go to (whether this URL is on our Website or not),
              your computer browser information, and your IP address.
            </p>
            <p>
              We use data collection devices such as &quot;cookies (small file
              stored on your computer)&quot; on certain pages of the Website to help
              analyse our web page flow, measure promotional effectiveness, and
              promote trust and safety. We offer certain features that are only
              available through the use of a &quot;cookie&quot;.
            </p>
            <p>
              Additionally, third parties may also place cookies or similar devices
              on our website, which we cannot control. If you choose to buy on the
              Website, we collect information about your buying behaviour.
            </p>
            <p>
              If you transact with us, we collect some additional information, such
              as a billing address, a credit / debit card number and a credit /
              debit card expiration date and/ or other payment instrument details. If
              you post messages or leave a feedback for us, we will collect that
              information you provide to us. We retain this information as
              necessary to resolve disputes, provide customer support and
              troubleshoot problems as permitted by law.
            </p>
            <p>
              If you send us personal correspondence, such as emails or letters, or
              if other users or third parties send us correspondence about your
              activities or postings on the Website, we may collect such
              information into a file specific to you.
            </p>
            <p>
              We collect personally identifiable information (email address, name,
              and phone number.) from you when you set up a free account with us. We
              do use your contact information to send you offers based on your
              previous orders and your interests. However, data protection is a
              matter of trust and your privacy is important to us. We shall therefore
              use your name and other information which relates to you in the manner
              set out in this Privacy Policy. We will only collect information where
              it is necessary for us to do so and we will only collect information.
            </p>
          </section>

          <section className="policy-section">
            <h2>Sharing of personal information</h2>
            <p>
              We will only share personal information with companies, organizations
              or individuals outside the periphery of Shahzadpur Travels if we have
              a good-faith and believe that access, use, preservation or disclosure
              of the information is reasonably necessary to:
            </p>
            <ul>
              <li>
                Meet any applicable law, regulation, legal process or enforceable
                governmental request.
              </li>
              <li>
                Enforce applicable Terms of Service, including investigation of
                potential violations.
              </li>
              <li>
                Detect, prevent, or otherwise address fraud, security or technical
                issues.
              </li>
              <li>
                Protect against harm to the rights, property or safety of Shahzadpur
                Travels, our users or the public as required or permitted by law.
              </li>
            </ul>
            <p>
              We may share aggregated, non-personally identifiable information
              publicly and with our partners – like bus operators, agents or
              connected sites. For example, we may share information publicly to
              show trends about the general use of our services. We may also share
              consolidated information provided by like-minded users with bus
              operators without ever taking individual names, email ids or other
              contact details.
            </p>
            <p>
              If Shahzadpur Travels is involved in a merger, acquisition or asset
              sale, we will continue to ensure the confidentiality of your personal
              information and give notice before personal information is
              transferred or becomes subject to a different privacy policy.
            </p>
          </section>

          <section className="policy-section">
            <h2>Collecting and Using Your Personal Data</h2>
            <p>
              <strong>Information Collected while Using the Application</strong>
            </p>
            <p>
              While using Our Application, in order to provide features of Our
              Application, We may collect, with your prior permission:
            </p>
            <ul>
              <li>Information regarding your location</li>
              <li>
                Information from your Device&apos;s phone book (contacts list)
              </li>
              <li>
                Pictures and other information from your Device&apos;s camera and
                photo library
              </li>
            </ul>
            <p>
              We use this information to provide features of Our Service, to improve
              and customize Our Service. The information may be uploaded to the
              Company&apos;s servers and/or it may be simply stored on your device.
            </p>
            <p>
              You can enable or disable access to this information at any time,
              through Your Device settings. We don&apos;t store or share any of your
              personal data to any other third party channel. Your data security is
              important to us and we only process this data through Shahzadpur
              Travels own channel to ensure features of our services.
            </p>
            <p>
              If you have any questions about this Privacy Policy, You can contact
              us by email:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>Contact @ Shahzadpur Travels</a>
            </p>
          </section>

          <section className="policy-section">
            <h2>Security Precautions</h2>
            <p>
              Our Website has stringent security measures in place to protect the
              loss, misuse, and alteration of the information under our control.
              Whenever you change or access your account information, we offer the
              use of a secure server. As informed earlier in this policy, once we
              receive your information we ensure strict security guidelines to
              protect it against unauthorized access. For example, we use SSL
              security to protect users against identity theft &amp; spyware.
            </p>
          </section>

          <section className="policy-section">
            <h2>Your Consent</h2>
            <p>
              By using the Website and/ or by providing your information, you
              consent to the collection and use of the information you disclose on
              the Website in accordance with this Privacy Policy, including but not
              limited to your consent for sharing your information as per this
              privacy policy.
            </p>
            <p>
              We may decide to make amends to this privacy policy without prior
              information, therefore, it is suggested you review this page at
              regular intervals. This ensures you are up-to-date with the details of
              the information we collect, how we use it, and under what circumstances
              we disclose it.
            </p>
          </section>
        </article>

        <hr className="policy-divider" />
      </main>

      <SiteFooter />
    </div>
  );
}
