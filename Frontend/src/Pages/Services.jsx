import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { NavLink } from 'react-router-dom'

const Services = () => {
    const services = [
        {
            id: 1,
            title: "Online Consultations",
            description: "Connect with healthcare professionals from the comfort of your home through secure video consultations.",
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            benefits: ["24/7 availability", "No travel required", "Secure platform", "Instant prescriptions"]
        },
        {
            id: 2,
            title: "Mental Health Services",
            description: "Comprehensive mental health support including therapy, counseling, and psychiatric consultations.",
            image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            benefits: ["Licensed therapists", "Confidential sessions", "Personalized care", "Stress management"]
        },
        {
            id: 3,
            title: "Health Checkups",
            description: "Regular health screenings and preventive care packages for early detection and better health management.",
            image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
            benefits: ["Comprehensive screening", "Quick results", "Expert analysis", "Follow-up care"]
        },
        {
            id: 4,
            title: "Emergency Care",
            description: "24/7 emergency medical services with rapid response teams and immediate care facilities.",
            image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            benefits: ["Immediate response", "Skilled professionals", "Advanced equipment", "Critical care"]
        },
        {
            id: 5,
            title: "Lab Tests & Diagnostics",
            description: "Wide range of laboratory tests and diagnostic services with home sample collection available.",
            image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
            benefits: ["Home collection", "Quick results", "Digital reports", "Expert pathologists"]
        },
        {
            id: 6,
            title: "Specialized Care",
            description: "Access to specialists across various medical fields for expert consultation and treatment.",
            image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
            benefits: ["Expert doctors", "Multiple specialties", "Advanced treatment", "Coordinated care"]
        }
    ];

    return (
        <>
            <div className="bg-gray-50">
                {/* Hero Section */}
                <div className="relative h-[500px] overflow-hidden">
                    <img 
                        src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1453&q=80" 
                        alt="Medical Services"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#007E85] bg-opacity-70 flex items-center justify-center">
                        <div className="text-center text-white">
                            <h1 className="text-6xl font-bold mb-6">Our Services</h1>
                            <p className="text-2xl max-w-2xl mx-auto">Comprehensive healthcare solutions tailored to your needs</p>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map(service => (
                            <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div className="h-48 overflow-hidden">
                                    <img 
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold text-[#007E85] mb-4">{service.title}</h3>
                                    <p className="text-gray-600 mb-6">{service.description}</p>
                                    <div className="space-y-2">
                                        {service.benefits.map((benefit, index) => (
                                            <div key={index} className="flex items-center text-gray-700">
                                                <span className="w-2 h-2 bg-[#FFA500] rounded-full mr-2"></span>
                                                <span>{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <NavLink 
                                        to={`/service/${service.id}`}
                                        className="mt-6 inline-block px-6 py-3 bg-[#007E85] text-white rounded-lg hover:bg-[#006b6f] transition-colors duration-300"
                                    >
                                        Learn More
                                    </NavLink>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative py-16">
                    <img 
                        src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80"
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="CTA Background"
                    />
                    <div className="relative bg-[#007E85] bg-opacity-90 text-white py-16">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-3xl font-bold mb-6">Need Immediate Assistance?</h2>
                            <p className="text-xl mb-8">Our healthcare professionals are available 24/7 to help you</p>
                            <NavLink 
                                to="/contact"
                                className="inline-block px-8 py-4 bg-[#FFA500] text-white rounded-lg hover:bg-[#ff9100] transition-colors duration-300 text-lg font-semibold"
                            >
                                Contact Us Now
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Services