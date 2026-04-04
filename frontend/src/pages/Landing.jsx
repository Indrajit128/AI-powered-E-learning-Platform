import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  BrainCircuit, 
  Users, 
  BarChart3, 
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="landing-page animate-mesh" style={{ 
      minHeight: '100vh', 
      overflowX: 'hidden' 
    }}>
      <div className="grid-pattern" style={{ minHeight: '100vh' }}>
        {/* Navigation */}
        <nav className="landing-nav">
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.025em' }}>
            Learn<span style={{ color: 'var(--text-main)' }}>AI</span>
          </div>
          <div className="auth-buttons">
            <Link to="/login" className="login-link">Login</Link>
            <Link to="/register">
              <button className="get-started-btn">Get Started Free</button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section style={{ 
          padding: '80px 5% 120px', 
          maxWidth: '1400px', 
          margin: '0 auto', 
          position: 'relative'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4rem', 
            textAlign: 'left',
            flexWrap: 'wrap'
          }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ flex: '1', minWidth: '350px' }}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 20px', 
                  background: 'rgba(224, 231, 255, 0.5)', 
                  backdropFilter: 'blur(10px)',
                  color: 'var(--primary)', 
                  borderRadius: '100px', 
                  fontSize: '0.875rem', 
                  fontWeight: '700', 
                  marginBottom: '2rem',
                  border: '1px solid rgba(79, 70, 229, 0.2)'
                }}>
                <Sparkles size={16} /> Powered by Advanced AI
              </motion.div>
              <h1 style={{ 
                fontSize: 'max(3.5rem, 4.5vw)', 
                fontWeight: '950', 
                letterSpacing: '-0.05em', 
                lineHeight: '1.1', 
                marginBottom: '1.5rem',
                color: '#1a1f36'
              }}>
                Revolutionize Education with <br />
                <span className="text-gradient">AI-Generated Mastery</span>
              </h1>
              <p style={{ 
                fontSize: '1.15rem', 
                color: 'var(--text-muted)', 
                maxWidth: '600px', 
                margin: '0 0 3.5rem',
                lineHeight: '1.7',
                fontWeight: '450'
              }}>
                The first full-stack E-learning platform that generates assignments, 
                quizzes, and coding challenges instantly using Google Gemini. 
                Designed for forward-thinking Faculty and ambitious Students.
              </p>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <Link to="/register">
                  <button style={{ 
                    padding: '1.1rem 2.5rem', 
                    fontSize: '1.05rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    borderRadius: '12px',
                    fontWeight: '700'
                  }}>
                    Start for Free <ArrowRight size={22} />
                  </button>
                </Link>
                <button className="glass" style={{ 
                  color: 'var(--text-main)', 
                  border: '1px solid var(--border)', 
                  padding: '1.1rem 2.5rem', 
                  fontSize: '1.05rem',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  View Demo
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ flex: '1', minWidth: '400px', position: 'relative' }}
            >
              <div className="glass" style={{ 
                borderRadius: '40px', 
                overflow: 'hidden', 
                boxShadow: '0 25px 70px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                aspectRatio: '4/3'
              }}>
                 <img 
                   src="/elearning_hero_image.png" 
                   alt="AI E-Learning Dashboard" 
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                 />
              </div>
            </motion.div>
          </div>

          {/* Floating elements decoration */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              position: 'absolute', 
              top: '10%', 
              left: '2%', 
              opacity: 0.15, 
              pointerEvents: 'none',
              color: 'var(--primary)'
            }}>
            <BrainCircuit size={160} />
          </motion.div>
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              position: 'absolute', 
              bottom: '15%', 
              right: '2%', 
              opacity: 0.15, 
              pointerEvents: 'none',
              color: 'var(--secondary)'
            }}>
            <BarChart3 size={160} />
          </motion.div>
        </section>

        {/* Trusted By Section */}
        <section style={{ 
          padding: '40px 5% 80px', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          textAlign: 'center',
          opacity: 0.8
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>Trusted by innovative institutions</p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '4rem', 
            flexWrap: 'wrap',
            filter: 'grayscale(1) contrast(0.5) opacity(0.5)'
          }}>
             <TrustIcon name="NextGen Uni" />
             <TrustIcon name="AI Lab 21" />
             <TrustIcon name="FutureSchool" />
             <TrustIcon name="EdTech Global" />
          </div>
        </section>

        {/* Feature Grid */}
        <section style={{ 
          padding: '120px 5%',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ textAlign: 'center', marginBottom: '5rem' }}>
              <h2 style={{ fontSize: '3.5rem', fontWeight: '950', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>Built for the Modern Classroom</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>Experience features that save faculty time and accelerate student learning through the power of Google Gemini.</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
              <FeatureCard 
                icon={<BrainCircuit size={32} />} 
                title="AI Generation" 
                desc="Create unique quizzes, flashcards, and coding challenges in seconds using advanced LLMs."
                delay={0.1}
              />
              <FeatureCard 
                icon={<Clock size={32} />} 
                title="Real-time Sync" 
                desc="Assignments appear on student dashboards instantly without any page refresh."
                delay={0.2}
              />
              <FeatureCard 
                icon={<BarChart3 size={32} />} 
                title="Smart Analytics" 
                desc="Deep insights into student performance and subject mastery trends."
                delay={0.3}
              />
              <FeatureCard 
                icon={<Users size={32} />} 
                title="Batch Management" 
                desc="Organize students into batches easily and track collective progress."
                delay={0.4}
              />
              <FeatureCard 
                icon={<CheckCircle size={32} />} 
                title="Auto-Grading" 
                desc="Instant scores and feedback for students on quizzes and fill-in-the-blanks."
                delay={0.5}
              />
              <FeatureCard 
                icon={<PlayCircle size={32} />} 
                title="Interactive UI" 
                desc="Premium dashboard experience with smooth animations and intuitive navigation."
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section style={{ padding: '100px 5%', textAlign: 'center' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '3rem', 
            maxWidth: '1100px', 
            margin: '0 auto',
            background: 'rgba(255, 255, 255, 0.4)',
            padding: '4rem',
            borderRadius: '30px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.5)'
          }}>
            <StatItem value="500+" label="Active Faculty" />
            <StatItem value="10k+" label="Students Enrolled" />
            <StatItem value="50k+" label="AI Questions" />
            <StatItem value="99%" label="Positive Feedback" />
          </div>
        </section>

        {/* Footer */}
        <footer style={{ 
          padding: '80px 5% 40px', 
          marginTop: '100px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          position: 'relative'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <strong style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>LearnAI</strong>
            <p style={{ marginTop: '0.5rem' }}>The Future of E-Learning, Today.</p>
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            &copy; 2026 AI E-Learning Platform. Built with passion for excellence.
          </div>
        </footer>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -12, transition: { duration: 0.2 } }}
    className="card glass" 
    style={{ 
      textAlign: 'left', 
      padding: '2.5rem',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)'
    }}
  >
    <div style={{ 
      width: '64px', 
      height: '64px', 
      background: 'white', 
      borderRadius: '16px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: 'var(--primary)',
      marginBottom: '2rem',
      boxShadow: '0 8px 20px rgba(79, 70, 229, 0.1)'
    }}>
      {icon}
    </div>
    <h3 style={{ marginBottom: '1.25rem', fontSize: '1.5rem', fontWeight: '800' }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', margin: 0, fontSize: '1.05rem' }}>{desc}</p>
  </motion.div>
);

const StatItem = ({ value, label }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
  >
    <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{value}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '600' }}>{label}</div>
  </motion.div>
);

const TrustIcon = ({ name }) => (
  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a1f36', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }}></div>
    {name}
  </div>
);

export default Landing;
