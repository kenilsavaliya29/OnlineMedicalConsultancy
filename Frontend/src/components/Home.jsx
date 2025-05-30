import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import "../styles/pages/Home.css"
import { useState, useEffect } from 'react'
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { FaHeartbeat, FaComments, FaCalendarCheck, FaStethoscope, FaPrescription, FaShieldAlt, FaClock, FaUserCheck } from 'react-icons/fa';
import { useContext } from 'react';
import { AuthContext } from '../contexts/authContext.jsx';
import { toast } from 'react-toastify';


const Home = () => {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleWellnessClick = (e) => {
    e.preventDefault();
    if (user && user.role === 'patient') {
      navigate('/patient/wellness');
    } else {
      navigate('/login');
      toast.info('Please login as a patient to access the Wellness Program');
    }
  };

  return (
    <main className='mt-20'>
      <div className="hero container flex flex-col lg:flex-row items-center justify-center m-auto p-4 sm:p-6 md:p-8 lg:p-14 lg:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-[#007E85] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 bg-[#6EAB36] opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className='hero-left z-10 text-center lg:text-left w-full lg:w-1/2 mb-8 lg:mb-0'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight'>
            Your Health, <br />
            <span className='text-[#007E85] animate-pulse'>Instantly Connected</span><br />
            <span className='text-[#6EAB36]'>24/7 Care</span>
          </h1>
          <p className='font-lato text-gray-600 my-4 sm:my-6 lg:my-8 text-base sm:text-lg lg:text-xl leading-relaxed'>
            Connect with certified doctors instantly through live chat, schedule appointments, and transform your lifestyle with personalized wellness programs. Your journey to better health starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
            <Link to="/doctors" className='px-6 sm:px-8 py-3 sm:py-4 bg-[#007E85] text-white rounded-lg font-lexend hover:bg-[#006b6f] transform hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base'>
              <FaComments className="text-lg sm:text-xl" /> Chat with Doctor
            </Link>
            <button
              onClick={handleWellnessClick}
              className='px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#6EAB36] text-[#6EAB36] rounded-lg font-lexend hover:bg-[#6EAB36] hover:text-white transform hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base'
            >
              <FaHeartbeat className="text-lg sm:text-xl" /> Wellness Program
            </button>
          </div>
        </div>
        <div className='hero-right w-full lg:w-1/2 relative'>
          <img src="/assets/images/landing_image.svg" alt="" className='w-full animate-float' />
          <div className="absolute top-5 sm:top-10 right-5 sm:right-10 bg-white p-3 sm:p-4 rounded-xl shadow-lg animate-bounce">
            <span className="text-[#007E85] font-bold text-sm sm:text-base">500+</span>
            <p className="text-xs sm:text-sm">Doctors Online</p>
          </div>
        </div>
      </div>

      <section className='pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-24 lg:pb-32 px-4 bg-gradient-to-b from-white to-gray-50'>
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <h1 className='text-[#007E85] font-bold text-3xl sm:text-4xl lg:text-5xl font-dm mb-4 sm:mb-6'>Comprehensive Healthcare Solutions</h1>
            <p className='text-gray-600 max-w-3xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed px-4'>
              Experience a new era of healthcare with our innovative digital solutions. We provide comprehensive medical services designed to make quality healthcare accessible, convenient, and personalized for you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 border-[#007E85]">
              <div className="bg-[#007E85] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
                <FaComments className="text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#007E85] mb-2 sm:mb-4">24/7 Doctor Chat</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Instant medical consultations with qualified doctors anytime, anywhere.</p>
              <NavLink to="/chat" className="text-[#007E85] font-semibold flex items-center gap-2 hover:gap-3 transition-all text-sm sm:text-base">
                Start Chat <FaCalendarCheck />
              </NavLink>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 border-[#6EAB36]">
              <div className="bg-[#6EAB36] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
                <FaHeartbeat className="text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#6EAB36] mb-2 sm:mb-4">Wellness Programs</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Personalized health plans with diet, exercise, and progress tracking.</p>
              <button
                onClick={handleWellnessClick}
                className="text-[#6EAB36] font-semibold flex items-center gap-2 hover:gap-3 transition-all text-sm sm:text-base"
              >
                Join Program <FaCalendarCheck />
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 border-[#007E85]">
              <div className="bg-[#007E85] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
                <FaStethoscope className="text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#007E85] mb-2 sm:mb-4">Specialist Consult</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Connect with specialized doctors for expert medical opinions.</p>
              <NavLink to="/specialists" className="text-[#007E85] font-semibold flex items-center gap-2 hover:gap-3 transition-all text-sm sm:text-base">
                Find Specialist <FaCalendarCheck />
              </NavLink>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 border-[#6EAB36]">
              <div className="bg-[#6EAB36] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
                <FaPrescription className="text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#6EAB36] mb-2 sm:mb-4">E-Prescriptions</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">Digital prescriptions and medication management system.</p>
              <NavLink to="/prescriptions" className="text-[#6EAB36] font-semibold flex items-center gap-2 hover:gap-3 transition-all text-sm sm:text-base">
                View Services <FaCalendarCheck />
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      <section className='py-16 bg-[#f8fafc] relative overflow-hidden'>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-[#007E85] mb-4">
              Your Health Guardians
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Round-the-clock protection for your wellbeing, combining cutting-edge technology with human expertise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-[#007E85] opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <FaShieldAlt className="text-4xl text-[#007E85] mb-6 animate-pulse" />
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Instant Shield</h3>
              <p className="text-gray-600 mb-4">
                Immediate connection to healthcare professionals within 90 seconds, 365 days a year
              </p>
              <div className="flex items-center gap-2 text-[#6EAB36] font-medium">
                <span>Always Protected</span>
                <FaHeartbeat className="animate-pulse" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-[#6EAB36] opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <FaUserCheck className="text-4xl text-[#6EAB36] mb-6 animate-bounce" />
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Expert Armor</h3>
              <p className="text-gray-600 mb-4">
                Verified specialists with average 15+ years experience, continuously monitored quality
              </p>
              <div className="flex items-center gap-2 text-[#007E85] font-medium">
                <span>Quality Assured</span>
                <FaStethoscope className="animate-swing" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-[#007E85] opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <FaClock className="text-4xl text-[#007E85] mb-6 animate-spin-slow" />
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Constant Vigil</h3>
              <p className="text-gray-600 mb-4">
                Continuous health monitoring with AI-powered alerts and follow-up reminders
              </p>
              <div className="flex items-center gap-2 text-[#6EAB36] font-medium">
                <span>Never Miss a Beat</span>
                <FaHeartbeat className="animate-pulse" />
              </div>
            </div>
          </div>

          {/* Animated background elements */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#007E85] opacity-5 rounded-full mix-blend-multiply filter blur-2xl animate-blob"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#6EAB36] opacity-5 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000"></div>
        </div>
      </section>

      <section ref={ref} className='py-12 sm:py-16 lg:py-24 relative overflow-hidden'>
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 text-gray-800">Our Impact in Numbers</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Making a difference in healthcare, one patient at a time</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-[#007E85]">
                {inView && <CountUp end={99} duration={2} />}%
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-600">Patient Satisfaction</p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-[#007E85]">
                {inView && <CountUp end={15} duration={2} />}k+
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-600">Online Consultations</p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-[#007E85]">
                {inView && <CountUp end={12} duration={2} />}k+
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-600">Wellness Members</p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-[#007E85]">
                {inView && <CountUp end={240} duration={2} />}+
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-600">Expert Doctors</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home