
import React from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../../styles/Main.css';

const Layout = ({ children, hideSidebar = false }) => {
    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                {!hideSidebar && <Sidebar />}
                <main className="main-content">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;