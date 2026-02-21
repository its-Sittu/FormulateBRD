import { useState, useEffect, useCallback } from 'react'
import logoImg from './assets/logo.png'
import ReactMarkdown from 'react-markdown'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  BarChart2, 
  FileInput, 
  Search, 
  Bell, 
  Mail, 
  Plus,
  CheckCircle,
  Clock,
  Briefcase,
  ChevronDown,
  MessageSquareText,
  Sun,
  Moon
} from 'lucide-react'
import './index.css'

// --- MOCK COMPONENTS FOR DASHBOARD ---

const StatsCard = ({ title, value, sub, color, icon: Icon, trend, change }) => (
  <div className={`stat-card ${color}`}>
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'18px'}}>
      <div className="stat-icon" style={{position:'static', background:'var(--glass-bg)', width:'40px', height:'40px', borderRadius:'12px', border:'1px solid var(--border-color)'}}>
        {Icon && <Icon size={18} />}
      </div>
      {change && (
        <div style={{fontSize:'12px', fontWeight:'600', padding:'4px 8px', borderRadius:'20px',
          background: trend==='up' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
          color: trend==='up' ? '#10b981' : '#ef4444'
        }}>
          {trend==='up' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
    <div className="stat-value" style={{fontSize:'34px', marginBottom:'4px'}}>{value}</div>
    <div className="stat-header" style={{opacity:1, fontWeight:'600', fontSize:'13px'}}>{title}</div>
    <div className="stat-sub" style={{marginTop:'4px'}}>{sub}</div>
  </div>
)

const BarChart = () => {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
  const requests = [18, 25, 22, 30, 27, 35]
  const completed = [15, 20, 19, 26, 24, 32]
  const maxVal = 40
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 style={{margin:0, fontSize:'15px', fontWeight:'600'}}>BRD Generation Overview</h3>
        <div className="chart-legend">
          <div className="legend-item"><div className="dot" style={{background:'#8b5cf6'}}></div>Requests</div>
          <div className="legend-item"><div className="dot" style={{background:'#3b82f6'}}></div>Completed</div>
        </div>
      </div>
      <svg viewBox="0 0 540 190" width="100%" height="190">
        {[0,10,20,30,40].map((v,i) => {
          const y = 165 - (v/maxVal)*140
          return <g key={i}>
            <line x1="30" y1={y} x2="540" y2={y} stroke="var(--border-color)" strokeWidth="1"/>
            <text x="24" y={y+4} fill="var(--text-secondary)" fontSize="9" textAnchor="end" style={{opacity:0.5}}>{v}</text>
          </g>
        })}
        {months.map((month, i) => {
          const x = 50 + i * 82
          const rH = (requests[i]/maxVal)*140
          const cH = (completed[i]/maxVal)*140
          return <g key={i}>
            <rect x={x} y={165-rH} width="26" height={rH} rx="5"
              fill="url(#barGrad1)" opacity="0.9"/>
            <rect x={x+30} y={165-cH} width="26" height={cH} rx="5"
              fill="url(#barGrad2)" opacity="0.9"/>
            <text x={x+26} y="183" fill="var(--text-secondary)" fontSize="10" textAnchor="middle" style={{opacity:0.7}}>{month}</text>
          </g>
        })}
        <defs>
          <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#6d28d9"/>
          </linearGradient>
          <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#1d4ed8"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

const PlatformStatus = () => (
  <div className="chart-card" style={{display:'flex', flexDirection:'column', gap:'0'}}>
    <h3 style={{margin:'0 0 20px 0', fontSize:'15px', fontWeight:'600'}}>AI Pipeline Status</h3>
    <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px',
      background:'rgba(16,185,129,0.06)', borderRadius:'12px',
      border:'1px solid rgba(16,185,129,0.18)', marginBottom:'20px'}}>
      <div style={{width:'9px', height:'9px', borderRadius:'50%', background:'#10b981',
        boxShadow:'0 0 8px #10b981', flexShrink:0}}></div>
      <div style={{flex:1}}>
        <div style={{fontSize:'13px', fontWeight:'600'}}>gemini-flash-latest</div>
        <div style={{fontSize:'11px', color:'var(--text-muted)'}}>Google AI Studio — Active</div>
      </div>
      <div style={{fontSize:'11px', fontWeight:'700', color:'#10b981', letterSpacing:'0.5px'}}>LIVE</div>
    </div>
    <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px'}}>
      {[
        {label:'Avg. Response Time', value:'~18s', color:'var(--text-primary)'},
        {label:'Success Rate', value:'98%', color:'#10b981'},
        {label:'Pipeline Stages', value:'3', color:'var(--text-primary)'},
        {label:'Total Runs Today', value:'12', color:'var(--accent-blue)'},
      ].map((m,i) => (
        <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize:'13px'}}>
          <span style={{color:'var(--text-secondary)'}}>{m.label}</span>
          <span style={{fontWeight:'600', color:m.color}}>{m.value}</span>
        </div>
      ))}
    </div>
    <div style={{fontSize:'11px', color:'var(--text-secondary)', letterSpacing:'0.5px', marginBottom:'8px'}}>PIPELINE</div>
    <div style={{display:'flex', gap:'4px', alignItems:'center'}}>
      {['Analysis','BRD Gen','Validation'].map((stage, i) => (
        <>
          <div key={stage} style={{flex:1, padding:'7px 4px', background:'rgba(16,185,129,0.08)',
            borderRadius:'8px', textAlign:'center', fontSize:'10px', fontWeight:'600',
            color:'#10b981', border:'1px solid rgba(16,185,129,0.2)'}}>{stage}</div>
          {i < 2 && <div style={{color:'var(--border-color)', fontSize:'14px'}}>→</div>}
        </>
      ))}
    </div>
  </div>
)

