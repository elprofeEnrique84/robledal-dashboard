import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. .trim() es vital para evitar errores de espacios al copiar/pegar el correo
      const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password 
      })

      if (authError) {
        // 2. Traducción de errores técnicos de Supabase a mensajes de usuario
        if (authError.message === 'Invalid login credentials') {
          throw new Error('El correo o la contraseña son incorrectos.')
        } else if (authError.message === 'Email not confirmed') {
          throw new Error('Por favor, confirma tu correo electrónico.')
        } else {
          throw authError
        }
      }

      // 3. Si no hay error, ejecutamos la función de éxito
      if (data?.user) {
        onLogin()
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 50%, #0d2b0d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Georgia', serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Textura de fondo */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(34,85,34,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(20,60,20,0.2) 0%, transparent 40%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏕️</div>
          <h1 style={{ color: '#a8d5a2', fontSize: '24px', fontWeight: '400', margin: 0, letterSpacing: '2px' }}>
            SISTEMA DE RESERVAS CON AI - CABAÑAS
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '6px', letterSpacing: '1px' }}>
            PANEL DE ANALÍTICA
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
              CORREO
            </label>
            <input
              type="email"
              placeholder="ejemplo@robledal.cl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%', padding: '12px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#fff',
                fontSize: '15px', outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                cursor: loading ? 'not-allowed' : 'text'
              }}
              onFocus={e => e.target.style.borderColor = '#4a9a4a'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
              CONTRASEÑA
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%', padding: '12px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#fff',
                fontSize: '15px', outline: 'none',
                boxSizing: 'border-box',
                cursor: loading ? 'not-allowed' : 'text'
              }}
              onFocus={e => e.target.style.borderColor = '#4a9a4a'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(220,50,50,0.15)',
              border: '1px solid rgba(220,50,50,0.3)',
              borderRadius: '8px', padding: '12px',
              color: '#ff8080', fontSize: '13px',
              marginBottom: '20px', textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(74,154,74,0.4)' : 'linear-gradient(135deg, #2d7a2d, #4a9a4a)',
              border: 'none', borderRadius: '8px',
              color: '#fff', fontSize: '14px',
              letterSpacing: '2px', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Georgia', serif",
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            {loading ? 'INGRESANDO...' : 'INGRESAR'}
          </button>
        </form>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', marginTop: '32px' }}>
          © 2026 Consultora Grupo DXAS SPA
        </p>
      </div>
    </div>
  )
}