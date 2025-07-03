import React from 'react';
import { Link } from 'react-router-dom';
import { NotebookPen, MessageCircle, FileText, CalendarDays, ClipboardCheck } from 'lucide-react';

const HowConsultationWorks = () => {
  return (
    <div className="container mx-auto p-4 mt-24 mb-10">
      <div className="text-center mb-10 sm:mb-14 lg:mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-[#007E85] mb-4">How Your Chat Consultation Works</h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
          Once you've booked your appointment, here's what to expect during and after your chat-based medical consultation.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-[#007E85] flex flex-col items-start hover:shadow-xl transition-all duration-300">
          <div className="bg-[#007E85] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
            <NotebookPen className="text-2xl sm:text-3xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">1. Preparing for Your Consultation</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
            Before your scheduled chat consultation, ensure you have a stable internet connection. Gather any relevant medical documents, previous test results, or a list of your current medications. Jot down your symptoms and questions to discuss with the doctor.
          </p>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            Being prepared helps your doctor provide the best possible care through text-based communication.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-[#6EAB36] flex flex-col items-start hover:shadow-xl transition-all duration-300">
          <div className="bg-[#6EAB36] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
            <MessageCircle className="text-2xl sm:text-3xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">2. During the Consultation</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
            Your chat consultation will involve a thorough discussion of your symptoms and medical history via our secure messaging platform. The doctor will ask questions, provide preliminary diagnoses, and discuss potential treatment options. Feel free to ask any questions or voice concerns during this time.
          </p>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            Our platform supports secure text-based communication, ensuring a private and effective consultation channel. You will find the chat option in your dashboard under the 'Messages' tab once your appointment is booked.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-[#007E85] flex flex-col items-start hover:shadow-xl transition-all duration-300">
          <div className="bg-[#007E85] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
            <FileText className="text-2xl sm:text-3xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">3. Prescriptions and Referrals</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
            If required, your doctor will issue electronic prescriptions directly through the platform, which you can easily access and take to your pharmacy. For specialized care, the doctor may provide referrals to other specialists or recommend further diagnostic tests.
          </p>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            All prescriptions and referrals are securely stored and accessible via your patient dashboard.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-[#6EAB36] flex flex-col items-start hover:shadow-xl transition-all duration-300">
          <div className="bg-[#6EAB36] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
            <ClipboardCheck className="text-2xl sm:text-3xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">4. Medical Records and Summaries</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
            After each consultation, a detailed summary of your visit, including diagnosis, treatment plan, and any advice, will be added to your secure medical record. You can review your consultation history and health progress at any time through your dashboard.
          </p>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            This ensures you have a comprehensive and easily accessible overview of your health journey.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-[#007E85] flex flex-col items-start hover:shadow-xl transition-all duration-300 md:col-span-2 mx-auto w-full max-w-2xl">
          <div className="bg-[#007E85] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
            <CalendarDays className="text-2xl sm:text-3xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">5. Follow-up and Support</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
            Your health journey doesn't end with a single consultation. Our platform facilitates easy scheduling of follow-up appointments and provides ongoing support through secure chat messaging. You can always reach out to your doctor for clarifications or further guidance.
          </p>
        </section>
      </div>

      <div className="text-center mt-12 sm:mt-16 lg:mt-20">
        <p className="text-lg sm:text-xl leading-relaxed mb-6 text-gray-700">
          We are committed to providing continuous and comprehensive care, ensuring you have the support you need for your well-being.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-[#007E85] text-white rounded-lg font-lexend hover:bg-[#006b6f] transform hover:scale-105 transition-all text-base sm:text-lg shadow-lg"
        >
          Back to Home
        </Link>
      </div>

      <section className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mt-12 sm:mt-16 lg:mt-20 max-w-4xl mx-auto" role="alert">
        <h3 className="font-bold text-lg mb-2">Important Notice: Off-Platform Communication Policy</h3>
        <p className="text-base leading-relaxed">
          To ensure the safety, security, and integrity of our platform, any attempt by either party (patient or doctor) to share contact details or solicit communication outside of our secure platform will result in immediate account termination. Additionally, the account holder will be subject to applicable charges for policy violation. All consultations and related communications must take place within our platform to protect your privacy and ensure compliance with healthcare regulations.
        </p>
      </section>
    </div>
  );
};

export default HowConsultationWorks;