const ActivityTable = () => {
  const activities = [
    { id:'BRD-001', name:'Project Phoenix', date:'Feb 21', time:'10:30 AM', status:'Completed', owner:'Sarah C.', initials:'SC', color:'#10b981', bg:'rgba(16,185,129,0.12)' },
    { id:'BRD-002', name:'Skynet Integration', date:'Feb 20', time:'11:00 AM', status:'In Review', owner:'Miles D.', initials:'MD', color:'#f59e0b', bg:'rgba(245,158,11,0.12)' },
    { id:'BRD-003', name:'T-800 Specs', date:'Feb 19', time:'09:15 AM', status:'Drafting', owner:'John D.', initials:'JD', color:'#3b82f6', bg:'rgba(59,130,246,0.12)' },
    { id:'BRD-004', name:'CRM Revamp 2025', date:'Feb 18', time:'02:45 PM', status:'Completed', owner:'Satyam R.', initials:'SR', color:'#10b981', bg:'rgba(16,185,129,0.12)' },
    { id:'BRD-005', name:'Customer Portal', date:'Feb 17', time:'04:00 PM', status:'In Review', owner:'Saksham J.', initials:'SJ', color:'#f59e0b', bg:'rgba(245,158,11,0.12)' },
    { id:'BRD-006', name:'Inventory API', date:'Feb 15', time:'12:20 PM', status:'Approved', owner:'Shimant R.', initials:'SR2', color:'#8b5cf6', bg:'rgba(139,92,246,0.12)' },
  ]
  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <h3 style={{margin:0, fontSize:'15px', fontWeight:'600'}}>Recent BRD Activity</h3>
          <div style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'4px'}}>Showing last 6 entries</div>
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <button style={{padding:'7px 14px', fontSize:'12px', background:'var(--bg-hover)',
            border:'1px solid var(--border-color)', borderRadius:'8px', color:'var(--text-secondary)', cursor:'pointer'}}>Filter</button>
          <button style={{padding:'7px 14px', fontSize:'12px', background:'var(--accent-blue)',
            border:'none', borderRadius:'8px', color:'white', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontWeight:'600'}}>
            <Plus size={13}/> New BRD
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Project Name</th>
            <th>Date &amp; Time</th>
            <th>Status</th>
            <th>Owner</th>
            <th style={{textAlign:'right'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {activities.map(a => (
            <tr key={a.id}>
              <td style={{fontFamily:'monospace', color:'var(--text-muted)', fontSize:'12px', letterSpacing:'0.5px'}}>{a.id}</td>
              <td style={{fontWeight:'600', fontSize:'14px'}}>{a.name}</td>
              <td style={{color:'var(--text-muted)', fontSize:'13px'}}>{a.date} <span style={{opacity:0.5}}>{a.time}</span></td>
              <td>
                <span className="status-badge" style={{color:a.color, background:a.bg, fontWeight:'600'}}>{a.status}</span>
              </td>
              <td>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <div style={{width:'26px', height:'26px', borderRadius:'50%', background:a.bg,
                    color:a.color, display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'9px', fontWeight:'700', flexShrink:0}}>{a.initials}</div>
                  <span style={{fontSize:'13px'}}>{a.owner}</span>
                </div>
              </td>
              <td>
                <div style={{display:'flex', gap:'6px', justifyContent:'flex-end'}}>
                  <button style={{padding:'4px 10px', fontSize:'12px', background:'var(--bg-hover)',
                    border:'1px solid var(--border-color)', borderRadius:'6px',
                    color:'var(--text-secondary)', cursor:'pointer'}}>View</button>
                  <button style={{padding:'4px 10px', fontSize:'12px', background:'var(--bg-hover)',
                    border:'1px solid var(--border-color)', borderRadius:'6px',
                    color:'var(--text-secondary)', cursor:'pointer'}}>Export</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


// --- GENERATOR COMPONENT (Existing Logic) ---


const GeneratorView = () => {
  const [inputText, setInputText] = useState('')
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('brd')
  const [inputSource, setInputSource] = useState('raw')

  const handleGenerate = async () => {
    if (!inputText) return;
    setIsLoading(true);
    setReport(null);
    setActiveTab('analysis');
    try {
      const formData = new FormData();
      formData.append('context', inputText);
      const genRes = await fetch('http://localhost:8000/generate', { method: 'POST', body: formData });
      if (!genRes.ok) throw new Error('Generation failed');
      const data = await genRes.json();
      setReport(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error generating report. Ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  }

  const loadEnron = async () => {
      setInputSource('enron');
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8000/enron/random');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setInputText(`Subject: ${data.subject}\nFrom: ${data.from}\nTo: ${data.to}\nDate: ${data.date}\n\n${data.body}`);
      } catch { alert("Failed to load Enron email"); } finally { setIsLoading(false); }
  }

  return (
    <div className="generator-view">
       <div className="gen-panel-left">
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block', marginBottom:'8px', fontSize:'12px', color:'var(--text-secondary)'}}>Input Source</label>
            <div style={{display:'flex', gap:'8px'}}>
               <button onClick={() => setInputSource('raw')} style={{flex:1, padding:'8px', background:inputSource==='raw'?'var(--accent-blue)':'var(--bg-hover)', border:'none', borderRadius:'8px', color:inputSource==='raw'?'white':'var(--text-primary)', cursor:'pointer'}}>Raw</button>
               <button onClick={loadEnron} style={{flex:1, padding:'8px', background:inputSource==='enron'?'var(--accent-blue)':'var(--bg-hover)', border:'none', borderRadius:'8px', color:inputSource==='enron'?'white':'var(--text-primary)', cursor:'pointer'}}>Enron</button>
            </div>
          </div>
          <textarea 
            style={{flex:1, background:'var(--bg-app)', border:'1px solid var(--border-color)', color:'var(--text-primary)', padding:'16px', borderRadius:'12px', resize:'none', fontFamily:'inherit'}}
            placeholder="Paste requirements here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            onClick={handleGenerate} 
            disabled={isLoading || !inputText}
            style={{marginTop:'20px', padding:'14px', background:'var(--primary)', border:'none', borderRadius:'12px', color:'white', fontWeight:'600', cursor:'pointer'}}
          >
            {isLoading ? 'Processing...' : 'Generate BRD'}
          </button>
       </div>

       <div className="gen-panel-right">
          {report ? (
             <>
               <div className="tabs" style={{borderBottom:'1px solid var(--border-color)', paddingBottom:'10px', marginBottom:'20px'}}>
                  {['analysis', 'brd', 'gaps'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        background:'transparent', border:'none', color: activeTab===tab?'var(--text-primary)':'var(--text-secondary)', 
                        padding:'8px 16px', cursor:'pointer', borderBottom: activeTab===tab?'2px solid var(--accent-blue)':'2px solid transparent'
                      }}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
               </div>
               <div className="markdown-body" style={{flex:1, overflowY:'auto', fontSize:'14px', lineHeight:'1.6'}}>
                  {activeTab === 'analysis' && <ReactMarkdown>{report.analysis}</ReactMarkdown>}
                  {activeTab === 'brd' && <ReactMarkdown>{report.brd}</ReactMarkdown>}
                  {activeTab === 'gaps' && <ReactMarkdown>{report.clarification_questions}</ReactMarkdown>}
               </div>
             </>
          ) : (
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', flex:1, color:'var(--text-muted)'}}>
               Select source and generate to view report
            </div>
          )}
       </div>
    </div>
  )
}

const DossierView = () => (
  <div className="dashboard-view">
    <div className="dashboard-title">Dossier / Projects</div>
    <div className="table-card">
       <div style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>
          <FileText size={48} style={{marginBottom:'16px', opacity:0.5}} />
          <h3>Project Files</h3>
          <p>Manage all your generated BRDs and source documents here.</p>
       </div>
    </div>
  </div>
)

const teamMembers = [
  { name: 'Satyam Raghuvanshi', role: 'Backend & AI Integration Lead', email: 'satyamraghuvanshi220ct@gmail.com', status: 'Online' },
  { name: 'Saksham Jaiswal', role: 'Mobile Experience & Product Delivery Lead', email: 'saksham2607jaiswal@gmail.com', status: 'Online' },
  { name: 'Sittu Kumar Singh', role: 'Web Experience & Demo Lead', email: 'sitturaj730@gmail.com', status: 'Online' },
  { name: 'Shimant Ranjan', role: 'AI Logic & Requirement Intelligence Lead', email: 'shimantranjan2@gmail.com', status: 'Online' },
]

const TeamView = () => (
  <div className="dashboard-view">
    <div className="dashboard-title">Team Members</div>
    <div className="stats-grid">
       <StatsCard title="Total Leads" value={teamMembers.length} sub="Core Team" color="blue" icon={Users} />
       <StatsCard title="Active" value={teamMembers.length} sub="Online" color="purple" icon={CheckCircle} />
    </div>
    <div className="table-card">
       <div className="table-header"><h3>Core Team Directory</h3></div>
       <table>
         <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th></tr></thead>
         <tbody>
           {teamMembers.map((member, index) => (
             <tr key={index}>
               <td style={{fontWeight:'500'}}>{member.name}</td>
               <td style={{color:'var(--text-muted)', fontSize:'13px'}}>{member.role}</td>
               <td style={{color:'var(--accent-blue)', fontSize:'13px'}}>{member.email}</td>
               <td>
                 <span 
                   className="status-badge" 
                   style={{
                     background: 'rgba(16, 185, 129, 0.1)', 
                     color: '#10b981'
                   }}
                 >
                   {member.status}
                 </span>
               </td>
             </tr>
           ))}
         </tbody>
       </table>
    </div>
  </div>
)

const SettingsView = ({ theme, setTheme }) => (
  <div className="dashboard-view">
    <div className="dashboard-title">Settings</div>
    <div className="gen-panel-left" style={{maxWidth:'600px'}}>
       <h3>General Configuration</h3>
       <div style={{marginTop:'20px'}}>
          <label style={{display:'block', marginBottom:'8px', color:'var(--text-secondary)'}}>Workspace Name</label>
          <input type="text" defaultValue="Genius Corp" style={{width:'100%', padding:'12px', background:'var(--bg-input)', border:'1px solid var(--border-color)', color:'var(--text-primary)', borderRadius:'8px'}} />
       </div>
       <div style={{marginTop:'20px'}}>
          <label style={{display:'block', marginBottom:'8px', color:'var(--text-secondary)'}}>Theme</label>
          <div style={{display:'flex', gap:'10px'}}>
             <button onClick={() => setTheme('dark')} style={{padding:'10px 20px', background:theme==='dark'?'var(--accent-blue)':'var(--bg-hover)', borderRadius:'8px', border:'none', color:theme==='dark'?'white':'var(--text-primary)', cursor:'pointer'}}>Dark Mode</button>
             <button onClick={() => setTheme('light')} style={{padding:'10px 20px', background:theme==='light'?'var(--accent-blue)':'var(--bg-hover)', borderRadius:'8px', border:'none', color:theme==='light'?'white':'var(--text-primary)', cursor:'pointer'}}>Light Mode</button>
          </div>
       </div>
    </div>
  </div>
)

const MailView = () => (
  <div className="dashboard-view">
    <div className="dashboard-title">Messages</div>
    <div className="table-card">
       <div className="table-header"><h3>Inbox (2 Active)</h3></div>
       <table>
         <thead><tr><th>From</th><th>Subject</th><th>Time</th><th>Action</th></tr></thead>
         <tbody>
           <tr><td>System</td><td>Report #12345 Generated</td><td>10:30 AM</td><td><button style={{color:'var(--accent-blue)', background:'transparent', border:'none', cursor:'pointer'}}>View</button></td></tr>
           <tr><td>Sarah Connor</td><td>Re: Phoenix Project Requirements</td><td>Yesterday</td><td><button style={{color:'var(--accent-blue)', background:'transparent', border:'none', cursor:'pointer'}}>Reply</button></td></tr>
         </tbody>
       </table>
    </div>
  </div>
)

const NotificationsView = () => (
   <div className="dashboard-view">
    <div className="dashboard-title">Notifications</div>
    <div className="stats-grid">
       <div className="stat-card dark-blue">
          <div className="stat-header">System Alerts</div>
          <div className="stat-value">0</div>
          <div className="stat-sub">All systems operational</div>
          <div className="stat-icon"><CheckCircle size={16} /></div>
       </div>
    </div>
    <div style={{background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:'16px', padding:'20px', boxShadow:'var(--shadow-sm)'}}>
       <div style={{display:'flex', gap:'16px', borderBottom:'1px solid var(--border-color)', paddingBottom:'16px', marginBottom:'16px', transition:'var(--transition)'}}>
          <div style={{width:'40px', height:'40px', background:'rgba(16, 185, 129, 0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981'}}><CheckCircle size={20} /></div>
          <div>
             <div style={{fontWeight:'600', color:'var(--text-primary)'}}>Generation Complete</div>
             <div style={{fontSize:'14px', color:'var(--text-secondary)', marginTop:'4px'}}>Project Phoenix BRD is ready for review.</div>
             <div style={{fontSize:'12px', color:'var(--text-secondary)', marginTop:'4px', opacity:0.6}}>2 mins ago</div>
          </div>
       </div>
       <div style={{display:'flex', gap:'16px'}}>
          <div style={{width:'40px', height:'40px', background:'rgba(59, 130, 246, 0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#3b82f6'}}><Bell size={20} /></div>
          <div>
             <div style={{fontWeight:'600', color:'var(--text-primary)'}}>New Comment</div>
             <div style={{fontSize:'14px', color:'var(--text-secondary)', marginTop:'4px'}}>Miles Dyson commented on "T-800 Specs"</div>
             <div style={{fontSize:'12px', color:'var(--text-secondary)', marginTop:'4px', opacity:0.6}}>1 hour ago</div>
          </div>
       </div>
    </div>
  </div>
)

const ProfileView = () => (
  <div className="dashboard-view">
    <div className="dashboard-title">User Profile</div>
    <div style={{display:'flex', gap:'32px', alignItems:'flex-start'}}>
       <div style={{background:'var(--bg-card)', borderRadius:'20px', padding:'32px', textAlign:'center', minWidth:'250px'}}>
           <div style={{width:'100px', height:'100px', borderRadius:'50%', background:'var(--accent-purple)', margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', fontWeight:'700', color:'white'}}>SR</div>
           <h2 style={{margin:'0 0 8px 0', color:'var(--text-primary)'}}>Satyam Raghuvanshi</h2>
           <div style={{color:'var(--text-secondary)', marginBottom:'24px'}}>Backend & AI Lead</div>
           <button style={{width:'100%', padding:'10px', background:'var(--bg-hover)', border:'1px solid var(--border-color)', borderRadius:'8px', color:'var(--text-primary)', cursor:'pointer'}}>Edit Profile</button>
       </div>
       <div style={{flex:1, background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:'20px', padding:'32px', boxShadow:'var(--shadow-sm)'}}>
           <h3 style={{color:'var(--text-primary)'}}>Account Details</h3>
           <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'20px'}}>
              <div>
                 <label style={{display:'block', fontSize:'12px', color:'var(--text-secondary)', marginBottom:'8px'}}>Full Name</label>
                 <div style={{padding:'12px', background:'var(--bg-app)', border:'1px solid var(--border-color)', borderRadius:'8px', color:'var(--text-primary)'}}>Satyam Raghuvanshi</div>
              </div>
              <div>
                 <label style={{display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px'}}>Email</label>
                 <div style={{padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'8px'}}>satyamraghuvanshi220ct@gmail.com</div>
              </div>
              <div>
                 <label style={{display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px'}}>Role</label>
                 <div style={{padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'8px'}}>Backend & AI Integration Lead</div>
              </div>
              <div>
                 <label style={{display:'block', fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px'}}>Department</label>
                 <div style={{padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'8px'}}>Engineering</div>
              </div>
           </div>
       </div>
    </div>
  </div>
)

// --- MAIN APP Layout ---

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [stats, setStats] = useState(null)
  const [clock, setClock] = useState(new Date())

  // Apply theme to document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }


  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch('http://localhost:8000/stats')
      if (r.ok) setStats(await r.json())
    } catch { 
      /* backend not reachable */ 
    }
  }, [])

  useEffect(() => {
    // Initial fetch in a timeout to avoid sync setState warning in lint
    const initialTimer = setTimeout(() => {
      fetchStats()
    }, 0)
    
    const statTimer = setInterval(fetchStats, 30000)
    const clockTimer = setInterval(() => setClock(new Date()), 1000)
    
    return () => { 
      clearTimeout(initialTimer)
      clearInterval(statTimer) 
      clearInterval(clockTimer) 
    }
  }, [fetchStats])

  const fmt = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const fmtDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          {/* Brand Icon — Custom Logo */}
          {/* Logo container with white background to contrast dark sidebar */}
          <div style={{
            width:'52px', height:'52px', borderRadius:'50%',
            background:'white', flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            overflow:'hidden',
            boxShadow:'0 2px 12px rgba(0,0,0,0.4)'
          }}>
            <img src={logoImg} alt="FormulateBRD Logo" style={{
              width:'100%', height:'100%',
              objectFit:'cover'
            }} />
          </div>
          {/* Brand Name */}
          <div>
            <div style={{fontWeight:'800', fontSize:'17px', letterSpacing:'-0.5px', lineHeight:'1.1'}}>
              Formulate
              <span style={{
                background:'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
              }}>BRD</span>
            </div>
            <div style={{fontSize:'10px', color:'var(--text-muted)', letterSpacing:'0.4px', marginTop:'2px'}}>
              AI-Powered Requirements
            </div>
          </div>
        </div>
        
        <div className="nav-menu">
           <button className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
              <LayoutDashboard size={20} /> Dashboard
           </button>
           <button className={`nav-item ${currentView === 'dossier' ? 'active' : ''}`} onClick={() => setCurrentView('dossier')}>
              <FileText size={20} /> Dossier
           </button>
           <button className={`nav-item ${currentView === 'generator' ? 'active' : ''}`} onClick={() => setCurrentView('generator')}>
              <FileInput size={20} /> New Report
           </button>
           <button className={`nav-item ${currentView === 'team' ? 'active' : ''}`} onClick={() => setCurrentView('team')}>
              <Users size={20} /> Team
           </button>
           <button className={`nav-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}>
              <Settings size={20} /> Settings
           </button>

           <div style={{marginTop: 'auto', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <button 
                className="nav-item theme-toggle" 
                onClick={toggleTheme}
                style={{background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)'}}
              >
                {theme === 'dark' ? <Sun size={20} color="var(--accent-orange)" /> : <Moon size={20} color="var(--accent-blue)" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
           </div>
        </div>

        <div 
          onClick={() => setCurrentView('profile')}
          style={{marginTop:'auto', padding:'12px', background:'var(--bg-hover)', border:'1px solid var(--border-color)', borderRadius:'12px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}
        >
          <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'var(--accent-purple)'}}></div>
           <div style={{fontSize:'12px', color:'var(--text-primary)'}}>
              <div style={{fontWeight:'700'}}>Satyam R.</div>
              <div style={{opacity:0.6, color:'var(--text-secondary)'}}>Backend & AI</div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header>
           <div className="search-bar">
             <Search size={18} color="rgba(255,255,255,0.4)" />
             <input className="search-input" placeholder="Search..." />
           </div>
           
           <div className="header-icons">
              <button className={`icon-btn ${currentView === 'mail' ? 'active' : ''}`} onClick={() => setCurrentView('mail')} style={currentView === 'mail' ? {borderColor:'var(--accent-blue)', color:'var(--accent-blue)'} : {}}><Mail size={20} /></button>
              <button className={`icon-btn ${currentView === 'notifications' ? 'active' : ''}`} onClick={() => setCurrentView('notifications')} style={currentView === 'notifications' ? {borderColor:'var(--accent-blue)', color:'var(--accent-blue)'} : {}}><Bell size={20} /></button>
              <div 
                className="user-profile" 
                onClick={() => setCurrentView('profile')}
                style={{cursor:'pointer', color:currentView === 'profile' ? 'var(--accent-blue)' : 'inherit'}}
              >
                 Satyam <ChevronDown size={16} />
              </div>
           </div>
        </header>

        {currentView === 'dashboard' && (
          <div className="dashboard-view">
            {/* Welcome Header */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px'}}>
              <div>
                <div style={{fontSize:'22px', fontWeight:'700', letterSpacing:'-0.3px'}}>Welcome back, Satyam 👋</div>
                <div style={{display:'flex', alignItems:'center', gap:'16px', marginTop:'6px'}}>
                  <span style={{fontSize:'13px', color:'var(--text-muted)'}}>{fmtDate(clock)}</span>
                  <span style={{fontSize:'13px', fontFamily:'monospace', color:'var(--accent-blue)', fontWeight:'600',
                    background:'rgba(59,130,246,0.08)', padding:'2px 10px', borderRadius:'20px'}}>
                    🕐 {fmt(clock)}
                  </span>
                  {stats && (
                    <span style={{fontSize:'12px', color: stats.ai_mode === 'Gemini AI' ? '#10b981' : '#f59e0b',
                      background: stats.ai_mode === 'Gemini AI' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                      padding:'2px 10px', borderRadius:'20px', fontWeight:'600'}}>
                      ● {stats.ai_mode}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setCurrentView('generator')} style={{
                padding:'11px 22px', background:'var(--primary)', border:'none',
                borderRadius:'12px', color:'white', fontWeight:'700', fontSize:'14px',
                cursor:'pointer', display:'flex', alignItems:'center', gap:'8px',
                boxShadow:'0 4px 14px rgba(79,70,229,0.4)'
              }}>
                <Plus size={16}/> New BRD
              </button>
            </div>

            {/* Stats Grid — real data */}
            <div className="stats-grid">
              <StatsCard
                title="BRDs Generated"
                value={stats ? stats.brd_count : '—'}
                sub={stats ? `${stats.success_count} successful` : 'Loading...'}
                color="purple" icon={CheckCircle}
                trend={stats && stats.brd_count > 0 ? 'up' : null}
                change={stats && stats.brd_count > 0 ? `${stats.success_count}✓` : null}
              />
              <StatsCard
                title="Server Uptime"
                value={stats ? stats.uptime : '—'}
                sub="Since last restart"
                color="blue" icon={Clock}
                trend="up" change="Live"
              />
              <StatsCard
                title="Enron Emails"
                value={stats ? stats.enron_loaded.toLocaleString() : '—'}
                sub={stats ? `${stats.enron_fetches} fetched this session` : 'Loading...'}
                color="dark-blue" icon={Mail}
                trend={stats && stats.enron_fetches > 0 ? 'up' : null}
                change={stats && stats.enron_fetches > 0 ? `+${stats.enron_fetches}` : null}
              />
              <StatsCard
                title="Success Rate"
                value={stats ? (stats.brd_count > 0 ? `${stats.success_rate}%` : 'N/A') : '—'}
                sub={stats ? `${stats.error_count} errors` : 'Loading...'}
                color="orange" icon={BarChart2}
                trend={stats && stats.success_rate >= 80 ? 'up' : 'down'}
                change={stats && stats.brd_count > 0 ? `${stats.success_rate}%` : null}
              />
            </div>

            {/* Quick Actions */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'32px'}}>
              {[
                { icon: Plus, label:'New BRD', sub:'Start from scratch', color:'var(--accent-blue)', bg:'rgba(59,130,246,0.1)', view:'generator' },
                { icon: Mail, label:'Import Email', sub:'Load Enron dataset', color:'#10b981', bg:'rgba(16,185,129,0.1)', view:'generator' },
                { icon: FileText, label:'Browse Dossier', sub:'View saved BRDs', color:'var(--accent-purple)', bg:'rgba(139,92,246,0.1)', view:'dossier' },
                { icon: Users, label:'View Team', sub:'Manage members', color:'#f97316', bg:'rgba(249,115,22,0.1)', view:'team' },
              ].map((action, i) => (
                <button key={i} onClick={() => setCurrentView(action.view)} style={{
                  padding:'16px', background:'var(--bg-card)', border:'1px solid var(--border-color)',
                  borderRadius:'16px', display:'flex', alignItems:'center', gap:'14px',
                  cursor:'pointer', color:'var(--text-primary)', textAlign:'left', width:'100%',
                  transition:'border-color 0.2s', boxShadow:'var(--shadow-sm)'
                }}>
                  <div style={{width:'42px', height:'42px', borderRadius:'12px', background:action.bg,
                    display:'flex', alignItems:'center', justifyContent:'center', color:action.color, flexShrink:0}}>
                    <action.icon size={18}/>
                  </div>
                  <div>
                    <div style={{fontWeight:'700', fontSize:'14px'}}>{action.label}</div>
                    <div style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'2px'}}>{action.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Charts Row */}
            <div className="charts-split">
              <BarChart />
              {/* Live AI Status Panel */}
              <div className="chart-card" style={{display:'flex', flexDirection:'column'}}>
                <h3 style={{margin:'0 0 20px 0', fontSize:'15px', fontWeight:'600'}}>AI Pipeline Status</h3>
                <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px',
                  background: stats?.ai_mode === 'Gemini AI' ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
                  borderRadius:'12px',
                  border: stats?.ai_mode === 'Gemini AI' ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(245,158,11,0.18)',
                  marginBottom:'20px'}}>
                  <div style={{width:'9px', height:'9px', borderRadius:'50%',
                    background: stats?.ai_mode === 'Gemini AI' ? '#10b981' : '#f59e0b',
                    boxShadow: stats?.ai_mode === 'Gemini AI' ? '0 0 8px #10b981' : '0 0 8px #f59e0b',
                    flexShrink:0}}></div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px', fontWeight:'600'}}>{stats ? stats.model : 'Loading...'}</div>
                    <div style={{fontSize:'11px', color:'var(--text-muted)'}}>{stats?.ai_mode === 'Gemini AI' ? 'Google AI Studio — Active' : 'Mock Mode — No API Key'}</div>
                  </div>
                  <div style={{fontSize:'11px', fontWeight:'700',
                    color: stats?.ai_mode === 'Gemini AI' ? '#10b981' : '#f59e0b',
                    letterSpacing:'0.5px'}}>{stats?.ai_mode === 'Gemini AI' ? 'LIVE' : 'MOCK'}</div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px'}}>
                  {[
                    {label:'BRDs Generated', value: stats ? stats.brd_count : '—'},
                    {label:'Success Rate', value: stats && stats.brd_count > 0 ? `${stats.success_rate}%` : 'N/A', color:'#10b981'},
                    {label:'Errors This Session', value: stats ? stats.error_count : '—', color: stats?.error_count > 0 ? '#ef4444' : 'var(--text-primary)'},
                    {label:'Server Uptime', value: stats ? stats.uptime : '—', color:'var(--accent-blue)'},
                  ].map((m,i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize:'13px'}}>
                      <span style={{color:'var(--text-secondary)'}}>{m.label}</span>
                      <span style={{fontWeight:'700', color:m.color||'var(--text-primary)'}}>{m.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:'11px', color:'var(--text-muted)', letterSpacing:'0.5px', marginBottom:'8px'}}>PIPELINE</div>
                <div style={{display:'flex', gap:'4px', alignItems:'center'}}>
                  {['Analysis','BRD Gen','Validation'].map((stage, i) => (
                    <>
                      <div key={stage} style={{flex:1, padding:'7px 4px', background:'rgba(16,185,129,0.08)',
                        borderRadius:'8px', textAlign:'center', fontSize:'10px', fontWeight:'600',
                        color:'#10b981', border:'1px solid rgba(16,185,129,0.2)'}}>{stage}</div>
                      {i < 2 && <div style={{color:'rgba(255,255,255,0.2)', fontSize:'14px'}}>→</div>}
                    </>
                  ))}
                </div>
                {stats && (
                  <div style={{marginTop:'16px', fontSize:'11px', color:'var(--text-muted)', textAlign:'right'}}>
                    Last refreshed: {new Date(stats.server_time).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            <ActivityTable />
          </div>
        )}

        {currentView === 'generator' && <GeneratorView />}
        {currentView === 'dossier' && <DossierView />}
        {currentView === 'team' && <TeamView />}
        {currentView === 'settings' && <SettingsView theme={theme} setTheme={setTheme} />}
        {currentView === 'mail' && <MailView />}
        {currentView === 'notifications' && <NotificationsView />}
        {currentView === 'profile' && <ProfileView />}

      </div>
    </div>
  )
}

export default App
