import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { NavLink } from 'react-router-dom'

const Blogs = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Understanding Mental Health in Modern Times",
      excerpt: "Explore the importance of mental health awareness and self-care strategies in today's fast-paced world.",
      author: "Dr. Sarah Johnson",
      date: "October 15, 2023",
      image: "https://images.unsplash.com/photo-1505455184862-554165e5f6ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
    },
    {
      id: 2, 
      title: "The Benefits of Regular Health Check-ups",
      excerpt: "Learn why preventive healthcare through regular medical check-ups is crucial for long-term wellbeing.",
      author: "Dr. Michael Chen",
      date: "October 10, 2023",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80"
    },
    {
      id: 3,
      title: "Nutrition Tips for Better Mental Health",
      excerpt: "Discover how your diet can impact your mental wellbeing and what foods can help improve your mood.",
      author: "Dr. Emily Williams",
      date: "October 5, 2023",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1453&q=80"
    },
    {
      id: 4,
      title: "Exercise and Mental Wellness",
      excerpt: "Understanding the powerful connection between physical activity and mental health improvements.",
      author: "Dr. James Miller",
      date: "October 1, 2023",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 5,
      title: "Sleep and Mental Health Connection",
      excerpt: "Learn about the crucial relationship between quality sleep and maintaining good mental health.",
      author: "Dr. Lisa Brown",
      date: "September 28, 2023",
      image: "https://images.unsplash.com/photo-1541199249251-f713e6145474?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 6,
      title: "Stress Management Techniques",
      excerpt: "Effective strategies to cope with daily stress and maintain mental wellness in challenging times.",
      author: "Dr. Robert Taylor",
      date: "September 25, 2023",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1099&q=80"
    }
  ]

  return (
    <>
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#007E85] mb-4">Health & Wellness Blog</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Stay informed with the latest insights, tips, and news about mental health, wellness, and healthcare practices.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(post => (
            <div 
              key={post.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#007E85] mb-2">{post.title}</h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
                <NavLink 
                  to={`/blog/${post.id}`}
                  className="mt-4 inline-block px-6 py-2 bg-[#007E85] text-white rounded hover:bg-[#006b6f] transition-colors duration-300"
                >
                  Read More
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Blogs