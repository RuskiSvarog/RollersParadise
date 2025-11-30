import { Bell, BookOpen } from './Icons';
import { showManualReportPrompt } from '../utils/simpleErrorReporter';

interface SupportTabProps {
  onShowTutorial?: () => void;
}

export function SupportTab({ onShowTutorial }: SupportTabProps) {
  return (
    <div className="space-y-5">
      <h3 className="text-white text-xl font-black mb-3">📞 Support & Help</h3>
      
      {/* Tutorial Button - Prominent placement at the top */}
      {onShowTutorial && (
        <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-2 border-orange-500 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">Learn How to Play</h4>
              <p className="text-orange-300 text-sm">Interactive step-by-step tutorial</p>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            New to craps or need a refresher? Our interactive tutorial walks you through everything with clear visuals, simple explanations, and helpful tips. Perfect for beginners and experienced players alike!
          </p>
          
          <button
            onClick={() => {
              onShowTutorial();
            }}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-5 h-5" />
            📚 Show Tutorial
          </button>
        </div>
      )}
      
      <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-500 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-white font-bold text-lg">Need Help?</h4>
            <p className="text-blue-300 text-sm">Send us a message directly</p>
          </div>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          Having an issue, question, or feedback? Click the button below to send a message directly to our AI support team. We'll review it and get back to you as soon as possible.
        </p>
        
        <button
          onClick={() => showManualReportPrompt()}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <Bell className="w-5 h-5" />
          📝 Send Message to Support
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-green-900/20 border-2 border-green-600 rounded-lg p-4">
          <p className="text-green-300 text-sm leading-relaxed">
            <strong>✅ What happens:</strong> Your message goes directly to our support database where our AI assistant and team can review it. You'll see a confirmation when it's sent successfully.
          </p>
        </div>
        
        <div className="bg-yellow-900/20 border-2 border-yellow-600 rounded-lg p-4">
          <p className="text-yellow-300 text-sm leading-relaxed">
            <strong>💡 Tip:</strong> Be specific! Include details like what you were doing, what happened, and what you expected. This helps us fix issues faster.
          </p>
        </div>

        <div className="bg-purple-900/20 border-2 border-purple-600 rounded-lg p-4">
          <p className="text-purple-300 text-sm leading-relaxed">
            <strong>🤖 AI-Powered:</strong> Our system uses advanced AI to analyze and categorize your feedback, making sure it gets to the right team member quickly.
          </p>
        </div>
      </div>

      <div className="border-t-2 border-gray-700 pt-4">
        <h4 className="text-white font-bold mb-3">Common Questions</h4>
        <div className="space-y-2 text-sm">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-blue-400 font-semibold">Q: How long does it take to get a response?</p>
            <p className="text-gray-400 mt-1">A: We review all messages within 24-48 hours. Critical issues are prioritized.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-blue-400 font-semibold">Q: Can I report bugs or errors?</p>
            <p className="text-gray-400 mt-1">A: Yes! Use the message button above to report any issues you encounter.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-blue-400 font-semibold">Q: Is my information private?</p>
            <p className="text-gray-400 mt-1">A: Absolutely. Messages are only visible to our support team and used solely to improve your experience.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
