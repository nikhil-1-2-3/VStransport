import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Clock, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';
import './Login.css';

declare global {
  interface Window {
    VANTA: any;
  }
}

const partnersList = [
  "JK Cement",
  "UltraTech",
  "Ambuja",
  "Shree Cement",
  "ACC Limited"
];

// Helper to render stylized text logos that look realistic but don't break
const CompanyLogo = ({ name }: { name: string }) => {
  let style: React.CSSProperties = { fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '8px' };
  
  if (name === "JK Cement") {
    return <div style={{ ...style, fontFamily: 'serif', color: '#60a5fa' }}><span style={{ border: '2px solid #60a5fa', padding: '2px 8px', borderRadius: '4px' }}>JK</span> Cement</div>;
  }
  if (name === "UltraTech") {
    return <div style={{ ...style, color: '#fbbf24', textTransform: 'uppercase', fontStyle: 'italic' }}>UltraTech</div>;
  }
  if (name === "Ambuja") {
    return <div style={{ ...style, color: '#4ade80' }}>Ambuja <span style={{ fontWeight: 300, fontSize: '1rem' }}>Cement</span></div>;
  }
  if (name === "Shree Cement") {
    return <div style={{ ...style, color: '#f87171', letterSpacing: '4px', textTransform: 'uppercase' }}>SHREE</div>;
  }
  if (name === "ACC Limited") {
    return <div style={{ ...style, color: '#a3e635' }}><span style={{ background: '#a3e635', color: '#050505', padding: '0 8px' }}>ACC</span></div>;
  }
  
  return <div style={style}>{name}</div>;
};

