import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[#007E85] text-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-5 sm:grid-cols-3 gap-8">
                    
                    <div className="space-y-4">
                        <NavLink className="w-auto inline-block transform hover:scale-105 transition-transform duration-300" to="/">
                            <div className="flex items-center bg-white rounded-lg px-4 py-2">
                                <span className="text-[#007E85] text-2xl font-lexend font-bold">MediHome</span>
                            </div>
                        </NavLink>
                        <p className="text-sm text-gray-100 font-lato">Your Trusted Partner in Health & Wellness</p>
                        <div className='sm:block hidden'>
                            <span className="text-sm text-gray-200 font-lexend">© 2023 MediHome. All Rights Reserved</span>
                        </div>
                    </div>

                    <div className="font-lexend">
                        <h2 className="text-xl font-bold mb-4 text-white">Services</h2>
                        <ul className="space-y-3">
                            <li><NavLink to="/appointments" className="hover:text-gray-300 hover:underline transition-all duration-300">Appointments</NavLink></li>
                            <li><NavLink to="/chat" className="hover:text-gray-300 hover:underline transition-all duration-300">Consultations</NavLink></li>
                            <li><NavLink to="/services" className="hover:text-gray-300 hover:underline transition-all duration-300">Health Checkups</NavLink></li>
                            <li><NavLink to="/wellness" className="hover:text-gray-300 hover:underline transition-all duration-300">Wellness Program</NavLink></li>
                        </ul>
                    </div>

                    <div className="font-lexend">
                        <h2 className="text-xl font-bold mb-4 text-white">About</h2>
                        <ul className="space-y-3">
                            <li><NavLink to="/about" className="hover:text-gray-300 hover:underline transition-all duration-300">Our Story</NavLink></li>
                            <li><NavLink to="/about#team" className="hover:text-gray-300 hover:underline transition-all duration-300">Team</NavLink></li>
                            <li><NavLink to="/blogs" className="hover:text-gray-300 hover:underline transition-all duration-300">Blogs</NavLink></li>
                            <li><NavLink to="/services" className="hover:text-gray-300 hover:underline transition-all duration-300">Services</NavLink></li>
                        </ul>
                    </div>

                    <div className="font-lexend">
                        <h2 className="text-xl font-bold mb-4 text-white">Support</h2>
                        <ul className="space-y-3">
                            <li><NavLink to="/about/faq" className="hover:text-gray-300 hover:underline transition-all duration-300">FAQs</NavLink></li>
                            <li><NavLink to="/about/privacy-policy" className="hover:text-gray-300 hover:underline transition-all duration-300">Privacy Policy</NavLink></li>
                            <li><NavLink to="/contactus" className="hover:text-gray-300 hover:underline transition-all duration-300">Contact Us</NavLink></li>
                            <li><NavLink to="/about/terms-and-conditions" className="hover:text-gray-300 hover:underline transition-all duration-300">Terms of Service</NavLink></li>
                        </ul>
                    </div>

                    <div className="font-lexend">
                        <h2 className="text-xl font-bold mb-4 text-white">Connect With Us</h2>
                        <div className="flex space-x-4">
                            <NavLink to="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 hover:scale-110 transition-all duration-300 text-2xl"><FaFacebook /></NavLink>
                            <NavLink to="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 hover:scale-110 transition-all duration-300 text-2xl"><FaTwitter /></NavLink>
                            <NavLink to="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 hover:scale-110 transition-all duration-300 text-2xl"><FaInstagram /></NavLink>
                            <NavLink to="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 hover:scale-110 transition-all duration-300 text-2xl"><FaLinkedin /></NavLink>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-gray-200">Subscribe to our newsletter</p>
                            <NavLink to="/newsletter" className="text-sm text-gray-300 hover:text-white underline">Sign up now</NavLink>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center sm:hidden block">
                    <p className="text-sm text-gray-200 font-lexend">© 2023 MediHome. All Rights Reserved</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
