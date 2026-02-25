const DriverConsent = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-6 font-[var(--font-heading)]">
      Driver Consent Agreement
    </h1>
    <div className="bg-white rounded-2xl p-8 space-y-4 text-gray-700 leading-relaxed text-sm">
      <p>
        <strong>Last updated:</strong> February 2026
      </p>
      <h2 className="text-lg font-bold font-[var(--font-heading)] pt-2">
        1. Eligibility
      </h2>
      <p>
        Only auto-rickshaw drivers approved by the college administration are
        eligible to operate on this platform. Drivers are added by the
        administrator and cannot self-register.
      </p>
      <h2 className="text-lg font-bold font-[var(--font-heading)] pt-2">
        2. Responsibilities
      </h2>
      <p>As a driver on RideMate, you agree to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Operate only college-approved auto-rickshaws</li>
        <li>Ensure the safety of all passengers during transit</li>
        <li>Follow all local traffic rules and regulations</li>
        <li>Maintain your vehicle in safe operating condition</li>
        <li>Not charge passengers more than the listed ride price</li>
      </ul>
      <h2 className="text-lg font-bold font-[var(--font-heading)] pt-2">
        3. Payment
      </h2>
      <p>
        All payments are received directly by the driver via UPI. RideMate does
        not deduct any commission or fees. Drivers must confirm student payments
        honestly and promptly.
      </p>
      <h2 className="text-lg font-bold font-[var(--font-heading)] pt-2">
        4. Student Management
      </h2>
      <p>
        Drivers have the ability to mark students as no-show or block them from
        future rides. These features must be used responsibly and not for
        discriminatory purposes.
      </p>
      <h2 className="text-lg font-bold font-[var(--font-heading)] pt-2">
        5. Deactivation
      </h2>
      <p>
        The administrator reserves the right to deactivate a driver&apos;s
        account at any time for violations of these terms or at the discretion
        of the college administration.
      </p>
      <h2 className="text-lg font-bold font-[var(--font-heading)] pt-2">
        6. Liability
      </h2>
      <p className="font-bold text-error">
        RideMate is a coordination platform only. The driver assumes full
        responsibility for the safe transportation of passengers. RideMate is
        not liable for any accidents, injuries, or losses during transit.
      </p>
    </div>
  </div>
);

export default DriverConsent;
