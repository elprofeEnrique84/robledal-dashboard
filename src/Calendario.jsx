import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

export default function Calendario() {
  const [reservas, setReservas] = useState([])
  const [hoy] = useState(new Date())
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => { fetchReservas() }, [])

  const fetchReservas = async () => {
    const { data } = await supabase.from('reservas').select('*')
    setReservas(data || [])
  }

  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  const reservasEnDia = (dia) => {
    const fecha = new Date(anio, mes, dia)
    return reservas.filter(r => {
      if (!r.fecha_llegada || !r.fecha_salida) return false
      const llegada = new Date(r.fecha_llegada)
      const salida = new Date(r.fecha_salida)
      return fecha >= llegada && fecha < salida
    })
  }

  const anterior = () => {
    if (mes === 0) { setMes(11); setAnio(a => a - 1) }
    else setMes(m => m - 1)
  }

  const siguiente = () => {
    if (mes === 11) { setMes(0); setAnio(a => a + 1) }
    else setMes(m => m + 1)
  }

  const estadoColor = (e) => ({
    'PENDIENTE': '#f0c060',
    'CONFIRMADA': '#6db86d',
    'CANCELADA': '#ff6060'
  }[e] || '#4a9a4a')

  return (
    <div style={{ padding: '32px', color: '#fff', fontFamily: "'Georgia', serif" }}>
      <h2 style={{ color: '#a8d5a2', fontSize: '22px', fontWeight: '400', marginBottom: '8px', letterSpacing: '1px' }}>
        Calendario de Ocupación
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '28px' }}>
        Vista mensual de reservas activas
      </p>

      {/* Navegación mes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
        <button onClick={anterior} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>←</button>
        <h3 style={{ color: '#a8d5a2', fontSize: '20px', fontWeight: '400', minWidth: '200px', textAlign: 'center' }}>
          {MESES[mes]} {anio}
        </h3>
        <button onClick={siguiente} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>→</button>
        <button onClick={() => { setMes(hoy.getMonth()); setAnio(hoy.getFullYear()) }}
          style={{ background: 'rgba(74,154,74,0.2)', border: '1px solid rgba(74,154,74,0.3)', color: '#a8d5a2', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px' }}>
          HOY
        </button>
      </div>

      {/* Grid calendario */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Header días */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {DIAS.map(d => (
            <div key={d} style={{ padding: '12px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '1px' }}>{d}</div>
          ))}
        </div>

        {/* Días */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {/* Espacios vacíos */}
          {Array.from({ length: primerDia }).map((_, i) => (
            <div key={`empty-${i}`} style={{ padding: '12px', minHeight: '80px', borderRight: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }} />
          ))}

          {/* Días del mes */}
          {Array.from({ length: diasEnMes }).map((_, i) => {
            const dia = i + 1
            const rEnDia = reservasEnDia(dia)
            const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
            return (
              <div key={dia}
                style={{
                  padding: '8px', minHeight: '80px',
                  borderRight: '1px solid rgba(255,255,255,0.04)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: esHoy ? 'rgba(74,154,74,0.08)' : 'transparent',
                  position: 'relative'
                }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: esHoy ? '#4a9a4a' : 'transparent',
                  color: esHoy ? '#fff' : 'rgba(255,255,255,0.7)',
                  fontSize: '13px', marginBottom: '4px'
                }}>{dia}</span>

                {rEnDia.slice(0, 2).map(r => (
                  <div key={r.id}
                    onClick={() => setTooltip(tooltip?.id === r.id ? null : r)}
                    style={{
                      background: `${estadoColor(r.estado)}33`,
                      border: `1px solid ${estadoColor(r.estado)}66`,
                      borderRadius: '4px', padding: '2px 6px',
                      fontSize: '10px', color: estadoColor(r.estado),
                      marginTop: '2px', cursor: 'pointer',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                    {r.nombre?.split(' ')[0] || 'Reserva'}
                  </div>
                ))}
                {rEnDia.length > 2 && (
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>+{rEnDia.length - 2} más</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Tooltip detalle */}
      {tooltip && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px',
          background: '#0d2b0d', border: '1px solid rgba(74,154,74,0.4)',
          borderRadius: '12px', padding: '20px', maxWidth: '300px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 50
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#a8d5a2', fontSize: '14px', fontWeight: '600' }}>{tooltip.nombre}</span>
            <button onClick={() => setTooltip(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
          {[
            ['Cabaña', tooltip.cabana],
            ['Personas', tooltip.personas],
            ['Llegada', tooltip.fecha_llegada],
            ['Salida', tooltip.fecha_salida],
            ['Total', tooltip.total_clp ? `$${tooltip.total_clp.toLocaleString('es-CL')}` : '-'],
            ['Estado', tooltip.estado],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{k}</span>
              <span style={{ color: '#fff', fontSize: '12px' }}>{v || '-'}</span>
            </div>
          ))}
        </div>
      )}

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
        {[['CONFIRMADA', '#6db86d'], ['PENDIENTE', '#f0c060'], ['CANCELADA', '#ff6060']].map(([e, c]) => (
          <div key={e} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: `${c}33`, border: `1px solid ${c}66` }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{e}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
