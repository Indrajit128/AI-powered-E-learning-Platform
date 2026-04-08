import { useState, useEffect } from 'react';
import { Users, Search, Calendar, CheckSquare, XSquare, ShieldCheck, Download, Activity, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const FacultyAttendance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceLog, setAttendanceLog] = useState({}); // { studentId: 'present' | 'absent' }
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Mocked API fetch for students
    setTimeout(() => {
      setStudents([
        { id: 1, name: 'Alice Parker', email: 'alice@student.com' },
        { id: 2, name: 'Bob Smith', email: 'bob@student.com' },
        { id: 3, name: 'Charlie Davis', email: 'charlie@student.com' },
        { id: 4, name: 'Diana Prince', email: 'diana@student.com' },
        { id: 5, name: 'Evan Wright', email: 'evan@student.com' },
      ]);
      // Set all base as present initially
      const initialLog = {
        1: 'present', 2: 'present', 3: 'absent', 4: 'present', 5: 'absent'
      };
      setAttendanceLog(initialLog);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleStatus = (id, status) => {
    setAttendanceLog(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Attendance securely logged for ' + attendanceDate);
    }, 800);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-[calc(100vh-100px)] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center">
      {/* Ambient BG */}
      <div className="absolute top-[-10%] right-[30%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl relative z-10 space-y-10"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-2xl bg-background/50 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-400">Attendance</span> Tracker
              <ShieldCheck size={32} className="text-primary hidden md:block" />
            </h1>
            <p className="text-muted-foreground mt-2 font-medium tracking-wide">Monitor participation and register daily presence.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 relative z-10">
            <button className="px-6 py-3 rounded-2xl font-black text-sm text-foreground bg-background/60 backdrop-blur-md border border-white/10 hover:border-primary/50 shadow-xl flex items-center gap-2 transition-all">
              <Download size={18} className="text-primary" /> Export Matrix
            </button>
            <button onClick={handleSave} disabled={isSaving} className="px-6 py-3 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-primary to-purple-600 shadow-[0_0_30px_-5px_rgba(var(--primary),0.5)] hover:shadow-[0_0_40px_-5px_rgba(var(--primary),0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50">
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Lock Registry
            </button>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-background/60 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Calendar size={18} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                   </div>
                   <input 
                     type="date" 
                     value={attendanceDate}
                     onChange={(e) => setAttendanceDate(e.target.value)}
                     className="bg-background/80 backdrop-blur-md border border-border/50 focus:border-primary/50 focus:ring-4 ring-primary/10 pl-12 pr-6 py-3 rounded-2xl text-sm font-bold outline-none transition-all shadow-inner uppercase tracking-widest text-muted-foreground"
                   />
                </div>
                <div className="relative group w-full sm:w-64">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Search size={18} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                   </div>
                   <input 
                     type="text" 
                     placeholder="Search cadet..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-background/80 backdrop-blur-md border border-border/50 focus:border-primary/50 focus:ring-4 ring-primary/10 pl-12 pr-6 py-3 rounded-2xl text-sm font-semibold outline-none transition-all shadow-inner placeholder:text-muted-foreground/60"
                   />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {loading ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-muted-foreground">
                        <Activity size={40} className="animate-bounce mb-3 text-primary" />
                        <p className="font-black tracking-widest uppercase mb-1">Loading Directory</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-muted-foreground font-black tracking-widest uppercase">
                        No matches found.
                    </div>
                ) : (
                    filteredStudents.map((s, i) => {
                        const status = attendanceLog[s.id];
                        return (
                           <motion.div 
                             initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                             key={s.id} 
                             className={`p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                                status === 'present' 
                                ? 'bg-success/5 border-success/30 shadow-[0_0_20px_-5px_rgba(var(--success),0.15)]' 
                                : status === 'absent' 
                                ? 'bg-destructive/5 border-destructive/30 shadow-[0_0_20px_-5px_rgba(var(--destructive),0.15)]'
                                : 'bg-background/80 border-border'
                             }`}
                           >
                             <div className="flex items-center gap-4 mb-5">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner transition-colors ${
                                    status === 'present' ? 'bg-success text-white' : status === 'absent' ? 'bg-destructive text-white' : 'bg-muted text-muted-foreground'
                                 }`}>
                                    {s.name[0]}
                                 </div>
                                 <div className="flex-1">
                                    <div className={`font-bold text-lg tracking-tight line-clamp-1 ${status === 'present' ? 'text-success' : status === 'absent' ? 'text-destructive' : 'text-foreground'}`}>
                                        {s.name}
                                    </div>
                                    <div className="text-xs font-semibold text-muted-foreground truncate">{s.email}</div>
                                 </div>
                             </div>

                             <div className="flex items-center gap-2 bg-background/50 p-1.5 rounded-xl border border-white/5">
                                 <button 
                                     onClick={() => toggleStatus(s.id, 'present')}
                                     className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                                        status === 'present' ? 'bg-success text-white shadow-md' : 'hover:bg-muted text-muted-foreground'
                                     }`}
                                 >
                                     <CheckSquare size={14} /> Present
                                 </button>
                                 <button 
                                     onClick={() => toggleStatus(s.id, 'absent')}
                                     className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                                        status === 'absent' ? 'bg-destructive text-white shadow-md' : 'hover:bg-muted text-muted-foreground'
                                     }`}
                                 >
                                     <XSquare size={14} /> Absent
                                 </button>
                             </div>
                           </motion.div>
                        );
                    })
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FacultyAttendance;
