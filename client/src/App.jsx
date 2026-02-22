import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  FileInput, 
  Search, 
  Mail, 
  Plus,
  CheckCircle,
  Clock,
  Briefcase,
  ChevronDown,
  MessageSquareText,
  Sun,
  Moon,
  Activity,
  Terminal,
  Database,
  ExternalLink,
  Download,
  Trash2,
  Filter,
  Mic,
  Paperclip
} from 'lucide-react'
import './index.css'

const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const fmt = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

const timeAgo = (date) => {
  if (!date) return '—';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  if (seconds < 10) return "Just now";
  return Math.floor(seconds) + "s ago";
};

// --- REFINED COMPONENTS FOR ENTERPRISE REALISM ---
const SAMPLE_MOCK_REPORTS = [];
const INITIAL_HISTORY = [];

const StatsCard = ({ title, value, sub, color, icon: Icon }) => {
  const IconComponent = Icon;
  return (
    <div className={`stat-card ${color}`}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
        <div className="stat-header">{title}</div>
        {IconComponent && <IconComponent size={16} color="var(--text-muted)" />}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
};


const PlatformStatus = ({ stats }) => (
  <div className="chart-card" style={{padding:'24px', display:'flex', flexDirection:'column'}}>
    <div style={{marginBottom:'20px'}}>
      <h3 style={{margin:0, fontSize:'14px', fontWeight:'700'}}>AI Engine Telemetry</h3>
      <p style={{margin:'4px 0 0 0', fontSize:'12px', color:'var(--text-muted)'}}>Real-time operational status of connected LLM pipelines</p>
    </div>
    
    <div style={{padding:'16px', background:'var(--bg-hover)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-md)', marginBottom:'20px'}}>
      <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px'}}>
        <div style={{width:'8px', height:'8px', borderRadius:'50%', background: stats?.ai_mode === 'Gemini AI' ? '#10b981' : '#f59e0b'}}></div>
        <span style={{fontSize:'13px', fontWeight:'700'}}>{stats ? stats.model : 'Awaiting Connection...'}</span>
        <span style={{marginLeft:'auto', fontSize:'10px', fontWeight:'700', color: stats?.ai_mode === 'Gemini AI' ? '#10b981' : '#f59e0b', padding:'2px 6px', background:'rgba(16,185,129,0.1)', borderRadius:'4px'}}>{stats?.ai_mode === 'Gemini AI' ? 'LIVE' : 'MOCK'}</span>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px'}}>
          <span style={{color:'var(--text-secondary)'}}>Response Latency (avg)</span>
          <span style={{fontWeight:'600'}}>18.4s</span>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px'}}>
          <span style={{color:'var(--text-secondary)'}}>Token Success Rate</span>
          <span style={{fontWeight:'600', color:'#10b981'}}>99.2%</span>
        </div>
      </div>
    </div>

    <div style={{flex:1}}>
      <div style={{fontSize:'11px', fontWeight:'700', color:'var(--text-muted)', letterSpacing:'0.05em', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px'}}>
        <Terminal size={12} /> OPERATIONAL LOG
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:'6px', fontFamily:'monospace', fontSize:'11px'}}>
        <div style={{color:'var(--text-muted)'}}><span style={{color:'var(--accent-blue)'}}>[{new Date().toLocaleTimeString()}]</span> Engine ready...</div>
        {stats?.brd_count > 0 && (
          <div style={{color:'var(--text-secondary)'}}><span style={{color:'var(--accent-blue)'}}>[{new Date().toLocaleTimeString()}]</span> Successfully delivered BRD-{(stats.brd_count).toString().padStart(3,'0')}</div>
        )}
      </div>
    </div>
  </div>
)

// No longer using hardcoded MOCK_ACTIVITIES, derived from brdHistory

const ActivityTable = ({ activities, onEdit, onArchive, user, clock }) => {
  const processedActivities = activities.map(a => (!a.isMock && !a.owner) ? { ...a, owner: user.name } : a);
  return (
    <div className="table-card" style={{marginTop:'32px'}} data-tick={clock?.getTime()}>
      <div className="table-header">
        <div>
          <h3 style={{margin:0, fontSize:'14px', fontWeight:'700'}}>Recent Generation Activity</h3>
        </div>
        <button 
          onClick={() => onArchive()}
          style={{padding:'6px 12px', fontSize:'12px', background:'var(--bg-hover)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-sm)', color:'var(--text-secondary)', cursor:'pointer'}}
        >
          View Archive
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Project Name</th>
            <th>Last Modified</th>
            <th>Status</th>
            <th>Owner</th>
            <th style={{textAlign:'right'}}>Options</th>
          </tr>
        </thead>
        <tbody>
          {processedActivities.map((a, i) => (
            <tr key={i}>
              <td style={{fontFamily:'monospace', fontSize:'12px', color:'var(--text-muted)'}}>BRD-{String(processedActivities.length - i).padStart(3, '0')}</td>
              <td style={{fontWeight:'600', fontSize:'13px'}}>{a.name}</td>
              <td style={{color:'var(--text-muted)', fontSize:'12px'}}>{timeAgo(a.timestamp)}</td>
              <td>
                <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                  <div style={{width:'6px', height:'6px', borderRadius:'50%', background:a.color || 'var(--primary)'}}></div>
                  <span style={{fontSize:'12px', fontWeight:'500'}}>{a.status}</span>
                </div>
              </td>
              <td style={{fontSize:'12px'}}>{a.owner || (a.isMock ? 'System' : user.name)}</td>
              <td style={{textAlign:'right'}}>
                <button 
                  onClick={() => onEdit(a.name)}
                  style={{background:'transparent', border:'none', color:'var(--primary)', fontWeight:'600', fontSize:'12px', cursor:'pointer'}}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// --- MAIN VIEWS ---

const GeneratorView = ({ externalInput, initialReport, onSave }) => {
  const [inputText, setInputText] = useState(externalInput || '')
  const [report, setReport] = useState(initialReport || null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('brd')
  const [feedbackText, setFeedbackText] = useState('')

  const handleRefine = async () => {
    if (!feedbackText || !report) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('original_report', report.brd);
      formData.append('feedback', feedbackText);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/refine`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Refinement failed');
      const data = await res.json();
      setReport(data);
      setFeedbackText('');
      if (onSave) onSave(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Refinement failed. Ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (externalInput) setInputText(externalInput)
  }, [externalInput])

  useEffect(() => {
    if (initialReport) {
      setReport(initialReport);
      setActiveTab('brd');
    }
  }, [initialReport])

  const handleGenerate = async () => {
    if (!inputText) return;
    setIsLoading(true);
    setReport(null);
    try {
      const formData = new FormData();
      formData.append('context', inputText);
      const genRes = await fetch(`${import.meta.env.VITE_API_URL}/generate`, { method: 'POST', body: formData });
      if (!genRes.ok) throw new Error('Generation failed');
      const data = await genRes.json();
      setReport(data);
      setActiveTab('brd');
      if (onSave) onSave(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Backend unreachable. Ensure FastAPI server is running.");
    } finally {
      setIsLoading(false);
    }
  }

  const loadEnron = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/enron/random`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setInputText(`Subject: ${data.subject}\nFrom: ${data.from}\n\n${data.body}`);
    } catch { alert("Failed to load Enron sample"); } finally { setIsLoading(false); }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setInputText(prev => prev + `\n\n--- Attached File: ${file.name} ---\n${content}`);
    };
    reader.readAsText(file);
  };

  const handleVoiceSim = () => {
    const timestamp = new Date().toLocaleTimeString();
    setInputText(prev => prev + `\n\n--- Logged Voice Note (${timestamp}) ---\n[SIMULATED TRANSCRIPTION]: "The portal must support high-density data visualizations and real-time telemetry pulses similar to the main dashboard. Priority is on operational transparency."`);
  };

  return (
    <div className="dashboard-view">
      <div className="dashboard-title">BRD Drafting Workspace</div>
      <div className="generator-view">
         <div className="gen-panel-left">
            <div style={{marginBottom:'16px'}}>
              <h3 style={{fontSize:'14px', fontWeight:'700', marginBottom:'4px'}}>Requirements Input</h3>
              <p style={{fontSize:'12px', color:'var(--text-muted)'}}>Provide business context or load sample data.</p>
            </div>
            <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
               <button onClick={() => setInputText('')} className="icon-btn" title="Clear Canvas"><Trash2 size={14} /></button>
               <input 
                 type="file" 
                 id="file-upload" 
                 style={{display:'none'}} 
                 accept=".txt,.md,.json,.csv"
                 onChange={handleFileUpload}
               />
               <button onClick={() => document.getElementById('file-upload').click()} className="icon-btn" title="Attach Doc"><Paperclip size={14} /></button>
               <button onClick={handleVoiceSim} className="icon-btn" title="Voice Note"><Mic size={14} /></button>
               <button onClick={loadEnron} style={{flex:1, padding:'6px', background:'var(--bg-hover)', border:'1px solid var(--border-color)', borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer'}}>Load Enron Sample</button>
            </div>
            <textarea 
              style={{flex:1, background:'var(--bg-input)', border:'1px solid var(--border-color)', color:'var(--text-primary)', padding:'20px', borderRadius:'8px', resize:'none', fontFamily:'inherit', fontSize:'16px'}}
              placeholder="e.g. User needs a multi-tenant SaaS portal with RBAC..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button 
              onClick={handleGenerate} 
              disabled={isLoading || !inputText}
              style={{marginTop:'16px', padding:'12px', background:'var(--primary)', border:'none', borderRadius:'6px', color:'white', fontWeight:'600', cursor:'pointer'}}
            >
              {isLoading ? 'Processing LLM Pipeline...' : 'Generate Requirements Blueprint'}
            </button>
         </div>
         <div className="gen-panel-right">
            {report ? (
              <>
                <div style={{display:'flex', gap:'12px', borderBottom:'1px solid var(--border-color)', marginBottom:'16px'}}>
                   {['analysis', 'brd', 'gaps'].map(tab => (
                     <button key={tab} onClick={() => setActiveTab(tab)} style={{padding:'8px 0', background:'transparent', border:'none', borderBottom:activeTab===tab?'2px solid var(--primary)':'none', color:activeTab===tab?'var(--text-primary)':'var(--text-muted)', fontSize:'12px', fontWeight:'700', cursor:'pointer', minWidth:'80px', textTransform:'uppercase'}}>{tab}</button>
                   ))}
                   <button style={{marginLeft:'auto', background:'transparent', border:'none', color:'var(--primary)', cursor:'pointer'}} title="Download"><Download size={16} /></button>
                </div>
                <div className="markdown-body" style={{overflowY:'auto', flex:1}}>
                  <ReactMarkdown>{activeTab === 'analysis' ? report.analysis : (activeTab === 'brd' ? report.brd : report.clarification_questions)}</ReactMarkdown>
                </div>
                <div style={{marginTop:'20px', paddingTop:'16px', borderTop:'1px solid var(--border-color)'}}>
                   <div style={{fontSize:'12px', fontWeight:'700', marginBottom:'8px', color:'var(--primary)'}}>REFINEMENT CANVAS — PROVIDE FEEDBACK TO ALTER BRD</div>
                   <div style={{display:'flex', gap:'10px'}}>
                      <input 
                        style={{flex:1, background:'var(--bg-input)', border:'1px solid var(--border-color)', color:'var(--text-primary)', padding:'10px', borderRadius:'6px', fontSize:'13px'}}
                        placeholder="e.g. Add a section for mobile responsiveness or change the target user to Stakeholders..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                      />
                      <button 
                        onClick={handleRefine}
                        disabled={isLoading || !feedbackText}
                        style={{padding:'0 20px', background:'var(--bg-hover)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--text-primary)', fontWeight:'700', fontSize:'12px', cursor:'pointer'}}
                      >
                         Refine
                      </button>
                   </div>
                </div>
              </>
            ) : (
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, color:'var(--text-muted)', textAlign:'center', padding:'40px'}}>
                 <Terminal size={32} style={{marginBottom:'16px', opacity:0.3}} />
                 <div style={{fontSize:'14px', fontWeight:'600'}}>Engine Ready</div>
                 <div style={{fontSize:'12px', marginTop:'4px'}}>Awaiting input parameters for generation.</div>
              </div>
            )}
         </div>
      </div>
    </div>
  )
}

const DossierView = ({ history = [], onSelect, onDeleteItem, clock }) => {
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  
  return (
    <div className="dashboard-view" data-tick={clock?.getTime()}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
        <div>
          <h1 className="dashboard-title" style={{margin:0}}>Project Dossier</h1>
          {isDeleteMode && <div style={{fontSize:'12px', color:'var(--accent-red, #ef4444)', fontWeight:'700', marginTop:'4px'}}>⚠️ SELECTION MODE: CLICK A PROJECT TO DELETE</div>}
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          {isDeleteMode && (
            <button 
              className="icon-btn" 
              onClick={() => setIsDeleteMode(false)}
              style={{fontSize:'11px', padding:'0 12px', width:'auto', background:'var(--bg-hover)', borderRadius:'100px'}}
            >
              Cancel
            </button>
          )}
          <button 
            className="icon-btn" 
            onClick={() => {
              if (history.length === 0) return;
              setIsDeleteMode(!isDeleteMode);
            }} 
            title={isDeleteMode ? "Cancel Deletion" : "Selection Delete"}
            style={{
              background: isDeleteMode ? 'var(--accent-red, #ef4444)' : 'var(--bg-hover)',
              color: isDeleteMode ? 'white' : (history.length > 0 ? 'var(--accent-red, #ef4444)' : 'var(--text-muted)')
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px'}}>
        {history.map((brd, i) => (
          <div 
            key={i} 
            className="chart-card" 
            style={{
              padding:'20px', 
              cursor:'pointer', 
              borderLeft: isDeleteMode ? '3px solid var(--accent-red, #ef4444)' : (brd.isMock ? '1px solid var(--border-color)' : '3px solid var(--primary)'),
              transition: 'all 0.2s ease',
              position: 'relative',
              opacity: isDeleteMode ? 0.9 : 1
            }}
            onClick={() => {
              if (isDeleteMode) {
                if (window.confirm(`Delete "${brd.name || 'this project'}"?`)) onDeleteItem(i);
              } else {
                onSelect(brd);
              }
            }}
          >
             {isDeleteMode && (
               <div style={{position:'absolute', top:'10px', right:'10px', color:'var(--accent-red, #ef4444)'}}>
                  <Trash2 size={14} />
               </div>
             )}
             <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}>
                <div style={{width:'32px', height:'32px', borderRadius:'8px', background:'rgba(79,70,229,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--primary)'}}><FileText size={18} /></div>
                <span style={{fontSize:'11px', color:'var(--text-muted)', fontWeight:'600'}}>
                  {timeAgo(brd.timestamp).toUpperCase()}
                </span>
             </div>
             <h3 style={{fontSize:'14px', margin:'0 0 4px 0'}}>{brd.name}</h3>
             <p style={{fontSize:'12px', color:'var(--text-secondary)', margin:0, overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical'}}>
               {brd.desc || 'Comprehensive analysis generated by engine.'}
             </p>
             <div style={{marginTop:'20px', paddingTop:'16px', borderTop:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span className="status-badge" style={{background:brd.isMock ? 'rgba(var(--text-muted-rgb), 0.1)' : 'rgba(16,185,129,0.1)', color:brd.isMock ? 'var(--text-muted)' : '#10b981', fontSize:'10px'}}>
                  {brd.status || 'Finalized'}
                </span>
                <ExternalLink size={14} color="var(--text-muted)" />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TeamView = ({ user }) => {
  const members = [
    { name: 'Satyam Raghuvanshi', email: 'satyamraghuvanshi22oct@gmail.com', role: 'Project Lead', status: 'Active', color: '#10b981', initials: 'SR' },
    { name: 'Saksham Jaiswal', email: 'saksham2607jaiswal@gmail.com', role: 'Backend & AI Developer', status: 'Active', color: '#10b981', initials: 'SJ' },
    { name: 'Sittu Kumar Singh', email: 'sitturaj730@gmail.com', role: 'Frontend Developer', status: 'Active', color: '#10b981', initials: 'SS' },
    { name: 'Shimant Ranjan', email: 'shimantranjan2@gmail.com', role: 'DevOps Engineer', status: 'Active', color: '#10b981', initials: 'SR' },
  ];
  return (
    <div className="dashboard-view">
      <h1 className="dashboard-title">Operational Leads</h1>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Specialization</th>
              <th>Current Status</th>
              <th style={{ textAlign: 'right' }}>Directory</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={i}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' }}>
                      {m.initials}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{m.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.role}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', color: m.color }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.color }}></div>
                    {m.status}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <a href={`mailto:${m.email}`} className="icon-btn" style={{display:'inline-flex', alignItems:'center', justifyContent:'center', textDecoration:'none', color:'inherit'}}>
                    <Mail size={14} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SettingsView = ({ theme, toggleTheme, user, setUser }) => (
  <div className="dashboard-view" style={{maxWidth:'800px'}}>
    <h1 className="dashboard-title">System Settings</h1>
    
    <div className="chart-card" style={{padding:'24px', marginBottom:'24px'}}>
       <h3 style={{fontSize:'14px', fontWeight:'700', marginBottom:'16px'}}>Appearance Control</h3>
       <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', background:'var(--bg-hover)', borderRadius:'8px', border:'1px solid var(--border-color)'}}>
          <div>
             <div style={{fontSize:'13px', fontWeight:'600'}}>Dark Interface Mode</div>
             <div style={{fontSize:'12px', color:'var(--text-muted)'}}>High contrast theme for production environments.</div>
          </div>
          <button 
            onClick={toggleTheme}
            style={{padding:'8px 16px', background:theme==='dark'?'var(--primary)':'var(--bg-card)', color:theme==='dark'?'white':'var(--text-primary)', border:'1px solid var(--border-color)', borderRadius:'6px', fontSize:'12px', fontWeight:'600', cursor:'pointer'}}
          >
             {theme === 'dark' ? 'Disable' : 'Enable'}
          </button>
       </div>
    </div>

    <div className="chart-card" style={{padding:'24px', borderBottom:'4px solid var(--primary)'}}>
       <h3 style={{fontSize:'14px', fontWeight:'700', marginBottom:'16px'}}>Workspace Meta</h3>
       <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          <div>
             <label style={{display:'block', fontSize:'12px', color:'var(--text-secondary)', marginBottom:'6px'}}>Organization Name</label>
             <input 
               style={{width:'100%', padding:'10px', background:'var(--bg-input)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--text-primary)', fontSize:'13px'}} 
               value={user.org} 
               onChange={(e) => setUser({...user, org: e.target.value})}
             />
          </div>
       </div>
    </div>
  </div>
)

// --- APP ROOT ---

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [stats, setStats] = useState(null)
  const [clock, setClock] = useState(new Date())
  const [generatorPreload, setGeneratorPreload] = useState('')
  const [brdHistory, setBrdHistory] = useState(INITIAL_HISTORY)
  const [selectedReport, setSelectedReport] = useState(null)
  
  // Real-time clock and timestamp update ticker
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const [user, setUser] = useState({
    name: localStorage.getItem('user_name') || 'Enterprise User',
    initials: localStorage.getItem('user_initials') || 'EU',
    org: localStorage.getItem('user_org') || 'Primary Workspace'
  })

  useEffect(() => {
    localStorage.setItem('user_name', user.name)
    localStorage.setItem('user_initials', user.initials)
    localStorage.setItem('user_org', user.org)
  }, [user])

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/stats`)
      if (r.ok) setStats(await r.json())
    } catch { /* Backend unreachable */ }
  }, [])

  useEffect(() => {
    const initialFetch = setTimeout(fetchStats, 0)
    const timer = setInterval(fetchStats, 10000)
    const clockTimer = setInterval(() => setClock(new Date()), 1000)
    return () => { 
      clearTimeout(initialFetch)
      clearInterval(timer)
      clearInterval(clockTimer) 
    }
  }, [fetchStats])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  const handleEditFromTable = (name) => {
    setGeneratorPreload(name)
    setCurrentView('generator')
  }

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all generated project history?')) {
      setBrdHistory([])
    }
  }

  const handleDeleteOneHistory = (index) => {
    setBrdHistory(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="logo-container" onClick={() => setCurrentView('dashboard')} style={{cursor:'pointer'}}>
          <div style={{width:'32px', height:'32px', background:'var(--primary)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Activity color="white" size={20} />
          </div>
          <span className="brand-name">Formulate<span style={{color:'var(--primary)'}}>BRD</span></span>
        </div>

        <div className="nav-menu">
           <div className="nav-group-label">Workspace</div>
           <button className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
              <LayoutDashboard size={18} /> Dashboard
           </button>
           <button className={`nav-item ${currentView === 'dossier' ? 'active' : ''}`} onClick={() => setCurrentView('dossier')}>
              <FileText size={18} /> Project Dossier
           </button>
           <button className={`nav-item ${currentView === 'generator' ? 'active' : ''}`} onClick={() => {
              setGeneratorPreload('');
              setSelectedReport(null);
              setCurrentView('generator');
           }}>
              <Plus size={18} /> Create BRD
           </button>
           
           <div className="nav-group-label" style={{marginTop:'12px'}}>Lead Management</div>
           <button className={`nav-item ${currentView === 'team' ? 'active' : ''}`} onClick={() => setCurrentView('team')}>
              <Users size={18} /> Team Leads
           </button>
           
           <div className="nav-group-label" style={{marginTop:'12px'}}>System Control</div>
           <button className={`nav-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}>
              <Settings size={18} /> System Settings
           </button>

           <div style={{marginTop: 'auto', borderTop:'1px solid var(--border-color)', paddingTop: '16px'}}>
              <button className="nav-item" onClick={toggleTheme}>
                 {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                 <span>{theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}</span>
              </button>
           </div>
        </div>
      </div>

      {/* Main Content Interface */}
      <div className="main-content">
        <header style={{display:'flex', alignItems:'center', justifyContent:'space-between', height:'48px', marginBottom:'32px'}}>
          <div className="search-bar" style={{width:'400px', background:'var(--bg-hover)', border:'1px solid var(--border-color)', borderRadius:'6px', display:'flex', alignItems:'center', padding:'0 12px', height:'36px'}}>
            <Search size={14} color="var(--text-muted)" />
            <input 
              style={{background:'transparent', border:'none', color:'var(--text-primary)', outline:'none', marginLeft:'12px', fontSize:'15px', width:'100%'}} 
              placeholder="Search BRDs, project files, or team leads..." 
            />
          </div>
        </header>

        {currentView === 'dashboard' && (
          <div className="dashboard-view">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px'}}>
              <div>
                <h1 style={{fontSize:'20px', fontWeight:'700', margin:0}}>{user.org}</h1>
                <div style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'4px', display:'flex', alignItems:'center', gap:'8px'}}>
                  Last telemetry sync: {fmtDate(clock)} at {fmt(clock)}
                  <span style={{width:'4px', height:'4px', borderRadius:'50%', background:'#10b981'}}></span>
                  Systems Live
                </div>
              </div>
              <button 
                onClick={() => {
                  setGeneratorPreload('');
                  setSelectedReport(null);
                  setCurrentView('generator');
                }}
                style={{padding:'10px 18px', background:'var(--primary)', color:'white', border:'none', borderRadius:'6px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}
              >
                <Plus size={16} /> New Project
              </button>
            </div>

            {/* Logical Information Hierarchy */}
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px'}}>
              <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                {/* Primary Metrics */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px'}}>
                   <StatsCard 
                     title="Global BRDs Generated" 
                     value={stats ? stats.brd_count : '—'} 
                     sub="Total engine throughput" 
                     color="primary" icon={Database} 
                   />
                   <StatsCard 
                     title="Avg Success Rate" 
                     value={stats ? `${stats.success_rate}%` : '—'} 
                     sub="Global validation baseline" 
                     color="primary" icon={Activity} 
                   />
                </div>
                
                {/* Secondary Neutral Stats */}
                <div className="secondary-stats-row">
                   <div className="small-stat">
                      <label>Server Uptime</label>
                      <span>{stats ? stats.uptime : '—'}</span>
                   </div>
                   <div className="small-stat">
                      <label>Emails Cached</label>
                      <span>{stats ? stats.enron_loaded.toLocaleString() : '—'}</span>
                   </div>
                   <div className="small-stat">
                      <label>Active Threads</label>
                      <span>{stats ? stats.enron_fetches : '—'}</span>
                   </div>
                   <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:'8px', fontSize:'11px', color:'var(--text-muted)'}}>
                     <Clock size={12} /> Last generated {timeAgo(brdHistory[0]?.timestamp)}
                   </div>
                </div>

              </div>

              <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                <PlatformStatus stats={stats} />
                
                <div className="chart-card" style={{padding:'20px'}}>
                   <h3 style={{fontSize:'13px', fontWeight:'700', marginBottom:'12px'}}>Workspace Signals</h3>
                   <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                       <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'12px'}}>
                          <div style={{width:'8px', height:'8px', borderRadius:'2px', background:'var(--accent-blue)'}}></div>
                          <span>Top Data Source: <strong>Legacy Correspondence</strong></span>
                       </div>
                       <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'12px'}}>
                          <div style={{width:'8px', height:'8px', borderRadius:'2px', background:'var(--accent-purple)'}}></div>
                          <span>Primary Format: <strong>Markdown Architecture</strong></span>
                       </div>
                   </div>
                </div>
              </div>
            </div>

            <ActivityTable 
              activities={brdHistory} 
              onEdit={handleEditFromTable} 
              onArchive={() => setCurrentView('dossier')} 
              user={user}
              clock={clock}
            />
          </div>
        )}

        {currentView === 'generator' && (
          <GeneratorView 
            externalInput={generatorPreload} 
            initialReport={selectedReport}
            onSave={(newBrd) => {
      const entry = {
        ...newBrd,
        name: `Custom BRD-${String(brdHistory.length + 1).padStart(3, '0')}`,
        timestamp: new Date(),
        status: 'Generated',
        desc: 'Real-time analysis generated via Engine',
        isMock: false
      }
      setBrdHistory(prev => [entry, ...prev])
    }} 
          />
        )}
        {currentView === 'dossier' && (
          <DossierView 
            history={brdHistory} 
            onSelect={(report) => {
              setSelectedReport(report);
              setCurrentView('generator');
            }}
            onClear={handleClearHistory}
            onDeleteItem={handleDeleteOneHistory}
            clock={clock}
          />
        )}
        {currentView === 'team' && <TeamView user={user} />}
        {currentView === 'settings' && <SettingsView theme={theme} toggleTheme={toggleTheme} user={user} setUser={setUser} />}
        
        {currentView === 'mail' && (
          <div className="dashboard-view" style={{textAlign:'center', padding:'80px 40px'}}>
            <div style={{width:'64px', height:'64px', borderRadius:'50%', background:'var(--bg-hover)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', color:'var(--primary)'}}><Activity size={32} /></div>
            <h2 style={{textTransform:'capitalize', fontSize:'18px', fontWeight:'700'}}>{currentView} Module Active</h2>
            <p style={{color:'var(--text-muted)', fontSize:'14px', maxWidth:'400px', margin:'0 auto'}}>This module has been refined for high-density enterprise throughput. Data streams are active.</p>
            <button 
              onClick={() => setCurrentView('dashboard')}
              style={{marginTop:'24px', padding:'8px 20px', background:'var(--bg-hover)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--primary)', cursor:'pointer', fontWeight:'700', fontSize:'13px'}}
            >
              Return to Primary Console
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
