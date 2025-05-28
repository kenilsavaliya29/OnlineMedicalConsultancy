import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import "../styles/components/Navbar.css"
import "../styles/globals.css"
import { AuthContext } from '../contexts/authContext.jsx';


const Navbar = ({ cookieCounter }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  

  const { user, loading, logout } = useContext(AuthContext);
  const userName = user ? user.firstName : "";

  // Function to get correct profile image URL
  const getProfileImageUrl = () => {
    if (!user || !user.profileImage) return '/assets/images/profilephoto.svg';
    
    // If the path already includes http/https, use it as is
    if (user.profileImage.startsWith('http')) {
      return user.profileImage;
    }
    
  
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${API_URL}${user.profileImage}`;
  };


  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    // Use the logout function from AuthContext
    const result = await logout();
    if (result.success) {
      setShowLogoutModal(false);
      window.location.href = "/";
    }
  };

  const navLinks = [
    { to: "/", text: "Home", icon: "🏠" },
    { to: "/services", text: "Service", icon: "⚕️" },
    { to: "/contactus", text: "Contact Us", icon: "📞" },
    { to: "/blogs", text: "Blogs", icon: "📝" },
    { to: "/about", text: "About Us", icon: "ℹ️" }
  ];

  return (
    
    <motion.nav 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-white'}`}
    >

      <div className="lg:container m-auto flex justify-between p-5 items-center font-lexend">
        <div className='flex items-center gap-4'>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="lg:hidden z-20 cursor-pointer relative w-10 h-10 flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
              <span className="line"></span>
              <span className="line"></span>
              <span className="line"></span>
            </div>
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <NavLink to="/">
              <img src="/assets/images/logo.png" alt="CareChat Logo" className="h-14" />
            </NavLink>
          </motion.div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30 h-screen"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween" }}
                className="fixed bg-white w-[280px] p-6 shadow-2xl h-screen overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-8">
                    <NavLink to="/">
                      <img src="/assets/images/logo.png" alt="CareChat Logo" className='w-40' />
                    </NavLink>
                  </div>
                  
                  {/* User Profile Section in Mobile Menu */}
                  {user && (
                    <div className="mb-6 pb-6 border-b border-gray-200 sm:hidden">
                      <div className="flex items-center gap-3 mb-4">
                        <img 
                          src={getProfileImageUrl()}
                          alt="Profile" 
                          className="w-12 h-12 rounded-full border-2 border-[#007E85] object-cover" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/images/profilephoto.svg';
                          }}
                        />
                        <div>
                          <p className="font-medium capitalize">{userName}</p>
                          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <NavLink 
                          to="/settings" 
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <img src="/assets/images/settings.svg" alt="" className="w-5 h-5" />
                          <span className="font-medium">Settings</span>
                        </NavLink>
                        <NavLink 
                          to={
                            user?.role === 'admin' ? "/admin/dashboard" : 
                            user?.role === 'doctor' ? "/doctor/dashboard" : 
                            "/patient/dashboard"
                          } 
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <img src="/assets/images/dashboard.svg" alt="" className="w-5 h-5" />
                          <span className="font-medium">Dashboard</span>
                        </NavLink>
                      </div>
                    </div>
                  )}

                  <motion.ul className="space-y-4 flex-1">
                    {navLinks.map(link => (
                      <motion.li 
                        key={link.to}
                        whileHover={{ x: 10 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <NavLink 
                          to={link.to} 
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 text-base font-medium text-gray-700 hover:text-[#007E85]"
                        >
                          <span className="text-xl">{link.icon}</span>
                          {link.text}
                        </NavLink>
                      </motion.li>
                    ))}
                  </motion.ul>

                  {!user ? (
                    <div className="space-y-4 pt-6 border-t">
                      <NavLink 
                        to="/signup"
                        className="block w-full text-center bg-[#007E85] text-white rounded-xl px-6 py-3 font-medium hover:bg-[#006b6f] transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Up
                      </NavLink>
                      <NavLink 
                        to="/login"
                        className="block w-full text-center border-2 border-[#007E85] text-[#007E85] rounded-xl px-6 py-3 font-medium hover:bg-[#007E85] hover:text-white transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </NavLink>
                    </div>
                  ) : (
                    <div className="pt-6 border-t">
                      <button 
                        className="flex items-center w-full gap-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowLogoutModal(true);
                        }}
                      >
                        <img src="/assets/images/logout-icon.svg" alt="" className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ul className='gap-8 items-center hidden lg:flex'>
          {navLinks.map(link => (
            <motion.li 
              key={link.to}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <NavLink 
                to={link.to} 
                className={({ isActive }) => 
                  `text-base font-medium transition-colors ${isActive ? 'text-[#007E85] font-bold' : 'text-gray-700 hover:text-[#007E85]'}`
                }
              >
                {link.text}
              </NavLink>
            </motion.li>
          ))}
        </ul>

        {user ? (
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-xl sm:border-2 p-2 sm:pl-5 sm:border-[#007E85] sm:hover:bg-[#007E85] sm:hover:text-white transition-colors group"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img 
                src={getProfileImageUrl()}
                alt="Profile" 
                className="w-8 h-8 rounded-full border-2 border-[#007E85] group-hover:border-white transition-colors object-cover" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/images/profilephoto.svg';
                }}
              />
              <span className='hidden sm:inline font-medium capitalize'>
                {user.role === 'admin' ? "Admin" : user.role==="doctor" ? "Dr. "+userName : userName}
              </span>
              <motion.img 
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                src="/assets/images/down-arrow.svg" 
                alt="Toggle menu" 
                className='w-[30px] transition-transform group-hover:filter hidden sm:inline'
              />
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl z-50 overflow-hidden hidden sm:block"
                >
                  <NavLink 
                    to="/settings" 
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <img src="/assets/images/settings.svg" alt="" className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </NavLink>
                  <NavLink 
                    to={
                      user?.role === 'admin' ? "/admin/dashboard" : 
                      user?.role === 'doctor' ? "/doctor/dashboard" : 
                      "/patient/dashboard"
                    } 
                    className="flex items-center gap-3 p-4 border-y border-gray-100 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <img src="/assets/images/dashboard.svg" alt="" className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </NavLink>
                  <button 
                    className="flex items-center w-full gap-3 p-4 text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => setShowLogoutModal(true)}
                  >
                    <img src="/assets/images/logout-icon.svg" alt="" className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className='items-center hidden sm:flex gap-4'>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink to="/signup" className="font-medium bg-[#007E85] text-white rounded-xl px-6 py-3 hover:bg-[#006b6f] transition-colors">
                Sign Up
              </NavLink>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink to="/login" className="font-medium border-2 border-[#007E85] text-[#007E85] rounded-xl px-6 py-3 hover:bg-[#007E85] hover:text-white transition-colors">
                Login
              </NavLink>
            </motion.div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed h-screen inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 pt-14 max-w-md w-full relative"
            >
              <button 
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowLogoutModal(false)}
              >
                <img src="/assets/images/cross.svg" alt="Close" className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-center mb-6">Are you sure you want to logout?</h2>
              <div className="flex gap-4">
                <button 
                  className="flex-1 py-3 rounded-xl border-2 border-[#007E85] text-[#007E85] font-medium hover:bg-[#007E85] hover:text-white transition-colors"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 bg-red-500 text-white rounded-xl py-3 font-medium hover:bg-red-600 transition-colors"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      

    </motion.nav>

    
  );
};

export default Navbar;
