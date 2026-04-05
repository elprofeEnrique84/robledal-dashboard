import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#4a9a4a', '#a8d5a2', '#2d7a2d', '#6db86d', '#1a5c1a']

export default function Dashboard() {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReservas()
  }, [])

  const fetchReservas = async () => {
    const { data } = await supabase
      .from('reservas')
      .select('*')
      .order('created_at', { ascending: false })
    setReservas(data || [])
    setLoading(false)
  }

  // KPIs
  const totalReservas = reservas.length
  const reservasConfirmadas = reservas.filter(r => r.estado === 'CONFIRMADA').length
  const reservasPendientes = reservas.filter(r => r.estado === 'PENDIENTE').length
  const ingresosTotales = reservas.reduce((s, r) => s + (r.total_clp || 0), 0)
  const anticiposPendientes = reservas.filter(r => r.estado === 'PENDIENTE').reduce((s, r) => s + (r.anticipo_clp || 0), 0)

  // Reservas por mes
  const reservasPorMes = reservas.reduce((acc, r) => {
    if (!r.created_at) return acc
    const mes = new Date(r.created_at).toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
    acc[mes] = (acc[mes] || 0) + 1
    return acc
  }, {})
  const dataMes = Object.entries(reservasPorMes).map(([mes, cantidad]) => ({ mes, cantidad }))

  // Ingresos por mes
  const ingresosPorMes = reservas.reduce((acc, r) => {
    if (!r.created_at) return acc
    const mes = new Date(r.created_at).toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
    acc[mes] = (acc[mes] || 0) + (r.total_clp || 0)
    return acc
  }, {})
  const dataIngresos = Object.entries(ingresosPorMes).map(([mes, total]) => ({ mes, total: Math.round(total / 1000) }))

  // Por cabaña
  const porCabana = reservas.reduce((acc, r) => {
    const cab = r.cabana || 'Sin especificar'
    acc[cab] = (acc[cab] || 0) + 1
    return acc
  }, {})
  const dataCabana = Object.entries(porCabana).map(([name, value]) => ({ name, value }))

  // Por idioma
  const porIdioma = reservas.reduce((acc, r) => {
    const idioma = r.idioma || 'Español'
    acc[idioma] = (acc[idioma] || 0) + 1
    return acc
  }, {})
  const dataIdioma = Object.entries(porIdioma).map(([name, value]) => ({ name, value }))

  const formatCLP = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

  const KPICard = ({ icon, label, value, sub, color }) => (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px', padding: '24px',
      flex: 1, minWidth: '180px'
    }}>
      <div style={{ fontSize: '28px', marginBottom: '12px' }}>{icon}</div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '1px', marginBottom: '6px' }}>{label}</div>
      <div style={{ color: color || '#a8d5a2', fontSize: '28px', fontWeight: '700', fontFamily: 'monospace' }}>{value}</div>
      {sub && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '4px' }}>{sub}</div>}
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#a8d5a2', fontSize: '18px' }}>
      Cargando datos...
    </div>
  )

  return (
    <div style={{ padding: '32px', color: '#fff', fontFamily: "'Georgia', serif" }}>
      <h2 style={{ color: '#a8d5a2', fontSize: '22px', fontWeight: '400', marginBottom: '8px', letterSpacing: '1px' }}>
        Vista General
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '32px' }}>
        Métricas en tiempo real de Cabañas Robledal
      </p>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <KPICard icon="📋" label="TOTAL RESERVAS" value={totalReservas} />
        <KPICard icon="✅" label="CONFIRMADAS" value={reservasConfirmadas} color="#6db86d" />
        <KPICard icon="⏳" label="PENDIENTES" value={reservasPendientes} color="#f0c060" />
        <KPICard icon="💰" label="INGRESOS TOTALES" value={formatCLP(ingresosTotales)} sub="proyectado" color="#a8d5a2" />
        <KPICard icon="🔔" label="ANTICIPOS POR COBRAR" value={formatCLP(anticiposPendientes)} color="#ff9060" />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Reservas por mes */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#a8d5a2', fontSize: '14px', fontWeight: '400', letterSpacing: '1px', marginBottom: '20px' }}>
            RESERVAS POR MES
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dataMes}>
              <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a3a1a', border: '1px solid #4a9a4a', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="cantidad" fill="#4a9a4a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ingresos por mes */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#a8d5a2', fontSize: '14px', fontWeight: '400', letterSpacing: '1px', marginBottom: '20px' }}>
            INGRESOS POR MES (miles CLP)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dataIngresos}>
              <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a3a1a', border: '1px solid #4a9a4a', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="total" stroke="#a8d5a2" strokeWidth={2} dot={{ fill: '#4a9a4a' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Por cabaña */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#a8d5a2', fontSize: '14px', fontWeight: '400', letterSpacing: '1px', marginBottom: '20px' }}>
            RESERVAS POR CABAÑA
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={dataCabana} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {dataCabana.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a3a1a', border: '1px solid #4a9a4a', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Por idioma */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: '#a8d5a2', fontSize: '14px', fontWeight: '400', letterSpacing: '1px', marginBottom: '20px' }}>
            CLIENTES POR IDIOMA
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dataIdioma} layout="vertical">
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} width={80} />
              <Tooltip contentStyle={{ background: '#1a3a1a', border: '1px solid #4a9a4a', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="value" fill="#6db86d" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
