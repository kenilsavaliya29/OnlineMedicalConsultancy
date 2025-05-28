import React from 'react'
import { useState } from 'react'
import { FiPlus, FiMinus } from 'react-icons/fi'

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is CareChat's main goal?",
      answer: "CareChat aims to provide accessible, high-quality healthcare services through digital solutions. Our platform connects patients with certified doctors 24/7, offers online consultations, and provides comprehensive wellness programs to improve overall health outcomes."
    },
    {
      question: "How does CareChat make healthcare more accessible?", 
      answer: "We make healthcare accessible through instant doctor chats, online appointment scheduling, digital prescriptions, and virtual consultations. Our platform eliminates geographical barriers and provides round-the-clock medical assistance."
    },
    {
      question: "What services does CareChat offer?",
      answer: "CareChat offers a wide range of services including 24/7 doctor consultations, appointment scheduling, wellness programs, health checkups, digital prescriptions, and personalized healthcare solutions tailored to individual needs."
    },
    {
      question: "How does CareChat ensure quality healthcare?",
      answer: "We partner with certified and experienced healthcare professionals, maintain strict quality standards, and continuously monitor our services. Our platform also implements secure technology for protecting patient information and ensuring reliable healthcare delivery."
    },
    {
      question: "What makes CareChat different from traditional healthcare?",
      answer: "CareChat combines traditional healthcare expertise with modern technology to provide convenient, instant, and personalized healthcare solutions. Our digital platform makes healthcare services available anytime, anywhere, while maintaining high-quality standards."
    },
    {
      question: "Is my personal health information secure with CareChat?",
      answer: "Absolutely! We take data security very seriously. All your personal and health information is encrypted and stored securely following HIPAA compliance standards. We implement the latest security measures to ensure your data remains confidential."
    },
    {
      question: "Can I get prescriptions through CareChat?",
      answer: "Yes! Our platform enables doctors to issue digital prescriptions after online consultations. These prescriptions are securely delivered to you and can be used at partner pharmacies. We ensure all prescriptions meet regulatory requirements."
    },
    {
      question: "What types of doctors are available on CareChat?",
      answer: "We have a diverse network of certified healthcare professionals including general physicians, specialists, pediatricians, dermatologists, psychiatrists, and more. All our doctors are verified and licensed to practice medicine."
    },
    {
      question: "How do I schedule an appointment?",
      answer: "Scheduling an appointment is simple! Just log into your account, choose your preferred doctor or specialist, select an available time slot, and confirm your booking. You'll receive immediate confirmation and reminders before your appointment."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit/debit cards, digital wallets, and insurance coverage where applicable. All payments are processed securely through our encrypted payment gateway."
    }
  ];

  return (
    <>
      <div className="pt-32 pb-16 min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#007E85] mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Find answers to common questions about CareChat's mission and services</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 ${
                  openIndex === index ? 'border-[#007E85]' : 'border-transparent'
                }`}
              >
                <button
                  className={`w-full px-8 py-6 text-left flex justify-between items-center rounded-2xl transition-colors duration-300 ${
                    openIndex === index ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className={`font-semibold text-lg transition-colors duration-300 ${
                    openIndex === index ? 'text-[#007E85]' : 'text-gray-800'
                  }`}>
                    {faq.question}
                  </span>
                  <span className={`ml-4 p-2 rounded-full transition-colors duration-300 ${
                    openIndex === index ? 'bg-[#007E85] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {openIndex === index ? <FiMinus size={20} /> : <FiPlus size={20} />}
                  </span>
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <p className="px-8 py-6 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Faq
