'use client'
import React, { useState, useEffect } from 'react'

const ECO_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHJ6cXJkenlrYnZoaWZzb3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTExMTQsImV4cCI6MjA4ODY2NzExNH0.8hwx4D0tbe8e8b9sFhG6shO7yLgM-3Q-ViZNkavC4iE'
const BASE = 'https://yvhrzqrdzykbvhifsoxk.supabase.co/rest/v1'
const H = { apikey: ECO_ANON, Authorization: `Bearer ${ECO_ANON}`, 'Content-Type': 'application/json' }

const ecoBadge = (tipo: string) => {
    const m: any = { municipal: ['var(--eco-green-dim)', 'var(--eco-green)', 'Municipal'], peligroso: ['var(--eco-red-dim)', 'var(--eco-red)', 'Peligroso'], hospitalario: ['var(--eco-purple-dim)', 'var(--eco-purple)', 'Hospitalario'], desmonte: ['var(--eco-yellow-dim)', 'var(--eco-yellow)', 'Desmonte'] }
    const [bg, c, t] = m[tipo] || ['rgba(180,180,180,0.1)', '#aaa', tipo]
    return <span style={{ background: bg, color: c, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 12 }}>{t}</span>
}
const ecoEstado = (estado: string) => {
    const m: any = { programado: ['var(--eco-blue-dim)', 'var(--eco-blue)', 'Programado'], en_ruta: ['var(--eco-yellow-dim)', 'var(--eco-yellow)', '⚡ En Ruta'], recogido: ['var(--eco-green-dim)', 'var(--eco-green)', 'Recogido'], en_planta: ['var(--eco-green-dim)', 'var(--eco-green)', 'En Planta'], completado: ['var(--eco-green-dim)', 'var(--eco-green)', '✓ Completado'], cancelado: ['var(--eco-red-dim)', 'var(--eco-red)', 'Cancelado'] }
    const [bg, c, t] = m[estado] || ['rgba(180,180,180,0.1)', '#aaa', estado]
    return <span style={{ background: bg, color: c, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 12 }}>{t}</span>
}

