'use client'
import React, { useState, useEffect } from 'react'

const ECO_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHJ6cXJkenlrYnZoaWZzb3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTExMTQsImV4cCI6MjA4ODY2NzExNH0.8hwx4D0tbe8e8b9sFhG6shO7yLgM-3Q-ViZNkavC4iE'
const BASE = 'https://yvhrzqrdzykbvhifsoxk.supabase.co/rest/v1'
const H = { apikey: ECO_ANON, Authorization: `Bearer ${ECO_ANON}`, 'Content-Type': 'application/json' }

const estadoRutaColor: any = {
    programada: ['var(--eco-blue-dim)', 'var(--eco-blue)', 'Programada'],
    'en-curso': ['var(--eco-yellow-dim)', 'var(--eco-yellow)', '⚡ En Curso'],
    completada: ['var(--eco-green-dim)', 'var(--eco-green)', '✓ Completada'],
    cancelada: ['var(--eco-red-dim)', 'var(--eco-red)', 'Cancelada'],
}

export default function TabEcoRutas({ showToast, ecoQuery }: any) {
    const [rutas, setRutas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState<any>(null)
    const [selected, setSelected] = useState<any>(null)
    const [form, setForm] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [flota, setFlota] = useState<any[]>([])
    const [operarios, setOperarios] = useState<any[]>([])
    const [ordenesDisp, setOrdenesDisp] = useState<any[]>([])
    const [ordenesRuta, setOrdenesRuta] = useState<any[]>([])
    const [selectedOrdenes, setSelectedOrdenes] = useState<Set<string>>(new Set())

    const today = new Date().toISOString().split('T')[0]

    const cargar = async () => {
        setLoading(true)
        const [r, fl, op, ords] = await Promise.all([
            ecoQuery('eco_rutas', { select: '*,eco_flota(placa,tipo),eco_operarios!eco_rutas_operario_conductor_id_fkey(nombres,apellidos)', filters: ['order=fecha.desc', 'limit=30'] }),
            ecoQuery('eco_flota', { select: 'id,placa,tipo,capacidad_kg', filters: ['estado=in.(disponible,en_ruta)'] }),
            ecoQuery('eco_operarios', { select: 'id,nombres,apellidos,cargo', filters: ['estado=eq.activo'] }),
            ecoQuery('eco_ordenes', { select: 'id,numero,cliente_id,tipo_residuo,direccion,distrito,kg_estimados,fecha_programada,eco_clientes(razon_social)', filters: ['estado=in.(programado,recogido)', `fecha_programada=gte.${today}`, 'limit=50'] }),
        ])
        setRutas(Array.isArray(r) ? r : [])
        setFlota(Array.isArray(fl) ? fl : [])
        setOperarios(Array.isArray(op) ? op : [])
        setOrdenesDisp(Array.isArray(ords) ? ords : [])
        setLoading(false)
    }

    const verDetalleRuta = async (ruta: any) => {
        const r = await ecoQuery('eco_ruta_ordenes', { select: '*,eco_ordenes(numero,tipo_residuo,kg_estimados,direccion,distrito,eco_clientes(razon_social))', filters: [`ruta_id=eq.${ruta.id}`, 'order=orden_visita.asc'] })
        setOrdenesRuta(Array.isArray(r) ? r : [])
        setSelected(ruta)
        setModal('detalle')
    }

    useEffect(() => { cargar() }, [])

    const crearRuta = async () => {
        if (!form.vehiculo_id || !form.operario_conductor_id) { showToast('Vehículo y conductor requeridos', 'error'); return }
        if (selectedOrdenes.size === 0) { showToast('Seleccione al menos una OS', 'error'); return }
        setSaving(true)
        const maxR = await ecoQuery('eco_rutas', { select: 'nombre', filters: ['order=created_at.desc', 'limit=1'] })
        const last = Array.isArray(maxR) && maxR[0] ? parseInt(maxR[0].nombre.split('-')[1] || '0') : 0
        const nombre = 'RUTA-' + String(last + 1).padStart(4, '0')
        const r = await fetch(`${BASE}/eco_rutas`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ nombre, fecha: form.fecha || today, vehiculo_id: form.vehiculo_id, operario_conductor_id: form.operario_conductor_id, operario_ayudante_id: form.operario_ayudante_id || null, estado: 'programada', hora_inicio: form.hora_inicio }) })
        if (!r.ok) { showToast('Error al crear ruta', 'error'); setSaving(false); return }
        const rutaData = await r.json()
        const rutaId = Array.isArray(rutaData) ? rutaData[0].id : rutaData.id
        // Link orders
        const ordenesArr = Array.from(selectedOrdenes)
        await Promise.all(ordenesArr.map((ordId: string, idx: number) =>
            fetch(`${BASE}/eco_ruta_ordenes`, { method: 'POST', headers: H, body: JSON.stringify({ ruta_id: rutaId, orden_id: ordId, orden_visita: idx + 1, estado: 'pendiente' }) })
        ))
        await fetch(`${BASE}/eco_flota?id=eq.${form.vehiculo_id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ estado: 'en_ruta' }) })
        showToast(`Ruta ${nombre} programada con ${ordenesArr.length} órdenes`, 'success')
        setModal(null); cargar()
        setSaving(false)
    }

    const iniciarRuta = async () => {
        if (!selected) return
        await fetch(`${BASE}/eco_rutas?id=eq.${selected.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ estado: 'en-curso', hora_inicio: new Date().toTimeString().slice(0, 5) }) })
        showToast('Ruta iniciada', 'info'); setModal(null); cargar()
    }

    const finalizarRuta = async () => {
        if (!form.km_recorridos) { showToast('Km recorridos requeridos', 'error'); return }
        await Promise.all([
            fetch(`${BASE}/eco_rutas?id=eq.${selected.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ estado: 'completada', hora_fin: new Date().toTimeString().slice(0, 5), km_recorridos: Number(form.km_recorridos), observaciones: form.observaciones }) }),
            selected.vehiculo_id ? fetch(`${BASE}/eco_flota?id=eq.${selected.vehiculo_id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ estado: 'disponible', km_actual: Number(form.km_recorridos) }) }) : Promise.resolve(),
        ])
        showToast('Ruta completada', 'success'); setModal(null); cargar()
    }

    const kgs = (ords: any[]) => ords.reduce((s: number, o: any) => s + (o.eco_ordenes?.kg_estimados || 0), 0)

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Modal Nueva Ruta */}
            {modal === 'nuevo' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 760, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16 }}>Programar Nueva Ruta</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label className="eco-label">Fecha *</label><input className="eco-input" type="date" defaultValue={today} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>
                                <div><label className="eco-label">Hora Inicio</label><input className="eco-input" type="time" onChange={e => setForm({ ...form, hora_inicio: e.target.value })} /></div>
                                <div><label className="eco-label">Vehículo *</label>
                                    <select className="eco-select" onChange={e => setForm({ ...form, vehiculo_id: e.target.value })}>
                                        <option value="">Seleccione...</option>
                                        {flota.map((v: any) => <option key={v.id} value={v.id}>{v.placa} — {v.tipo} — {v.capacidad_kg} kg</option>)}
                                    </select></div>
                                <div><label className="eco-label">Conductor *</label>
                                    <select className="eco-select" onChange={e => setForm({ ...form, operario_conductor_id: e.target.value })}>
                                        <option value="">Seleccione...</option>
                                        {operarios.filter((o: any) => ['conductor', 'supervisor'].includes(o.cargo)).map((o: any) => <option key={o.id} value={o.id}>{o.apellidos} {o.nombres}</option>)}
                                    </select></div>
                                <div><label className="eco-label">Ayudante</label>
                                    <select className="eco-select" onChange={e => setForm({ ...form, operario_ayudante_id: e.target.value })}>
                                        <option value="">Ninguno</option>
                                        {operarios.filter((o: any) => o.cargo === 'ayudante').map((o: any) => <option key={o.id} value={o.id}>{o.apellidos} {o.nombres}</option>)}
                                    </select></div>
                            </div>

                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Órdenes Disponibles — seleccione las que van en esta ruta:</div>
                                <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid var(--eco-border)', borderRadius: 8 }}>
                                    {ordenesDisp.length === 0 ? <div style={{ padding: 16, color: 'var(--eco-text-muted)', fontSize: 13 }}>Sin órdenes disponibles para hoy</div> :
                                        ordenesDisp.map((o: any) => (
                                            <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--eco-border)', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={selectedOrdenes.has(o.id)} onChange={e => { const ns = new Set(selectedOrdenes); e.target.checked ? ns.add(o.id) : ns.delete(o.id); setSelectedOrdenes(ns) }} />
                                                <div style={{ flex: 1 }}>
                                                    <div className="sg" style={{ fontSize: 13, color: 'var(--eco-green)', fontWeight: 600 }}>{o.numero}</div>
                                                    <div style={{ fontSize: 12, color: 'var(--eco-text-muted)' }}>{o.eco_clientes?.razon_social} — {o.direccion}</div>
                                                </div>
                                                <span style={{ fontSize: 12 }}>{o.kg_estimados} kg</span>
                                                <span style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 6, fontSize: 11, padding: '2px 6px', color: 'var(--eco-text-muted)' }}>{o.distrito}</span>
                                            </label>
                                        ))}
                                </div>
                                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--eco-text-muted)' }}>
                                    Seleccionadas: <strong style={{ color: 'var(--eco-green)' }}>{selectedOrdenes.size} OS</strong> — Kg estimados: <strong style={{ color: 'var(--eco-green)' }}>{Array.from(selectedOrdenes).reduce((s: number, id: string) => s + (ordenesDisp.find((o: any) => o.id === id)?.kg_estimados || 0), 0)} kg</strong>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={crearRuta}>{saving ? 'Programando...' : 'Programar Ruta'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalle */}
            {modal === 'detalle' && selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 700, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16, color: 'var(--eco-green)' }}>{selected.nombre}</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                {[['Fecha', selected.fecha], ['Vehículo', selected.eco_flota?.placa], ['Tipo', selected.eco_flota?.tipo], ['Conductor', `${selected.eco_operarios?.nombres || ''} ${selected.eco_operarios?.apellidos || ''}`], ['Hora Inicio', selected.hora_inicio || '—'], ['Hora Fin', selected.hora_fin || '—'], ['Km Recorridos', selected.km_recorridos ? `${selected.km_recorridos} km` : '—']].map(([k, v]) => (
                                    <div key={k} style={{ background: 'var(--eco-surface2)', borderRadius: 8, padding: 10 }}>
                                        <div style={{ fontSize: 11, color: 'var(--eco-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                                        <div style={{ fontSize: 13 }}>{v || '—'}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Paradas */}
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10, color: 'var(--eco-text)' }}>Paradas ({ordenesRuta.length})</div>
                            {ordenesRuta.length === 0 ? <div style={{ color: 'var(--eco-text-muted)', fontSize: 13 }}>Sin paradas registradas</div> :
                                ordenesRuta.map((ro: any, i: number) => (
                                    <div key={ro.id} style={{ display: 'flex', gap: 12, marginBottom: 8, background: 'var(--eco-surface2)', borderRadius: 8, padding: 12 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--eco-green)', color: '#0a0f0d', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                                        <div style={{ flex: 1 }}>
                                            <div className="sg" style={{ fontSize: 13, color: 'var(--eco-green)', fontWeight: 600 }}>{ro.eco_ordenes?.numero}</div>
                                            <div style={{ fontSize: 12, color: 'var(--eco-text-muted)' }}>{ro.eco_ordenes?.eco_clientes?.razon_social}</div>
                                            <div style={{ fontSize: 12, color: 'var(--eco-text-muted)' }}>{ro.eco_ordenes?.direccion}, {ro.eco_ordenes?.distrito}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 12, color: 'var(--eco-text-muted)' }}>{ro.eco_ordenes?.kg_estimados} kg</div>
                                            <span style={{ fontSize: 11, background: ro.estado === 'completado' ? 'var(--eco-green-dim)' : 'var(--eco-blue-dim)', color: ro.estado === 'completado' ? 'var(--eco-green)' : 'var(--eco-blue)', padding: '2px 6px', borderRadius: 8 }}>{ro.estado}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cerrar</button>
                            {selected.estado === 'programada' && <button className="eco-btn-primary" onClick={iniciarRuta}>▶ Iniciar Ruta</button>}
                            {selected.estado === 'en-curso' && <button className="eco-btn-primary" onClick={() => setModal('finalizar')}>Finalizar Ruta</button>}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Finalizar */}
            {modal === 'finalizar' && selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 480, maxWidth: '95vw', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16 }}>Finalizar Ruta {selected.nombre}</span>
                            <button onClick={() => setModal('detalle')} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div><label className="eco-label">Km Recorridos *</label><input className="eco-input" type="number" onChange={e => setForm({ ...form, km_recorridos: e.target.value })} /></div>
                            <div><label className="eco-label">Observaciones del viaje</label><textarea className="eco-input" rows={3} style={{ resize: 'none' }} onChange={e => setForm({ ...form, observaciones: e.target.value })} /></div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal('detalle')}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={finalizarRuta}>Confirmar Finalización</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span className="sg" style={{ fontSize: 20, fontWeight: 600 }}>Rutas de Recolección</span>
                <button className="eco-btn-primary" onClick={() => { setForm({}); setSelectedOrdenes(new Set()); setModal('nuevo') }}>+ Programar Ruta</button>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Rutas Hoy', val: rutas.filter(r => r.fecha === today).length, color: 'var(--eco-blue)' },
                    { label: 'En Curso', val: rutas.filter(r => r.estado === 'en-curso').length, color: 'var(--eco-yellow)' },
                    { label: 'Completadas', val: rutas.filter(r => r.estado === 'completada').length, color: 'var(--eco-green)' },
                    { label: 'OS sin asignar a ruta', val: ordenesDisp.length, color: ordenesDisp.length > 0 ? 'var(--eco-yellow)' : 'var(--eco-green)' },
                ].map((k, i) => <div key={i} className="eco-card" style={{ cursor: 'default' }}>
                    <div style={{ fontSize: 12, color: 'var(--eco-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{k.label}</div>
                    <div className="sg" style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.val}</div>
                </div>)}
            </div>

            <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="eco-table" style={{ minWidth: 800 }}>
                        <thead><tr><th>Ruta</th><th>Fecha</th><th>Vehículo</th><th>Conductor</th><th>H. Inicio</th><th>H. Fin</th><th>Km</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan={9}><div style={{ height: 80, animation: 'ecoPulse 1.5s infinite', background: 'var(--eco-border)', margin: 12, borderRadius: 4 }} /></td></tr> :
                                rutas.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--eco-text-muted)' }}>Sin rutas programadas</td></tr> :
                                    rutas.map((r: any) => {
                                        const [bg, c, l] = estadoRutaColor[r.estado] || ['rgba(180,180,180,0.1)', '#aaa', r.estado]
                                        return (
                                            <tr key={r.id}>
                                                <td className="sg" style={{ color: 'var(--eco-green)', fontWeight: 600 }}>{r.nombre}</td>
                                                <td style={{ color: 'var(--eco-text-muted)', fontSize: 12 }}>{r.fecha}</td>
                                                <td><span className="sg" style={{ color: 'var(--eco-blue)', fontSize: 13 }}>{r.eco_flota?.placa || '—'}</span></td>
                                                <td style={{ fontSize: 13 }}>{r.eco_operarios?.apellidos || '—'}</td>
                                                <td style={{ color: 'var(--eco-text-muted)', fontSize: 12 }}>{r.hora_inicio || '—'}</td>
                                                <td style={{ color: 'var(--eco-text-muted)', fontSize: 12 }}>{r.hora_fin || '—'}</td>
                                                <td style={{ color: 'var(--eco-text-muted)', fontSize: 12 }}>{r.km_recorridos ? r.km_recorridos + ' km' : '—'}</td>
                                                <td><span style={{ background: bg, color: c, fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{l}</span></td>
                                                <td>
                                                    <button onClick={() => verDetalleRuta(r)} style={{ padding: '4px 10px', background: 'var(--eco-surface2)', border: '1px solid var(--eco-border)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'var(--eco-text-muted)' }}>Ver →</button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
