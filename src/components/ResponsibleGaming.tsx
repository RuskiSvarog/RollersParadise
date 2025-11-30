interface ResponsibleGamingProps {
  onClose: () => void;
}

export function ResponsibleGaming({ onClose }: ResponsibleGamingProps) {
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
            RESPONSIBLE GAMING
          </h1>
          <p className="text-center mt-2" style={{ color: '#fde047' }}>
            Play Safely - Entertainment Only
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
              🎮 ENTERTAINMENT ONLY - NO REAL MONEY
            </h2>
            <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-6 mb-4">
              <p className="text-xl font-bold text-green-400 mb-3">
                ✅ THIS IS NOT REAL GAMBLING
              </p>
              <ul className="space-y-2 text-green-100">
                <li>• <strong>100% FREE:</strong> Rollers Paradise uses only virtual currency</li>
                <li>• <strong>NO REAL MONEY:</strong> All chips and credits have zero monetary value</li>
                <li>• <strong>NO DEPOSITS:</strong> You cannot deposit real money</li>
                <li>• <strong>NO WITHDRAWALS:</strong> You cannot cash out or withdraw funds</li>
                <li>• <strong>NO PURCHASES REQUIRED:</strong> Everything is free entertainment</li>
                <li>• <strong>ENTERTAINMENT PURPOSE:</strong> Designed purely for fun and enjoyment</li>
              </ul>
            </div>
            <p className="mb-4">
              While Rollers Paradise is NOT real gambling, we recognize that some individuals may develop unhealthy patterns with gaming activities. We are committed to promoting responsible gaming practices and providing support resources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              ⚠️ RECOGNIZING PROBLEM GAMING BEHAVIOR
            </h2>
            <p className="mb-3">
              Even with virtual currency, it's important to maintain healthy gaming habits. Ask yourself these questions:
            </p>
            <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-bold text-red-400 mb-3">Warning Signs:</h3>
              <ul className="space-y-2">
                <li>□ Do you spend more time gaming than you intended?</li>
                <li>□ Does gaming interfere with work, school, or family responsibilities?</li>
                <li>□ Do you feel restless or irritable when not gaming?</li>
                <li>□ Have you lied to friends or family about how much time you spend gaming?</li>
                <li>□ Do you use gaming to escape problems or relieve feelings of anxiety or depression?</li>
                <li>□ Have you neglected personal hygiene, meals, or sleep to keep gaming?</li>
                <li>□ Do you feel the need to play with increasing amounts of time to feel satisfied?</li>
                <li>□ Have relationships suffered because of your gaming?</li>
              </ul>
              <p className="mt-4 text-yellow-300 font-bold">
                If you answered "yes" to three or more questions, you may want to seek support.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              🛡️ OUR RESPONSIBLE GAMING COMMITMENTS
            </h2>
            <ul className="list-disc ml-6 mb-4 space-y-3">
              <li>
                <strong>Time Tracking:</strong> The app tracks your session duration and displays play time
              </li>
              <li>
                <strong>Session Limits:</strong> You can set voluntary time limits in settings (coming soon)
              </li>
              <li>
                <strong>Reality Checks:</strong> Periodic reminders about play time (coming soon)
              </li>
              <li>
                <strong>Self-Exclusion Options:</strong> Ability to temporarily or permanently suspend your account
              </li>
              <li>
                <strong>Educational Resources:</strong> Information about responsible gaming and problem gaming behaviors
              </li>
              <li>
                <strong>Age Verification:</strong> Minimum age requirement of 18 years
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              💡 HEALTHY GAMING TIPS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">⏰ Set Time Limits</h3>
                <p className="text-sm">Decide in advance how long you'll play and stick to it</p>
              </div>
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">🎯 Play for Fun</h3>
                <p className="text-sm">Remember, it's entertainment, not a source of income</p>
              </div>
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">⏸️ Take Breaks</h3>
                <p className="text-sm">Step away regularly - every 30-60 minutes</p>
              </div>
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">⚖️ Balance Life</h3>
                <p className="text-sm">Maintain work, family, and social activities</p>
              </div>
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">🚫 Don't Chase Losses</h3>
                <p className="text-sm">Accept losses as part of the game and move on</p>
              </div>
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">👥 Stay Social</h3>
                <p className="text-sm">Don't isolate yourself - maintain real-world connections</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              📞 PROBLEM GAMBLING HELP & SUPPORT
            </h2>
            <p className="mb-4 text-yellow-300 font-bold">
              If you or someone you know has a gambling problem, help is available 24/7:
            </p>

            <div className="space-y-4">
              {/* USA Resources */}
              <div className="bg-gray-900/50 border-2 border-yellow-500 rounded-lg p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-3">🇺🇸 UNITED STATES</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-green-400 mb-1">National Council on Problem Gambling</h4>
                    <p><strong>24/7 Helpline:</strong> <span className="text-blue-400 text-xl">1-800-522-4700</span></p>
                    <p><strong>Text Support:</strong> Text "GAMBLER" to <span className="text-blue-400">53342</span></p>
                    <p><strong>Online Chat:</strong> <span className="text-blue-400">ncpgambling.org/chat</span></p>
                    <p className="text-sm text-gray-400">Free, confidential support 24/7</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-green-400 mb-1">Gamblers Anonymous</h4>
                    <p><strong>Website:</strong> <span className="text-blue-400">www.gamblersanonymous.org</span></p>
                    <p className="text-sm text-gray-400">Find local meetings and support groups</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-green-400 mb-1">SAMHSA National Helpline</h4>
                    <p><strong>Phone:</strong> <span className="text-blue-400 text-xl">1-800-662-4357</span></p>
                    <p className="text-sm text-gray-400">Substance Abuse and Mental Health Services - Free, confidential, 24/7</p>
                  </div>
                </div>
              </div>

              {/* International Resources */}
              <div className="bg-gray-900/50 border-2 border-blue-500 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-3">🌍 INTERNATIONAL RESOURCES</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-green-400">🇨🇦 Canada</h4>
                    <p>ConnexOntario: <span className="text-blue-400">1-866-531-2600</span></p>
                    <p className="text-sm text-gray-400">Problem Gambling Helpline</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-green-400">🇬🇧 United Kingdom</h4>
                    <p>National Gambling Helpline: <span className="text-blue-400">0808 8020 133</span></p>
                    <p className="text-sm text-gray-400">GamCare - Free support</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-green-400">🇦🇺 Australia</h4>
                    <p>Gambling Help Online: <span className="text-blue-400">1800 858 858</span></p>
                    <p className="text-sm text-gray-400">24/7 support</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-green-400">🇮🇪 Ireland</h4>
                    <p>Dunlewey Addiction Services: <span className="text-blue-400">+353 1 649 8899</span></p>
                  </div>

                  <div>
                    <h4 className="font-bold text-green-400">🇳🇿 New Zealand</h4>
                    <p>Gambling Helpline: <span className="text-blue-400">0800 654 655</span></p>
                  </div>

                  <div>
                    <h4 className="font-bold text-green-400">🇸🇬 Singapore</h4>
                    <p>NCPG Helpline: <span className="text-blue-400">1800 6668 668</span></p>
                  </div>
                </div>
              </div>

              {/* Online Resources */}
              <div className="bg-gray-900/50 border-2 border-purple-500 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-400 mb-3">💻 ONLINE SUPPORT RESOURCES</h3>
                <ul className="space-y-2">
                  <li>• <strong>BeGambleAware:</strong> <span className="text-blue-400">begambleaware.org</span></li>
                  <li>• <strong>Gambling Therapy:</strong> <span className="text-blue-400">gamblingtherapy.org</span> (Free online support)</li>
                  <li>• <strong>GamTalk:</strong> <span className="text-blue-400">gamtalk.org</span> (Peer support forum)</li>
                  <li>• <strong>SMART Recovery:</strong> <span className="text-blue-400">smartrecovery.org</span> (Self-help groups)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              🔒 SELF-EXCLUSION OPTIONS
            </h2>
            <p className="mb-4">
              If you need to take a break from Rollers Paradise, we offer self-exclusion options:
            </p>
            <div className="space-y-3">
              <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4">
                <h3 className="font-bold text-orange-400 mb-2">⏸️ Temporary Suspension (24 hours - 30 days)</h3>
                <p className="text-sm mb-2">Take a short break. Your account will be automatically reactivated after the period.</p>
                <p className="text-sm text-gray-400">Contact: <span className="text-blue-400">support@rollersparadise.com</span></p>
              </div>

              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <h3 className="font-bold text-red-400 mb-2">🚫 Extended Self-Exclusion (6 months - 1 year)</h3>
                <p className="text-sm mb-2">Longer break with mandatory cooling-off period. Cannot be reversed early.</p>
                <p className="text-sm text-gray-400">Contact: <span className="text-blue-400">support@rollersparadise.com</span></p>
              </div>

              <div className="bg-gray-900/50 border border-gray-500 rounded-lg p-4">
                <h3 className="font-bold text-gray-400 mb-2">❌ Permanent Account Closure</h3>
                <p className="text-sm mb-2">Permanent deletion of your account and all data. This action cannot be undone.</p>
                <p className="text-sm text-gray-400">Contact: <span className="text-blue-400">support@rollersparadise.com</span></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              📧 CONTACT OUR SUPPORT TEAM
            </h2>
            <p className="mb-4">
              Our support team is here to help with responsible gaming concerns:
            </p>
            <div className="bg-gray-900/50 p-6 rounded-lg mb-4">
              <p className="mb-2"><strong>Responsible Gaming Support</strong></p>
              <p className="mb-2"><strong>Email:</strong> <span className="text-blue-400">support@rollersparadise.com</span></p>
              <p className="mb-2"><strong>Subject Line:</strong> "Responsible Gaming - [Your Concern]"</p>
              <p className="text-sm text-gray-400 mt-4">
                We treat all inquiries with confidentiality and respect. We're here to help, not judge.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#fbbf24' }}>
              👨‍👩‍👧‍👦 FOR FAMILY & FRIENDS
            </h2>
            <p className="mb-4">
              If you're concerned about a loved one's gaming habits:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-2">
              <li><strong>Talk openly:</strong> Express concern without judgment</li>
              <li><strong>Listen actively:</strong> Let them share their feelings</li>
              <li><strong>Offer support:</strong> Provide resources and encouragement</li>
              <li><strong>Set boundaries:</strong> Protect your own well-being</li>
              <li><strong>Seek help together:</strong> Attend counseling or support groups</li>
            </ul>
            <p className="mb-4">
              <strong>Gam-Anon</strong> provides support specifically for family members: <span className="text-blue-400">gam-anon.org</span>
            </p>
          </section>

          <section className="bg-green-900/30 border-2 border-green-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-3 text-green-400">
              ✅ REMEMBER: IT'S JUST A GAME
            </h2>
            <p className="text-lg mb-3">
              Rollers Paradise is designed for entertainment and fun. Keep it that way by:
            </p>
            <ul className="space-y-2 text-green-100">
              <li>✓ Playing responsibly and in moderation</li>
              <li>✓ Maintaining balance with other activities</li>
              <li>✓ Seeking help if gaming becomes problematic</li>
              <li>✓ Looking out for friends and family</li>
              <li>✓ Remembering it's virtual currency with no real value</li>
            </ul>
          </section>

          <section className="border-t-2 border-yellow-600/30 pt-6">
            <p className="text-center text-sm text-gray-400">
              Last Updated: {new Date().toLocaleDateString()}<br />
              Rollers Paradise is committed to promoting responsible gaming practices
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

export default ResponsibleGaming;