export default function TabEcoOrdenes({ showToast, ecoQuery }: any) {
    const [data, setData] = useState<any[]>([])
    const [filtrado, setFiltrado] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [clientes, setClientes] = useState<any[]>([])
    const [flota, setFlota] = useState<any[]>([])
    const [operarios, setOperarios] = useState<any[]>([])
    const [modal, setModal] = useState<any>(null)
    const [selected, setSelected] = useState<any>(null)
    const [form, setForm] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [pill, setPill] = useState('Todos')

    const today = new Date().toISOString().split('T')[0]

    const cargar = async () => {
        setLoading(true)
        const r = await ecoQuery('eco_ordenes', { select: '*,eco_clientes(razon_social),eco_flota(placa)', filters: ['order=fecha_programada.desc'] })
        const arr = Array.isArray(r) ? r : []
        setData(arr); setFiltrado(arr)
        setLoading(false)
    }

    useEffect(() => {
        cargar()
        Promise.all([
            ecoQuery('eco_clientes', { select: 'id,razon_social', filters: ['estado=eq.activo'] }),
            ecoQuery('eco_flota', { select: 'id,placa,tipo,capacidad_kg,tipos_habilitados', filters: ['estado=in.(disponible,en_ruta)'] }),
            ecoQuery('eco_operarios', { select: 'id,nombres,apellidos,cargo', filters: ['estado=eq.activo'] }),
        ]).then(([c, f, o]) => { setClientes(Array.isArray(c) ? c : []); setFlota(Array.isArray(f) ? f : []); setOperarios(Array.isArray(o) ? o : []) })
    }, [])

    const filtrar = (arr: any[], p: string) => {
        if (p === 'Todos') return setFiltrado(arr)
        const mp: any = { Programado: 'programado', 'En Ruta': 'en_ruta', Recogido: 'recogido', 'En Planta': 'en_planta', Completado: 'completado', Cancelado: 'cancelado' }
        setFiltrado(arr.filter((o: any) => o.estado === mp[p]))
    }

    const patchOrden = async (id: string, body: any) => {
        return fetch(`${BASE}/eco_ordenes?id=eq.${id}`, { method: 'PATCH', headers: H, body: JSON.stringify(body) })
    }

    const registrarRecojo = async () => {
        if (!form.kg_reales || Number(form.kg_reales) <= 0) { showToast('Kg reales requeridos', 'error'); return }
        setSaving(true)
        const r = await patchOrden(selected.id, { kg_reales: Number(form.kg_reales), estado: 'recogido' })
        if (r.ok) { showToast(`Recojo registrado: ${form.kg_reales} kg`, 'success'); setModal(null); cargar() }
        else showToast('Error al registrar', 'error')
        setSaving(false)
    }

    const cancelarOrden = async () => {
        if (!form.motivo || form.motivo.length < 10) { showToast('Motivo mínimo 10 caracteres', 'error'); return }
        await patchOrden(selected.id, { estado: 'cancelado' })
        if (selected.vehiculo_id) await fetch(`${BASE}/eco_flota?id=eq.${selected.vehiculo_id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ estado: 'disponible' }) })
        showToast('Orden cancelada', 'warning'); setModal(null); cargar()
    }

    const asignarVehiculo = async () => {
        if (!form.vehiculo_id) { showToast('Seleccione un vehículo', 'error'); return }
        setSaving(true)
        await Promise.all([
            patchOrden(selected.id, { vehiculo_id: form.vehiculo_id, operario_id: form.operario_id || null }),
            fetch(`${BASE}/eco_flota?id=eq.${form.vehiculo_id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ estado: 'en_ruta' }) }),
        ])
        showToast('Vehículo asignado', 'success'); setModal(null); setSaving(false); cargar()
    }

    const crearOrden = async () => {
        const req = ['cliente_id', 'tipo_residuo', 'descripcion', 'kg_estimados', 'fecha_programada', 'direccion']
        for (const k of req) { if (!form[k]) { showToast(`Campo requerido: ${k}`, 'error'); return } }
        if (form.fecha_programada < today) { showToast('La fecha no puede ser pasada', 'error'); return }
        setSaving(true)
        const maxR = await ecoQuery('eco_ordenes', { select: 'numero', filters: ['order=numero.desc', 'limit=1'] })
        const last = Array.isArray(maxR) && maxR[0] ? parseInt(maxR[0].numero.split('-')[1]) : 0
        const numero = 'OS-' + String(last + 1).padStart(4, '0')
        const r = await fetch(`${BASE}/eco_ordenes`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ ...form, numero, estado: 'programado' }) })
        if (r.ok) { showToast('Orden ' + numero + ' registrada', 'success'); setModal(null); cargar() }
        else showToast('Error al crear orden', 'error')
        setSaving(false)
    }

    const resumen = [
        { label: 'Hoy', val: data.filter((o: any) => o.fecha_programada === today).length, color: 'var(--eco-blue)' },
        { label: 'Esta Semana', val: (() => { const d = new Date(); const mon = new Date(d.setDate(d.getDate() - d.getDay() + 1)).toISOString().split('T')[0]; const sun = new Date(d.setDate(d.getDate() - d.getDay() + 7)).toISOString().split('T')[0]; return data.filter((o: any) => o.fecha_programada >= mon && o.fecha_programada <= sun).length })(), color: 'var(--eco-green)' },
        { label: 'Kg Mes', val: data.filter((o: any) => o.estado === 'completado' && o.fecha_programada?.startsWith(today.slice(0, 7))).reduce((s: number, o: any) => s + (Number(o.kg_reales) || 0), 0), color: 'var(--eco-text)', fmt: (v: number) => v.toLocaleString('es-PE') + ' kg' },
        { label: 'Sin Vehículo', val: data.filter((o: any) => o.fecha_programada === today && !o.vehiculo_id).length, color: 'var(--eco-red)' },
    ]

    const pills = ['Todos', 'Programado', 'En Ruta', 'Recogido', 'En Planta', 'Completado', 'Cancelado']

    const flotaFiltrada = selected ? flota.filter((v: any) => !v.tipos_habilitados || v.tipos_habilitados.includes(selected.tipo_residuo)) : flota

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Detalle modal */}
            {modal === 'detalle' && selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 660, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16, color: 'var(--eco-text)' }}>OS {selected.numero}</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                            <div style={{ marginBottom: 12 }}>{ecoEstado(selected.estado)}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                {[['Cliente', selected.eco_clientes?.razon_social], ['Tipo', selected.tipo_residuo], ['Fecha', selected.fecha_programada], ['Hora', selected.hora_programada || '—'], ['Dirección', selected.direccion], ['Distrito', selected.distrito], ['Kg Estimados', selected.kg_estimados + ' kg'], ['Kg Reales', selected.kg_reales ? selected.kg_reales + ' kg' : 'No registrado aún']].map(([k, v]) => (
                                    <div key={k} style={{ background: 'var(--eco-surface2)', borderRadius: 8, padding: 10 }}>
                                        <div style={{ fontSize: 11, color: 'var(--eco-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                                        <div style={{ fontSize: 13 }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                            {selected.requiere_manifiesto && <div style={{ background: 'var(--eco-yellow-dim)', border: '1px solid var(--eco-yellow)', borderRadius: 8, padding: 10, fontSize: 13, color: 'var(--eco-yellow)' }}>⚠ Esta orden requiere Manifiesto MINEM</div>}
                            <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                                {['programado', 'en_ruta'].includes(selected.estado) && <button className="eco-btn-primary" style={{ fontSize: 12 }} onClick={() => setModal('recojo')}>Registrar Recojo</button>}
                                {!selected.vehiculo_id && <button className="eco-btn-secondary" style={{ fontSize: 12 }} onClick={() => setModal('vehiculo')}>Asignar Vehículo</button>}
                                {selected.estado === 'programado' && <button className="eco-btn-danger" style={{ fontSize: 12 }} onClick={() => setModal('cancelar')}>Cancelar Orden</button>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recojo Modal */}
            {modal === 'recojo' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 460, maxWidth: '95vw' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 15 }}>Registrar Recojo</span>
                            <button onClick={() => setModal('detalle')} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div><label className="eco-label">Kg Reales Recolectados *</label><input className="eco-input" type="number" min="0.1" onChange={e => setForm({ ...form, kg_reales: e.target.value })} /></div>
                            <div><label className="eco-label">Observaciones</label><textarea className="eco-input" rows={2} style={{ resize: 'none' }} onChange={e => setForm({ ...form, obs: e.target.value })} /></div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal('detalle')}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={registrarRecojo}>Registrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Vehículo Modal */}
            {modal === 'vehiculo' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 500, maxWidth: '95vw' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 15 }}>Asignar Vehículo</span>
                            <button onClick={() => setModal('detalle')} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div><label className="eco-label">Vehículo (compatible con {selected?.tipo_residuo})</label>
                                <select className="eco-select" onChange={e => setForm({ ...form, vehiculo_id: e.target.value })}>
                                    <option value="">Seleccione...</option>
                                    {flotaFiltrada.map((v: any) => <option key={v.id} value={v.id}>{v.placa} — {v.tipo} — Cap: {v.capacidad_kg} kg</option>)}
                                </select>
                            </div>
                            <div><label className="eco-label">Conductor</label>
                                <select className="eco-select" onChange={e => setForm({ ...form, operario_id: e.target.value })}>
                                    <option value="">Seleccione...</option>
                                    {operarios.filter((o: any) => o.cargo === 'conductor' || o.cargo === 'supervisor').map((o: any) => <option key={o.id} value={o.id}>{o.nombres} {o.apellidos}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal('detalle')}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={asignarVehiculo}>Confirmar Asignación</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancelar Modal */}
            {modal === 'cancelar' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 460, maxWidth: '95vw' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 15, color: 'var(--eco-red)' }}>Cancelar Orden</span>
                            <button onClick={() => setModal('detalle')} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24 }}>
                            <label className="eco-label">Motivo de cancelación * (mínimo 10 caracteres)</label>
                            <textarea className="eco-input" rows={3} style={{ resize: 'none' }} onChange={e => setForm({ ...form, motivo: e.target.value })} />
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal('detalle')}>No, volver</button>
                            <button className="eco-btn-danger" onClick={cancelarOrden}>Confirmar Cancelación</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Nueva Orden Modal */}
            {modal === 'nuevo' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 700, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16 }}>Nueva Orden de Servicio</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div><label className="eco-label">Cliente *</label>
                                <select className="eco-select" onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
                                    <option value="">Seleccione...</option>
                                    {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                                </select></div>
                            <div><label className="eco-label">Tipo de Residuo *</label>
                                <select className="eco-select" onChange={e => setForm({ ...form, tipo_residuo: e.target.value, requiere_manifiesto: ['peligroso', 'hospitalario'].includes(e.target.value) })}>
                                    <option value="">Seleccione...</option>
                                    {['municipal', 'peligroso', 'hospitalario', 'desmonte'].map(t => <option key={t}>{t}</option>)}
                                </select>
                                {['peligroso', 'hospitalario'].includes(form.tipo_residuo) && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--eco-blue)', background: 'var(--eco-blue-dim)', padding: '6px 10px', borderRadius: 6 }}>⚠ Requiere Manifiesto MINEM automáticamente</div>}
                            </div>
                            <div style={{ gridColumn: '1/-1' }}><label className="eco-label">Descripción *</label><textarea className="eco-input" rows={2} style={{ resize: 'none' }} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
                            <div><label className="eco-label">Kg Estimados *</label><input className="eco-input" type="number" onChange={e => setForm({ ...form, kg_estimados: Number(e.target.value) })} /></div>
                            <div><label className="eco-label">Fecha Programada *</label><input className="eco-input" type="date" min={today} onChange={e => setForm({ ...form, fecha_programada: e.target.value })} /></div>
                            <div><label className="eco-label">Hora Programada *</label><input className="eco-input" type="time" onChange={e => setForm({ ...form, hora_programada: e.target.value })} /></div>
                            <div><label className="eco-label">Precio S/.</label><input className="eco-input" type="number" onChange={e => setForm({ ...form, precio: Number(e.target.value) })} /></div>
                            <div style={{ gridColumn: '1/-1' }}><label className="eco-label">Dirección de Recojo *</label><input className="eco-input" onChange={e => setForm({ ...form, direccion: e.target.value })} /></div>
                            <div><label className="eco-label">Distrito *</label><input className="eco-input" onChange={e => setForm({ ...form, distrito: e.target.value })} /></div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={crearOrden}>{saving ? 'Creando...' : 'Registrar Orden'}</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="sg" style={{ fontSize: 20, fontWeight: 600 }}>Órdenes de Servicio</span>
                <button className="eco-btn-primary" onClick={() => { setForm({}); setModal('nuevo') }}>+ Nueva Orden</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {pills.map(p => <button key={p} onClick={() => { setPill(p); filtrar(data, p) }} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '1px solid', borderColor: pill === p ? 'var(--eco-green)' : 'var(--eco-border)', background: pill === p ? 'var(--eco-green-dim)' : 'transparent', color: pill === p ? 'var(--eco-green)' : 'var(--eco-text-muted)', transition: 'all 200ms' }}>{p}</button>)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {resumen.map((r, i) => <div key={i} className="eco-card" style={{ cursor: 'default' }}>
                    <div style={{ fontSize: 12, color: 'var(--eco-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{r.label}</div>
                    <div className="sg" style={{ fontSize: 26, fontWeight: 700, color: r.color }}>{r.fmt ? r.fmt(r.val) : r.val}</div>
                </div>)}
            </div>

            <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="eco-table" style={{ minWidth: 900 }}>
                        <thead><tr><th>N° OS</th><th>Cliente</th><th>Tipo</th><th>Fecha</th><th>Km Estimados</th><th>Kg Reales</th><th>Vehículo</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan={9}><div style={{ height: 80, animation: 'ecoPulse 1.5s infinite', background: 'var(--eco-border)', margin: 12, borderRadius: 4 }} /></td></tr> :
                                filtrado.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--eco-text-muted)' }}>Sin órdenes</td></tr> :
                                    filtrado.map((o: any) => {
                                        const atrasada = o.fecha_programada < today && !['completado', 'cancelado'].includes(o.estado)
                                        return (
                                            <tr key={o.id}>
                                                <td className="sg" style={{ color: 'var(--eco-green)', fontWeight: 600 }}>{o.numero}</td>
                                                <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.eco_clientes?.razon_social}</td>
                                                <td>{ecoBadge(o.tipo_residuo)}</td>
                                                <td style={{ color: atrasada ? 'var(--eco-red)' : 'var(--eco-text-muted)', fontSize: 12 }}>{o.fecha_programada}</td>
                                                <td style={{ color: 'var(--eco-text-muted)' }}>{o.kg_estimados} kg</td>
                                                <td style={{ color: 'var(--eco-text-muted)' }}>{o.kg_reales ? o.kg_reales + ' kg' : '—'}</td>
                                                <td>{o.eco_flota?.placa ? <span className="sg" style={{ color: 'var(--eco-green)', fontSize: 12, fontWeight: 600 }}>{o.eco_flota.placa}</span> : <span style={{ background: 'var(--eco-red-dim)', color: 'var(--eco-red)', fontSize: 11, padding: '2px 6px', borderRadius: 8 }}>Sin asignar</span>}</td>
                                                <td>{ecoEstado(o.estado)}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button title="Ver detalle" onClick={() => { setSelected(o); setForm({}); setModal('detalle') }} style={{ padding: '4px 8px', background: 'var(--eco-surface2)', border: '1px solid var(--eco-border)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'var(--eco-text-muted)' }}>👁</button>
                                                        {!o.vehiculo_id && <button title="Asignar vehículo" onClick={() => { setSelected(o); setForm({}); setModal('vehiculo') }} style={{ padding: '4px 8px', background: 'var(--eco-green-dim)', border: '1px solid var(--eco-green)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: 'var(--eco-green)' }}>🚛</button>}
                                                        {['programado', 'en_ruta'].includes(o.estado) && <button title="Registrar recojo" onClick={() => { setSelected(o); setForm({}); setModal('recojo') }} style={{ padding: '4px 8px', background: 'var(--eco-blue-dim)', border: '1px solid var(--eco-blue)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: 'var(--eco-blue)' }}>✔</button>}
                                                    </div>
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
