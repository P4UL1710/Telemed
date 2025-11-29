import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Phone, MapPin, Calendar, Eye, EyeOff, Stethoscope, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Register = () => {
  const { signup } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'patient',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    // Doctor specific fields
    specialization: '',
    license: '',
    experience: '',
    consultationFee: '',
    // Patient specific fields
    bloodType: '',
    height: '',
    weight: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    const { phone, dateOfBirth } = formData;
    
    if (!phone || !dateOfBirth) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData);
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email address already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        default:
          errorMessage = error.message || 'An error occurred during registration.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="register-container">
        <LoadingSpinner size="large" message="Creating your account..." />
      </div>
    );
  }

  const renderStep1 = () => (
    <div className="form-step">
      <div className="form-row">
        <div className="input-group">
          <label className="input-label">First Name *</label>
          <div className="input-wrapper">
            <User size={20} className="input-icon" />
            <input
              type="text"
              name="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
        </div>
        
        <div className="input-group">
          <label className="input-label">Last Name *</label>
          <div className="input-wrapper">
            <input
              type="text"
              name="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="input-group">
        <label className="input-label">Email Address *</label>
        <div className="input-wrapper">
          <Mail size={20} className="input-icon" />
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange}
            className="input-field"
            required
          />
        </div>
      </div>
      
      <div className="input-group">
        <label className="input-label">I am a: *</label>
        <div className="user-type-selection">
          <label className={`user-type-card ${formData.userType === 'patient' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="userType"
              value="patient"
              checked={formData.userType === 'patient'}
              onChange={handleInputChange}
            />
            <div className="card-content">
              <div className="card-icon">👤</div>
              <div className="card-title">Patient</div>
              <div className="card-description">Seeking medical care</div>
            </div>
          </label>
          <label className={`user-type-card ${formData.userType === 'doctor' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="userType"
              value="doctor"
              checked={formData.userType === 'doctor'}
              onChange={handleInputChange}
            />
            <div className="card-content">
              <div className="card-icon">👨‍⚕️</div>
              <div className="card-title">Doctor</div>
              <div className="card-description">Healthcare provider</div>
            </div>
          </label>
        </div>
      </div>
      
      <div className="form-row">
        <div className="input-group">
          <label className="input-label">Password *</label>
          <div className="input-wrapper">
            <Lock size={20} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              className="input-field"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        
        <div className="input-group">
          <label className="input-label">Confirm Password *</label>
          <div className="input-wrapper">
            <Lock size={20} className="input-icon" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="input-field"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <div className="form-row">
        <div className="input-group">
          <label className="input-label">Phone Number *</label>
          <div className="input-wrapper">
            <Phone size={20} className="input-icon" />
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
        </div>
        
        <div className="input-group">
          <label className="input-label">Date of Birth *</label>
          <div className="input-wrapper">
            <Calendar size={20} className="input-icon" />
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="input-group">
        <label className="input-label">Gender</label>
        <div className="input-wrapper">
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="input-field"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </div>
      
      <div className="input-group">
        <label className="input-label">Address</label>
        <div className="input-wrapper">
          <MapPin size={20} className="input-icon" />
          <textarea
            name="address"
            placeholder="Enter your address"
            value={formData.address}
            onChange={handleInputChange}
            className="input-field textarea"
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    if (formData.userType === 'doctor') {
      return (
        <div className="form-step">
          <div className="input-group">
            <label className="input-label">Medical Specialization</label>
            <div className="input-wrapper">
              <Stethoscope size={20} className="input-icon" />
              <input
                type="text"
                name="specialization"
                placeholder="e.g., Cardiology, Pediatrics"
                value={formData.specialization}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">License Number</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="license"
                  placeholder="Medical license number"
                  value={formData.license}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Years of Experience</label>
              <div className="input-wrapper">
                <input
                  type="number"
                  name="experience"
                  placeholder="0"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Consultation Fee (USD)</label>
            <div className="input-wrapper">
              <input
                type="number"
                name="consultationFee"
                placeholder="0"
                value={formData.consultationFee}
                onChange={handleInputChange}
                className="input-field"
                min="0"
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="form-step">
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Blood Type</label>
              <div className="input-wrapper">
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Height (cm)</label>
              <div className="input-wrapper">
                <input
                  type="number"
                  name="height"
                  placeholder="170"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Weight (kg)</label>
              <div className="input-wrapper">
                <input
                  type="number"
                  name="weight"
                  placeholder="70"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
          </div>
          
          <div className="section-divider">
            <h3>Emergency Contact</h3>
          </div>
          
          <div className="input-group">
            <label className="input-label">Contact Name</label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input
                type="text"
                name="emergencyContact.name"
                placeholder="Emergency contact name"
                value={formData.emergencyContact.name}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Contact Phone</label>
              <div className="input-wrapper">
                <Phone size={20} className="input-icon" />
                <input
                  type="tel"
                  name="emergencyContact.phone"
                  placeholder="Emergency contact phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="input-group">
              <label className="input-label">Relationship</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="emergencyContact.relationship"
                  placeholder="e.g., Parent, Spouse"
                  value={formData.emergencyContact.relationship}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="logo">
            <div className="logo-icon">
              <Stethoscope size={32} />
            </div>
            <h1>TeleMed+</h1>
          </div>
          <h2>Create Your Account</h2>
          <p>Join our healthcare community today</p>
        </div>
        
        {/* Progress Indicator */}
        <div className="progress-steps">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}>
              <div className="step-circle">{step}</div>
              <div className="step-label">
                {step === 1 ? 'Account Info' : step === 2 ? 'Personal Details' : 'Additional Info'}
              </div>
            </div>
          ))}
        </div>
        
        <form className="register-form" onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          <div className="form-navigation">
            {currentStep > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrevStep}
                className="nav-button"
              >
                <ArrowLeft size={18} />
                Previous
              </Button>
            )}
            
            <div className="nav-spacer"></div>
            
            {currentStep < 3 ? (
              <Button 
                type="button" 
                variant="primary" 
                onClick={handleNextStep}
                className="nav-button"
              >
                Next
                <ArrowRight size={18} />
              </Button>
            ) : (
              <Button 
                type="submit" 
                variant="primary" 
                className="nav-button"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            )}
          </div>
        </form>
        
        <div className="register-footer">
          <p>Already have an account? 
            <Link to="/login" className="login-link">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;