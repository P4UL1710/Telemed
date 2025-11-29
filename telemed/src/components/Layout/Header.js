import React, { useState } from 'react';
import { LogOut, User, Settings, Bell, Search, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { logout, userData, currentUser } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayName = userData?.displayName || currentUser?.displayName || 'User';

  return (
    <header className="header modern">
      <div className="header-content">
        <div className="header-left">
          <div className="logo modern">
            <div className="logo-icon">
              <Stethoscope size={24} />
            </div>
            <h2>TeleMed+</h2>
          </div>
          
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search patients, appointments..."
                className="search-input"
              />
            </div>
          </div>
        </div>
        
        <div className="header-right">
          {/* Notifications */}
          <div className="notification-container">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h4>Notifications</h4>
                  <button className="mark-all-read">Mark all read</button>
                </div>
                <div className="notification-list">
                  <div className="notification-item unread">
                    <div className="notification-content">
                      <p><strong>New appointment</strong></p>
                      <p>John Smith scheduled for 3:00 PM</p>
                      <span className="notification-time">5 min ago</span>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-content">
                      <p><strong>Message received</strong></p>
                      <p>Sarah Johnson sent you a message</p>
                      <span className="notification-time">1 hour ago</span>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-content">
                      <p><strong>Appointment completed</strong></p>
                      <p>Video call with Mike Davis finished</p>
                      <span className="notification-time">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile */}
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{displayName}</span>
              <span className="user-role">{userData?.userType || 'User'}</span>
            </div>
            
            <div className="user-menu">
              <button 
                className="user-avatar"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {userData?.profilePicture ? (
                  <img src={userData.profilePicture} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitials(displayName)}
                  </div>
                )}
              </button>
              
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar large">
                      {userData?.profilePicture ? (
                        <img src={userData.profilePicture} alt="Profile" />
                      ) : (
                        <div className="avatar-placeholder">
                          {getInitials(displayName)}
                        </div>
                      )}
                    </div>
                    <div className="user-details">
                      <h4>{displayName}</h4>
                      <p>{currentUser?.email}</p>
                      <span className="role-badge">{userData?.userType || 'User'}</span>
                    </div>
                  </div>
                  
                  <div className="dropdown-menu">
                    <button className="dropdown-item">
                      <User size={16} />
                      View Profile
                    </button>
                    <button className="dropdown-item">
                      <Settings size={16} />
                      Settings
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;