// Helper Component: Pixel Reveal Image
const PixelRevealImage = ({ src, alt }: { src: string, alt: string }) => {
  const pixels = Array.from({ length: 144 }, (_, i) => i); // 12x12 grid

  return (
    <motion.div 
      className="pixel-reveal-wrapper"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <img src={src} alt={alt} className="pixel-target-image" />
      <div className="pixel-grid-overlay">
        {pixels.map((i) => (
          <motion.div
            key={i}
            className="pixel-block"
            variants={{
              hidden: { opacity: 1 },
              visible: { 
                opacity: 0, 
                transition: { duration: 0.1, delay: Math.random() * 1.5 }
              }
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export const Login: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [role, setRole] = useState<'ADMIN' | 'DRIVER'>('ADMIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  
  const vantaRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  useEffect(() => {
    let vantaEffect: any = null;
    
    const initVanta = () => {
      if (window.VANTA && window.VANTA.GLOBE && vantaRef.current) {
        vantaEffect = window.VANTA.GLOBE({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x4f46e5, // Indigo/Tech Blue
          color2: 0x0f172a, // Slate
          size: 1.2,
          backgroundColor: 0x050505 // Pure dark background
        });
        setTimeout(() => setIsBooting(false), 2200);
      } else {
        setTimeout(initVanta, 100);
      }
    };
    
    initVanta();

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  const openLogin = (selectedRole: 'ADMIN' | 'DRIVER') => {
    setRole(selectedRole);
    setShowLoginModal(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const { user, token } = response.data;

      if (user.role !== role) {
        setError(`Access Denied. You are not registered as an ${role}.`);
        return;
      }

      login(user, token);
      
      if (user.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/driver');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="vanta-theme-container">
      {/* Boot Animation Screen */}
      <AnimatePresence>
        {isBooting && (
          <motion.div 
            className="system-boot-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
          >
            <div className="boot-content">
              <Truck size={48} className="accent-icon" />
              <motion.h2 
                initial={{ opacity: 0, letterSpacing: "10px" }}
                animate={{ opacity: 1, letterSpacing: "4px" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                V S TRANSPORT GLOBAL
              </motion.h2>
              <div className="boot-progress-container">
                <motion.div 
                  className="boot-progress-bar"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
              <p className="boot-text">INITIALIZING SYSTEMS...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vanta Globe Background Layer */}
      <div className="vanta-bg" ref={vantaRef}></div>

      {/* Sleek Header */}
      <motion.header 
        className={`sleek-header ${scrolled ? 'scrolled' : ''}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="logo-area">
          <Truck size={24} className="accent-icon" />
          <span className="brand-title">V S TRANSPORT</span>
        </div>
        <nav className="nav-links">
          <a href="#about">Platform</a>
          <a href="#services">Capabilities</a>
          <a href="#contact">Network</a>
        </nav>
        <button className="btn-minimal" onClick={() => openLogin('ADMIN')}>
          ACCESS PORTAL <ArrowRight size={14} />
        </button>
      </motion.header>

      {/* Main Hero Foreground */}
      <main className="hero-foreground">
        <motion.div 
          className="hero-content"
          initial="hidden" animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 2.8 } }
          }}
        >
          <motion.div variants={fadeUp} className="badge">GLOBAL LOGISTICS INFRASTRUCTURE</motion.div>
          <motion.h1 variants={fadeUp}>
            POWERING<br />THE FUTURE<br />OF TRANSPORT.
          </motion.h1>
          <motion.p variants={fadeUp} className="hero-subtitle">
            A state-of-the-art dispatch and fleet management system built for unparalleled scale and precision.
          </motion.p>
          <motion.div className="hero-actions" variants={fadeUp}>
            <button className="btn-primary-tech" onClick={() => openLogin('ADMIN')}>
              ADMINISTRATOR
            </button>
            <button className="btn-secondary-tech" onClick={() => openLogin('DRIVER')}>
              DRIVER CONNECT
            </button>
          </motion.div>
        </motion.div>
      </main>

      {/* Partners Banner with Actual Logos & Curved Motion */}
      <section className="tech-section partners-banner">
        <div className="tech-container">
          <p className="tech-label">TRUSTED ENTERPRISE PARTNERS</p>
          <div className="curved-marquee-container">
            <motion.div 
              className="curved-marquee-track"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            >
              {[...partnersList, ...partnersList, ...partnersList].map((name, index) => (
                <motion.div 
                  key={index}
                  className="curved-logo-wrapper"
                  animate={{ y: [0, -35, 0, 35, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: (index % partnersList.length) * 0.8 }}
                >
                  <CompanyLogo name={name} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Us: What We Do & Pixel Reveal */}
      <section id="about" className="tech-section">
        <div className="tech-container about-flex-layout">
          <div className="about-content-left">
            <motion.h2 
              className="section-title"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            >
              WHAT WE DO.
            </motion.h2>
            <motion.div 
              className="about-text-blocks"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            >
              <div className="text-block">
                <h3>WHAT WE DO</h3>
                <p>We architect the backbone of modern heavy logistics. V S TRANSPORT provides an elite, unified platform that directly interfaces with nationwide operations, cutting out inefficiencies and maximizing fleet uptime through algorithmic precision.</p>
              </div>
              <div className="text-block">
                <h3>WHAT WE DELIVER</h3>
                <p>Uncompromising reliability. We deliver heavy cargo, construction materials, and commercial freight with down-to-the-minute accuracy. Our systems guarantee total visibility from the origin facility straight to the destination site.</p>
              </div>
            </motion.div>
          </div>
          <div className="about-visual-right">
            <PixelRevealImage src="/dumper_truck.png" alt="V S Transport Fleet" />
          </div>
        </div>
      </section>

      {/* Upscaled Core Capabilities */}
      <section id="services" className="tech-section capabilities-massive-section relative-section">
        {/* Soft Animated Background */}
        <div className="light-animated-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>
        
        <div className="tech-container">
          <motion.h2 
            className="section-title center-title"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            CORE CAPABILITIES.
          </motion.h2>
          
          <div className="capabilities-grid huge-capabilities">
            {[
              { icon: Truck, title: "FLEET OVERSIGHT", desc: "Real-time telemetry and advanced analytics for active vehicles globally." },
              { icon: Clock, title: "INSTANT DISPATCH", desc: "Algorithmic routing and instant assignment ensures zero downtime for cargo." },
              { icon: MapPin, title: "PRECISION TRACKING", desc: "Military-grade GPS integration provides high accuracy for every shipment." }
            ].map((service, index) => (
              <motion.div 
                key={index}
                className="huge-capability-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <div className="huge-icon-container">
                  <service.icon size={64} className="accent-icon" />
                </div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
                <div className="card-line-massive"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Animated Map Overlay */}
      <section id="contact" className="tech-section contact-map-section">
        <div className="tech-container map-split-layout">
          <motion.div 
            className="contact-details-huge"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">COMMAND CENTER.</h2>
            <div className="huge-contact-item">
              <MapPin size={28} className="accent-icon" />
              <div>
                <h4>HEADQUARTERS</h4>
                <p>Sai Heaven<br/>Surat, Gujarat</p>
              </div>
            </div>
            <div className="huge-contact-item">
              <Phone size={28} className="accent-icon" />
              <div>
                <h4>AKASH SINGH (LUCKY)</h4>
                <p>+91 79059 37814</p>
              </div>
            </div>
            <div className="huge-contact-item">
              <Phone size={28} className="accent-icon" />
              <div>
                <h4>VINAY PRATAP SINGH</h4>
                <p>+91 99258 03262</p>
              </div>
            </div>
            <div className="huge-contact-item">
              <Mail size={28} className="accent-icon" />
              <div>
                <h4>SECURE COMM</h4>
                <p>vstransport9925@gmail.com</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="animated-map-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="map-radar-sweep">
              <div className="radar-beam"></div>
              <div className="radar-circle"></div>
              <div className="radar-circle rc-2"></div>
            </div>
            <iframe 
              src="https://maps.google.com/maps?q=21.1564883,72.9576756&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(120%)' }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="tech-footer">
        <div className="tech-container footer-flex">
          <div className="footer-brand">
            <Truck size={24} className="accent-icon" />
            <span className="brand-title">V S TRANSPORT</span>
            <p className="footer-tagline">Logistics without limits.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>SYSTEM</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); openLogin('ADMIN'); }}>Admin Interface</a>
              <a href="#" onClick={(e) => { e.preventDefault(); openLogin('DRIVER'); }}>Driver Interface</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>2026 &copy; V S TRANSPORT GLOBAL. ALL SYSTEMS NOMINAL.</p>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            className="tech-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="tech-modal-content"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button className="modal-close" onClick={() => setShowLoginModal(false)}>✕</button>
              <div className="modal-header">
                <span className="brand-title">V S TRANSPORT</span>
                <h2>{role === 'ADMIN' ? 'ADMINISTRATOR AUTH' : 'DRIVER AUTH'}</h2>
              </div>

              {error && (
                <div className="tech-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="tech-form">
                <div className="input-group">
                  <label>IDENTIFIER</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    placeholder="Enter system ID"
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>SECURITY KEY</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Enter passcode"
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary-tech full-width">
                  INITIALIZE CONNECTION
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
