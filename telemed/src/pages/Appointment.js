import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Calendar, Clock, User, MapPin, FileText, Search, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService, userService } from '../utils/firestoreUtils';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Appointment = () => {
  const { userData, currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    doctorId: '',
    doctorName: '',
    appointmentDate: '',
    appointmentTime: '',
    type: 'video',
    reason: '',
    symptoms: '',
    urgency: 'normal'
  });

  useEffect(() => {
    fetchData();
  }, [currentUser, userData]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter]);

  const fetchData = async () => {
    if (!currentUser || !userData) return;

    try {
      setLoading(true);
      
      // Fetch appointments
      const userAppointments = await appointmentService.getByUser(
        currentUser.uid, 
        userData.userType
      );
      setAppointments(userAppointments);

      // Fetch doctors if user is a patient
      if (userData.userType === 'patient') {
        const availableDoctors = await userService.getDoctors();
        setDoctors(availableDoctors);
      }

    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(appointment => {
        const searchFields = [
          appointment.patientName,
          appointment.doctorName,
          appointment.reason,
          appointment.type
        ].join(' ').toLowerCase();
        return searchFields.includes(searchTerm.toLowerCase());
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => 
        appointment.status?.toLowerCase() === statusFilter
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDoctorSelect = (doctorId) => {
    const selectedDoctor = doctors.find(doc => doc.id === doctorId);
    setFormData(prev => ({
      ...prev,
      doctorId,
      doctorName: selectedDoctor ? selectedDoctor.displayName : ''
    }));
  };

  const validateForm = () => {
    const required = userData.userType === 'doctor' 
      ? ['patientName', 'appointmentDate', 'appointmentTime']
      : ['doctorId', 'appointmentDate', 'appointmentTime', 'reason'];

    for (const field of required) {
      if (!formData[field]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Check if appointment date is in the future
    const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
    if (appointmentDateTime <= new Date()) {
      toast.error('Appointment must be scheduled for a future date and time');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const appointmentData = {
        ...formData,
        [userData.userType === 'doctor' ? 'doctorId' : 'patientId']: currentUser.uid,
        [userData.userType === 'doctor' ? 'doctorName' : 'patientName']: userData.displayName,
        appointmentDate: `${formData.appointmentDate}T${formData.appointmentTime}`,
        status: 'scheduled',
        createdBy: currentUser.uid,
        patientId: userData.userType === 'patient' ? currentUser.uid : formData.patientId
      };

      await appointmentService.create(appointmentData);
      
      toast.success('Appointment scheduled successfully!');
      setShowForm(false);
      setFormData({
        patientName: '',
        patientId: '',
        doctorId: '',
        doctorName: '',
        appointmentDate: '',
        appointmentTime: '',
        type: 'video',
        reason: '',
        symptoms: '',
        urgency: 'normal'
      });
      
      // Refresh appointments
      await fetchData();
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to schedule appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await appointmentService.update(appointmentId, { status: newStatus });
      toast.success(`Appointment ${newStatus} successfully`);
      await fetchData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'status-scheduled';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner size="large" message="Loading appointments..." />
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p>
            {userData?.userType === 'doctor' 
              ? 'Manage your patient appointments and schedule.' 
              : 'Book and manage your healthcare appointments.'}
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowForm(!showForm)}
          disabled={submitting}
        >
          <Plus size={20} />
          {showForm ? 'Cancel' : 'New Appointment'}
        </Button>
      </div>

      {/* Appointment Form */}
      {showForm && (
        <div className="form-section slide-up">
          <h2>Schedule New Appointment</h2>
          <form className="appointment-form" onSubmit={handleSubmit}>
            {userData?.userType === 'doctor' ? (
              <div className="form-row">
                <div className="input-group modern half-width">
                  <label className="input-label modern">Patient Name *</label>
                  <div className="input-icon">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="patientName"
                    placeholder="Enter patient name"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="input-field modern"
                    required
                  />
                </div>
                
                <div className="input-group modern half-width">
                  <label className="input-label modern">Urgency Level</label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="input-field modern"
                    style={{ paddingLeft: '1rem' }}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="input-group modern">
                <label className="input-label modern">Select Doctor *</label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={(e) => handleDoctorSelect(e.target.value)}
                  className="input-field modern"
                  style={{ paddingLeft: '1rem' }}
                  required
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.displayName} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-row">
              <div className="input-group modern half-width">
                <label className="input-label modern">Date *</label>
                <div className="input-icon">
                  <Calendar size={20} />
                </div>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  className="input-field modern"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="input-group modern half-width">
                <label className="input-label modern">Time *</label>
                <div className="input-icon">
                  <Clock size={20} />
                </div>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  className="input-field modern"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group modern half-width">
                <label className="input-label modern">Appointment Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field modern"
                  style={{ paddingLeft: '1rem' }}
                >
                  <option value="video">Video Call</option>
                  <option value="chat">Chat Consultation</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In-Person Visit</option>
                </select>
              </div>
            </div>

            <div className="input-group modern">
              <label className="input-label modern">
                {userData?.userType === 'doctor' ? 'Appointment Notes' : 'Reason for Visit *'}
              </label>
              <div className="input-icon">
                <FileText size={20} />
              </div>
              <textarea
                name="reason"
                placeholder={
                  userData?.userType === 'doctor' 
                    ? "Add any notes about this appointment"
                    : "Describe your symptoms or reason for the appointment"
                }
                value={formData.reason}
                onChange={handleInputChange}
                className="input-field modern"
                style={{ paddingLeft: '3rem', minHeight: '100px' }}
                rows="4"
                required={userData?.userType === 'patient'}
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              disabled={submitting}
              className="auth-button modern"
            >
              {submitting ? 'Scheduling...' : 'Schedule Appointment'}
            </Button>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="appointments-section slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <h2>All Appointments</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="search-input-wrapper" style={{ maxWidth: '300px' }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="appointments-grid">
            {filteredAppointments.map((appointment) => {
              const dateTime = formatDateTime(appointment.appointmentDate);
              return (
                <div key={appointment.id} className="appointment-card">
                  <div className="card-header">
                    <h3>
                      {userData?.userType === 'doctor' 
                        ? appointment.patientName 
                        : appointment.doctorName}
                    </h3>
                    <div className={`status-badge ${getStatusColor(appointment.status)}`}>
                      {appointment.status || 'Scheduled'}
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="appointment-details">
                      <p><strong>Date:</strong> {dateTime.date}</p>
                      <p><strong>Time:</strong> {dateTime.time}</p>
                      <p><strong>Type:</strong> {appointment.type}</p>
                      {appointment.reason && (
                        <p><strong>Reason:</strong> {appointment.reason}</p>
                      )}
                      {appointment.urgency && appointment.urgency !== 'normal' && (
                        <p><strong>Urgency:</strong> 
                          <span className={`urgency-${appointment.urgency}`}>
                            {appointment.urgency}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button 
                          variant="success" 
                          size="small"
                          onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                        >
                          Confirm
                        </Button>
                        <Button 
                          variant="outline" 
                          size="small"
                          onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === 'confirmed' && (
                      <Button 
                        variant="primary" 
                        size="small"
                      >
                        {appointment.type === 'video' ? 'Join Call' : 'Start Session'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>No appointments found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : userData?.userType === 'doctor' 
                  ? "You don't have any appointments scheduled yet."
                  : "You haven't booked any appointments yet."}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button 
                variant="primary" 
                onClick={() => setShowForm(true)}
                style={{ marginTop: '1rem' }}
              >
                Schedule First Appointment
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;