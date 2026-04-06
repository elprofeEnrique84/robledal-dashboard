import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Cabanas() {
  const [cabanas, setCabanas] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nuevaCabana, setNuevaCabana] = useState({ nombre: '', capacidad_max: '', precio_alta: '', direccion: '' })
  const [editandoId, setEditandoId] = useState(null)
  const [cabanaEditada, setCabanaEditada] = useState({})

  useEffect(() => { fetchCabanas() }, [])

  async function fetchCabanas() {
    setLoading(true)
    const { data } = await supabase.from('cabanas').select('*').order('nombre')
    setCabanas(data || [])
    setLoading(false)
  }

  async function toggleEstado(id, estadoActual) {
    await supabase.from('cabanas').update({ activa: !estadoActual }).eq('id', id)
    fetchCabanas()
  }

  async function agregarCabana(e) {
    e.preventDefault()
    const { error } = await supabase.from('cabanas').insert([
      { ...nuevaCabana, 
        capacidad_max: parseInt(nuevaCabana.capacidad_max), 
        precio_alta: parseInt(nuevaCabana.precio_alta), 
        fotos: [], 
        activa: true 
      }
    ])
    if (!error) { setMostrarForm(false); setNuevaCabana({ nombre: '', capacidad_max: '', precio_alta: '', direccion: '' }); fetchCabanas(); }
  }

  async function guardarEdicion(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('cabanas')
      .update({
        nombre: cabanaEditada.nombre,
        direccion: cabanaEditada.direccion,
        capacidad_max: parseInt(cabanaEditada.capacidad_max),
        precio_alta: parseInt(cabanaEditada.precio_alta)
      })
      .eq('id', editandoId)

    if (!error) { setEditandoId(null); fetchCabanas(); }
  }

  async function handleUpload(e, cabana) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingId(cabana.id)
    const fileName = `${cabana.id}/${Date.now()}.${file.name.split('.').pop()}`
    try {
      await supabase.storage.from('cabanas-fotos').upload(fileName, file)
      const { data: { publicUrl } } = supabase.storage.from('cabanas-fotos').getPublicUrl(fileName)
      const nuevasFotos = [...(cabana.fotos || []), publicUrl]
      await supabase.from('cabanas').update({ fotos: nuevasFotos }).eq('id', cabana.id)
      fetchCabanas()
    } finally { setUploadingId(null) }
  }

  if (loading && cabanas.length === 0) return <div style={{ padding: '40px', color: '#a8d5a2' }}>Cargando...</div>

  return (
    <div style={{ padding: '32px', color: '#fff', fontFamily: "'Georgia', serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h2 style={{ color: '#a8d5a2', margin: 0 }}>Gestión de Cabañas</h2>
        <button onClick={() => setMostrarForm(!mostrarForm)} style={{ background: '#4a9a4a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
          {mostrarForm ? '✕ CANCELAR' : '+ AGREGAR CABAÑA'}
        </button>
      </div>

      {/* FORMULARIO AGREGAR CON DIRECCIÓN */}
      {mostrarForm && (
        <form onSubmit={agregarCabana} style={{ background: 'rgba(74,154,74,0.1)', padding: '20px', borderRadius: '12px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #4a9a4a' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input placeholder="Nombre" required value={nuevaCabana.nombre} onChange={e => setNuevaCabana({...nuevaCabana, nombre: e.target.value})} style={{ background: '#0a1a0a', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '6px', flex: 2 }} />
            <input type="number" placeholder="Capacidad" required value={nuevaCabana.capacidad_max} onChange={e => setNuevaCabana({...nuevaCabana, capacidad_max: e.target.value})} style={{ background: '#0a1a0a', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '6px', flex: 1 }} />
            <input type="number" placeholder="Precio" required value={nuevaCabana.precio_alta} onChange={e => setNuevaCabana({...nuevaCabana, precio_alta: e.target.value})} style={{ background: '#0a1a0a', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '6px', flex: 1 }} />
          </div>
          <input placeholder="Dirección (ej: La Placeta, km 12, Maule)" required value={nuevaCabana.direccion} onChange={e => setNuevaCabana({...nuevaCabana, direccion: e.target.value})} style={{ background: '#0a1a0a', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '6px' }} />
          <button type="submit" style={{ background: '#a8d5a2', color: '#0a1a0a', fontWeight: 'bold', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>GUARDAR CABAÑA</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {cabanas.map(c => (
          <div key={c.id} style={{ 
            background: c.activa ? 'rgba(255,255,255,0.03)' : 'rgba(255,0,0,0.05)', 
            borderRadius: '16px', padding: '24px', 
            border: c.activa ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,0,0,0.2)',
            position: 'relative'
          }}>
            
            <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '10px' }}>
              <button onClick={() => toggleEstado(c.id, c.activa)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>{c.activa ? '🟢' : '🔴'}</button>
              <button onClick={() => { setEditandoId(c.id); setCabanaEditada(c); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✏️</button>
            </div>

            {editandoId === c.id ? (
              <form onSubmit={guardarEdicion} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input value={cabanaEditada.nombre} onChange={e => setCabanaEditada({...cabanaEditada, nombre: e.target.value})} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #4a9a4a', padding: '8px', borderRadius: '6px' }} />
                <input value={cabanaEditada.direccion} onChange={e => setCabanaEditada({...cabanaEditada, direccion: e.target.value})} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #4a9a4a', padding: '8px', borderRadius: '6px' }} />
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input type="number" value={cabanaEditada.capacidad_max} onChange={e => setCabanaEditada({...cabanaEditada, capacidad_max: e.target.value})} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #4a9a4a', padding: '8px', borderRadius: '6px', flex: 1 }} />
                  <input type="number" value={cabanaEditada.precio_alta} onChange={e => setCabanaEditada({...cabanaEditada, precio_alta: e.target.value})} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #4a9a4a', padding: '8px', borderRadius: '6px', flex: 1 }} />
                </div>
                <button type="submit" style={{ background: '#4a9a4a', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>Actualizar</button>
              </form>
            ) : (
              <>
                <h3 style={{ margin: '0 0 5px 0' }}>{c.nombre}</h3>
                <p style={{ color: '#a8d5a2', fontSize: '12px', margin: '0 0 15px 0', opacity: 0.8 }}>📍 {c.direccion || 'Sin dirección registrada'}</p>
                
                {/* Galería de fotos */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {c.fotos?.map((url, idx) => (
                    <img key={idx} src={url} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                  ))}
                  <label style={{ width: '80px', height: '60px', border: '1px dashed #4a9a4a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <span>{uploadingId === c.id ? '...' : '+'}</span>
                    <input type="file" hidden accept="image/*" onChange={(e) => handleUpload(e, c)} />
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                  <span style={{ color: '#a8d5a2', fontWeight: 'bold' }}>${c.precio_alta?.toLocaleString('es-CL')}</span>
                  <span style={{ opacity: 0.5, fontSize: '13px' }}>👤 {c.capacidad_max} pers.</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}