import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">{title}</h2>
    <div className="text-gray-700 space-y-3 leading-relaxed">{children}</div>
  </section>
);

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="text-indigo-600 text-sm mb-6 inline-block">← Back</Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: June 2026 · SG (Sawa Gaadi) · Nepal</p>

          <Section title="1. Acceptance">
            <p>By creating a SG account or using the SG app, you agree to these Terms. If you disagree, do not use the service. These Terms constitute a binding agreement between you and Sawa Gaadi Pvt. Ltd. ("SG", "we", "us").</p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be at least 18 years old to use SG. Drivers must additionally hold a valid Nepali driving license for the vehicle type they register, and must pass SG's KYC verification before accepting rides.</p>
          </Section>

          <Section title="3. The Service">
            <p>SG is a technology platform that connects riders who request transportation with independent drivers who provide it. SG is not a transportation company. Drivers are independent contractors, not SG employees. SG is not liable for the actions, conduct, or performance of any driver.</p>
          </Section>

          <Section title="4. Rider Responsibilities">
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate pickup and dropoff locations.</li>
              <li>Be ready at the pickup location when the driver arrives.</li>
              <li>Treat drivers with respect. Harassment, discrimination, or abuse will result in account suspension.</li>
              <li>Ensure your wallet has sufficient balance before requesting a ride.</li>
              <li>Not request rides for illegal purposes or to transport prohibited items.</li>
              <li>Wear your seatbelt (car/SUV rides).</li>
            </ul>
          </Section>

          <Section title="5. Driver Responsibilities">
            <ul className="list-disc pl-5 space-y-2">
              <li>Maintain a valid driving license and vehicle registration at all times.</li>
              <li>Keep your vehicle in safe, roadworthy condition.</li>
              <li>Follow all Nepali traffic laws.</li>
              <li>Only accept rides for routes you can safely complete.</li>
              <li>Treat riders with respect. Harassment, discrimination, or abuse will result in permanent account termination and may be reported to authorities.</li>
              <li>Do not manipulate location data, GPS, or the fare calculation system.</li>
              <li>Only go online when you are available and willing to complete rides.</li>
            </ul>
          </Section>

          <Section title="6. Fare & Payment">
            <p><strong>Bidding system:</strong> Drivers submit bids in response to ride requests. Riders choose and accept a bid. The accepted bid price is the final fare.</p>
            <p><strong>Fare estimate:</strong> Estimates shown before booking are indicative only. Final fare is the accepted bid amount.</p>
            <p><strong>Payment:</strong> All rides are paid via the SG wallet. Riders must top up their wallet before booking. Wallet funds are deducted immediately when a ride is completed.</p>
            <p><strong>Platform fee:</strong> SG charges a platform fee (typically 15–20%) on each completed ride. This is deducted from the driver's earnings, not charged to the rider separately.</p>
            <p><strong>Refunds:</strong> If a driver cancels after acceptance, the ride amount is not charged. Disputed charges must be raised within 24 hours of the ride via the Help section.</p>
          </Section>

          <Section title="7. Cancellation Policy">
            <p><strong>Rider cancellation:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Before a driver accepts your bid: Free, no charge.</li>
              <li>After acceptance, within 2 minutes: Free cancellation.</li>
              <li>After acceptance, after 2 minutes: Rs 50 cancellation fee charged to your wallet.</li>
              <li>After the driver has arrived at pickup: Rs 100 cancellation fee.</li>
            </ul>
            <p><strong>Driver cancellation:</strong> Frequent driver cancellations reduce the driver's safety score and may result in account restriction. Drivers who cancel after arriving at pickup are penalised more heavily.</p>
          </Section>

          <Section title="8. Ratings & Safety">
            <p>After each completed ride, both rider and driver are asked to rate the experience (1–5 stars). Ratings affect a driver's safety score. Drivers with consistently low safety scores may be suspended. Riders with consistently low ratings may lose booking privileges.</p>
            <p>Safety concerns (filed at ≤3 stars) are reviewed by SG's safety team within 48 hours.</p>
          </Section>

          <Section title="9. Prohibited Conduct">
            <p>The following will result in immediate permanent suspension and may be reported to law enforcement:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Physical or verbal assault of any user, driver, or SG staff.</li>
              <li>Sexual harassment or misconduct.</li>
              <li>Transporting illegal goods or substances.</li>
              <li>Fraudulent use of payment methods.</li>
              <li>Creating fake accounts or manipulating the bidding system.</li>
              <li>Circumventing the platform (arranging rides off-app to avoid fees).</li>
            </ul>
          </Section>

          <Section title="10. Disputes">
            <p>Fare disputes must be raised within 24 hours via Help & Support in the app. SG will review ride GPS data, driver logs, and chat records. SG's decision is final.</p>
            <p>Any legal dispute between you and SG is governed by the laws of Nepal. The courts of Kathmandu, Bagmati Province have exclusive jurisdiction.</p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p>SG's liability to you for any incident is limited to the fare paid for that specific ride. SG is not liable for delays, accidents, loss of property, or personal injury arising from a ride. Drivers carry their own vehicle insurance as required by Nepali law.</p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>We may update these Terms at any time. We will notify you via push notification and in-app alert at least 14 days before significant changes take effect. Continued use after the effective date is acceptance of the new terms.</p>
          </Section>

          <Section title="13. Contact">
            <p>Sawa Gaadi Pvt. Ltd.<br />Kathmandu, Nepal<br />Email: legal@sawagaadi.com<br />Help: help@sawagaadi.com</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
