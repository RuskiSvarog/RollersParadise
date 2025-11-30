interface TermsOfServiceProps {
  onClose: () => void;
}

export function TermsOfService({ onClose }: TermsOfServiceProps) {
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
            TERMS OF SERVICE
          </h1>
          <p className="text-center mt-2" style={{ color: '#fde047' }}>
            Rollers Paradise User Agreement
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6" style={{
          color: '#e5e7eb',
          fontFamily: 'Georgia, serif',
          lineHeight: '1.8',
        }}>
          <section>
            <p className="mb-4 text-sm text-gray-400">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className="mb-4">
              These Terms of Service ("Terms") govern your access to and use of Rollers Paradise ("the Application," "we," "our," or "us"), an online crapless craps entertainment application. By accessing or using the Application, you agree to be bound by these Terms.
            </p>
            <div className="bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-4 mb-4">
              <p className="font-bold text-yellow-300">
                ⚠️ IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THE APPLICATION.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              1. VIRTUAL CURRENCY - NO REAL MONEY
            </h2>
            <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-6 mb-4">
              <p className="text-xl font-bold text-green-400 mb-3">
                THIS IS NOT REAL GAMBLING
              </p>
              <p className="mb-3">
                Rollers Paradise is a <strong>FREE ENTERTAINMENT APPLICATION</strong> that uses only virtual currency for gameplay:
              </p>
              <ul className="space-y-2">
                <li>✅ All chips, credits, and currency are <strong className="text-green-400">100% VIRTUAL</strong></li>
                <li>✅ Virtual currency has <strong className="text-green-400">ZERO REAL-WORLD MONETARY VALUE</strong></li>
                <li>✅ You <strong className="text-green-400">CANNOT</strong> deposit real money into the Application</li>
                <li>✅ You <strong className="text-green-400">CANNOT</strong> withdraw, cash out, or exchange virtual currency for real money</li>
                <li>✅ Virtual currency <strong className="text-green-400">CANNOT</strong> be sold, traded, or transferred to other users for real money</li>
                <li>✅ This Application is for <strong className="text-green-400">ENTERTAINMENT PURPOSES ONLY</strong></li>
              </ul>
            </div>
            <p className="mb-4 text-yellow-300 font-bold">
              BY USING THIS APPLICATION, YOU ACKNOWLEDGE AND AGREE THAT ALL CURRENCY IS VIRTUAL AND HAS NO MONETARY VALUE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              2. ELIGIBILITY & ACCOUNT REQUIREMENTS
            </h2>
            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              2.1 Age Requirement
            </h3>
            <p className="mb-4">
              You must be at least <strong className="text-yellow-400">18 years of age</strong> to use Rollers Paradise. By creating an account, you represent and warrant that you are 18 or older.
            </p>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              2.2 One Account Policy
            </h3>
            <p className="mb-3">To ensure fair play and prevent abuse:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>One Account Per Email:</strong> Each email address can only be associated with one account</li>
              <li><strong>One Account Per IP Address:</strong> Each IP address is limited to one account</li>
              <li><strong>No Multi-Accounting:</strong> Creating multiple accounts to gain unfair advantages is strictly prohibited</li>
            </ul>
            <p className="mb-4 text-red-300">
              ⚠️ <strong>Violation Consequences:</strong> Multiple account creation will result in account suspension and permanent ban.
            </p>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              2.3 Guest Accounts
            </h3>
            <p className="mb-4">
              Guest accounts are available for temporary play. <strong className="text-yellow-300">IMPORTANT:</strong> Guest accounts do NOT save any data, progress, settings, or game history. All guest data is permanently deleted when you close the browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              3. GAME RULES & MECHANICS
            </h2>
            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              3.1 Crapless Craps Rules
            </h3>
            <p className="mb-3">Rollers Paradise follows authentic crapless craps rules:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>On the come-out roll, only rolling a <strong>7 wins</strong></li>
              <li>All other numbers (2, 3, 4, 5, 6, 8, 9, 10, 11, 12) become the point</li>
              <li>Rolling a 7 after establishing a point results in a seven-out and clears all bets</li>
              <li>Minimum bet: <strong>$3</strong> (virtual currency)</li>
            </ul>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              3.2 Fairness & Randomness
            </h3>
            <p className="mb-3">We guarantee complete fairness:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Cryptographic RNG:</strong> All dice rolls use cryptographically secure random number generation</li>
              <li><strong>No Manipulation:</strong> Dice outcomes are never manipulated or biased</li>
              <li><strong>Equal Treatment:</strong> Single-player and multiplayer modes use identical algorithms</li>
              <li><strong>Server-Side Validation:</strong> All results are validated server-side to prevent tampering</li>
            </ul>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              3.3 Betting Restrictions
            </h3>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Bets must comply with game phase restrictions</li>
              <li>Odds betting limits follow electronic casino machine rules</li>
              <li>All bets are final once placed (no cancellation after roll starts)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              4. PROHIBITED CONDUCT & CHEATING
            </h2>
            <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-6 mb-4">
              <p className="text-xl font-bold text-red-400 mb-3">
                ⛔ ZERO TOLERANCE POLICY
              </p>
              <p className="mb-3">The following activities are strictly prohibited:</p>
              <ul className="space-y-2">
                <li>❌ <strong>Hacking or Cheating:</strong> Using cheats, exploits, bots, or automation tools</li>
                <li>❌ <strong>Game Tampering:</strong> Modifying client code, memory manipulation, or packet injection</li>
                <li>❌ <strong>Console Manipulation:</strong> Using browser developer tools to alter game state or balances</li>
                <li>❌ <strong>Multi-Accounting:</strong> Creating multiple accounts to gain unfair advantages</li>
                <li>❌ <strong>Collusion:</strong> Coordinating with other players to manipulate outcomes</li>
                <li>❌ <strong>Reverse Engineering:</strong> Attempting to decompile, disassemble, or reverse engineer the Application</li>
                <li>❌ <strong>Unauthorized Access:</strong> Accessing other users' accounts or attempting to breach security</li>
                <li>❌ <strong>Fraud:</strong> Any fraudulent activity or false representation</li>
              </ul>
            </div>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              4.1 Anti-Cheat Monitoring
            </h3>
            <p className="mb-3">
              <strong>BY USING THIS APPLICATION, YOU CONSENT TO ANTI-CHEAT MONITORING.</strong> We employ comprehensive security measures:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Developer tools detection and monitoring</li>
              <li>Game state integrity validation</li>
              <li>Balance and bet verification</li>
              <li>Pattern analysis for suspicious behavior</li>
              <li>IP address and device fingerprinting</li>
              <li>Rate limiting and action throttling</li>
            </ul>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              4.2 Consequences for Violations
            </h3>
            <div className="bg-gray-900/50 p-4 rounded-lg mb-4">
              <p className="mb-2"><strong>First Offense:</strong> Warning + 7-day suspension + balance reset</p>
              <p className="mb-2"><strong>Second Offense:</strong> 30-day suspension + permanent balance reset</p>
              <p className="mb-2"><strong>Third Offense:</strong> <span className="text-red-400">PERMANENT BAN</span> from all Rollers Paradise services</p>
              <p className="mt-3 text-sm text-yellow-300">
                Severe violations (hacking, fraud) result in immediate permanent ban without warning.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              5. MEMBERSHIP & PURCHASES
            </h2>
            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              5.1 Membership Tiers (Optional)
            </h3>
            <p className="mb-3">
              Rollers Paradise offers optional membership tiers that provide cosmetic enhancements and quality-of-life features:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>VIP Gold:</strong> Exclusive dice skins, badges, priority support</li>
              <li><strong>VIP Platinum:</strong> Premium features, custom avatars, enhanced rewards</li>
            </ul>
            <p className="mb-4 text-yellow-300">
              <strong>IMPORTANT:</strong> Memberships provide cosmetic benefits only. They do NOT provide gambling advantages, increased win rates, or manipulated dice outcomes.
            </p>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              5.2 Virtual Currency Packages
            </h3>
            <p className="mb-4">
              While the Application is free, you may optionally purchase virtual currency packages for convenience. <strong className="text-red-400">REMINDER:</strong> Virtual currency has NO real-world value and CANNOT be converted back to real money.
            </p>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              5.3 Refund Policy
            </h3>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Memberships:</strong> Refunds available within 7 days if no benefits were used</li>
              <li><strong>Virtual Currency:</strong> Refunds available within 24 hours if unspent</li>
              <li><strong>Account Violations:</strong> No refunds if account is banned for Terms violations</li>
            </ul>
            <p className="mb-4">
              To request a refund, contact <span className="text-blue-400">support@rollersparadise.com</span> with your transaction details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              6. INTELLECTUAL PROPERTY
            </h2>
            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              6.1 Our Rights
            </h3>
            <p className="mb-4">
              All content, features, and functionality of Rollers Paradise (including but not limited to text, graphics, logos, icons, images, audio clips, code, and software) are the exclusive property of Rollers Paradise and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              6.2 Limited License
            </h3>
            <p className="mb-4">
              We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Application for personal, non-commercial entertainment purposes. You may NOT:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Copy, modify, or create derivative works</li>
              <li>Distribute, transmit, or publicly display any part of the Application</li>
              <li>Reverse engineer, decompile, or disassemble</li>
              <li>Use for commercial purposes without written permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              7. DISCLAIMERS & LIMITATIONS OF LIABILITY
            </h2>
            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              7.1 "AS IS" Disclaimer
            </h3>
            <p className="mb-4">
              THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              7.2 No Guarantee of Availability
            </h3>
            <p className="mb-4">
              We do not guarantee that the Application will be uninterrupted, secure, or error-free. We may suspend or terminate the Application at any time for maintenance, updates, or other reasons.
            </p>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              7.3 Limitation of Liability
            </h3>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ROLLERS PARADISE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="mb-4">
              BECAUSE THIS APPLICATION USES VIRTUAL CURRENCY WITH NO REAL-WORLD VALUE, YOU ACKNOWLEDGE THAT YOU HAVE NO MONETARY LOSS FROM GAMEPLAY.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              8. INDEMNIFICATION
            </h2>
            <p className="mb-4">
              You agree to indemnify, defend, and hold harmless Rollers Paradise, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, or expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Your use or misuse of the Application</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your violation of applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              9. ACCOUNT TERMINATION
            </h2>
            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              9.1 Your Right to Terminate
            </h3>
            <p className="mb-4">
              You may terminate your account at any time by contacting <span className="text-blue-400">support@rollersparadise.com</span>. Upon termination, all your data will be permanently deleted within 30 days.
            </p>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              9.2 Our Right to Terminate
            </h3>
            <p className="mb-3">We may suspend or terminate your account immediately, without notice, for:</p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>Violation of these Terms</li>
              <li>Cheating, hacking, or fraudulent activity</li>
              <li>Abusive behavior toward other users or staff</li>
              <li>Any conduct that harms the Application or other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              10. MODIFICATIONS TO TERMS
            </h2>
            <p className="mb-4">
              We reserve the right to modify these Terms at any time. Material changes will be notified via:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li>In-app notification</li>
              <li>Email to registered users</li>
              <li>Prominent notice on the Application</li>
            </ul>
            <p className="mb-4">
              Continued use of the Application after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              11. GOVERNING LAW & DISPUTE RESOLUTION
            </h2>
            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              11.1 Governing Law
            </h3>
            <p className="mb-4">
              These Terms are governed by the laws of the State of [Your State], United States, without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              11.2 Arbitration
            </h3>
            <p className="mb-4">
              Any disputes arising from these Terms or the Application shall be resolved through binding arbitration in accordance with the American Arbitration Association's rules, rather than in court.
            </p>

            <h3 className="text-xl font-bold mb-2 mt-4" style={{ color: '#fde047' }}>
              11.3 Class Action Waiver
            </h3>
            <p className="mb-4">
              You agree to resolve disputes on an individual basis only, and waive any right to participate in class action lawsuits or class-wide arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              12. CONTACT INFORMATION
            </h2>
            <p className="mb-3">For questions about these Terms:</p>
            <div className="bg-gray-900/50 p-6 rounded-lg mb-4">
              <p className="mb-2"><strong>Rollers Paradise Legal Team</strong></p>
              <p className="mb-2"><strong>Email:</strong> <span className="text-blue-400">legal@rollersparadise.com</span></p>
              <p className="mb-2"><strong>Support:</strong> <span className="text-blue-400">support@rollersparadise.com</span></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              13. SEVERABILITY
            </h2>
            <p className="mb-4">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section className="bg-green-900/30 border-2 border-green-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-3 text-green-400">
              ✅ ACKNOWLEDGMENT
            </h2>
            <p className="mb-3">
              BY USING ROLLERS PARADISE, YOU ACKNOWLEDGE THAT:
            </p>
            <ul className="space-y-2">
              <li>✓ You have read and understood these Terms</li>
              <li>✓ You agree to be bound by these Terms</li>
              <li>✓ You understand this uses virtual currency with no real-world value</li>
              <li>✓ You consent to anti-cheat monitoring</li>
              <li>✓ You are at least 18 years of age</li>
              <li>✓ You will not engage in cheating or prohibited conduct</li>
            </ul>
          </section>

          <section className="border-t-2 border-yellow-600/30 pt-6">
            <p className="text-center text-sm text-gray-400">
              Last Updated: {new Date().toLocaleDateString()}<br />
              Version 1.0<br />
              © {new Date().getFullYear()} Rollers Paradise. All rights reserved.
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

export default TermsOfService;
