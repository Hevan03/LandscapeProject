import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusSquare, Briefcase, Calendar, User } from 'lucide-react';

const LandscaperNavbar = () => {
  const getNavLinkClass = ({ isActive }) => {
    return isActive 
      ? "flex items-center text-white font-bold" 
      : "flex items-center text-gray-200 hover:text-white transition-colors";
  };

  return (
    <header className="shadow-lg sticky top-0 z-50">
      <div className="bg-gradient-to-b from-[#134E1A] to-green-500 text-white">
        
        {/* Top Header Section */}
        <div className="py-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-wide">
            LeafSphere
          </h1>
          <p className="text-green-100 text-sm mt-1">
            Connecting Nature, People & Sustainability
          </p>
        </div>

        {/* Bottom Navigation Bar -- BORDER REMOVED HERE */}
        <div> {/* Formerly <div className="border-t border-white/20"> */}
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            
            {/* 1. Left Spacer (pushes the nav to the center) */}
            <div className="flex-1"></div>

            {/* 2. Centered Navigation Links */}
            <nav>
              <ul className="flex items-center space-x-6 text-lg font-medium">
                <li>
                  <NavLink to="/landscaper/home" className={getNavLinkClass}>
                    <Home size={20} className="mr-2" /> Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/create-landscape" className={getNavLinkClass}>
                    <PlusSquare size={20} className="mr-2" /> Start New Project
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/landscaper/projects" className={getNavLinkClass}>
                    <Briefcase size={20} className="mr-2" /> My Projects
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/landscaper/appointments" className={getNavLinkClass}>
                    <Calendar size={20} className="mr-2" /> My Appointments
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* 3. Right Aligned Account Button */}
            <div className="flex-1 flex justify-end">
              <NavLink to="/landscaper/account" className="flex items-center text-gray-200 hover:text-white transition-colors text-lg font-medium">
                <User size={20} className="mr-2" /> My Account
              </NavLink>
            </div>

          </div>
        </div>

      </div>
    </header>
  );
};

export default LandscaperNavbar;