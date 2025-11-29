import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Video, 
  MessageCircle, 
  Calendar, 
  Shield, 
  Clock,
  Users,
  Star,
  ArrowRight,
  Phone,
  CheckCircle,
  Heart,
  Brain,
  Baby,
  Eye,
  Pill,
  Activity,
  UserPlus,
  FileText,
  Award,
  Lock
} from 'lucide-react';
import Button from '../components/Common/Button';

const PublicHome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Video,
      title: 'Video Consultations',
      description: 'Connect with healthcare professionals through secure HD video calls.'
    },
    {
      icon: MessageCircle,
      title: 'Secure Messaging',
      description: 'Chat directly with doctors and get quick answers to health questions.'
    },
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book appointments 24/7 with our intuitive scheduling system.'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Your health data is protected with enterprise-grade security.'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      icon: UserPlus,
      title: 'Create Account',
      description: 'Sign up in minutes with your basic information'
    },
    {
      step: '2',
      icon: Video,
      title: 'Connect with Doctor',
      description: 'Choose from our network of licensed healthcare professionals'
    },
    {
      step: '3',
      icon: FileText,
      title: 'Get Treatment Plan',
      description: 'Receive personalized care plans and prescriptions'
    }
  ];

  const services = [
    {
      icon: Heart,
      title: 'General Medicine',
      description: 'Comprehensive primary care for common health concerns',
      availability: '24/7 Available'
    },
    {
      icon: Brain,
      title: 'Mental Health',
      description: 'Professional counseling and therapy sessions',
      availability: 'Same Day'
    },
    {
      icon: Baby,
      title: 'Pediatrics',
      description: 'Specialized care for children and adolescents',
      availability: 'Urgent Care'
    },
    {
      icon: Eye,
      title: 'Dermatology',
      description: 'Skin condition diagnosis and treatment plans',
      availability: 'Next Day'
    },
    {
      icon: Activity,
      title: 'Cardiology',
      description: 'Heart health consultations and monitoring',
      availability: 'Priority Care'
    },
    {
      icon: Pill,
      title: 'Pharmacy',
      description: 'Digital prescriptions and medication delivery',
      availability: 'Same Day Delivery'
    }
  ];

  const doctors = [
    {
      name: 'Dr. Sarah Johnson',
      specialty: 'Internal Medicine',
      experience: '15+ years',
      rating: 4.9,
      reviews: 234
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Cardiology',
      experience: '12+ years',
      rating: 4.8,
      reviews: 189
    },
    {
      name: 'Dr. Emily Rodriguez',
      specialty: 'Dermatology',
      experience: '10+ years',
      rating: 5.0,
      reviews: 156
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Wilson',
      role: 'Patient',
      content: 'TeleMed+ made healthcare so convenient. I can consult with my doctor from home!',
      rating: 5
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      content: 'The platform streamlines consultations while maintaining the highest security standards.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Working Mother',
      content: 'Scheduling appointments around my work has never been easier. Highly recommended!',
      rating: 5
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Patients Served' },
    { number: '200+', label: 'Healthcare Providers' },
    { number: '98%', label: 'Satisfaction Rate' },
    { number: '24/7', label: 'Available Support' }
  ];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <Stethoscope size={28} />
              </div>
              <span className="logo-text">TeleMed+</span>
            </div>
            
            <nav className="nav-menu">
              <a href="#features">Features</a>
              <a href="#services">Services</a>
              <a href="#doctors">Doctors</a>
              <a href="#about">About</a>
            </nav>
            
            <div className="header-actions">
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button 
                variant="primary" 
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Healthcare at Your Fingertips</h1>
              <p>
                Connect with qualified doctors through secure video calls, 
                chat consultations, and comprehensive medical care from the 
                comfort of your home.
              </p>
              
              <div className="hero-actions">
                <Button 
                  variant="primary" 
                  size="large"
                  onClick={() => navigate('/register')}
                >
                  Start Your Journey
                  <ArrowRight size={20} />
                </Button>
                <Button 
                  variant="outline" 
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  <Phone size={18} />
                  Book Consultation
                </Button>
              </div>

              <div className="trust-badges">
                <div className="badge">
                  <Shield size={16} />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="badge">
                  <Award size={16} />
                  <span>Board-Certified</span>
                </div>
                <div className="badge">
                  <Clock size={16} />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            <div className="hero-image">
              <div className="demo-card">
                <div className="demo-header">
                  <div className="doctor-avatar">
                    <Stethoscope size={20} />
                  </div>
                  <div className="doctor-info">
                    <div className="doctor-name">Dr. Sarah Williams</div>
                    <div className="doctor-specialty">General Practitioner</div>
                  </div>
                  <div className="status-badge">
                    <div className="status-dot"></div>
                    <span>Available</span>
                  </div>
                </div>
                <div className="demo-body">
                  <p>Ready for consultation</p>
                  <div className="consultation-type">
                    <Video size={16} />
                    <span>Video Call • 30 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Getting quality healthcare has never been easier. Follow these simple steps.</p>
          </div>
          
          <div className="steps-grid">
            {howItWorks.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="step-card">
                  <div className="step-number">{step.step}</div>
                  <div className="step-icon">
                    <IconComponent size={28} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose TeleMed+?</h2>
            <p>Comprehensive healthcare solutions designed for the modern world</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <IconComponent size={28} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="container">
          <div className="section-header">
            <h2>Our Medical Services</h2>
            <p>Comprehensive healthcare services by board-certified professionals</p>
          </div>
          
          <div className="services-grid">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div key={index} className="service-card">
                  <div className="service-header">
                    <div className="service-icon">
                      <IconComponent size={24} />
                    </div>
                    <div className="availability-badge">{service.availability}</div>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <Button variant="outline" size="small">
                    Learn More
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="doctors">
        <div className="container">
          <div className="section-header">
            <h2>Meet Our Medical Team</h2>
            <p>Board-certified physicians providing exceptional care</p>
          </div>
          
          <div className="doctors-grid">
            {doctors.map((doctor, index) => (
              <div key={index} className="doctor-card">
                <div className="doctor-avatar">
                  {getInitials(doctor.name)}
                </div>
                <h3>{doctor.name}</h3>
                <div className="doctor-specialty">{doctor.specialty}</div>
                <div className="doctor-experience">{doctor.experience} experience</div>
                
                <div className="doctor-rating">
                  <div className="rating-stars">
                    <Star size={16} fill="currentColor" />
                    <span>{doctor.rating}</span>
                  </div>
                  <span className="review-count">({doctor.reviews} reviews)</span>
                </div>
                
                <Button variant="primary" size="small">
                  Book Consultation
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Users Say</h2>
            <p>Real stories from people who trust TeleMed+ with their healthcare</p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar">
                    {getInitials(testimonial.name)}
                  </div>
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                  <div className="testimonial-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="security">
        <div className="container">
          <div className="section-header">
            <h2>Trusted & Secure Healthcare</h2>
            <p>Your privacy and security are our top priorities</p>
          </div>
          
          <div className="security-features">
            <div className="security-item">
              <Shield size={24} />
              <h3>HIPAA Compliant</h3>
              <p>Enterprise-grade security protecting your medical information</p>
            </div>
            <div className="security-item">
              <Lock size={24} />
              <h3>End-to-End Encryption</h3>
              <p>Military-grade encryption for all consultations and data</p>
            </div>
            <div className="security-item">
              <CheckCircle size={24} />
              <h3>Verified Doctors</h3>
              <p>All physicians are board-certified and licensed professionals</p>
            </div>
            <div className="security-item">
              <Clock size={24} />
              <h3>24/7 Support</h3>
              <p>Round-the-clock technical and medical support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience Better Healthcare?</h2>
            <p>Join thousands of patients who have transformed their healthcare experience</p>
            <div className="cta-actions">
              <Button 
                variant="primary" 
                size="large"
                onClick={() => navigate('/register')}
              >
                Get Started Today
                <ArrowRight size={20} />
              </Button>
            </div>
            <div className="cta-note">
              Free account • No credit card required • Start in minutes
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon">
                  <Stethoscope size={24} />
                </div>
                <span className="logo-text">TeleMed+</span>
              </div>
              <p>Making quality medical care accessible to everyone, everywhere.</p>
            </div>
            
            <div className="footer-links">
              <div className="link-column">
                <h4>Platform</h4>
                <a href="#" onClick={() => navigate('/register')}>For Patients</a>
                <a href="#" onClick={() => navigate('/register')}>For Doctors</a>
                <a href="#features">Features</a>
                <a href="#services">Services</a>
              </div>
              
              <div className="link-column">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
              
              <div className="link-column">
                <h4>Get Started</h4>
                <a href="#" onClick={() => navigate('/login')}>Sign In</a>
                <a href="#" onClick={() => navigate('/register')}>Create Account</a>
                <a href="#">Schedule Demo</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 TeleMed+. All rights reserved.</p>
            <p>HIPAA Compliant • SOC 2 Certified • FDA Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;