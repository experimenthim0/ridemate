const PrivacyPolicy = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">
      Privacy Policy
    </h1>
    <div className="bg-white rounded-2xl p-8 space-y-4 text-gray-700 leading-relaxed text-sm">
      <p>
        <strong>Last updated:</strong> February 2026
      </p>
      <h2 className="text-lg font-bold font-[var(--font-heading)] pt-2">
        1. Information We Collect
      </h2>
      <p>
        We collect the following personal information when you register: name,
        phone number, and email address (for students). For drivers, we collect
        name, phone number, auto registration number, and UPI payment ID.
      </p>
      <h2 className="text-lg font-bold font-[var(--font-heading)] pt-2">
        2. How We Use Your Information
      </h2>
      <p>
        Your information is used solely for the purpose of facilitating
        auto-rickshaw seat bookings within the college campus. Phone numbers are
        shared with drivers to coordinate rides. Email addresses are used for
        account recovery purposes.
      </p>
      <h2 className="text-lg font-bold font-[var(--font-heading)] pt-2">
        3. Data Security
      </h2>
      <p>
        All passwords are encrypted using industry-standard bcrypt hashing.
        Authentication is handled via JSON Web Tokens (JWT). We do not store
        payment information — all payments are made directly via UPI between
        students and drivers.
      </p>
      <h2 className="text-lg font-bold font-[var(--font-heading)] pt-2">
        4. Data Sharing
      </h2>
      <p>
        We do not share your personal information with third parties. Driver
        contact information is visible to booked students only. Student email
        addresses are never shared with drivers.
      </p>
      <h2 className="text-lg font-bold font-[var(--font-heading)] pt-2">
        5. Your Rights
      </h2>
      <p>
        You may request deletion of your account by contacting the
        administrator. All associated booking history will be retained for
        record-keeping purposes in anonymized form.
      </p>
      <h2 className="text-lg font-bold font-[var(--font-heading)] pt-2">
        6. Contact
      </h2>
      <p>
        For privacy-related inquiries, contact us at{" "}
        <strong>support@ridemate.in</strong>
      </p>
    </div>
  </div>
);

export default PrivacyPolicy;
