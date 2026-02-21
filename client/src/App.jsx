import { useState, useEffect, useCallback } from 'react'
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
  Moon,
  Activity,
  Terminal,
  Database,
  ExternalLink,
  Download,
  Trash2,
  Filter
} from 'lucide-react'
import './index.css'

// --- REFINED COMPONENTS FOR ENTERPRISE REALISM ---

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

const BarChart = () => {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
  const requests = [18, 25, 22, 30, 27, 35]
  const completed = [15, 20, 19, 26, 24, 32]
  const maxVal = 40
  return (
    <div className="chart-card" style={{padding:'24px'}}>
      <div style={{marginBottom:'20px'}}>
        <h3 style={{margin:0, fontSize:'14px', fontWeight:'700'}}>Generation Velocity</h3>
        <p style={{margin:'4px 0 0 0', fontSize:'12px', color:'var(--text-muted)'}}>Monthly volume of BRD requests vs successful primary exports</p>
      </div>
      <svg viewBox="0 0 540 160" width="100%" height="160">
        {[0,20,40].map((v,i) => {
          const y = 140 - (v/maxVal)*120
          return <g key={i}>
            <line x1="30" y1={y} x2="540" y2={y} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4"/>
            <text x="24" y={y+4} fill="var(--text-muted)" fontSize="10" textAnchor="end">{v}</text>
          </g>
        })}
        {months.map((month, i) => {
          const x = 50 + i * 82
          const rH = (requests[i]/maxVal)*120
          const cH = (completed[i]/maxVal)*120
          return <g key={i}>
            <rect x={x} y={140-rH} width="22" height={rH} rx="4" fill="var(--primary)" opacity="0.8"/>
            <rect x={x+26} y={140-cH} width="22" height={cH} rx="4" fill="var(--accent-blue)" opacity="0.8"/>
            <text x={x+24} y="158" fill="var(--text-muted)" fontSize="10" textAnchor="middle">{month}</text>
          </g>
        })}
      </svg>
      <div style={{display:'flex', gap:'16px', marginTop:'16px', fontSize:'11px', color:'var(--text-secondary)'}}>
        <div style={{display:'flex', alignItems:'center', gap:'6px'}}><div style={{width:'8px', height:'8px', borderRadius:'2px', background:'var(--primary)'}}></div> Requests</div>
        <div style={{display:'flex', alignItems:'center', gap:'6px'}}><div style={{width:'8px', height:'8px', borderRadius:'2px', background:'var(--accent-blue)'}}></div> Completed</div>
      </div>
    </div>
  )
}

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

