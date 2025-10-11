import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import axios from "axios";
import { PlusSquare, Briefcase, Calendar, Leaf, Users, CheckCircle } from "lucide-react";

//Component for Action Buttons
const ActionCard = ({ title, value, to, imageUrl, icon }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(to)} className="relative h-48 rounded-2xl shadow-xl cursor-pointer overflow-hidden group">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-60 transition-all duration-300"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6 text-white">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-bold">{title}</h3>
          {icon}
        </div>
        <div className="text-right">
          <span className={`text-5xl font-bold tracking-tighter ${title === "Start a New Project" && "text-4xl"}`}>{value}</span>
        </div>
      </div>
    </div>
  );
};

// --- Component for Background ---
const heroImages = [
  "https://plus.unsplash.com/premium_photo-1661963333824-fd020faec5fc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1661281245031-8972bc9db289?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1696846911635-83b97e53fb65?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1712325632272-bd6891435fc4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const HeroSlider = ({ children }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 2000); // Change image 2 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen flex items-center justify-center text-center p-4">
      {/* Background Images transition */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${image})`,
            opacity: index === currentImageIndex ? 1 : 0,
          }}
        />
      ))}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      {/* Content passed as children */}
      <div className="relative z-10 text-white">{children}</div>
    </div>
  );
};

//Main Page Component
const LandscaperHomePage = () => {
  const [landscaper, setLandscaper] = useState(null);
  const [projectCount, setProjectCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  //import AuthContext from "../../context/AuthContext";
  const { user } = useContext(AuthContext);
  const loggedInLandscaperId = user?.id;

  useEffect(() => {
    if (!loggedInLandscaperId) return;
    const fetchData = async () => {
      try {
        // --- EDIT THESE ENDPOINTS AS NEEDED ---
        const landscaperRes = await fetch(`http://localhost:5001/api/landscaper/profile/${loggedInLandscaperId}`);
        const projectsRes = await fetch(`http://localhost:5001/api/landscape/landscaper/${loggedInLandscaperId}`);
        const appointmentsRes = await fetch(`http://localhost:5001/api/appointments/landscaper/${loggedInLandscaperId}`);

        if (!landscaperRes.ok || !projectsRes.ok || !appointmentsRes.ok) {
          throw new Error("One or more requests failed");
        }

        const landscaperData = await landscaperRes.json();
        const projectsData = await projectsRes.json();
        const appointmentsData = await appointmentsRes.json();

        setLandscaper(landscaperData);
        setProjectCount(Array.isArray(projectsData) ? projectsData.length : projectsData.count || 0);
        setAppointmentCount(Array.isArray(appointmentsData) ? appointmentsData.length : appointmentsData.count || 0);
      } catch (error) {
        console.error("Failed to fetch page data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loggedInLandscaperId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* --- Hero Section with Background --- */}
      <HeroSlider>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight" style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}>
          Welcome back, {landscaper?.name || "Ranjith"}!
        </h1>
        <p className="mt-4 text-xl text-gray-200 max-w-2xl mx-auto" style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.7)" }}>
          Manage your projects and appointments from here. Let's create something beautiful today.
        </p>
      </HeroSlider>

      {/* --- Action Cards Section --- */}
      <div className="bg-white">
        <div className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ActionCard
              title="Start a New Project"
              value="Create"
              to="/landscaper/create-landscape"
              imageUrl="https://plus.unsplash.com/premium_photo-1678278696462-af2774447dd0?q=80&w=1069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              icon={<PlusSquare size={40} className="text-white opacity-70" />}
            />
            <ActionCard
              title="My Projects"
              value={projectCount}
              to="/landscaper/projects"
              imageUrl="https://plus.unsplash.com/premium_photo-1713991088871-614d45da7fdb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              icon={<Briefcase size={40} className="text-white opacity-70" />}
            />
            <ActionCard
              title="My Appointments"
              value={appointmentCount}
              to="/landscaper/appointments"
              imageUrl="https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              icon={<Calendar size={40} className="text-white opacity-70" />}
            />
          </div>
        </div>
      </div>

      {/* ---Static Information  --- */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose LeafSphere?</h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-12">
            Our platform provides everything you need to manage your landscaping business efficiently, connecting you with clients and simplifying
            your workflow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Leaf */}
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Leaf size={32} className="text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Streamline Projects</h3>
              <p className="text-gray-600">Manage all your projects, from initial design to final touches, in one organized place.</p>
            </div>
            {/* clients */}
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Users size={32} className="text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Connect with Clients</h3>
              <p className="text-gray-600">Easily handle appointments and communicate with clients to bring their vision to life.</p>
            </div>
            {/* Bussiness */}
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <CheckCircle size={32} className="text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Grow Your Business</h3>
              <p className="text-gray-600">Showcase your portfolio, gain visibility, and focus on what you do best: creating beautiful landscapes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandscaperHomePage;
