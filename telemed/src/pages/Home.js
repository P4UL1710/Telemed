import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, CheckCircle, Clock, Plus, Video, MessageCircle, FileText, Activity, Heart, TrendingUp, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService, analyticsService } from '../utils/firestoreUtils';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const { userData, currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedConsultations: 0,
    pendingAppointments: 0,
    activePatients: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || !userData) return;

      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const dashboardStats = await analyticsService.getDashboardStats(
          currentUser.uid, 
          userData.userType
        );
        setStats(dashboardStats);

        // Fetch recent appointments
        const appointments = await appointmentService.getByUser(
          currentUser.uid, 
          userData.userType
        );
        setRecentAppointments(appointments.slice(0, 3));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, userData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userData?.firstName || 'User';
    
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 17) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getQuickActions = () => {
    if (userData?.userType === 'doctor') {
      return [
        {
          title: 'View Schedule',
          icon: Calendar,
          action: () => navigate('/appointment'),
          color: 'blue',
          description: 'Manage appointments'
        },
        {
          title: 'Start Video Call',
          icon: Video,
          action: () => navigate('/video-call'),
          color: 'green',
          description: 'Begin consultation'
        },
        {
          title: 'Patient Messages',
          icon: MessageCircle,
          action: () => navigate('/chatroom'),
          color: 'purple',
          description: 'Chat with patients'
        },
        {
          title: 'Consultations',
          icon: FileText,
          action: () => navigate('/consult'),
          color: 'orange',
          description: 'Medical records'
        }
      ];
    } else {
      return [
        {
          title: 'Book Appointment',
          icon: Plus,
          action: () => navigate('/appointment'),
          color: 'blue',
          description: 'Schedule with doctor'
        },
        {
          title: 'Join Video Call',
          icon: Video,
          action: () => navigate('/video-call'),
          color: 'green',
          description: 'Start consultation'
        },
        {
          title: 'Message Doctor',
          icon: MessageCircle,
          action: () => navigate('/chatroom'),
          color: 'purple',
          description: 'Chat with healthcare provider'
        },
        {
          title: 'My Records',
          icon: FileText,
          action: () => navigate('/consult'),
          color: 'orange',
          description: 'View medical history'
        }
      ];
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="large" message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>{getGreeting()}</h1>
          <p>Welcome to your {userData?.userType === 'doctor' ? 'practice' : 'health'} dashboard</p>
        </div>
        <div className="header-actions">
          <Button 
            variant="primary" 
            onClick={() => navigate('/appointment')}
            className="main-cta"
          >
            <Plus size={18} />
            {userData?.userType === 'doctor' ? 'New Appointment' : 'Book Appointment'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stats-row">
          <div className="stat-card blue">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalAppointments || 0}</div>
              <div className="stat-label">Total Appointments</div>
            </div>
          </div>
          
          <div className="stat-card green">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.completedConsultations || 0}</div>
              <div className="stat-label">
                {userData?.userType === 'doctor' ? 'Completed' : 'Total'} Consultations
              </div>
            </div>
          </div>
          
          <div className="stat-card orange">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pendingAppointments || 0}</div>
              <div className="stat-label">Pending Appointments</div>
            </div>
          </div>
          
          <div className="stat-card purple">
            <div className="stat-icon">
              {userData?.userType === 'doctor' ? <Users size={24} /> : <Heart size={24} />}
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.activePatients || stats.healthRecords || 0}</div>
              <div className="stat-label">
                {userData?.userType === 'doctor' ? 'Active Patients' : 'Health Records'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Appointments */}
        <div className="dashboard-card appointments-card">
          <div className="card-header">
            <h2>Recent Appointments</h2>
            <Button 
              variant="outline" 
              size="small"
              onClick={() => navigate('/appointment')}
            >
              View All
            </Button>
          </div>
          
          <div className="card-content">
            {recentAppointments.length > 0 ? (
              <div className="appointments-list">
                {recentAppointments.map((appointment) => {
                  const dateTime = formatDateTime(appointment.appointmentDate);
                  return (
                    <div key={appointment.id} className="appointment-item">
                      <div className="appointment-info">
                        <div className="appointment-title">
                          {userData?.userType === 'doctor' 
                            ? appointment.patientName 
                            : appointment.doctorName}
                        </div>
                        <div className="appointment-details">
                          {dateTime.date} at {dateTime.time} • {appointment.type}
                        </div>
                      </div>
                      <div className={`appointment-status status-${appointment.status?.toLowerCase()}`}>
                        {appointment.status || 'Scheduled'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <Calendar size={48} />
                <div className="empty-title">No appointments yet</div>
                <div className="empty-description">
                  {userData?.userType === 'doctor' 
                    ? "You don't have any appointments scheduled." 
                    : "You haven't booked any appointments yet."}
                </div>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/appointment')}
                  size="small"
                >
                  {userData?.userType === 'doctor' ? 'Manage Schedule' : 'Book First Appointment'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card actions-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="card-content">
            <div className="actions-grid">
              {getQuickActions().map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <div 
                    key={index}
                    className={`action-item ${action.color}`}
                    onClick={action.action}
                  >
                    <div className="action-icon">
                      <IconComponent size={20} />
                    </div>
                    <div className="action-content">
                      <div className="action-title">{action.title}</div>
                      <div className="action-description">{action.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <h2>Recent Activity</h2>
          </div>
          
          <div className="card-content">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon green">
                  <CheckCircle size={16} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">Consultation completed</div>
                  <div className="activity-time">2 hours ago</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon blue">
                  <Calendar size={16} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">New appointment scheduled</div>
                  <div className="activity-time">5 hours ago</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon purple">
                  <MessageCircle size={16} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">New message received</div>
                  <div className="activity-time">1 day ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Overview (for patients) / Practice Stats (for doctors) */}
        <div className="dashboard-card overview-card">
          <div className="card-header">
            <h2>
              {userData?.userType === 'doctor' ? 'Practice Overview' : 'Health Overview'}
            </h2>
          </div>
          
          <div className="card-content">
            {userData?.userType === 'doctor' ? (
              <div className="practice-stats">
                <div className="practice-stat">
                  <div className="practice-stat-icon">
                    <TrendingUp size={20} />
                  </div>
                  <div className="practice-stat-content">
                    <div className="practice-stat-number">+15%</div>
                    <div className="practice-stat-label">Patient Growth</div>
                  </div>
                </div>
                
                <div className="practice-stat">
                  <div className="practice-stat-icon">
                    <Activity size={20} />
                  </div>
                  <div className="practice-stat-content">
                    <div className="practice-stat-number">4.8/5</div>
                    <div className="practice-stat-label">Average Rating</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="health-metrics">
                <div className="health-metric">
                  <div className="metric-label">Last Checkup</div>
                  <div className="metric-value">3 months ago</div>
                </div>
                
                <div className="health-metric">
                  <div className="metric-label">Next Appointment</div>
                  <div className="metric-value">
                    {recentAppointments.length > 0 ? 'Tomorrow' : 'Not scheduled'}
                  </div>
                </div>
                
                <div className="health-metric">
                  <div className="metric-label">Health Score</div>
                  <div className="metric-value">Good</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Welcome Message for New Users */}
      {stats.totalAppointments === 0 && (
        <div className="welcome-banner">
          <div className="welcome-content">
            <h2>Welcome to TeleMed+! 🎉</h2>
            <p>
              {userData?.userType === 'doctor' 
                ? "Start by managing your schedule and connecting with patients."
                : "Begin your healthcare journey by booking your first appointment."}
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/appointment')}
            >
              {userData?.userType === 'doctor' ? 'Set Up Schedule' : 'Book First Appointment'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;