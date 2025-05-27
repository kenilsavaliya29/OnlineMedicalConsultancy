import React from 'react'
import { motion } from 'framer-motion'

const Terms_Conditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f7f8] to-white pt-28 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl p-8 custom-box-shadow"
      >
        <h1 className="text-3xl font-bold text-[#007E85] mb-6">Terms and Conditions</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-[#007E85] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using our online medical consultation services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#007E85] mb-3">2. Medical Disclaimer</h2>
            <p>The information provided through our platform is for general informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with questions about your medical condition.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#007E85] mb-3">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information about your health conditions</li>
              <li>Keep your account credentials confidential</li>
              <li>Use the service only for legitimate medical consultation purposes</li>
              <li>Not share your personal consultation sessions with third parties</li>
              <li>Maintain professional and respectful communication in chat sessions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#007E85] mb-3">4. Chat Service Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The chat service is available for registered users only</li>
              <li>Response times may vary based on healthcare provider availability</li>
              <li>Chat history is stored securely for continuity of care</li>
              <li>Inappropriate or abusive behavior will result in service termination</li>
              <li>Chat services are not for emergency medical situations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#007E85] mb-3">5. Wellness Program</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Wellness program participation is optional and complementary to medical services</li>
              <li>Health metrics tracking is provided for informational purposes only</li>
              <li>Wellness recommendations are general and not personalized medical advice</li>
              <li>Program features may be modified based on service availability</li>
              <li>Users can opt out of the wellness program at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#007E85] mb-3">6. Privacy and Data Protection</h2>
            <p>We are committed to protecting your privacy and handling your personal health information in accordance with applicable laws and regulations. This includes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Secure storage of chat histories and health records</li>
              <li>Encrypted transmission of all personal health information</li>
              <li>Strict access controls for medical professionals</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#007E85] mb-3">7. Service Availability</h2>
            <p>While we strive to provide uninterrupted service, we do not guarantee that our service will be available at all times. This applies to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Online consultation platform</li>
              <li>Chat services</li>
              <li>Wellness program features</li>
              <li>Health metrics tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#007E85] mb-3">8. Payment and Subscriptions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Consultation fees must be paid in advance</li>
              <li>Wellness program may have separate subscription fees</li>
              <li>Subscription cancellations require 30-day notice</li>
              <li>Refunds are provided according to our refund policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#007E85] mb-3">9. Emergency Services</h2>
            <p className="font-semibold text-red-600">This is not an emergency service. If you have a medical emergency, please dial your local emergency number immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#007E85] mb-3">10. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.</p>
          </section>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <p>Last updated: January 2024</p>
          <p>If you have any questions about these Terms and Conditions, please contact us.</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Terms_Conditions
