import React from 'react';
import { Outlet } from 'react-router-dom';
import LandscaperNavbar from './LandscaperNavbar';

const LandscaperLayout = () => {
  return (
    <div>
      <LandscaperNavbar />
      <main>
        {/* The Outlet component renders the specific page (e.g., Home, Projects) */}
        <Outlet />
      </main>
    </div>
  );
};

export default LandscaperLayout;