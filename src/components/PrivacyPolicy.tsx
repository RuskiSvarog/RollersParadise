interface PrivacyPolicyProps {
  onClose: () => void;
}

export function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-4" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderColor: '#fbbf24',
        boxShadow: '0 0 60px rgba(251, 191, 36, 0.4)',
      }}>
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b-4" style={{
          background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #b45309 100%)',
          borderColor: '#fbbf24',
        }}>
          <h1 className="text-3xl font-bold text-center" style={{
            color: '#fef3c7',
            textShadow: '0 0 20px rgba(251, 191, 36, 0.8)',
            fontFamily: 'Georgia, serif',
          }}>
            PRIVACY POLICY
          </h1>
          <p className="text-center mt-2" style={{ color: '#fde047' }}>
            Rollers Paradise - Effective Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6" style={{
          color: '#e5e7eb',
          fontFamily: 'Georgia, serif',
          lineHeight: '1.8',
        }}>
          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              1. INTRODUCTION
            </h2>
            <p className="mb-4">
              Rollers Paradise ("we," "our," "us," or "the Application") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our online crapless craps entertainment application.
            </p>
            <p className="mb-4">
              <strong className="text-yellow-400">IMPORTANT:</strong> Rollers Paradise is a <strong className="text-green-400">FREE ENTERTAINMENT APPLICATION</strong> using virtual currency only. All chips, credits, and currency have <strong className="text-green-400">NO REAL-WORLD MONETARY VALUE</strong>. This is NOT real gambling.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              2. INFORMATION WE COLLECT
            </h2>
            
            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              2.1 Personal Information You Provide
            </h3>
            <p className="mb-3">When you create an account, we may collect:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Email Address:</strong> Required for account creation and password recovery</li>
              <li><strong>Username/Display Name:</strong> Your chosen in-game identity</li>
              <li><strong>Password:</strong> Stored securely using industry-standard encryption</li>
              <li><strong>Profile Picture:</strong> Optional avatar image</li>
              <li><strong>Two-Factor Authentication Codes:</strong> If you enable 2FA security</li>
            </ul>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              2.2 Automatically Collected Information
            </h3>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Device Information:</strong> Browser type, operating system, screen resolution, GPU capabilities</li>
              <li><strong>IP Address:</strong> Used for security, fraud prevention, and enforcing one-account-per-IP policy</li>
              <li><strong>Game Statistics:</strong> Bet history, roll outcomes, win/loss records, achievements, XP level</li>
              <li><strong>Session Data:</strong> Login times, session duration, last active date</li>
              <li><strong>Performance Metrics:</strong> Frame rates, load times, error logs for optimization</li>
            </ul>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              2.3 Anti-Cheat & Security Data
            </h3>
            <p className="mb-3">To ensure fair play, we collect:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Developer console open/close events</li>
              <li>Game state integrity checksums</li>
              <li>Gameplay pattern analysis</li>
              <li>Browser extension detection</li>
              <li>Device fingerprinting for multi-account detection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              3. HOW WE USE YOUR INFORMATION
            </h2>
            <p className="mb-3">We use collected information for:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Game Functionality:</strong> Provide core gameplay features, save progress, sync across devices</li>
              <li><strong>Account Security:</strong> Verify identity, prevent unauthorized access, enforce one-account policies</li>
              <li><strong>Performance Optimization:</strong> Automatically adjust graphics settings based on your device</li>
              <li><strong>Fair Play Enforcement:</strong> Detect and prevent cheating, hacking, or exploitation</li>
              <li><strong>Customer Support:</strong> Respond to inquiries, troubleshoot issues, provide assistance</li>
              <li><strong>Analytics & Improvement:</strong> Understand usage patterns, improve features, fix bugs</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws, regulations, and legal processes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              4. INFORMATION SHARING & DISCLOSURE
            </h2>
            
            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              4.1 We DO NOT Sell Your Data
            </h3>
            <p className="mb-4">
              <strong className="text-green-400">GUARANTEED:</strong> We will NEVER sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              4.2 Limited Sharing Circumstances
            </h3>
            <p className="mb-3">We may share information only in these situations:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Service Providers:</strong> Cloud hosting (Supabase), content delivery networks, analytics services - bound by strict confidentiality agreements</li>
              <li><strong>Legal Requirements:</strong> When required by law, subpoena, court order, or government request</li>
              <li><strong>Safety & Security:</strong> To protect against fraud, security threats, or violations of our Terms of Service</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets (users will be notified)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              5. DATA SECURITY
            </h2>
            <p className="mb-3">We implement industry-standard security measures:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Encryption:</strong> All passwords are hashed using bcrypt with salt</li>
              <li><strong>Secure Transmission:</strong> HTTPS/TLS encryption for all data in transit</li>
              <li><strong>Access Controls:</strong> Strict employee access restrictions on a need-to-know basis</li>
              <li><strong>Regular Audits:</strong> Security reviews and vulnerability assessments</li>
              <li><strong>Two-Factor Authentication:</strong> Optional 2FA for enhanced account protection</li>
            </ul>
            <p className="mb-4 text-yellow-300">
              ⚠️ <strong>Important:</strong> No method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              6. DATA RETENTION
            </h2>
            <p className="mb-3">We retain your information:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Active Accounts:</strong> As long as your account remains active</li>
              <li><strong>Inactive Accounts:</strong> Up to 2 years after last login</li>
              <li><strong>Deleted Accounts:</strong> 30 days retention for recovery, then permanently deleted</li>
              <li><strong>Guest Accounts:</strong> NO data retention - completely cleared after session ends</li>
              <li><strong>Legal Requirements:</strong> Longer retention if required by law or for legal disputes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              7. YOUR PRIVACY RIGHTS
            </h2>
            
            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              7.1 General Rights
            </h3>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request account and data deletion (subject to legal obligations)</li>
              <li><strong>Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Opt-Out:</strong> Decline marketing communications (if any)</li>
            </ul>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              7.2 USA - State-Specific Rights
            </h3>
            <p className="mb-3"><strong>California (CCPA/CPRA):</strong></p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of sale (we do NOT sell data)</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
            <p className="mb-3"><strong>Virginia, Colorado, Connecticut, Utah:</strong> Similar rights under state privacy laws</p>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              7.3 European Union - GDPR Rights
            </h3>
            <p className="mb-3">If you are in the EU/EEA, you have additional rights under GDPR:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Right to access and receive a copy of your data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to lodge a complaint with your supervisory authority</li>
            </ul>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              7.4 How to Exercise Your Rights
            </h3>
            <p className="mb-3">To exercise any privacy rights, contact us at:</p>
            <div className="bg-gray-900/50 p-4 rounded-lg mb-4">
              <p><strong>Email:</strong> <span className="text-blue-400">privacy@rollersparadise.com</span></p>
              <p><strong>Subject Line:</strong> "Privacy Rights Request - [Your Request Type]"</p>
              <p className="mt-2 text-sm text-gray-400">We will respond within 30 days (45 days for complex requests)</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              8. COOKIES & TRACKING TECHNOLOGIES
            </h2>
            <p className="mb-3">We use:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication, security, and basic functionality</li>
              <li><strong>Performance Cookies:</strong> Anonymous analytics to improve app performance</li>
              <li><strong>Preference Cookies:</strong> Remember your settings (volume, graphics quality, etc.)</li>
            </ul>
            <p className="mb-4">
              <strong>NO ADVERTISING COOKIES:</strong> We do NOT use cookies for advertising or cross-site tracking.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              9. CHILDREN'S PRIVACY
            </h2>
            <p className="mb-4">
              Rollers Paradise is intended for users aged <strong className="text-yellow-400">18 years and older</strong>. We do NOT knowingly collect personal information from children under 18.
            </p>
            <p className="mb-4">
              If we discover that a child under 18 has provided personal information, we will delete it immediately. Parents or guardians who believe their child has provided information should contact us at <span className="text-blue-400">privacy@rollersparadise.com</span>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              10. INTERNATIONAL DATA TRANSFERS
            </h2>
            <p className="mb-4">
              Rollers Paradise may store and process data in the United States or other countries where our service providers operate. By using the Application, you consent to the transfer of your information to countries outside your country of residence, which may have different data protection laws.
            </p>
            <p className="mb-4">
              For EU users: We use appropriate safeguards such as Standard Contractual Clauses (SCCs) approved by the European Commission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              11. CHANGES TO THIS PRIVACY POLICY
            </h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Effective Date." Material changes will be notified via:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>In-app notification</li>
              <li>Email to registered users (if applicable)</li>
              <li>Prominent notice on the Application</li>
            </ul>
            <p className="mb-4">
              Continued use of the Application after changes constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              12. CONTACT US
            </h2>
            <p className="mb-3">For questions, concerns, or requests regarding this Privacy Policy:</p>
            <div className="bg-gray-900/50 p-6 rounded-lg mb-4">
              <p className="mb-2"><strong>Rollers Paradise Privacy Team</strong></p>
              <p className="mb-2"><strong>Email:</strong> <span className="text-blue-400">privacy@rollersparadise.com</span></p>
              <p className="mb-2"><strong>Support:</strong> <span className="text-blue-400">support@rollersparadise.com</span></p>
              <p className="text-sm text-gray-400 mt-4">We aim to respond to all inquiries within 48 hours</p>
            </div>
          </section>

          <section className="border-t-2 border-yellow-600/30 pt-6">
            <p className="text-center text-sm text-gray-400">
              Last Updated: {new Date().toLocaleDateString()}<br />
              Version 1.0
            </p>
          </section>
        </div>

        {/* Close Button */}
        <div className="sticky bottom-0 p-4 border-t-4" style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderColor: '#fbbf24',
        }}>
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-lg font-bold text-lg uppercase transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              borderWidth: '3px',
              borderStyle: 'solid',
              borderColor: '#fbbf24',
              color: '#fef3c7',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)',
            }}
          >
            ✓ CLOSE & RETURN
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
