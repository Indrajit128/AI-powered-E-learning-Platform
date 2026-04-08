import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BarChart3, Users, Trophy, Download, Search, CheckCircle2, ChevronRight, Activity, Percent, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const ViewResults = () => {
  const { id } = useParams(); // Batch ID
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/faculty/submissions/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setSubmissions(res.data);
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [id]);

  return (
    <div className="relative min-h-[calc(100vh-100px)] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center">
      {/* Ambient Orbs */}
      <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[0%] left-[-5%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl relative z-10 space-y-10"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-2xl bg-background/50 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-400">Results</span> Intel
              <Activity size={32} className="text-primary animate-pulse hidden md:block" />
            </h1>
            <p className="text-muted-foreground mt-2 font-medium tracking-wide flex items-center gap-2">
               <BookOpen size={16} /> Detailed analytics for Cohort/Batch <span className="font-bold text-foreground">#{id}</span>
            </p>
          </div>
          
          <div className="relative z-10">
            <button className="px-6 py-3 rounded-2xl font-black text-sm text-foreground bg-background/60 backdrop-blur-md border border-white/10 hover:border-primary/50 hover:bg-primary/5 shadow-xl flex items-center gap-2 transition-all">
              <Download size={18} className="text-primary" /> Export Matrix (CSV)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="p-6 rounded-[2rem] bg-background/60 backdrop-blur-xl border border-white/10 shadow-xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner"><Users size={24} /></div>
              <div><div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Submissions</div><div className="text-3xl font-black">{submissions.length}</div></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="p-6 rounded-[2rem] bg-background/60 backdrop-blur-xl border border-white/10 shadow-xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-success/20 rounded-full blur-2xl group-hover:bg-success/40 transition-colors" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="p-4 rounded-2xl bg-success/10 text-success border border-success/20 shadow-inner"><Trophy size={24} /></div>
              <div><div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Class Average</div><div className="text-3xl font-black flex items-end gap-1">84<span className="text-sm pb-1 text-muted-foreground">%</span></div></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="p-6 rounded-[2rem] bg-background/60 backdrop-blur-xl border border-white/10 shadow-xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/40 transition-colors" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 shadow-inner"><BarChart3 size={24} /></div>
              <div><div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">High Achievers</div><div className="text-3xl font-black">12</div></div>
            </div>
          </motion.div>
        </div>

        <div className="rounded-[2.5rem] bg-background/50 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="px-8 py-6 border-b border-border/50 bg-muted/10 flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight">Performance Directory</h3>
              <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Search cadet..." className="pl-9 pr-4 py-2 rounded-xl bg-background border border-border/50 text-sm font-semibold outline-none focus:ring-2 ring-primary/20 shadow-inner" />
              </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-background/40">
                  <th className="py-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Student Alpha</th>
                  <th className="py-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Comm Link (Email)</th>
                  <th className="py-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Score Rating</th>
                  <th className="py-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Timestamp</th>
                  <th className="py-4 px-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="py-12 text-center text-muted-foreground font-black tracking-widest animate-pulse">Decrypting Records...</td></tr>
                ) : submissions.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center text-muted-foreground font-black tracking-widest">NO RECORDS FOUND</td></tr>
                ) : (
                  submissions.map((sub, i) => (
                    <motion.tr 
                       initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                       key={sub.id} 
                       className="border-b border-border/20 hover:bg-muted/30 transition-colors group cursor-default"
                    >
                      <td className="py-4 px-8 font-bold text-foreground/90 group-hover:text-primary transition-colors flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black">{sub.student_name?.[0] || 'X'}</div>
                          {sub.student_name}
                      </td>
                      <td className="py-4 px-8 text-sm font-medium text-muted-foreground">{sub.student_email}</td>
                      <td className="py-4 px-8 font-black">
                         <span className={`inline-flex items-center gap-1 ${Number(sub.score) >= 70 ? 'text-success' : 'text-warning'}`}>
                             {sub.score}<Percent size={12}/>
                         </span>
                      </td>
                      <td className="py-4 px-8 text-xs font-semibold text-muted-foreground tracking-wide">{new Date(sub.submitted_at).toLocaleString()}</td>
                      <td className="py-4 px-8 text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-success/10 text-success border border-success/20 text-[10px] font-black uppercase tracking-widest shadow-sm">
                           <CheckCircle2 size={12} /> Graded
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewResults;
