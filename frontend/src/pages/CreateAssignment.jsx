import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Save, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const CreateAssignment = () => {
  const [batches, setBatches] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Computer Networks',
    type: 'quiz',
    batchId: '',
    level: 'beginner'
  });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/faculty/batches', {
          headers: { 'x-auth-token': token }
        });
        setBatches(res.data);
      } catch (err) {
        console.error('Error fetching batches:', err);
      }
    };
    fetchBatches();
  }, []);

  const handleGenerate = async () => {
    if (!formData.title || !formData.batchId) {
      setError('Please fill in Title and Batch before generating');
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/faculty/generate-assignment', {
        subject: formData.subject,
        type: formData.type,
        level: formData.level
      }, {
        headers: { 'x-auth-token': token }
      });
      setGeneratedContent(res.data.questions);
    } catch (err) {
      setError('AI Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/faculty/assignments', {
        ...formData,
        questionsJson: generatedContent
      }, {
        headers: { 'x-auth-token': token }
      });
      navigate('/faculty');
    } catch (err) {
      setError('Failed to save assignment');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create New Assignment</h1>
        <p style={{ color: 'var(--text-muted)' }}>Use AI to automatically generate high-quality educational content.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={18} color="var(--primary)" /> Assignment Settings</h3>
          
          <div className="input-group">
            <label>Assignment Title</label>
            <input type="text" placeholder="e.g. OSI Model Quiz" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>

          <div className="input-group">
            <label>Target Batch</label>
            <select value={formData.batchId} onChange={e => setFormData({...formData, batchId: e.target.value})} required>
              <option value="">Select a batch</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Subject</label>
            <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
              <option value="Computer Networks">Computer Networks</option>
              <option value="C Programming">C Programming</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Assignment Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="quiz">Quiz (MCQs)</option>
                <option value="crossword">Crossword</option>
                <option value="coding">Coding Challenge</option>
                <option value="flashcards">Flashcards</option>
                <option value="fill_blanks">Fill in Blanks</option>
              </select>
            </div>
            <div className="input-group">
              <label>Difficulty</label>
              <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14} /> {error}</div>}

          <button 
            onClick={handleGenerate} 
            disabled={isGenerating} 
            style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Generating Content...</> : <><Sparkles size={18} /> Generate Content</>}
          </button>
        </div>

        <div className="card" style={{ border: '1px dashed var(--border)', background: generatedContent ? 'white' : '#f8fafc', overflowY: 'auto', maxHeight: '600px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={18} color={generatedContent ? 'var(--success)' : 'var(--text-muted)'} /> Content Preview</h3>
          
          {!generatedContent ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <p>Configure settings and click generate to see AI magic here.</p>
            </div>
          ) : (
            <div className="fade-in">
              <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Successfully generated {formData.type}! Review the content below.
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Array.isArray(generatedContent) ? generatedContent.map((item, i) => (
                  <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{i+1}. {item.question || item.front || item.sentence}</div>
                    {item.options && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', opacity: 0.8 }}>
                        {item.options.map((opt, j) => <div key={j} style={{ fontSize: '0.75rem', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px' }}>{opt}</div>)}
                      </div>
                    )}
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>Answer: {item.correctAnswer || item.back || item.answer}</div>
                  </div>
                )) : <pre style={{ fontSize: '0.75rem', padding: '1rem', background: '#f8fafc' }}>{JSON.stringify(generatedContent, null, 2)}</pre>}
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button onClick={handleSave} disabled={isSaving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {isSaving ? 'Publishing...' : <><Save size={18} /> Publish Assignment</>}
                </button>
                <button onClick={() => setGeneratedContent(null)} style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;