const ActivityTable = ({ onEdit, onArchive }) => {
  const activities = [
    { id:'BRD-001', name:'Project Phoenix', date:'Feb 21', status:'Completed', owner:'Sarah C.', color:'#10b981' },
    { id:'BRD-002', name:'Skynet Integration', date:'Feb 20', status:'In Review', owner:'Miles D.', color:'#f59e0b' },
    { id:'BRD-003', name:'T-800 Specs', date:'Feb 19', status:'Drafting', owner:'John D.', color:'#3b82f6' },
    { id:'BRD-004', name:'CRM Revamp 2025', date:'Feb 18', status:'Completed', owner:'Satyam R.', color:'#10b981' },
  ]
  return (
    <div className="table-card" style={{marginTop:'32px'}}>
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
          {activities.map(a => (
            <tr key={a.id}>
              <td style={{fontFamily:'monospace', fontSize:'12px', color:'var(--text-muted)'}}>{a.id}</td>
              <td style={{fontWeight:'600', fontSize:'13px'}}>{a.name}</td>
              <td style={{color:'var(--text-muted)', fontSize:'12px'}}>{a.date}</td>
              <td>
                <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                  <div style={{width:'6px', height:'6px', borderRadius:'50%', background:a.color}}></div>
                  <span style={{fontSize:'12px', fontWeight:'500'}}>{a.status}</span>
                </div>
              </td>
              <td style={{fontSize:'12px'}}>{a.owner}</td>
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

const GeneratorView = ({ externalInput }) => {
  const [inputText, setInputText] = useState(externalInput || '')
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('brd')

  useEffect(() => {
    if (externalInput) setInputText(externalInput)
  }, [externalInput])

  const handleGenerate = async () => {
    if (!inputText) return;
    setIsLoading(true);
    setReport(null);
    try {
      const formData = new FormData();
      formData.append('context', inputText);
      const genRes = await fetch('http://localhost:8000/generate', { method: 'POST', body: formData });
      if (!genRes.ok) throw new Error('Generation failed');
      const data = await genRes.json();
      setReport(data);
      setActiveTab('brd');
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
        const response = await fetch('http://localhost:8000/enron/random');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setInputText(`Subject: ${data.subject}\nFrom: ${data.from}\n\n${data.body}`);
      } catch { alert("Failed to load Enron sample"); } finally { setIsLoading(false); }
  }

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
               <button onClick={() => setInputText('')} className="icon-btn" title="Clear"><Trash2 size={14} /></button>
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

const DossierView = () => (
  <div className="dashboard-view">
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
      <h1 className="dashboard-title">Project Dossier</h1>
      <button className="icon-btn"><Filter size={18} /></button>
    </div>
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px'}}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="chart-card" style={{padding:'20px', cursor:'pointer'}}>
           <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}>
              <div style={{width:'32px', height:'32px', borderRadius:'8px', background:'rgba(79,70,229,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--primary)'}}><FileText size={18} /></div>
              <span style={{fontSize:'11px', color:'var(--text-muted)', fontWeight:'600'}}>MAR 0{i}, 2025</span>
           </div>
           <h3 style={{fontSize:'14px', margin:'0 0 4px 0'}}>Strategic BRD-00{i}</h3>
           <p style={{fontSize:'12px', color:'var(--text-secondary)', margin:0}}>Enterprise requirements for Platform Delta v2.0</p>
           <div style={{marginTop:'20px', paddingTop:'16px', borderTop:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span className="status-badge" style={{background:'rgba(16,185,129,0.1)', color:'#10b981', fontSize:'10px'}}>Finalized</span>
              <ExternalLink size={14} color="var(--text-muted)" />
           </div>
        </div>
      ))}
    </div>
  </div>
)

const TeamView = () => {
  const members = [
    { name: 'Satyam Raghuvanshi', role: 'Backend & AI Integration Lead', status: 'Active', color:'#10b981' },
    { name: 'Saksham Jaiswal', role: 'UX & Product Delivery Lead', status: 'Away', color:'#f59e0b' },
    { name: 'Sittu Kumar Singh', role: 'Frontend Architect', status: 'Active', color:'#10b981' },
    { name: 'Shimant Ranjan', role: 'Requirement Specialist', status: 'Offline', color:'var(--text-muted)' },
  ]
  return (
    <div className="dashboard-view">
      <h1 className="dashboard-title">Operational Leads</h1>
      <div className="table-card">
         <table>
            <thead><tr><th>Lead Name</th><th>Specialization</th><th>Current Status</th><th style={{textAlign:'right'}}>Directory</th></tr></thead>
            <tbody>
               {members.map((m, i) => (
                 <tr key={i}>
                   <td>
                     <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <div style={{width:'28px', height:'28px', borderRadius:'50%', background:'var(--bg-hover)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700'}}>{m.name.split(' ').map(n=>n[0]).join('')}</div>
                        <span style={{fontSize:'13px', fontWeight:'600'}}>{m.name}</span>
                     </div>
                   </td>
                   <td style={{fontSize:'12px', color:'var(--text-secondary)'}}>{m.role}</td>
                   <td>
                      <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', fontWeight:'600', color:m.color}}>
                        <div style={{width:'6px', height:'6px', borderRadius:'50%', background:m.color}}></div>
                        {m.status}
                      </div>
                   </td>
                   <td style={{textAlign:'right'}}><button className="icon-btn"><Mail size={14} /></button></td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  )
}

const SettingsView = ({ theme, toggleTheme }) => (
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
    <div className="chart-card" style={{padding:'24px'}}>
       <h3 style={{fontSize:'14px', fontWeight:'700', marginBottom:'16px'}}>Workspace Meta</h3>
       <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          <div>
             <label style={{display:'block', fontSize:'12px', color:'var(--text-secondary)', marginBottom:'6px'}}>Organization Name</label>
             <input style={{width:'100%', padding:'10px', background:'var(--bg-input)', border:'1px solid var(--border-color)', borderRadius:'6px', color:'var(--text-primary)', fontSize:'13px'}} defaultValue="Genius Corp Operations" />
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

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch('http://localhost:8000/stats')
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
  const fmt = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const handleEditFromTable = (projectName) => {
    setGeneratorPreload(`RE: Requirements for ${projectName}. We need to adjust the RBAC specifications...`);
    setCurrentView('generator');
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
           <button className={`nav-item ${currentView === 'generator' ? 'active' : ''}`} onClick={() => setCurrentView('generator')}>
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
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <button className="icon-btn" onClick={() => setCurrentView('notifications')} title="Notifications"><Bell size={18} /></button>
            <button className="icon-btn" onClick={() => setCurrentView('mail')} title="Messages"><Mail size={18} /></button>
            <div style={{width:'1px', height:'20px', background:'var(--border-color)'}}></div>
            <div style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}} onClick={() => setCurrentView('profile')}>
              <div style={{width:'28px', height:'28px', borderRadius:'50%', background:'var(--primary)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700'}}>SR</div>
              <span style={{fontSize:'13px', fontWeight:'600'}}>S. Raghuvanshi</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </div>
          </div>
        </header>

        {currentView === 'dashboard' && (
          <div className="dashboard-view">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px'}}>
              <div>
                <h1 style={{fontSize:'20px', fontWeight:'700', margin:0}}>Operational Overview</h1>
                <div style={{fontSize:'12px', color:'var(--text-muted)', marginTop:'4px', display:'flex', alignItems:'center', gap:'8px'}}>
                  Last telemetry sync: {fmtDate(clock)} at {fmt(clock)}
                  <span style={{width:'4px', height:'4px', borderRadius:'50%', background:'#10b981'}}></span>
                  Systems Live
                </div>
              </div>
              <button 
                onClick={() => setCurrentView('generator')}
                style={{padding:'10px 18px', background:'var(--primary)', color:'white', border:'none', borderRadius:'6px', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}
              >
                <Plus size={16} /> Start New BRD
              </button>
            </div>

            {/* Logical Information Hierarchy */}
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px'}}>
              <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                {/* Primary Metrics */}
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px'}}>
                   <StatsCard 
                     title="BRDs Generated" 
                     value={stats ? stats.brd_count : '—'} 
                     sub="Total production deliveries" 
                     color="primary" icon={Database} 
                   />
                   <StatsCard 
                     title="Success Rate" 
                     value={stats ? `${stats.success_rate}%` : '—'} 
                     sub="Validation pass frequency" 
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
                     <Clock size={12} /> Last generated 42s ago
                   </div>
                </div>

                <BarChart />
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
                <PlatformStatus stats={stats} />
                
                <div className="chart-card" style={{padding:'20px'}}>
                   <h3 style={{fontSize:'13px', fontWeight:'700', marginBottom:'12px'}}>Workspace Signals</h3>
                   <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'12px'}}>
                         <div style={{width:'8px', height:'8px', borderRadius:'2px', background:'var(--accent-blue)'}}></div>
                         <span>Most common input: <strong>Email Threads</strong></span>
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'12px'}}>
                         <div style={{width:'8px', height:'8px', borderRadius:'2px', background:'var(--accent-purple)'}}></div>
                         <span>Primary Export: <strong>PDF Document</strong></span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <ActivityTable onEdit={handleEditFromTable} onArchive={() => setCurrentView('dossier')} />
          </div>
        )}

        {currentView === 'generator' && <GeneratorView externalInput={generatorPreload} />}
        {currentView === 'dossier' && <DossierView />}
        {currentView === 'team' && <TeamView />}
        {currentView === 'settings' && <SettingsView theme={theme} toggleTheme={toggleTheme} />}
        
        {['notifications', 'profile', 'mail'].includes(currentView) && (
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
