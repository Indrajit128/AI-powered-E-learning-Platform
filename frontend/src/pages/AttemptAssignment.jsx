import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AttemptAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/student/assignments/batch_0`, { // Adjust batch fetch logic
          headers: { 'x-auth-token': token }
        });
        // For demo, we find the assignment with ID from the list
        const found = res.data.find(a => a.id === parseInt(id));
        setAssignment(found);
      } catch (err) {
        console.error('Error fetching assignment:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [id]);

  const handleSubmit = async () => {
    let calculatedScore = 0;
    const questions = assignment.questions_json;
    
    if (assignment.type === 'quiz') {
      questions.forEach((q, i) => {
        if (answers[i] === q.correctAnswer) calculatedScore += 1;
      });
      calculatedScore = (calculatedScore / questions.length) * 100;
    } else {
      // Simplistic scoring for other types in this demo
      calculatedScore = 100;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/student/submissions', {
        assignmentId: id,
        answersJson: answers,
        score: calculatedScore
      }, {
        headers: { 'x-auth-token': token }
      });
      setScore(calculatedScore);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 size={32} className="animate-spin" /></div>;
  if (!assignment) return <div>Assignment not found.</div>;

  const questions = assignment.questions_json;

  if (isSubmitted) return (
    <div className="fade-in" style={{ textAlign: 'center', maxWidth: '500px', margin: '5rem auto' }}>
      <div className="card">
        <div style={{ color: 'var(--success)', marginBottom: '1.5rem' }}><Trophy size={64} /></div>
        <h2 style={{ marginBottom: '1rem' }}>Assignment Submitted!</h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>You scored <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{score.toFixed(1)}%</span></p>
        <button onClick={() => navigate('/student')} style={{ marginTop: '2rem', width: '100%' }}>Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>{assignment.title}</h2>
          <span style={{ fontSize: '0.8rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>{assignment.type.toUpperCase()}</span>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Question <strong>{currentIdx + 1}</strong> of {questions.length}
        </div>
      </div>

      <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '2.5rem', overflow: 'hidden' }}>
        <div style={{ width: `${((currentIdx + 1) / questions.length) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
      </div>

      <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {assignment.type === 'quiz' && (
              <div>
                <h3 style={{ marginBottom: '2rem' }}>{questions[currentIdx].question}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {questions[currentIdx].options.map((opt, i) => (
                    <div 
                      key={i} 
                      onClick={() => setAnswers({...answers, [currentIdx]: opt})}
                      style={{
                        padding: '1.25rem',
                        border: '2px solid ' + (answers[currentIdx] === opt ? 'var(--primary)' : 'var(--border)'),
                        borderRadius: '12px',
                        cursor: 'pointer',
                        background: answers[currentIdx] === opt ? '#4f46e505' : 'transparent',
                        fontWeight: answers[currentIdx] === opt ? '600' : '400',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                    >
                      {opt}
                      {answers[currentIdx] === opt && <CheckCircle2 size={18} color="var(--primary)" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assignment.type === 'flashcards' && (
              <div 
                onClick={() => setAnswers({...answers, [currentIdx]: true})}
                style={{
                  height: '300px',
                  perspective: '1000px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.6s',
                  transformStyle: 'preserve-3d',
                  transform: answers[currentIdx] ? 'rotateY(180deg)' : 'rotateY(0)'
                }}>
                  <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontSize: '1.5rem', fontWeight: '600' }}>
                    {questions[currentIdx].front}
                  </div>
                  <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontSize: '1.5rem', fontWeight: '600' }}>
                    {questions[currentIdx].back}
                  </div>
                </div>
              </div>
            )}

            {/* Other types like Crossword, Coding Challenge can be added here */}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
          <button 
            disabled={currentIdx === 0} 
            onClick={() => setCurrentIdx(currentIdx - 1)} 
            style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={18} /> Previous
          </button>
          
          {currentIdx === questions.length - 1 ? (
            <button onClick={handleSubmit} style={{ background: 'var(--success)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Submit Assignment <CheckCircle2 size={18} />
            </button>
          ) : (
            <button onClick={() => setCurrentIdx(currentIdx + 1)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Next Question <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttemptAssignment;
