import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './Login'
import Dashboard from './Dashboard'
import Reservas from './Reservas'
import Calendario from './Calendario'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'reservas', label: 'Reservas', icon: '📋' },
  { id: 'calendario', label: 'Calendario', icon: '📅' },
]

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pagina, setPagina] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0a1a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#a8d5a2', fontSize: '18px', fontFamily: "'Georgia', serif"
    }}>
      🏕️ Cargando...
    </div>
  )

  if (!session) return <Login onLogin={() => {}} />

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a1a0a 0%, #0d2010 100%)',
      display: 'flex', fontFamily: "'Georgia', serif"
    }}>
      {/* Sidebar */}
      <div style={{
        width: '240px', minHeight: '100vh',
        background: 'rgba(0,0,0,0.3)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏕️</div>
          <div style={{ color: '#a8d5a2', fontSize: '14px', letterSpacing: '1.5px' }}>CABAÑAS</div>
          <div style={{ color: '#a8d5a2', fontSize: '14px', letterSpacing: '1.5px' }}>ROBLEDAL</div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', letterSpacing: '1px', marginTop: '4px' }}>ANALÍTICA</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setPagina(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '8px', border: 'none',
                background: pagina === item.id ? 'rgba(74,154,74,0.2)' : 'transparent',
                color: pagina === item.id ? '#a8d5a2' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer', fontSize: '14px', textAlign: 'left',
                marginBottom: '4px',
                borderLeft: pagina === item.id ? '2px solid #4a9a4a' : '2px solid transparent',
                transition: 'all 0.2s'
              }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {session.user.email}
          </div>
          <button onClick={handleLogout}
            style={{
              width: '100%', padding: '8px', marginTop: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px', color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer', fontSize: '12px', letterSpacing: '1px'
            }}>
            CERRAR SESIÓN
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Top bar */}
        <div style={{
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '1px' }}>
            {NAV.find(n => n.id === pagina)?.icon} {NAV.find(n => n.id === pagina)?.label?.toUpperCase()}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Page content */}
        {pagina === 'dashboard' && <Dashboard />}
        {pagina === 'reservas' && <Reservas />}
        {pagina === 'calendario' && <Calendario />}
      </div>
    </div>
  )
}
