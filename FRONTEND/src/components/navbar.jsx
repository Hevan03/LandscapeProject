import React from 'react';

const Navbar = () => {
  return (
  <header className="bg-base-300 border-b border-base-content/10 ">
    <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-Bold text-primary font-mono tracking-tight">
                LeafSphere 
            </h1>
            {/* Navigation */}
          <nav>
            <ul className="flex space-x-6 text-lg font-medium">
              <li>
                <a href="/" className="hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/addProgress" className="hover:text-primary transition-colors">
                  Add Progress
                </a>
              </li>
            </ul>
          </nav>
            
        </div>
      
    </div>

  </header>
    
  );
}

export default Navbar;