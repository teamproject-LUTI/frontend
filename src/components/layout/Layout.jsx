
import React from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../../styles/Main.css';

const Layout = ({ children }) => {
    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    {children}
                </main>
            </div>
            <Footer />

        </div>
    );
};

export default Layout;