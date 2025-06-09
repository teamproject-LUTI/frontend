import React, { useState } from 'react';
import {
  Home,
  MapPin,
  Calendar,
  Heart,
  Settings,
  User,
  CreditCard,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import '../../../styles/layout/Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: '홈', path: '/' },
    { icon: MapPin, label: '여행 계획', path: '/plan' },
    { icon: Calendar, label: '내 일정', path: '/schedule' },
    { icon: Heart, label: '찜 목록', path: '/favorites' },
    { icon: User, label: '프로필', path: '/profile' },
    { icon: CreditCard, label: '결제 내역', path: '/payments' },
    { icon: Settings, label: '설정', path: '/settings' },
    { icon: HelpCircle, label: '도움말', path: '/help' },
  ];

  return (
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="sidebar-content">
          {/* Toggle Button */}
          <div className="toggle-section">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="toggle-btn"
            >
              {isCollapsed ? (
                  <ChevronRight className="toggle-icon" />
              ) : (
                  <ChevronLeft className="toggle-icon" />
              )}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="sidebar-nav">
            {menuItems.map((item, index) => (
                <button
                    key={index}
                    className={`nav-item ${isCollapsed ? 'collapsed' : 'expanded'}`}
                >
                  <item.icon className="nav-icon" />
                  <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
                {item.label}
              </span>
                </button>
            ))}
          </nav>
        </div>
      </aside>
  );
};

export default Sidebar;
