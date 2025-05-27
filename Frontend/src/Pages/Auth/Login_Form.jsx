import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "../../contexts/authContext.jsx";

const Login_Form = () => {
  let open_eye = "/assets/images/opened.svg";
  let close_eye = "/assets/images/closed.svg";

  // Use the auth context
  const { login, getRedirectPath, user, getAndClearReturnPath } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [imgToggle, setimgToggle] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [errorType, setErrorType] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Get query parameters for appointment booking
  useEffect(() => {
    // Check if there are query parameters to restore appointment data
    if (location.search) {
      const queryParams = new URLSearchParams(location.search);
      // If doctorId exists, it indicates we're coming from appointment booking
      if (queryParams.has('doctorId')) {
        console.log("Login form loaded with appointment booking query params");
      }
    }
  }, [location]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
    clearErrors
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  });

  // Set focus on the appropriate field based on error type
  useEffect(() => {
    if (errorType === "notFound") {
      setFocus("email");
      clearErrors("password");
    } else if (errorType === "invalidPassword") {
      setFocus("password");
      clearErrors("email");
    }
  }, [errorType, setFocus, clearErrors]);

  // This will be our actual submission handler
  const handleFormSubmit = async (data) => {
    setFormSubmitting(true);
    setLoginError(""); // Clear previous errors
    setErrorType(null);
    
    try {
      console.log(`Attempting login with email: ${data.email}, isDoctor: ${isDoctor}`);
      
      // Add isDoctor to the credentials object
      const credentials = {
        email: data.email,
        password: data.password,
        isDoctor: isDoctor
      };
      
      // Use AuthContext login method which handles the API call and user state
      const result = await login(credentials);
      
      if (result.success) {
        console.log("Login successful, user role:", result.user.role);
        
        // Validate that the user's role matches their login attempt
        if (isDoctor && result.user.role !== 'doctor') {
          setLoginError("This account is not registered as a doctor. Please uncheck the 'I am a doctor' checkbox.");
          setErrorType("roleError");
          setFormSubmitting(false);
          return;
        }
        
        if (!isDoctor && result.user.role === 'doctor') {
          setLoginError("This is a doctor account. Please check the 'I am a doctor' checkbox.");
          setErrorType("roleError");
          setFormSubmitting(false);
          return;
        }
        
        // Check if user is trying to access doctor dashboard without being a doctor
        if (result.user.role !== 'doctor' && location.pathname.includes('/doctor')) {
          setLoginError("You don't have permission to access the doctor dashboard");
          setErrorType("authError");
          setFormSubmitting(false);
          return;
        }
        
        // Important: Add a small delay to ensure auth state is fully propagated
        // before navigating to a protected route to prevent false "access denied" errors
        const handleSuccessfulLogin = () => {
          // If we have query parameters for appointment booking
          if (location.search && new URLSearchParams(location.search).has('doctorId')) {
            const queryParams = new URLSearchParams(location.search);
            const doctorId = queryParams.get('doctorId');
            
            // Redirect back to appointment booking with query params as state
            const appointmentData = {};
            queryParams.forEach((value, key) => {
              appointmentData[key] = value;
            });
            
            navigate(`/doctors/${doctorId}/book`, { state: appointmentData });
            return;
          }
          
          // Check if there's a return path stored in context
          const contextReturnPath = getAndClearReturnPath();
          if (contextReturnPath) {
            navigate(contextReturnPath);
            return;
          }
          
          // Check if there's a specific location to redirect to from state
          if (location.state && location.state.from) {
            // Redirect to the original location
            navigate(location.state.from);
          } else {
            // Get redirect path based on user role from the actual response
            const redirectPath = getRedirectPath(result.user);
            console.log(`Redirecting to: ${redirectPath}`);
            navigate(redirectPath, { state: { postLogin: true } });
          }
        };
        
        // Add short delay to ensure authentication state is fully propagated
        setTimeout(handleSuccessfulLogin, 300);
      } else {
        setLoginError(result.message || "Login failed");
        setErrorType(result.errorType);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error.message || "An error occurred during login");
      setErrorType("serverError");
    } finally {
      setFormSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    setimgToggle(!imgToggle);
  };

  // Function to get error CSS class based on error type
  const getErrorClass = (field) => {
    if ((errorType === "notFound" && field === "email") || 
        (errorType === "invalidPassword" && field === "password")) {
      return "border-red-500 focus:border-red-500";
    }
    return "border-gray-200 focus:border-[#007E85]";
  };

  // Function to get error icon if needed
  const renderErrorIcon = (field) => {
    if ((errorType === "notFound" && field === "email") || 
        (errorType === "invalidPassword" && field === "password")) {
      return (
        <svg className="h-5 w-5 text-red-500 absolute right-12 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-[#007E85] to-[#00565c] pb-14 pt-36">
      <div className="container mx-auto flex items-center justify-center px-4">
        <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl flex overflow-hidden">
          
          {/* Left Side - Image */}
          <div className="hidden lg:block w-5/12 relative">
            <img 
              src="https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80"
              alt="Medical Professional" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[#007E85] bg-opacity-30 flex items-center justify-center">
              <div className="text-white text-center p-8">
                <h2 className="text-3xl font-bold font-lexend mb-3">Welcome Back!</h2>
                <p className="text-lg font-montserrat">Your trusted healthcare partner</p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-7/12 p-8 md:p-12">
            <div className="mb-8">
              <NavLink to="/" className="block">
                <img src="https://cdn-icons-png.flaticon.com/512/4807/4807695.png" alt="Medicare Logo" className="h-10 mx-auto mb-6 hover:opacity-80 transition-opacity" />
              </NavLink>
              <h1 className="text-2xl font-bold text-center text-gray-800 font-lexend mb-2">
                Sign in to Medicare
              </h1>
              <p className="text-center text-gray-600 font-montserrat text-sm">
                Access your personalized healthcare dashboard
              </p>
            </div>

            {/* Display login error if present */}
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-start">
                <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p className="font-medium">Login Failed</p>
                  <p className="text-sm">{loginError}</p>
                  {errorType === "notFound" && isDoctor && (
                    <p className="text-sm mt-1">Make sure the "I am a doctor" checkbox is selected if you're a doctor.</p>
                  )}
                  {errorType === "notFound" && !isDoctor && (
                    <p className="text-sm mt-1">If you're a doctor, please check the "I am a doctor" checkbox.</p>
                  )}
                  {errorType === "roleError" && (
                    <p className="text-sm mt-1">Please ensure you've selected the correct account type using the "I am a doctor" checkbox.</p>
                  )}
                  {errorType === "invalidPassword" && (
                    <p className="text-sm mt-1">Please check your password and try again. <Link to="/login/forgotpassword" className="text-[#007E85] hover:underline">Forgot password?</Link></p>
                  )}
                  {errorType === "serverError" && (
                    <p className="text-sm mt-1">There might be an issue with the server. Please try again later or contact support.</p>
                  )}
                  {errorType === "databaseError" && (
                    <p className="text-sm mt-1">There was a problem accessing your account information. Please try again later.</p>
                  )}
                  {errorType === "tokenError" && (
                    <p className="text-sm mt-1">Authentication error. Please try clearing your browser cache and cookies, then try again.</p>
                  )}
                  {errorType === "authError" && (
                    <p className="text-sm mt-1">You don't have permission to access this area. Please check your account type.</p>
                  )}
                </div>
              </div>
            )}

            {/* Important: Use onSubmit={handleSubmit(handleFormSubmit)} to properly handle form submission with react-hook-form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 max-w-md mx-auto">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 font-dmSans">Email Address</label>
                <div className="relative">
                  <input
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 ${getErrorClass("email")} focus:outline-none focus:ring-0 transition-colors text-sm`}
                    type="email"
                    placeholder="Enter your email"
                    disabled={formSubmitting}
                  />
                  {renderErrorIcon("email")}
                </div>
                {errors.email && (
                  <p className="mt-1 text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    {...register("password", { 
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    className={`w-full px-4 py-2.5 rounded-xl border-2 ${getErrorClass("password")} focus:outline-none focus:ring-0 transition-colors text-sm`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    disabled={formSubmitting}
                  />
                  {renderErrorIcon("password")}
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <img
                      src={imgToggle ? `${close_eye}` : `${open_eye}`}
                      alt="toggle password"
                      className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity"
                    />
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-red-500 text-xs">{errors.password.message}</p>
                )}
              </div>

              {/* Doctor Login Checkbox */}
              <div className="flex items-center">
                <input
                  id="doctor-login"
                  type="checkbox"
                  checked={isDoctor}
                  onChange={() => {
                    setIsDoctor(!isDoctor);
                    setLoginError("");
                    setErrorType(null);
                  }}
                  className="w-4 h-4 text-[#007E85] border-gray-300 rounded focus:ring-[#007E85]"
                  disabled={formSubmitting}
                />
                <label htmlFor="doctor-login" className="ml-2 text-sm font-medium text-gray-700">
                  I am a doctor
                </label>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#007E85] text-white py-2.5 rounded-xl font-medium hover:bg-[#006b6f] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#007E85] text-sm"
                disabled={formSubmitting}
              >
                {formSubmitting ? "Signing in..." : "Sign In"}
              </button>

              <div className="text-center space-y-3 text-sm">
                <Link
                  to="/login/forgotpassword"
                  className="text-[#007E85] hover:text-[#006b6f] font-medium inline-block"
                >
                  Forgot your password?
                </Link>

                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/SignUp"
                    className="text-[#007E85] hover:text-[#006b6f] font-medium"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login_Form;
