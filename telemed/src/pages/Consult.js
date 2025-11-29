import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, User, Calendar, Stethoscope,AArrowDown, ChevronLeft, Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { consultationService, userService } from '../utils/firestoreUtils';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Consult = () => {
  const { userData, currentUser } = useAuth();
  const [selectedConsult, setSelectedConsult] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newConsultation, setNewConsultation] = useState({
    patientName: '',
    patientId: '',
    symptoms: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    followUpDate: '',
    status: 'active'
  });

  useEffect(() => {
    fetchConsultations();
  }, [currentUser, userData]);

  useEffect(() => {
    filterConsultations();
  }, [consultations, searchTerm, statusFilter]);

  const fetchConsultations = async () => {
    if (!currentUser || !userData) return;

    try {
      setLoading(true);
      const userConsultations = await consultationService.getByUser(
        currentUser.uid, 
        userData.userType
      );
      setConsultations(userConsultations);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  const filterConsultations = () => {
    let filtered = consultations;

    if (searchTerm) {
      filtered = filtered.filter(consultation => {
        const searchFields = [
          consultation.patientName,
          consultation.doctorName,
          consultation.diagnosis,
          consultation.symptoms
        ].join(' ').toLowerCase();
        return searchFields.includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(consultation => 
        consultation.status?.toLowerCase() === statusFilter
      );
    }

    setFilteredConsultations(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewConsultation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateConsultation = async (e) => {
    e.preventDefault();
    
    if (!newConsultation.patientName || !newConsultation.symptoms) {
      toast.error('Please fill in patient name and symptoms');
      return;
    }

    setSubmitting(true);
    try {
      const consultationData = {
        ...newConsultation,
        doctorId: currentUser.uid,
        doctorName: userData.displayName,
        patientId: newConsultation.patientId || `patient_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await consultationService.create(consultationData);
      toast.success('Consultation created successfully!');
      
      setShowCreateForm(false);
      setNewConsultation({
        patientName: '',
        patientId: '',
        symptoms: '',
        diagnosis: '',
        prescription: '',
        notes: '',
        followUpDate: '',
        status: 'active'
      });
      
      await fetchConsultations();
      
    } catch (error) {
      console.error('Error creating consultation:', error);
      toast.error('Failed to create consultation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateConsultation = async (consultationId, updateData) => {
    try {
      await consultationService.update(consultationId, updateData);
      toast.success('Consultation updated successfully!');
      await fetchConsultations();
      
      // Update selected consultation if it's currently being viewed
      if (selectedConsult?.id === consultationId) {
        setSelectedConsult(prev => ({ ...prev, ...updateData }));
      }
    } catch (error) {
      console.error('Error updating consultation:', error);
      toast.error('Failed to update consultation');
    }
  };

  const handleAddNote = async (consultationId, note) => {
    if (!note.trim()) return;
    
    try {
      await consultationService.addNote(consultationId, note);
      toast.success('Note added successfully!');
      await fetchConsultations();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'follow-up': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-scheduled';
    }
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner size="large" message="Loading consultations..." />
      </div>
    );
  }

  if (selectedConsult) {
    return (
      <div className="page fade-in">
        <div className="consultation-details">
          <div className="details-header">
            <Button 
              variant="outline" 
              onClick={() => setSelectedConsult(null)}
              className="d-flex align-items-center"
              style={{ gap: '0.5rem' }}
            >
              <ChevronLeft size={20} />
              Back to List
            </Button>
            <h2>Consultation Details</h2>
          </div>

          <div className="patient-info">
            <h3>Patient Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Patient Name:</label>
                <span>{selectedConsult.patientName}</span>
              </div>
              <div className="info-item">
                <label>Date:</label>
                <span>{formatDate(selectedConsult.createdAt)}</span>
              </div>
              <div className="info-item">
                <label>Doctor:</label>
                <span>{selectedConsult.doctorName}</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className={`status-badge ${getStatusColor(selectedConsult.status)}`}>
                  {selectedConsult.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="medical-details">
            <div className="detail-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4>Symptoms</h4>
                {userData?.userType === 'doctor' && (
                  <Button variant="outline" size="small">
                    Edit
                  </Button>
                )}
              </div>
              <p>{selectedConsult.symptoms || 'No symptoms recorded'}</p>
            </div>

            <div className="detail-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4>Diagnosis</h4>
                {userData?.userType === 'doctor' && (
                  <Button variant="outline" size="small">
                    Update
                  </Button>
                )}
              </div>
              <p>{selectedConsult.diagnosis || 'Diagnosis pending...'}</p>
            </div>

            <div className="detail-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4>Prescription</h4>
                {userData?.userType === 'doctor' && (
                  <Button variant="outline" size="small">
                    Add Medication
                  </Button>
                )}
              </div>
              <p>{selectedConsult.prescription || 'No prescription given'}</p>
            </div>

            <div className="detail-section">
              <h4>Notes & Follow-up</h4>
              <p>{selectedConsult.notes || 'No additional notes'}</p>
              
              {selectedConsult.notes?.length > 0 && (
                <div className="notes-list" style={{ marginTop: '1rem' }}>
                  {selectedConsult.notes.map((note, index) => (
                    <div key={index} className="note-item">
                      <p>{note.content}</p>
                      <small>{formatDate(note.timestamp)}</small>
                    </div>
                  ))}
                </div>
              )}
              
              {userData?.userType === 'doctor' && (
                <div style={{ marginTop: '1rem' }}>
                  <textarea
                    placeholder="Add a note..."
                    className="input-field modern"
                    rows="3"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleAddNote(selectedConsult.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <small style={{ color: 'var(--text-muted)' }}>
                    Press Ctrl+Enter to add note
                  </small>
                </div>
              )}
            </div>
          </div>

          {userData?.userType === 'doctor' && selectedConsult.status !== 'completed' && (
            <div className="consultation-actions">
              <Button 
                variant="success"
                onClick={() => handleUpdateConsultation(selectedConsult.id, { status: 'completed' })}
              >
                <FileText size={18} />
                Complete Consultation
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleUpdateConsultation(selectedConsult.id, { status: 'follow-up' })}
              >
                <Calendar size={18} />
                Schedule Follow-up
              </Button>
              <Button variant="outline">
                <AArrowDown size={18} />
                Add Prescription
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Consultations</h1>
          <p>
            {userData?.userType === 'doctor' 
              ? 'Manage patient consultations and medical records'
              : 'View your consultation history and medical records'}
          </p>
        </div>
        {userData?.userType === 'doctor' && (
          <Button 
            variant="primary" 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus size={20} />
            {showCreateForm ? 'Cancel' : 'New Consultation'}
          </Button>
        )}
      </div>

      {/* Create Consultation Form */}
      {showCreateForm && userData?.userType === 'doctor' && (
        <div className="form-section slide-up">
          <h2>Create New Consultation</h2>
          <form onSubmit={handleCreateConsultation}>
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
                  value={newConsultation.patientName}
                  onChange={handleInputChange}
                  className="input-field modern"
                  required
                />
              </div>
              
              <div className="input-group modern half-width">
                <label className="input-label modern">Follow-up Date</label>
                <div className="input-icon">
                  <Calendar size={20} />
                </div>
                <input
                  type="date"
                  name="followUpDate"
                  value={newConsultation.followUpDate}
                  onChange={handleInputChange}
                  className="input-field modern"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="input-group modern">
              <label className="input-label modern">Symptoms *</label>
              <div className="input-icon">
                <Stethoscope size={20} />
              </div>
              <textarea
                name="symptoms"
                placeholder="Describe the patient's symptoms"
                value={newConsultation.symptoms}
                onChange={handleInputChange}
                className="input-field modern"
                style={{ paddingLeft: '3rem' }}
                rows="3"
                required
              />
            </div>

            <div className="input-group modern">
              <label className="input-label modern">Initial Diagnosis</label>
              <div className="input-icon">
                <FileText size={20} />
              </div>
              <textarea
                name="diagnosis"
                placeholder="Enter initial diagnosis or assessment"
                value={newConsultation.diagnosis}
                onChange={handleInputChange}
                className="input-field modern"
                style={{ paddingLeft: '3rem' }}
                rows="2"
              />
            </div>

            <div className="input-group modern">
              <label className="input-label modern">Prescription</label>
              <div className="input-icon">
                <AArrowDown size={20} />
              </div>
              <textarea
                name="prescription"
                placeholder="Enter medication details and instructions"
                value={newConsultation.prescription}
                onChange={handleInputChange}
                className="input-field modern"
                style={{ paddingLeft: '3rem' }}
                rows="2"
              />
            </div>

            <div className="input-group modern">
              <label className="input-label modern">Additional Notes</label>
              <textarea
                name="notes"
                placeholder="Any additional notes or observations"
                value={newConsultation.notes}
                onChange={handleInputChange}
                className="input-field modern"
                rows="2"
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              disabled={submitting}
              className="auth-button modern"
            >
              {submitting ? 'Creating...' : 'Create Consultation'}
            </Button>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="consultations-list slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <h2>All Consultations</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="search-input-wrapper" style={{ maxWidth: '300px' }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search consultations..."
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
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="follow-up">Follow-up</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredConsultations.length > 0 ? (
          <div className="consultations-grid">
            {filteredConsultations.map((consultation) => (
              <div key={consultation.id} className="consultation-card">
                <div className="card-header">
                  <h3>
                    {userData?.userType === 'doctor' 
                      ? consultation.patientName 
                      : consultation.doctorName}
                  </h3>
                  <div className={`status-badge ${getStatusColor(consultation.status)}`}>
                    {consultation.status || 'Active'}
                  </div>
                </div>
                
                <div className="card-content">
                  <p><strong>Date:</strong> {formatDate(consultation.createdAt)}</p>
                  <p><strong>Symptoms:</strong> {consultation.symptoms?.substring(0, 100)}
                    {consultation.symptoms?.length > 100 ? '...' : ''}
                  </p>
                  {consultation.diagnosis && (
                    <p><strong>Diagnosis:</strong> {consultation.diagnosis?.substring(0, 80)}
                      {consultation.diagnosis?.length > 80 ? '...' : ''}
                    </p>
                  )}
                  {consultation.followUpDate && (
                    <p><strong>Follow-up:</strong> {formatDate(consultation.followUpDate)}</p>
                  )}
                </div>
                
                <div className="card-actions">
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => setSelectedConsult(consultation)}
                  >
                    View Details
                  </Button>
                  {consultation.status === 'active' && userData?.userType === 'doctor' && (
                    <Button 
                      variant="primary" 
                      size="small"
                      onClick={() => handleUpdateConsultation(consultation.id, { status: 'completed' })}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={64} />
            <h3>No consultations found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : userData?.userType === 'doctor' 
                  ? "You haven't created any consultations yet."
                  : "You don't have any consultation records yet."}
            </p>
            {!searchTerm && statusFilter === 'all' && userData?.userType === 'doctor' && (
              <Button 
                variant="primary" 
                onClick={() => setShowCreateForm(true)}
                style={{ marginTop: '1rem' }}
              >
                Create First Consultation
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Consult;