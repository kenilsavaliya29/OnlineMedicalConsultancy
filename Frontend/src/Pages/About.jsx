import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const About = () => {
    return (
        <>
            <div className="container mx-auto px-4 py-24">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-[#007E85] mb-6">About Us</h1>
                    <p className="text-gray-600 text-xl max-w-3xl mx-auto">Transforming lives through compassionate mental healthcare and innovative support services tailored to your unique journey.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-[#007E85] mb-5">Our Mission</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">We are dedicated to revolutionizing mental healthcare through personalized, evidence-based treatments that empower individuals to overcome challenges and flourish. Our commitment to excellence and innovation ensures that every patient receives the highest quality care on their path to wellness.</p>
                        </div>
                        
                        <div>
                            <h2 className="text-4xl font-bold text-[#007E85] mb-5">Our Vision</h2>
                            <p className="text-gray-600 text-lg leading-relaxed">To pioneer the future of mental healthcare, creating a world where seeking mental health support is normalized, accessible, and transformative for everyone. We envision a society where mental health is prioritized equally with physical health, and where everyone has access to the support they need.</p>
                        </div>
                    </div>
                    <div className="relative">
                        <img src="https://img.freepik.com/free-photo/medium-shot-doctor-with-crossed-arms_23-2148868176.jpg" 
                            alt="Caring Healthcare Professional" 
                            className="rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 w-full h-[400px] object-cover"
                        />
                        <div className="absolute -bottom-6 -right-6 bg-[#007E85] text-white p-6 rounded-lg hidden md:block">
                            <p className="text-2xl font-bold">20+ Years</p>
                            <p>of Excellence</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-[#f8f9fa] to-[#e9ecef] p-12 rounded-2xl mb-20">
                    <h2 className="text-4xl font-bold text-[#007E85] mb-12 text-center">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-[#007E85] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl text-white">✨</span>
                            </div>
                            <h3 className="text-2xl font-bold text-[#007E85] mb-4">Excellence</h3>
                            <p className="text-gray-600 text-lg">Pursuing the highest standards through continuous innovation and evidence-based practices. We never stop learning and improving our services.</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-[#007E85] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl text-white">❤️</span>
                            </div>
                            <h3 className="text-2xl font-bold text-[#007E85] mb-4">Compassion</h3>
                            <p className="text-gray-600 text-lg">Creating a nurturing environment with empathy and understanding at its core. Every patient's journey is unique and deserves individual attention.</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="w-16 h-16 bg-[#007E85] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl text-white">⚖️</span>
                            </div>
                            <h3 className="text-2xl font-bold text-[#007E85] mb-4">Integrity</h3>
                            <p className="text-gray-600 text-lg">Upholding the highest ethical standards with transparency and trust in all our interactions and treatments.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#f8f9fa] p-12 rounded-2xl mb-20">
                    <h2 className="text-4xl font-bold text-[#007E85] mb-8 text-center">Our Approach</h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold text-[#007E85] mb-4">Personalized Care Plans</h3>
                            <p className="text-gray-600 text-lg">We develop individualized treatment plans that address your specific needs and goals. Our holistic approach considers all aspects of your well-being.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold text-[#007E85] mb-4">Evidence-Based Treatment</h3>
                            <p className="text-gray-600 text-lg">Our treatments are based on the latest research and proven methodologies in mental health care, ensuring you receive the most effective care possible.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold text-[#007E85] mb-4">Continuous Support</h3>
                            <p className="text-gray-600 text-lg">We provide ongoing support and resources to help you maintain your progress and achieve lasting positive changes in your life.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-bold text-[#007E85] mb-4">Innovative Solutions</h3>
                            <p className="text-gray-600 text-lg">We leverage the latest technologies and therapeutic approaches to provide cutting-edge mental health solutions.</p>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-20" id='team'>
                    <h2 className="text-4xl font-bold text-[#007E85] mb-8">Our Expert Team</h2>
                    <p className="text-gray-600 text-xl max-w-3xl mx-auto mb-10">Join forces with our distinguished team of mental health experts, featuring renowned psychiatrists, psychologists, and counselors dedicated to guiding you toward lasting wellness.</p>
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2" alt="Doctor" className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"/>
                            <h3 className="text-xl font-bold text-[#007E85]">Dr. Sarah Johnson</h3>
                            <p className="text-gray-600">Lead Psychiatrist</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d" alt="Doctor" className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"/>
                            <h3 className="text-xl font-bold text-[#007E85]">Dr. Michael Chen</h3>
                            <p className="text-gray-600">Clinical Psychologist</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f" alt="Doctor" className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"/>
                            <h3 className="text-xl font-bold text-[#007E85]">Dr. Emily Williams</h3>
                            <p className="text-gray-600">Therapeutic Specialist</p>
                        </div>
                    </div>
                    <button className="bg-[#007E85] text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-[#006b6f] transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                        Meet Our Specialists
                    </button>
                </div>

                <div className="bg-[#007E85] text-white p-12 rounded-2xl mb-20">
                    <h2 className="text-4xl font-bold mb-8 text-center">Get Started Today</h2>
                    <p className="text-xl text-center mb-8">Take the first step towards better mental health. Schedule a consultation with our experts.</p>
                    <div className="flex justify-center gap-6">
                        <button className="bg-white text-[#007E85] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Book Appointment
                        </button>
                        <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#007E85] transition-colors">
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default About