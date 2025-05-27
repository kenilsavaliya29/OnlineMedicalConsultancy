import React from 'react'
import { motion } from 'framer-motion'

const Privacy_Policies = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f7f8] to-white pt-28 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl p-8 custom-box-shadow"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#007E85] mb-3">Your Privacy Matters</h1>
          <p className="text-gray-600">We believe healthcare should be accessible, secure, and private</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#f0fafb] p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#007E85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h2 className="text-xl font-semibold text-[#007E85]">Data Security</h2>
              </div>
              <p className="text-gray-700">Your medical data is encrypted using industry-standard protocols. We employ advanced security measures to protect against unauthorized access, maintaining the confidentiality of your health information.</p>
            </div>

            <div className="bg-[#f0fafb] p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#007E85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h2 className="text-xl font-semibold text-[#007E85]">HIPAA Compliance</h2>
              </div>
              <p className="text-gray-700">We adhere to HIPAA guidelines, ensuring your medical information is handled with the highest level of privacy and security standards required by healthcare regulations.</p>
            </div>

            <div className="bg-[#f0fafb] p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#007E85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-xl font-semibold text-[#007E85]">Data Collection</h2>
              </div>
              <p className="text-gray-700">We only collect information that's necessary for your healthcare. This includes medical history, consultation records, and basic personal information needed for identification and communication.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#f0fafb] p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#007E85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <h2 className="text-xl font-semibold text-[#007E85]">Your Control</h2>
              </div>
              <p className="text-gray-700">You have complete control over your data. Access, update, or request deletion of your information at any time. We believe in transparency and putting you in charge of your health information.</p>
            </div>

            <div className="bg-[#f0fafb] p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#007E85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <h2 className="text-xl font-semibold text-[#007E85]">Secure Communication</h2>
              </div>
              <p className="text-gray-700">All communications between you and your healthcare providers are encrypted end-to-end. Your virtual consultations and messages remain private and secure.</p>
            </div>

            <div className="bg-[#f0fafb] p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#007E85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-[#007E85]">Data Retention</h2>
              </div>
              <p className="text-gray-700">We retain your medical records as required by law and medical best practices. You can request information about retention periods and our data deletion policies at any time.</p>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-6"
        >
          <div className="bg-[#f0fafb] p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-[#007E85] mb-4">Third-Party Services</h2>
            <p className="text-gray-700">We may use trusted third-party services for specific functions like payment processing or video consultations. These partners are bound by strict confidentiality agreements and must meet our privacy standards.</p>
          </div>

          <div className="bg-[#f0fafb] p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-[#007E85] mb-4">Cookies & Analytics</h2>
            <p className="text-gray-700">We use essential cookies to ensure our platform functions properly. Analytics data is anonymized and used only to improve our services. You can manage cookie preferences through your browser settings.</p>
          </div>

          <div className="p-6 bg-[#007E85] text-white rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Have Questions?</h2>
            <p className="mb-4">Our dedicated privacy team is here to help. Contact us at:</p>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>privacy@medconnect.com</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Privacy_Policies
