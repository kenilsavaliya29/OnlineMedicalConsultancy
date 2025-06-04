import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login_Form from "./Pages/Auth/Login_Form"
import SignUp_Form from "./Pages/Auth/SignUp_Form"
import Navbar from "./components/Navbar";
import Home from './components/Home';
import Services from './Pages/Services'
import ContactUs from './Pages/ContactUs'
import Blogs from './Pages/Blogs'
import About from './Pages/About';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import ResetPassword from './Pages/Auth/ResetPassword';
import Patient_Dashboard from './components/Dashboards/Patient_Dashboard';
import Layout from './Pages/Layout';
import Terms_and_Conditions from './Pages/Terms_Conditions';
import Privacy_Policies from './Pages/Privacy_Policies';
import Faq from './Pages/Faq';
import Settings from './Pages/Settings';
import Doctor_Dashboard from './components/Dashboards/Doctor_Dashboard';
import ProtectedRoute from './Pages/Auth/ProtectedRoute';
import Admin from './components/Dashboards/Admin_Dashboard';
import SearchDoctors from './Pages/Doctors/SearchDoctors';
import DoctorProfile from './Pages/Doctors/DoctorProfile';
import AppointmentBooking from './Pages/Doctors/AppointmentBooking';
import WellnessProgram from './pages/Patient/WellnessProgram';
import { AuthProvider } from './contexts/authContext';
import NotFoundPage from './404Page';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout><Home /></Layout>,
    },
    {
      path: "/login",
      element: <Login_Form />,
    },
    {
      path: "/SignUp",
      element: <SignUp_Form />,
    },
    {
      path: "/login/forgotpassword",
      element: <ForgotPassword />,
    },
    {
      path: "/login/resetpassword/:token",
      element: <ResetPassword />,
    },
    // Public route that redirects to proper wellness route
    {
      path: "/wellness",
      element: <Navigate to="/patient/wellness" replace />,
    },
    // Patient Routes - Protected for patients only
    {
      path: "/patient/dashboard",
      element: <ProtectedRoute allowedRoles={['patient']}><Layout><Patient_Dashboard /></Layout></ProtectedRoute>,
    },
    // Wellness Program Routes
    {
      path: "/patient/wellness",
      element: <ProtectedRoute allowedRoles={['patient']}><Layout><WellnessProgram /></Layout></ProtectedRoute>,
    },
    {
      path: "/patient/wellness/*",
      element: <ProtectedRoute allowedRoles={['patient']}><Layout><WellnessProgram /></Layout></ProtectedRoute>,
    },
    // Legacy redirect for backward compatibility
    {
      path: "/patient-dashboard",
      element: <Navigate to="/patient/dashboard" replace />,
    },
    // Doctor Routes - Protected for doctors only 
    {
      path: "/doctor/dashboard",
      element: <ProtectedRoute allowedRoles={['doctor']}><Layout><Doctor_Dashboard /></Layout></ProtectedRoute>,
    },
    // Admin Routes - Protected for admins only
    {
      path: "/admin/dashboard",
      element: <ProtectedRoute allowedRoles={['admin']}><Layout><Admin /></Layout></ProtectedRoute>,
    },
    // Common routes
    {
      path: "/services",
      element: <Layout><Services /></Layout>,
    },
    {
      path: "/contactus",
      element: <Layout><ContactUs /></Layout>,
    },
    {
      path: "/blogs",
      element: <Layout><Blogs /></Layout>,
    },
    {
      path: "/about",
      element: <Layout><About /></Layout>,
    },
    {
      path: "/about/terms-and-conditions",
      element: <Layout><Terms_and_Conditions /></Layout>
    },
    {
      path: "/about/privacy-policy",
      element: <Layout><Privacy_Policies /></Layout>
    },
    {
      path: "/about/faq",
      element: <Layout><Faq /></Layout>
    },
    {
      path: "/settings",
      element: <Layout><Settings /></Layout>
    },
    // Doctor public pages
    {
      path: "/doctors",
      element: <Layout><SearchDoctors /></Layout>
    },
    {
      path: "/doctors/:id",
      element: <Layout><DoctorProfile /></Layout>
    },
    {
      path: "/doctors",
      element: <Layout ><SearchDoctors /></Layout>
    },
    {
      path: "/doctors/:id/book",
      element: <ProtectedRoute allowedRoles={['patient']}><Layout><AppointmentBooking /></Layout></ProtectedRoute>
    },
    {
      path: "*",
      element: <NotFoundPage />,
    }
  ], {
    future: {
      v7_normalizeFormMethod: true,
      v7_startTransition: true,
      v7_fetcherPersist: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
      v7_relativeSplatPath: true,
    }
  });

  return (
    <AuthProvider>
      <RouterProvider router={router}>
        <Navbar />
        <div className=''>
          <img src="assets/images/trial.svg" alt="" />
        </div>
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;
