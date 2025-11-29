import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageCircle, 
  Users, 
  Settings,
  Monitor,
  Camera,
  Volume2,
  VolumeX,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService, consultationService } from '../utils/firestoreUtils';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const VideoCall = () => {
  const { userData, currentUser } = useAuth();
  const [isCallActive, setIsCallActive] = useState(false);
  const [callSettings, setCallSettings] = useState({
    isMuted: false,
    isVideoOff: false,
    isSpeakerOff: false,
    isRecording: false,
    screenSharing: false
  });
  const [callDuration, setCallDuration] = useState(0);
  const [callNotes, setCallNotes] = useState('');
  const [availableAppointments, setAvailableAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStartTime, setCallStartTime] = useState(null);

  useEffect(() => {
    fetchAvailableAppointments();
  }, [currentUser, userData]);

  useEffect(() => {
    let interval;
    if (isCallActive && callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, callStartTime]);

  const fetchAvailableAppointments = async () => {
    if (!currentUser || !userData) return;

    try {
      setLoading(true);
      const appointments = await appointmentService.getByUser(
        currentUser.uid,
        userData.userType
      );
      
      // Filter for confirmed video call appointments
      const videoAppointments = appointments.filter(
        appointment => 
          appointment.type === 'video' && 
          appointment.status === 'confirmed'
      );
      
      setAvailableAppointments(videoAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = async (appointment) => {
    try {
      setSelectedAppointment(appointment);
      setIsCallActive(true);
      setCallStartTime(Date.now());
      
      // Update appointment status to 'in-progress'
      await appointmentService.update(appointment.id, { 
        status: 'in-progress',
        callStartTime: new Date().toISOString()
      });
      
      toast.success('Call started successfully');
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call');
    }
  };

  const handleEndCall = async () => {
    try {
      if (selectedAppointment) {
        // Create consultation record
        const consultationData = {
          appointmentId: selectedAppointment.id,
          patientId: selectedAppointment.patientId,
          patientName: selectedAppointment.patientName,
          doctorId: selectedAppointment.doctorId,
          doctorName: selectedAppointment.doctorName,
          type: 'video_call',
          duration: callDuration,
          notes: callNotes,
          status: 'completed',
          callEndTime: new Date().toISOString()
        };

        await consultationService.create(consultationData);
        
        // Update appointment status
        await appointmentService.update(selectedAppointment.id, { 
          status: 'completed',
          callEndTime: new Date().toISOString(),
          duration: callDuration
        });
      }

      // Reset call state
      setIsCallActive(false);
      setCallSettings({
        isMuted: false,
        isVideoOff: false,
        isSpeakerOff: false,
        isRecording: false,
        screenSharing: false
      });
      setCallDuration(0);
      setCallNotes('');
      setSelectedAppointment(null);
      setCallStartTime(null);
      
      toast.success('Call ended successfully');
      
      // Refresh appointments
      await fetchAvailableAppointments();
      
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call properly');
    }
  };

  const toggleSetting = (setting) => {
    setCallSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));

    // Show appropriate feedback
    const messages = {
      isMuted: prev => prev ? 'Microphone unmuted' : 'Microphone muted',
      isVideoOff: prev => prev ? 'Camera turned on' : 'Camera turned off',
      isSpeakerOff: prev => prev ? 'Speaker turned on' : 'Speaker muted',
      screenSharing: prev => prev ? 'Screen sharing stopped' : 'Screen sharing started',
      isRecording: prev => prev ? 'Recording stopped' : 'Recording started'
    };

    if (messages[setting]) {
      toast.success(messages[setting](callSettings[setting]));
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="video-call-loading">
        <LoadingSpinner size="large" message="Loading video call interface..." />
      </div>
    );
  }

  if (!isCallActive) {
    return (
      <div className="video-call-setup">
        <div className="page-header">
          <div>
            <h1>Video Call</h1>
            <p>Connect with {userData?.userType === 'doctor' ? 'patients' : 'doctors'} through secure video calls</p>
          </div>
        </div>

        <div className="setup-content">
          {/* Available Appointments */}
          <div className="setup-card main-card">
            <div className="card-header">
              <div className="header-icon">
                <Video size={32} />
              </div>
              <div className="header-content">
                <h2>Start Video Call</h2>
                <p>Choose an appointment to start a video consultation</p>
              </div>
            </div>
            
            {availableAppointments.length > 0 ? (
              <div className="appointments-section">
                <h3>Available Video Appointments</h3>
                <div className="appointments-list">
                  {availableAppointments.map((appointment) => {
                    const dateTime = formatDateTime(appointment.appointmentDate);
                    return (
                      <div key={appointment.id} className="appointment-card">
                        <div className="appointment-info">
                          <div className="participant-avatar">
                            <div className="avatar-circle">
                              {getInitials(
                                userData?.userType === 'doctor' 
                                  ? appointment.patientName 
                                  : appointment.doctorName
                              )}
                            </div>
                            <div className="status-indicator online"></div>
                          </div>
                          
                          <div className="appointment-details">
                            <h4>
                              {userData?.userType === 'doctor' 
                                ? appointment.patientName 
                                : appointment.doctorName}
                            </h4>
                            <div className="appointment-meta">
                              <span className="appointment-time">
                                <Calendar size={16} />
                                {dateTime.date} at {dateTime.time}
                              </span>
                              <span className="appointment-type">
                                <Video size={16} />
                                {appointment.type} • {appointment.reason}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="primary" 
                          onClick={() => handleStartCall(appointment)}
                          className="start-call-button"
                        >
                          <Video size={18} />
                          Start Call
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <Users size={64} />
                <h3>No video appointments available</h3>
                <p>
                  {userData?.userType === 'doctor' 
                    ? "You don't have any confirmed video appointments at the moment."
                    : "You don't have any confirmed video appointments scheduled."}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/appointment'}
                >
                  {userData?.userType === 'doctor' ? 'Manage Schedule' : 'Book Appointment'}
                </Button>
              </div>
            )}
          </div>

          {/* Call Preferences */}
          <div className="setup-card preferences-card">
            <div className="card-header">
              <div className="header-icon">
                <Settings size={24} />
              </div>
              <div className="header-content">
                <h3>Call Preferences</h3>
                <p>Configure your call settings</p>
              </div>
            </div>
            
            <div className="preferences-list">
              <label className="preference-item">
                <div className="preference-info">
                  <Camera size={20} />
                  <span>Enable Camera</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={!callSettings.isVideoOff}
                  onChange={() => toggleSetting('isVideoOff')}
                  className="preference-toggle"
                />
              </label>
              
              <label className="preference-item">
                <div className="preference-info">
                  <Mic size={20} />
                  <span>Enable Microphone</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={!callSettings.isMuted}
                  onChange={() => toggleSetting('isMuted')}
                  className="preference-toggle"
                />
              </label>
              
              <label className="preference-item">
                <div className="preference-info">
                  <Volume2 size={20} />
                  <span>Enable Speaker</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={!callSettings.isSpeakerOff}
                  onChange={() => toggleSetting('isSpeakerOff')}
                  className="preference-toggle"
                />
              </label>
              
              <label className="preference-item">
                <div className="preference-info">
                  <Activity size={20} />
                  <span>Record Session</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={callSettings.isRecording}
                  onChange={() => toggleSetting('isRecording')}
                  className="preference-toggle"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-active">
      <div className="call-header">
        <div className="call-info">
          <h2>
            Video Call with {
              userData?.userType === 'doctor' 
                ? selectedAppointment?.patientName 
                : selectedAppointment?.doctorName
            }
          </h2>
          <div className="call-status">
            <div className="status-indicator online"></div>
            <span>Connected</span>
          </div>
        </div>
        
        <div className="call-timer">
          <Clock size={20} />
          {formatDuration(callDuration)}
        </div>
      </div>

      <div className="video-interface">
        <div className="video-main">
          <div className="remote-participant">
            <div className="participant-video">
              <div className="video-placeholder">
                <div className="participant-avatar large">
                  {getInitials(
                    userData?.userType === 'doctor' 
                      ? selectedAppointment?.patientName 
                      : selectedAppointment?.doctorName
                  )}
                </div>
                <div className="participant-name">
                  {userData?.userType === 'doctor' 
                    ? selectedAppointment?.patientName 
                    : selectedAppointment?.doctorName}
                </div>
                {callSettings.isVideoOff && (
                  <div className="video-status">Camera Off</div>
                )}
              </div>
            </div>
          </div>

          <div className="local-participant">
            <div className="participant-video small">
              <div className="video-placeholder">
                <div className="participant-avatar">
                  {getInitials(userData?.displayName || 'You')}
                </div>
                <div className="participant-name">You</div>
                {callSettings.isVideoOff && (
                  <div className="video-status">Camera Off</div>
                )}
              </div>
            </div>
          </div>

          {callSettings.screenSharing && (
            <div className="screen-share-indicator">
              <Monitor size={20} />
              <span>Screen Sharing Active</span>
            </div>
          )}
        </div>

        <div className="call-controls">
          <div className="controls-row">
            <Button 
              variant={callSettings.isMuted ? "danger" : "outline"}
              onClick={() => toggleSetting('isMuted')}
              className="control-button"
              title={callSettings.isMuted ? "Unmute" : "Mute"}
            >
              {callSettings.isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>

            <Button 
              variant={callSettings.isVideoOff ? "danger" : "outline"}
              onClick={() => toggleSetting('isVideoOff')}
              className="control-button"
              title={callSettings.isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {callSettings.isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </Button>

            <Button 
              variant={callSettings.isSpeakerOff ? "danger" : "outline"}
              onClick={() => toggleSetting('isSpeakerOff')}
              className="control-button"
              title={callSettings.isSpeakerOff ? "Unmute speaker" : "Mute speaker"}
            >
              {callSettings.isSpeakerOff ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </Button>

            <Button 
              variant="outline"
              onClick={() => toggleSetting('screenSharing')}
              className="control-button"
              title="Share screen"
            >
              <Monitor size={24} />
            </Button>

            <Button 
              variant="outline"
              className="control-button"
              title="Open chat"
            >
              <MessageCircle size={24} />
            </Button>

            <Button 
              variant="danger"
              onClick={handleEndCall}
              className="control-button end-call"
            >
              <PhoneOff size={24} />
              End Call
            </Button>
          </div>
        </div>
      </div>

      <div className="call-notes-section">
        <div className="notes-card">
          <h3>Call Notes</h3>
          <textarea 
            placeholder="Add notes during the call..."
            className="notes-textarea"
            rows="4"
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
          />
          <div className="notes-footer">
            <Button variant="outline" size="small">
              Save Notes
            </Button>
            <span className="notes-hint">
              Notes will be automatically saved when the call ends
            </span>
          </div>
        </div>

        {/* Call Quality Indicator */}
        <div className="call-quality">
          <div className="quality-status good">
            <div className="signal-strength">
              <div className="signal-bar active"></div>
              <div className="signal-bar active"></div>
              <div className="signal-bar active"></div>
              <div className="signal-bar active"></div>
            </div>
            <span>Excellent Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;