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
        const res = await axios.get(`/api/student-assignments/attempt/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setAssignment(res.data);
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
    const questionsList = parsedQuestions;
    
    if (assignment.type === 'quiz') {
      questionsList.forEach((q, i) => {
        // q.correctAnswer might be an index or the exact string
        if (answers[i] === q.options?.[q.correctAnswer] || answers[i] === q.correctAnswer) {
           calculatedScore += 1;
        }
      });
      calculatedScore = (calculatedScore / (questionsList.length || 1)) * 100;
    } else if (assignment.type === 'crossword') {
      (questionsList.words || []).forEach((w, i) => {
        if ((answers[i] || '').toUpperCase() === w.answer.toUpperCase()) calculatedScore += 1;
      });
      calculatedScore = (calculatedScore / ((questionsList.words || []).length || 1)) * 100;
    } else if (assignment.type === 'coding') {
      // For coding, we check if they filled at least something significant
      const solution = answers[0] || '';
      calculatedScore = solution.length > 50 ? 100 : 0;
    } else {
      calculatedScore = 100;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/student-assignments/submit', {
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

  let parsedQuestions = [];
  try {
    const raw = typeof assignment.questions_json === 'string' ? JSON.parse(assignment.questions_json) : assignment.questions_json;
    parsedQuestions = Array.isArray(raw) ? raw : (raw?.questions || raw);
  } catch (e) {
    console.error('Failed to parse questions', e);
  }

  const getQuestionCount = () => {
    if (assignment.type === 'quiz') return parsedQuestions.length || 1;
    return 1; // Coding/Crossword display as single page
  };
  const qCount = getQuestionCount();

  if (isSubmitted) return (
    <div className="fade-in" style={{ textAlign: 'center', maxWidth: '500px', margin: '5rem auto' }}>
      <div className="card">
        <div style={{ color: 'var(--success)', marginBottom: '1.5rem' }}><Trophy size={64} /></div>
        <h2 style={{ marginBottom: '1rem' }}>Assignment Submitted!</h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>You scored <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{score.toFixed(1)}%</span></p>
        <button onClick={() => navigate('/student/practice')} style={{ marginTop: '2rem', width: '100%' }}>Back to Dashboard</button>
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
          Question <strong>{currentIdx + 1}</strong> of {qCount}
        </div>
      </div>

      <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '2.5rem', overflow: 'hidden' }}>
        <div style={{ width: `${((currentIdx + 1) / qCount) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
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
            {assignment.type === 'quiz' && parsedQuestions[currentIdx] && (
              <div>
                <h3 style={{ marginBottom: '2rem' }}>{parsedQuestions[currentIdx].question || parsedQuestions[currentIdx].sentence}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(parsedQuestions[currentIdx].options || []).map((opt, i) => (
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

            {assignment.type === 'crossword' && (
              <div>
                <h3 style={{ marginBottom: '1.5rem' }}>Solve the Crossword Clues</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter the correct word for each clue based on the subject: <strong>{assignment.subject}</strong></p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {(parsedQuestions.words || []).map((word, i) => (
                    <div key={i} className="input-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        {i + 1}. {word.clue} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({word.answer?.length} letters, {word.orientation})</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="ENTER WORD" 
                        maxLength={word.answer?.length || 50}
                        value={answers[i] || ''} 
                        onChange={(e) => setAnswers({...answers, [i]: e.target.value.toUpperCase()})}
                        style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700', fontSize: '1.1rem' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assignment.type === 'coding' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>{parsedQuestions.title || 'Coding Challenge'}</h3>
                  <p style={{ marginBottom: '1rem' }}>{parsedQuestions.description || 'Complete the functionality.'}</p>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <strong>Constraints:</strong> {parsedQuestions.constraints || 'None'}
                  </div>
                </div>

                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Write your solution here:</label>
                  <textarea 
                    value={answers[0] || parsedQuestions.initialCode || ''} 
                    onChange={(e) => setAnswers({...answers, 0: e.target.value})}
                    style={{ 
                      minHeight: '300px', 
                      fontFamily: 'monospace', 
                      fontSize: '0.9rem', 
                      lineHeight: '1.6', 
                      padding: '1rem',
                      background: '#1e293b',
                      color: '#f8fafc',
                      borderRadius: '10px'
                    }}
                  />
                </div>

                {parsedQuestions.testCases && parsedQuestions.testCases[0] && (
                  <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Example Test Case:</div>
                    <div style={{ fontSize: '0.8rem' }}><strong>Input:</strong> {parsedQuestions.testCases[0].input}</div>
                    <div style={{ fontSize: '0.8rem' }}><strong>Output:</strong> {parsedQuestions.testCases[0].output}</div>
                  </div>
                )}
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
          
          {currentIdx === qCount - 1 ? (
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
