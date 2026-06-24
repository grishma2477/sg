import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">{title}</h2>
    <div className="text-gray-700 space-y-3 leading-relaxed">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="text-indigo-600 text-sm mb-6 inline-block">← Back</Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: June 2026 · SG (Sawa Gaadi) · Nepal</p>

          <Section title="1. Who We Are">
            <p>SG (Sawa Gaadi) is a ride-sharing platform operating in Nepal. We connect riders who need transportation with drivers who provide it. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
            <p>For questions, contact us at: <strong>privacy@sawagaadi.com</strong></p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong>Account Information:</strong> Your full name and phone number when you register. We do not collect or store passwords for most users — authentication is via SMS OTP.</p>
            <p><strong>Location Data:</strong> Your GPS coordinates while using the app. Riders' location is collected when requesting a ride. Drivers' location is collected continuously while they are online to enable ride matching and real-time tracking.</p>
            <p><strong>Payment Information:</strong> Your wallet balance and transaction history. We do not store credit/debit card numbers directly — payments are processed through eSewa and Khalti. We store transaction IDs and amounts.</p>
            <p><strong>Identity Documents (KYC):</strong> Photos of government-issued ID and driver's license (drivers only), uploaded to verify identity. Stored securely via Cloudinary.</p>
            <p><strong>Device Information:</strong> Device type (iOS/Android), push notification token for sending you ride updates. We do not read any other apps on your device.</p>
            <p><strong>Usage Data:</strong> Ride history, ratings given and received, app activity logs for debugging.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p><strong>To provide the service:</strong> Match you with nearby drivers, calculate fares, process payments, send ride notifications.</p>
            <p><strong>For safety:</strong> Monitor for fraudulent activity, investigate safety incidents, calculate driver safety scores.</p>
            <p><strong>For support:</strong> Resolve disputes, investigate complaints, respond to your inquiries.</p>
            <p><strong>For improvement:</strong> Analyse aggregated usage patterns (not linked to individual users) to improve the service.</p>
            <p>We do <strong>not</strong> sell your personal information to third parties. We do not use your data for advertising purposes beyond SG's own service.</p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>We share data with the following third-party services only as required to operate SG:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Google Maps Platform</strong> — for map display, address search, and route calculation. Google's Privacy Policy applies.</li>
              <li><strong>Firebase (Google)</strong> — for push notifications (ride updates, bid alerts). Device tokens are shared. Google's Privacy Policy applies.</li>
              <li><strong>eSewa / Khalti</strong> — for payment processing. Payment amounts and transaction IDs are shared. Their respective privacy policies apply.</li>
              <li><strong>Cloudinary</strong> — for storing KYC document photos. Files are stored in Nepal-region servers where available.</li>
              <li><strong>Sparrow SMS / Twilio</strong> — for sending OTP verification codes via SMS.</li>
              <li><strong>Sentry</strong> — for error tracking. Error reports may include device info and app state (no payment or location data).</li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p><strong>Account data:</strong> Retained while your account is active, and for 2 years after deletion to comply with financial regulations.</p>
            <p><strong>Ride history:</strong> Retained for 3 years for dispute resolution and financial record-keeping.</p>
            <p><strong>Location data:</strong> Real-time location is not permanently stored. Pickup/dropoff coordinates for completed rides are retained as part of ride records (3 years).</p>
            <p><strong>KYC documents:</strong> Retained for as long as your driver account is active, plus 5 years after account closure as required by Nepali financial regulations.</p>
          </Section>

          <Section title="6. Your Rights">
            <p><strong>Access your data:</strong> Contact privacy@sawagaadi.com to request a copy of all personal data we hold about you.</p>
            <p><strong>Correct your data:</strong> Update your name in the app under Profile. Contact support for corrections to other fields.</p>
            <p><strong>Delete your account:</strong> Go to Profile → Settings → Delete Account, or email privacy@sawagaadi.com. Deletion is processed within 30 days. Some records may be retained as described in Section 5.</p>
            <p><strong>Withdraw location consent:</strong> You can deny location permission at any time in your phone settings. Note that the app cannot function without location access.</p>
          </Section>

          <Section title="7. Security">
            <p>Your data is transmitted over HTTPS/TLS. Authentication tokens are short-lived (15 minutes) with 30-day refresh tokens. Sensitive tokens are stored in iOS Keychain / Android Keystore (mobile) or HTTP-only cookies (web). We conduct regular security reviews and have bug bounty contact at security@sawagaadi.com.</p>
          </Section>

          <Section title="8. Children">
            <p>SG is not intended for users under 18. We do not knowingly collect information from children. If you believe a minor has registered, contact privacy@sawagaadi.com immediately.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We will notify you of significant changes via push notification and in-app banner at least 14 days before they take effect. Continued use after the effective date constitutes acceptance.</p>
          </Section>

          <Section title="10. Contact">
            <p>SG Operations (Sawa Gaadi Pvt. Ltd.)<br />Kathmandu, Nepal<br />Email: privacy@sawagaadi.com<br />Phone: +977-01-XXXXXXX</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
