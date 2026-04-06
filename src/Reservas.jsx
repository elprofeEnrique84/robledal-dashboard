import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const ESTADOS = ['TODOS', 'PENDIENTE', 'CONFIRMADA', 'CANCELADA']

export default function Reservas() {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [selected, setSelected] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    fetchReservas()

    const handleFocus = () => fetchReservas()
    const handleResize = () => setIsMobile(window.innerWidth < 768)

    window.addEventListener('focus', handleFocus)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const fetchReservas = async () => {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error("Error cargando reservas:", error.message)
    setReservas(data || [])
    setLoading(false)
  }

  // MEJORA: Función robusta para guardar en DB
  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('reservas')
        .update({ estado: nuevoEstado })
        .eq('id', id)

      if (error) throw error

      // Actualización optimista de la UI
      setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r))
      setSelected(null)
      
      console.log(`Estado actualizado: ${nuevoEstado}`)
    } catch (error) {
      console.error("Error al actualizar:", error.message)
      alert("No se pudo actualizar el estado en la base de datos.")
    }
  }

  const filtradas = reservas.filter(r => {
    const matchEstado = filtroEstado === 'TODOS' || r.estado === filtroEstado
    const matchBusqueda = !busqueda || 
      r.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
      r.telefono?.includes(busqueda) || 
      r.email?.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchBusqueda
  })

  const formatCLP = (n) => n ? new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n) : '-'
  const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-CL') : '-'

  const estadoColor = (e) => ({
    'PENDIENTE': '#f0c060',
    'CONFIRMADA': '#6db86d',
    'CANCELADA': '#ff6060'
  }[e] || '#aaa')

  return (
    <div style={{ padding: isMobile ? '16px' : '32px', color: '#fff', fontFamily: "'Georgia', serif" }}>
      <h2 style={{ color: '#a8d5a2', fontSize: '22px', fontWeight: '400', marginBottom: '8px', letterSpacing: '1px' }}>
        Reservas
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '28px' }}>
        {filtradas.length} reservas encontradas • Cabañas Robledal
      </p>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Buscar cliente, email o teléfono..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            flex: isMobile ? '1 1 100%' : '1', 
            minWidth: '200px', padding: '12px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ESTADOS.map(e => (
            <button key={e} onClick={() => setFiltroEstado(e)}
              style={{
                padding: '10px 14px', borderRadius: '8px', fontSize: '11px',
                letterSpacing: '1px', cursor: 'pointer', border: 'none',
                background: filtroEstado === e ? '#4a9a4a' : 'rgba(255,255,255,0.05)',
                color: filtroEstado === e ? '#fff' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s'
              }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla con scroll horizontal */}
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.07)', 
        borderRadius: '12px', 
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Cliente', 'Teléfono', 'Llegada', 'Salida', 'Cabaña', 'Total', 'Anticipo', 'Estado', ''].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '1px', fontWeight: '400' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Cargando...</td></tr>
            ) : filtradas.map((r, i) => (
              <tr key={r.id} style={{
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
              }}>
                <td style={{ padding: '14px 16px', fontSize: '14px' }}>
                  <div style={{ fontWeight: '600' }}>{r.nombre || '-'}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{r.email || '-'}</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{r.telefono?.replace('@s.whatsapp.net', '') || '-'}</td>
                <td style={{ padding: '14px 16px', fontSize: '13px' }}>{formatFecha(r.fecha_llegada)}</td>
                <td style={{ padding: '14px 16px', fontSize: '13px' }}>{formatFecha(r.fecha_salida)}</td>
                <td style={{ padding: '14px 16px', fontSize: '13px' }}>{r.cabana || '-'}</td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#a8d5a2' }}>{formatCLP(r.total_clp)}</td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#f0c060' }}>{formatCLP(r.anticipo_clp)}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    background: `${estadoColor(r.estado)}22`,
                    color: estadoColor(r.estado),
                    border: `1px solid ${estadoColor(r.estado)}44`,
                    padding: '4px 10px', borderRadius: '20px', fontSize: '10px'
                  }}>
                    {r.estado || 'PENDIENTE'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={() => setSelected(r)}
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.6)', padding: '6px 12px',
                      borderRadius: '6px', fontSize: '12px', cursor: 'pointer'
                    }}>
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detalle */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          padding: '20px'
        }} onClick={() => setSelected(null)}>
          <div style={{
            background: '#0d2b0d', border: '1px solid rgba(74,154,74,0.3)',
            borderRadius: '16px', padding: isMobile ? '24px' : '36px', 
            maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#a8d5a2', marginBottom: '20px', fontWeight: '400', letterSpacing: '1px' }}>DETALLE DE RESERVA</h3>
            {[
              ['Cliente', selected.nombre],
              ['Email', selected.email],
              ['Teléfono', selected.telefono?.replace('@s.whatsapp.net', '')],
              ['Llegada', formatFecha(selected.fecha_llegada)],
              ['Salida', formatFecha(selected.fecha_salida)],
              ['Cabaña', selected.cabana],
              ['Total', formatCLP(selected.total_clp)],
              ['Anticipo', formatCLP(selected.anticipo_clp)],
              ['Estado Actual', selected.estado],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase' }}>{k}</span>
                <span style={{ color: '#fff', fontSize: '13px' }}>{v || '-'}</span>
              </div>
            ))}
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button 
                disabled={selected.estado === 'CONFIRMADA'}
                onClick={() => actualizarEstado(selected.id, 'CONFIRMADA')}
                style={{ 
                  flex: 1, padding: '14px', background: '#2d7a2d', border: 'none', 
                  borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600',
                  opacity: selected.estado === 'CONFIRMADA' ? 0.5 : 1
                }}>
                Confirmar Pago
              </button>
              <button 
                disabled={selected.estado === 'CANCELADA'}
                onClick={() => actualizarEstado(selected.id, 'CANCELADA')}
                style={{ 
                  flex: 1, padding: '14px', background: 'rgba(200,50,50,0.1)', border: '1px solid #ff6060', 
                  borderRadius: '8px', color: '#ff6060', cursor: 'pointer', fontWeight: '600',
                  opacity: selected.estado === 'CANCELADA' ? 0.5 : 1
                }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}