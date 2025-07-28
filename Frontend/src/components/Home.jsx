import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import "../styles/pages/Home.css"
import { useState, useEffect, useRef } from 'react'
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { User, FileText, Search, MessageCircle, Calendar, Shield, Clock, Star, CheckCircle, Users, Stethoscope, Heart, Activity } from 'lucide-react';
import {
  FaHeartbeat,
  FaComments,
  FaCalendarCheck,
  FaStethoscope,
  FaPrescription,
  FaShieldAlt,
  FaClock,
  FaUserCheck,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaPlay,
  FaCheckCircle,
  FaUsers,
  FaAward,
  FaPhone,
  FaVideo,
  FaLaptop,
  FaMoneyBillWave,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { useContext } from 'react';
import { AuthContext } from '../contexts/authContext.jsx';
import MessageBox from './common/MessageBox.jsx';
import faqs from '../json/faq.json';
import testimonials from '../json/testimonials.json';



const Home = () => {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messageBox, setMessageBox] = useState({ show: false, type: '', message: '' });
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const chatContainerRef = useRef(null);

  const showMessage = (type, message) => {
    setMessageBox({ show: true, type, message });
  };

  const closeMessageBox = () => {
    setMessageBox({ show: false, type: '', message: '' });
  };

  const handleWellnessClick = (e) => {
    e.preventDefault();
    if (user && user.role === 'patient') {
      navigate('/patient/wellness');
    } else {
      navigate('/login');
      showMessage('info', 'Please login as a patient to access the Wellness Program');
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };


  const steps = [
    {
      id: 1,
      title: "Register & Login",
      description: "Create your account and access your personal dashboard to get started with our healthcare platform.",
      icon: <User className="w-8 h-8" />
    },
    {
      id: 2,
      title: "Complete Medical Profile",
      description: "Fill out your medical details and health information in the 'My Profile' section to help doctors understand your needs.",
      icon: <FileText className="w-8 h-8" />
    },
    {
      id: 3,
      title: "Find & Book Doctor",
      description: "Browse available doctors, view their profiles, select convenient time slots, and pay consultation fees securely.",
      icon: <Search className="w-8 h-8" />
    },
    {
      id: 4,
      title: "Live Chat Consultation",
      description: "Connect with your doctor through our secure live chat platform for professional medical consultation.",
      icon: <MessageCircle className="w-8 h-8" />
    }
  ];

  const hero_testimonials = [
    { name: "Priya Sharma", condition: "Diabetes Care", rating: 5, text: "Quick response and excellent care!" },
    { name: "Rahul Gupta", condition: "Heart Health", rating: 5, text: "Professional consultation from home" },
    { name: "Anita Patel", condition: "General Health", rating: 5, text: "Easy booking and great doctors" }
  ];

  const chatMessages = [
    { type: 'doctor', message: "Hello! I've reviewed your medical profile. How can I help you today?" },
    { type: 'patient', message: "I've been experiencing stomach pain for the past 2 days" },
    { type: 'doctor', message: "I understand your concern. Let me ask a few questions to better assess your condition..." }
  ];

  const stats = [
    { icon: <Users className="w-5 h-5" />, value: "50,000+", label: "Patients Served" },
    { icon: <Stethoscope className="w-5 h-5" />, value: "500+", label: "Verified Doctors" },
    { icon: <Star className="w-5 h-5" />, value: "4.9/5", label: "Patient Rating" },
    { icon: <Clock className="w-5 h-5" />, value: "24/7", label: "Available" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % hero_testimonials.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const text = "Get instant medical advice through secure chat consultations";
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setTypingText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);


  return (
    <main className='mt-20'>
      {messageBox.show && (
        <MessageBox
          type={messageBox.type}
          message={messageBox.message}
          onClose={closeMessageBox}
        />
      )}

      {/* Hero Section */}
      <section className="hero container flex flex-col gap-10 lg:flex-row items-center justify-center m-auto p-4 sm:p-6 md:p-8 lg:p-14 lg:py-20 relative overflow-hidden min-h-screen">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-[#007E85] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 sm:w-64 lg:w-96 h-48 sm:h-64 lg:h-96 bg-[#6EAB36] opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        {/* Floating Elements */}
        <div className="absolute bottom-20 right-10 hidden lg:block">
          <div className="bg-white p-3 rounded-full shadow-lg animate-float-delayed">
            <Activity className="w-6 h-6 text-[#6EAB36]" />
          </div>
        </div>

        <div className='hero-left z-10 text-center lg:text-left w-full lg:w-1/2 mb-8 lg:mb-0'>
          <div className="inline-block mb-4 px-4 py-2 bg-[#007E85] bg-opacity-10 text-[#007E85] rounded-full text-sm font-medium">
            💬 Trusted by 50,000+ Patients
          </div>

          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6'>
            Expert Medical Care
            <br />
            <span className='text-[#007E85]'>Through Live Chat</span>
            <br />
            <span className='text-[#6EAB36]'>24/7 Available</span>
          </h1>

          <div className="h-16 mb-6">
            <p className='font-lato text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed'>
              {typingText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start mb-8">
            <Link to='/doctors' className='px-6 sm:px-8 py-3 sm:py-4 bg-[#007E85] text-white rounded-lg font-lexend hover:bg-[#006b6f] transform hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg'>
              <MessageCircle className="w-5 h-5" /> Start Chat Consultation
            </Link>
            <Link to='/doctors' className='px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#6EAB36] text-[#6EAB36] rounded-lg font-lexend hover:bg-[#6EAB36] hover:text-white transform hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg'>
              <Calendar className="w-5 h-5" /> Book Appointment
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-[#6EAB36] w-4 h-4" />
              <span>Instant Chat Response</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-[#6EAB36] w-4 h-4" />
              <span>Verified Doctors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-[#6EAB36] w-4 h-4" />
              <span>Secure & Private</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
                <div className="flex justify-center mb-2 text-[#007E85]">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className='hero-right w-full lg:w-1/2 relative'>
          <div className="space-y-4">
            {/* Live Chat Interface */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#007E85] to-[#6EAB36]"></div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#007E85] to-[#6EAB36] rounded-full flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Dr. Sarah Johnson</h3>
                    <p className="text-sm text-gray-600">Cardiologist • Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
              </div>

              <div ref={chatContainerRef} className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'patient' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${msg.type === 'patient'
                      ? 'bg-[#007E85] text-white'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E85]"
                  disabled
                />
                <button className="px-4 py-2 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>


            {/* Testimonial Carousel */}
            <div className="bg-gradient-to-r from-[#007E85] to-[#6EAB36] text-white p-6 rounded-2xl shadow-2xl">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {[...Array(hero_testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-yellow-300" />
                  ))}
                </div>
                <p className="text-sm mb-3 italic">"{hero_testimonials[currentTestimonial].text}"</p>
                <p className="font-semibold">{hero_testimonials[currentTestimonial].name}</p>
                <p className="text-xs opacity-90">{hero_testimonials[currentTestimonial].condition}</p>
              </div>
            </div>
          </div>

          {/* Floating Badge */}
          <div className="absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-lg animate-bounce">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[#007E85] font-bold text-sm">500+ Doctors Online</span>
            </div>
          </div>
        </div>

      </section>

      {/* Services Section */}
      <section className='pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-24 lg:pb-32 px-4 bg-gradient-to-b from-white to-gray-50'>
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <h2 className='text-[#007E85] font-bold text-3xl sm:text-4xl lg:text-5xl font-dm mb-4 sm:mb-6'>
              Complete Healthcare Solutions
            </h2>
            <p className='text-gray-600 max-w-3xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed px-4'>
              From instant consultations to personalized wellness programs, we provide comprehensive medical services
              designed to make quality healthcare accessible, convenient, and affordable for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 border-[#007E85]">
              <div className="bg-[#007E85] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
                <FaVideo className="text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#007E85] mb-2 sm:mb-4">Live Video Consultations</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Connect with doctors instantly through secure video calls. Get diagnosis, prescriptions, and medical advice from anywhere.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>From ₹299</span>
                <span>⏱️ 15-30 min</span>
              </div>
              <NavLink to="/doctors" className="text-[#007E85] font-semibold flex items-center gap-2 hover:gap-3 transition-all text-sm sm:text-base">
                Book Now <FaPlay />
              </NavLink>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 border-[#6EAB36]">
              <div className="bg-[#6EAB36] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
                <FaHeartbeat className="text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#6EAB36] mb-2 sm:mb-4">AI-Powered Wellness</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Get personalized diet plans, exercise routines, and health tracking powered by artificial intelligence.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Free Trial</span>
                <span>📱 Mobile App</span>
              </div>
              <button
                onClick={handleWellnessClick}
                className="text-[#6EAB36] font-semibold flex items-center gap-2 hover:gap-3 transition-all text-sm sm:text-base"
              >
                Start Program <FaPlay />
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 border-[#007E85]">
              <div className="bg-[#007E85] text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-4 sm:mb-6">
                <FaStethoscope className="text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#007E85] mb-2 sm:mb-4">Specialist Consultations</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Access specialized doctors including cardiologists, dermatologists, psychiatrists, and more.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>₹499-₹999</span>
                <span>🏥 25+ Specialties</span>
              </div>
              <NavLink to="/specialists" className="text-[#007E85] font-semibold flex items-center gap-2 hover:gap-3 transition-all text-sm sm:text-base">
                Find Specialist <FaPlay />
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className='py-16 bg-gradient-to-br from-gray-50 to-blue-50'>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#007E85] mb-6">How It Works</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Getting quality healthcare is simple with our platform. Follow these easy steps to start your journey to better health.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-6 top-0 w-1 h-full bg-gradient-to-b from-[#007E85] to-[#00A8B5] rounded-full"></div>

              <div className="space-y-12 py-4">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center relative">
                    {/* Dot */}
                    <div className="w-12 h-12 bg-white border-4 border-[#007E85] rounded-full flex items-center justify-center shadow-lg relative z-10 flex-shrink-0">
                      <span className="text-[#007E85] font-bold text-lg">{step.id}</span>
                    </div>

                    {/* Content Card */}
                    <div className="ml-6 bg-white rounded-2xl p-6 shadow-xl border-l-4 border-[#007E85] hover:shadow-2xl transition-all duration-300 flex-grow">
                      <div className="flex items-center mb-4">
                        <div className="bg-gradient-to-r from-[#007E85] to-[#00A8B5] text-white rounded-full w-12 h-12 flex items-center justify-center mr-4">
                          {step.icon}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="bg-white rounded-2xl p-8 shadow-xl border-t-4 border-[#007E85] max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-[#007E85] mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6">Join thousands of patients who trust our platform for their healthcare needs.</p>
                <button className="bg-gradient-to-r from-[#007E85] to-[#00A8B5] text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Start Your Journey
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className='py-16 bg-[#f8fafc] relative overflow-hidden'>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-[#007E85] mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Experience the future of healthcare with our innovative features and dedicated medical professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-[#007E85] opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <FaShieldAlt className="text-4xl text-[#007E85] mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Instant Access</h3>
              <p className="text-gray-600 mb-4">
                Connect with doctors within 2 minutes. No waiting rooms, no long queues. Get medical help when you need it most.
              </p>
              <div className="flex items-center gap-2 text-[#6EAB36] font-medium">
                <span>24/7 Available</span>
                <FaClock className="animate-pulse" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-[#6EAB36] opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <FaAward className="text-4xl text-[#6EAB36] mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Verified Doctors</h3>
              <p className="text-gray-600 mb-4">
                All doctors are verified professionals with valid licenses and 10+ years of experience. Quality care guaranteed.
              </p>
              <div className="flex items-center gap-2 text-[#007E85] font-medium">
                <span>Certified & Licensed</span>
                <FaUserCheck />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-[#007E85] opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <FaMoneyBillWave className="text-4xl text-[#007E85] mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Affordable Care</h3>
              <p className="text-gray-600 mb-4">
                Transparent pricing with no hidden fees. Pay only for consultations, starting from just ₹299.
              </p>
              <div className="flex items-center gap-2 text-[#6EAB36] font-medium">
                <span>No Hidden Costs</span>
                <FaCheckCircle />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className='py-16 bg-[#f0f9ff]'>
        <div className="container mx-auto px-4 text-center">
          <div className="mb-14">
            <h2 className="text-4xl font-bold text-[#007E85] mb-4">
              See Our Platform in Action
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Watch a quick overview of how our online medical consultancy works and benefits you.
            </p>
          </div>

          <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl  overflow-hidden shadow-xl border-4 border-[#007E85]">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Platform Overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full p-2 rounded-2xl"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='py-16 bg-gray-50'>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#007E85] mb-4">What Our Patients Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Read genuine reviews from patients who have experienced our healthcare services
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-[#007E85]"
                  />
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                    <div className="flex text-yellow-500 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < testimonial.rating ? <FaStar /> : i === Math.floor(testimonial.rating) && testimonial.rating % 1 !== 0 ? <FaStarHalfAlt /> : <FaRegStar />}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section ref={ref} className='py-12 sm:py-16 lg:py-24 relative overflow-hidden'>
        <div className="absolute inset-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#007E85] rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#6EAB36] rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 text-gray-800">Trusted by Thousands</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Making healthcare accessible and affordable for everyone</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 transform hover:scale-105 transition-all duration-300 shadow-lg text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-[#007E85]">
                {inView && <CountUp end={50} duration={2} />}K+
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-600">Happy Patients</p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 transform hover:scale-105 transition-all duration-300 shadow-lg text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-[#6EAB36]">
                {inView && <CountUp end={500} duration={2} />}+
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-600">Verified Doctors</p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 transform hover:scale-105 transition-all duration-300 shadow-lg text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-[#007E85]">
                {inView && <CountUp end={1} duration={2} />}M+
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-600">Consultations</p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 transform hover:scale-105 transition-all duration-300 shadow-lg text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 text-[#6EAB36]">
                {inView && <CountUp end={98} duration={2} />}%
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-600">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-[#007E85] mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Quick answers to the most common questions about our services.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-xl border transition-all duration-300 ${expandedFaq === index
                  ? 'border-[#007E85]/50 bg-white shadow-lg'
                  : 'border-gray-200 bg-white hover:shadow-md'
                  }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left"
                >
                  <span className="text-lg md:text-xl font-medium text-gray-800">{faq.question}</span>
                  <FaChevronDown
                    className={`text-[#007E85] transform transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedFaq === index ? 'max-h-96' : 'max-h-0'
                    }`}
                >
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}

export default Home