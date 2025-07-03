import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Video, HomeIcon, Settings } from 'lucide-react'; // Import relevant icons

const HowAppointmentsWork = () => {
  return (
    <div className="container mx-auto p-4 mt-24 mb-10">
      <div className="text-center mb-10 sm:mb-14 lg:mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-[#007E85] mb-4">How Appointments Work</h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
          Booking and managing your medical appointments has never been easier. Follow our simple process to connect with healthcare professionals.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-[#007E85] flex flex-col items-start hover:shadow-xl transition-all duration-300">
          <div className="bg-[#007E85] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
            <Search className="text-2xl sm:text-3xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">1. Finding a Doctor</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
            Our platform allows you to easily search for doctors based on various criteria such as specialization, location, and availability. You can view detailed doctor profiles, including their qualifications, experience, and patient reviews, to help you make an informed decision.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-[#6EAB36] flex flex-col items-start hover:shadow-xl transition-all duration-300">
          <div className="bg-[#6EAB36] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
            <Calendar className="text-2xl sm:text-3xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">2. Booking an Appointment</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
            Once you've found a suitable doctor, you can book an appointment directly through their profile. Our system displays real-time availability, allowing you to choose a date and time that fits your schedule. You'll receive an instant confirmation once your appointment is successfully booked.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-[#007E85] flex flex-col items-start hover:shadow-xl transition-all duration-300">
          <div className="bg-[#007E85] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
            <Video className="text-2xl sm:text-3xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">3. Virtual Consultations</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
            Many of our doctors offer virtual consultations, allowing you to connect with them from the comfort of your home. These consultations are conducted through secure video calls, ensuring privacy and convenience. You'll receive a link to join your virtual appointment prior to the scheduled time.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-[#6EAB36] flex flex-col items-start hover:shadow-xl transition-all duration-300">
          <div className="bg-[#6EAB36] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
            <HomeIcon className="text-2xl sm:text-3xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">4. In-person Visits</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
            For those who prefer in-person consultations, our platform also facilitates booking traditional clinic visits. The doctor's profile will provide their clinic address and directions. Please ensure you arrive on time for your appointment.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-4 border-[#007E85] flex flex-col items-start hover:shadow-xl transition-all duration-300 md:col-span-2 mx-auto w-full max-w-2xl">
          <div className="bg-[#007E85] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
            <Settings className="text-2xl sm:text-3xl" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3">5. Managing Your Appointments</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
            Your patient dashboard provides a comprehensive overview of all your upcoming and past appointments. You can easily reschedule or cancel appointments, view appointment details, and access consultation notes or prescriptions directly from your dashboard.
          </p>
        </section>
      </div>

      <div className="text-center mt-12 sm:mt-16 lg:mt-20">
        <p className="text-lg sm:text-xl leading-relaxed mb-6 text-gray-700">
          Our aim is to make healthcare accessible and convenient by streamlining the appointment booking process for both patients and doctors.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-[#007E85] text-white rounded-lg font-lexend hover:bg-[#006b6f] transform hover:scale-105 transition-all text-base sm:text-lg shadow-lg"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default HowAppointmentsWork;
