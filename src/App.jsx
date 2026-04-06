import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './Login'
import Dashboard from './Dashboard'
import Reservas from './Reservas'
import Calendario from './Calendario'
import Cabanas from './Cabanas' // Importación de la nueva sección

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'reservas', label: 'Reservas', icon: '📋' },
  { id: 'calendario', label: 'Calendario', icon: '📅' },
  { id: 'cabanas', label: 'Cabañas', icon: '🏡' }, // Ítem añadido
]

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pagina, setPagina] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    // Gestión de Sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Lógica Responsive para el Sidebar
    const handleResize = () => {
      if (window.innerWidth < 768) setCollapsed(true)
      else setCollapsed(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('resize', handleResize)
    }
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

  const sidebarW = collapsed ? '64px' : '220px'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a1a0a 0%, #0d2010 100%)',
      display: 'flex', fontFamily: "'Georgia', serif"
    }}>
      {/* Sidebar con todas sus propiedades originales */}
      <div style={{
        width: sidebarW,
        minHeight: '100vh',
        background: 'rgba(0,0,0,0.35)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Logo + Botón de colapso */}
        <div style={{
          padding: collapsed ? '20px 0' : '24px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: collapsed ? 'center' : 'flex-start',
          justifyContent: collapsed ? 'center' : 'space-between',
          transition: 'padding 0.28s'
        }}>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🏕️</div>
              <div style={{ color: '#a8d5a2', fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>CABAÑAS</div>
              <div style={{ color: '#a8d5a2', fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', whiteSpace: 'nowrap' }}>ROBLEDAL</div>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '9px', letterSpacing: '1px', marginTop: '2px', whiteSpace: 'nowrap' }}>ADMINISTRACIÓN</div>
            </div>
          )}

          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              width: '28px', height: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', flexShrink: 0, transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#a8d5a2'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Navegación con efectos Hover */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV.map(item => {
            const active = pagina === item.id
            return (
              <button
                key={item.id}
                onClick={() => setPagina(item.id)}
                title={collapsed ? item.label : ''}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: collapsed ? '0' : '10px',
                  padding: collapsed ? '12px 0' : '11px 12px',
                  borderRadius: '8px', border: 'none',
                  background: active ? 'rgba(74,154,74,0.22)' : 'transparent',
                  color: active ? '#a8d5a2' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'left',
                  marginBottom: '2px',
                  borderLeft: active ? '2px solid #4a9a4a' : '2px solid transparent',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{
                  opacity: collapsed ? 0 : 1,
                  maxWidth: collapsed ? '0' : '200px',
                  overflow: 'hidden',
                  transition: 'opacity 0.2s, max-width 0.28s',
                  fontSize: '13px',
                  letterSpacing: '0.3px'
                }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Usuario + Logout con efectos originales */}
        <div style={{
          padding: collapsed ? '12px 8px' : '14px 10px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          transition: 'padding 0.28s'
        }}>
          {!collapsed && (
            <div style={{
              color: 'rgba(255,255,255,0.3)', fontSize: '10px',
              marginBottom: '8px', padding: '0 4px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {session.user.email}
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            style={{
              width: '100%', padding: collapsed ? '10px 0' : '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: collapsed ? '16px' : '11px',
              letterSpacing: collapsed ? '0' : '1px',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ff8080'; e.currentTarget.style.borderColor = 'rgba(255,100,100,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            {collapsed ? '⏻' : 'CERRAR SESIÓN'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflow: 'auto', transition: 'all 0.28s' }}>
        {/* Top Bar dinámico */}
        <div style={{
          padding: '14px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 5,
          background: 'rgba(10,26,10,0.85)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>{NAV.find(n => n.id === pagina)?.icon}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '1.5px' }}>
              {NAV.find(n => n.id === pagina)?.label?.toUpperCase()}
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Área de Renderizado de Páginas */}
        <div style={{ padding: '0px' }}>
          {pagina === 'dashboard' && <Dashboard />}
          {pagina === 'reservas' && <Reservas />}
          {pagina === 'calendario' && <Calendario />}
          {pagina === 'cabanas' && <Cabanas />}
        </div>
      </div>
    </div>
  )
}