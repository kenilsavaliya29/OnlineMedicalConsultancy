import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Checkbox } from "@material-tailwind/react";
import { useContext } from "react";
import { AuthContext } from "../../contexts/authContext.jsx";

const SignUp_Form = () => {
  let open_eye = "/assets/images/opened.svg";
  let close_eye = "/assets/images/closed.svg";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imgToggle, setimgToggle] = useState(false);
  const [imgToggleConfirm, setimgToggleConfirm] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      // Use the register function from AuthContext
      const result = await registerUser(data);
      
      if (result.success) {
        // Check if user data is returned to determine redirection
        if (result.user) {
          // Redirect based on user role
          const role = result.user.role || 'patient';
          if (role === 'doctor') {
            navigate('/doctor/dashboard');
          } else if (role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/patient/dashboard');
          }
        } else {
          // Fallback to patient dashboard if no user data
          navigate('/patient/dashboard');
        }
      } else {
        setError("email", { message: result.message || "Registration failed" });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("email", { message: "An error occurred during signup" });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    setimgToggle(!imgToggle);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
    setimgToggleConfirm(!imgToggleConfirm);
  };

  return (
    <div className=" bg-gradient-to-br from-[#007E85] to-[#00565c] pb-14 pt-36">
      <div className="container mx-auto flex  items-center justify-center px-4">
        <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl flex overflow-hidden">
          
          {/* Left Side - Image */}
          <div className="hidden lg:block w-5/12 relative">
            <img 
              src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Medical Professional" 
              className="h-full w-full object-cover brightness-110 contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#007E85]/50 to-[#007E85]/70 flex items-center justify-center">
              <div className="text-white text-center p-8">
                <h2 className="text-4xl font-bold font-lexend mb-4 drop-shadow-lg">Join Our Healthcare Community</h2>
                <p className="text-xl font-montserrat mb-6 drop-shadow-md">Connect with top healthcare professionals and access premium medical services</p>
                <div className="space-y-4 text-left">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-3 drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                    <span className="text-lg drop-shadow">24/7 Medical Support</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-3 drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                    <span className="text-lg drop-shadow">Expert Consultations</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-3 drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                    <span className="text-lg drop-shadow">Secure Health Records</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-7/12 p-8 md:p-12">
            <div className="mb-8">
              <Link to="/" className="block">
                <img src="https://cdn-icons-png.flaticon.com/512/4807/4807695.png" alt="Medicare Logo" className="h-10 mx-auto mb-6 hover:opacity-80 transition-opacity" />
              </Link>
              <h1 className="text-2xl font-bold text-center text-gray-800 font-lexend mb-2">
                Create your account
              </h1>
              <p className="text-center text-gray-600 font-montserrat text-sm">
                Join Medicare for personalized healthcare services
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
                  <input
                    {...register("firstname", { required: true })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#007E85] focus:outline-none focus:ring-0 transition-colors text-sm"
                    type="text"
                    placeholder="John"
                  />
                  {errors.firstname && (
                    <p className="mt-1 text-red-500 text-xs">{errors.firstname.message || "First name is required"}</p>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Last Name</label>
                  <input
                    {...register("lastname", { required: true })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#007E85] focus:outline-none focus:ring-0 transition-colors text-sm"
                    type="text"
                    placeholder="Doe"
                  />
                  {errors.lastname && (
                    <p className="mt-1 text-red-500 text-xs">{errors.lastname.message || "Last name is required"}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                  <input
                    {...register("phonenumber", {
                      required: "Phone number is required",
                      minLength: {
                        value: 9,
                        message: "Number must be at least 9 digits"
                      },
                      maxLength: {
                        value: 10,
                        message: "Number cannot exceed 10 digits"
                      }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#007E85] focus:outline-none focus:ring-0 transition-colors text-sm"
                    type="tel"
                    placeholder="1234567890"
                  />
                  {errors.phonenumber && (
                    <p className="mt-1 text-red-500 text-xs">{errors.phonenumber.message}</p>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Gender</label>
                  <div className="relative">
                    <select
                      {...register("gender", { required: "Please select a gender" })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#007E85] focus:outline-none focus:ring-0 transition-colors text-sm appearance-none"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                      <svg className="fill-current h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                      </svg>
                    </div>
                  </div>
                  {errors.gender && (
                    <p className="mt-1 text-red-500 text-xs">{errors.gender.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                <input
                  {...register("email", { required: true })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#007E85] focus:outline-none focus:ring-0 transition-colors text-sm"
                  type="email"
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-red-500 text-xs">{errors.email.message || "Email is required"}</p>
                )}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <input
                      {...register("password", { required: true })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#007E85] focus:outline-none focus:ring-0 transition-colors text-sm"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                    />
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
                    <p className="mt-1 text-red-500 text-xs">{errors.password.message || "Password is required"}</p>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      {...register("confirmPassword", { required: true })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#007E85] focus:outline-none focus:ring-0 transition-colors text-sm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                    />
                    <button 
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <img
                        src={imgToggleConfirm ? `${close_eye}` : `${open_eye}`}
                        alt="toggle password"
                        className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity"
                      />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-red-500 text-xs">{errors.confirmPassword.message || "Please confirm your password"}</p>
                  )}
                </div>
              </div>

              <div className="mt-2">
                <Checkbox
                  {...register("terms", {
                    required: "You must accept the terms and conditions",
                  })}
                  color="teal"
                  label={
                    <span className="text-sm text-gray-700">
                      I accept the <Link to="#" className="text-[#007E85] hover:underline">terms and conditions</Link>
                    </span>
                  }
                />
                {errors.terms && (
                  <p className="mt-1 text-red-500 text-xs">{errors.terms.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#007E85] text-white py-2.5 rounded-xl font-medium hover:bg-[#006b6f] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#007E85] text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/Login" className="text-[#007E85] hover:text-[#006b6f] font-medium">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp_Form;
