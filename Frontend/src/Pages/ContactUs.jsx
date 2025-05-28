import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { Checkbox } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Footer from '../components/Footer';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const ContactUs = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    // Handle form submission
  };

  return (
    <>
      <div className="bg-gray-50">
        <div className="relative h-[400px] overflow-hidden">
          <img 
            src="assets/images/contact-hero.png" 
            alt="Contact Us Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#007E85] bg-opacity-70 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-6xl font-bold mb-6">Contact Us</h1>
              <p className="text-2xl max-w-2xl mx-auto">We're here to help and answer any questions you might have. We look forward to hearing from you.</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="flex justify-center mb-4">
                <FaPhone className="text-4xl text-[#007E85]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Phone</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
              <p className="text-gray-600">Mon-Fri: 9:00 AM - 6:00 PM</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="flex justify-center mb-4">
                <FaEnvelope className="text-4xl text-[#007E85]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-gray-600">support@CareChat.com</p>
              <p className="text-gray-600">info@CareChat.com</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="flex justify-center mb-4">
                <FaMapMarkerAlt className="text-4xl text-[#007E85]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Location</h3>
              <p className="text-gray-600">123 Healthcare Avenue</p>
              <p className="text-gray-600">New York, NY 10001</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-[#007E85] mb-4">Get in Touch</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">Have a specific question or concern? Fill out the form below and our team will get back to you within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">First Name</label>
                    <input
                      {...register("firstname", { required: "First name is required" })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#007E85] focus:ring-[#007E85] focus:ring-1 outline-none transition duration-200"
                      type="text"
                      placeholder="Enter your first name"
                    />
                    {errors.firstname && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstname.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Last Name</label>
                    <input
                      {...register("lastname", { required: "Last name is required" })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#007E85] focus:ring-[#007E85] focus:ring-1 outline-none transition duration-200"
                      type="text"
                      placeholder="Enter your last name"
                    />
                    {errors.lastname && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastname.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                    <input
                      {...register("email", { 
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#007E85] focus:ring-[#007E85] focus:ring-1 outline-none transition duration-200"
                      type="email"
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                    <input
                      {...register("phonenumber", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9]{9,10}$/,
                          message: "Please enter a valid phone number"
                        }
                      })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#007E85] focus:ring-[#007E85] focus:ring-1 outline-none transition duration-200"
                      type="tel"
                      placeholder="Enter your phone number"
                    />
                    {errors.phonenumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.phonenumber.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Topic</label>
                  <div className="relative">
                    <select
                      {...register("topic", { required: "Please select a topic" })}
                      className="w-full px-4 py-3 pr-8 rounded-lg border border-gray-300 focus:border-[#007E85] focus:ring-[#007E85] focus:ring-1 outline-none transition duration-200 appearance-none"
                    >
                      <option value="">Select a topic</option>
                      <option value="doctor">Join As Doctor</option>
                      <option value="support">Technical Support</option>
                      <option value="inquiry">General Inquiry</option>
                      <option value="error">Report an Error</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership Opportunities</option>
                    </select>
                    <div className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2">
                      <svg className="fill-current h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                  {errors.topic && (
                    <p className="text-red-500 text-sm mt-1">{errors.topic.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Message</label>
                  <textarea
                    {...register("message", { required: "Please enter your message" })}
                    rows="5"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#007E85] focus:ring-[#007E85] focus:ring-1 outline-none transition duration-200"
                    placeholder="Please describe your inquiry in detail..."
                  ></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <Checkbox
                    {...register("terms", {
                      required: "You must accept the terms and conditions"
                    })}
                    color="teal"
                    className="h-5 w-5"
                  />
                  <label className="ml-2 text-gray-700">
                    I accept the <Link to="/about/terms-and-conditions" className="text-[#007E85] hover:underline">terms & conditions</Link> and <Link to="/about/privacy-policy" className="text-[#007E85] hover:underline">privacy policy</Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-red-500 text-sm">{errors.terms.message}</p>
                )}

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#007E85] text-white px-12 py-4 rounded-lg font-medium hover:bg-[#006b6f] transition duration-200 disabled:opacity-50 text-lg"
                  >
                    {isSubmitting ? "Submitting..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-[#007E85] text-white py-16 mt-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Emergency Contact</h2>
            <p className="text-xl mb-8">For medical emergencies, please call our 24/7 helpline</p>
            <div className="text-4xl font-bold">1-800-CareChat</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactUs