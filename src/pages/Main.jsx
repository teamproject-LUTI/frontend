import React from 'react';
import Topbar from '../components/common/layout/Topbar';
import Sidebar from '../components/common/layout/Sidebar';
import Footer from '../components/common/layout/Footer';
import '../styles/Main.css';

const Main = ({ children }) => {
  return (
      <div className="main-layout">
        {/* Topbar */}
        <Topbar />

        <div className="main-content-wrapper">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="main-content">
            {children}
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>
  );
};

export default Main;
