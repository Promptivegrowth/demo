'use client'
import React, { useState, useEffect } from 'react'

const ECO_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHJ6cXJkenlrYnZoaWZzb3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTExMTQsImV4cCI6MjA4ODY2NzExNH0.8hwx4D0tbe8e8b9sFhG6shO7yLgM-3Q-ViZNkavC4iE'
const BASE = 'https://yvhrzqrdzykbvhifsoxk.supabase.co/rest/v1'
const H = { apikey: ECO_ANON, Authorization: `Bearer ${ECO_ANON}`, 'Content-Type': 'application/json' }

export default function TabEcoFlota({ showToast, ecoQuery }: any) {
    const [flota, setFlota] = useState<any[]>([])
    const [operarios, setOperarios] = useState<any[]>([])
    const [mantenimientos, setMantenimientos] = useState<any[]>([])
    const [tab, setTab] = useState<'flota' | 'personal'>('flota')
    const [modal, setModal] = useState<any>(null)
    const [selected, setSelected] = useState<any>(null)
    const [form, setForm] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    const today = new Date().toISOString().split('T')[0]
    const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

    const cargar = async () => {
        setLoading(true)
        const [f, o, m] = await Promise.all([
            ecoQuery('eco_flota', { select: '*', filters: ['order=placa.asc'] }),
            ecoQuery('eco_operarios', { select: '*', filters: ['order=apellidos.asc'] }),
            ecoQuery('eco_mantenimientos', { select: '*,eco_flota(placa)', filters: ['order=created_at.desc', 'limit=30'] }),
        ])
        setFlota(Array.isArray(f) ? f : [])
        setOperarios(Array.isArray(o) ? o : [])
        setMantenimientos(Array.isArray(m) ? m : [])
        setLoading(false)
    }

    useEffect(() => { cargar() }, [])

    const estadoFlotaColor: any = {
        disponible: ['var(--eco-green-dim)', 'var(--eco-green)', 'Disponible ✓'],
        en_ruta: ['var(--eco-yellow-dim)', 'var(--eco-yellow)', '⚡ En Ruta'],
        mantenimiento: ['var(--eco-red-dim)', 'var(--eco-red)', '🔧 Mant.'],
        inactivo: ['rgba(180,180,180,0.1)', '#aaa', 'Inactivo'],
    }

    const docStatus = (fecha: string) => {
        if (!fecha) return 'sin-doc'
        if (fecha < today) return 'vencido'
        if (fecha < in30) return 'por-vencer'
        return 'ok'
    }

    const docColor: any = { vencido: 'var(--eco-red)', 'por-vencer': 'var(--eco-yellow)', ok: 'var(--eco-green)', 'sin-doc': '#aaa' }

    const crearOperario = async () => {
        if (!form.nombres || !form.apellidos || !form.dni || !form.cargo) { showToast('Campos requeridos', 'error'); return }
        setSaving(true)
        const r = await fetch(`${BASE}/eco_operarios`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ nombres: form.nombres, apellidos: form.apellidos, dni: form.dni, cargo: form.cargo, telefono: form.telefono, estado: 'activo', venc_sanidad: form.venc_sanidad, venc_capacitacion: form.venc_capacitacion }) })
        if (r.ok) { showToast('Operario registrado', 'success'); setModal(null); cargar() }
        else showToast('Error al registrar. ¿DNI duplicado?', 'error')
        setSaving(false)
    }

    const crearVehiculo = async () => {
        if (!form.placa || !form.tipo) { showToast('Placa y tipo requeridos', 'error'); return }
        setSaving(true)
        const r = await fetch(`${BASE}/eco_flota`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ placa: form.placa.toUpperCase(), tipo: form.tipo, marca: form.marca, modelo: form.modelo, año: form.año ? Number(form.año) : null, capacidad_kg: form.capacidad_kg ? Number(form.capacidad_kg) : null, tipos_habilitados: form.tipos_habilitados ? form.tipos_habilitados.split(',').map((x: string) => x.trim()) : [], estado: 'disponible', km_actual: Number(form.km_actual || 0), venc_soat: form.venc_soat || null, venc_revision: form.venc_revision || null, venc_minem: form.venc_minem || null }) })
        if (r.ok) { showToast('Vehículo registrado', 'success'); setModal(null); cargar() }
        else showToast('Error al registrar. ¿Placa duplicada?', 'error')
        setSaving(false)
    }

    const registrarMantenimiento = async () => {
        if (!form.descripcion || !form.costo || !form.fecha) { showToast('Campos requeridos', 'error'); return }
        setSaving(true)
        const r = await fetch(`${BASE}/eco_mantenimientos`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ vehiculo_id: selected.id, fecha: form.fecha || today, tipo: form.tipo || 'preventivo', descripcion: form.descripcion, costo: Number(form.costo), km_registro: Number(form.km_registro || selected.km_actual) }) })
        if (r.ok) {
            if (form.nuevo_km) await fetch(`${BASE}/eco_flota?id=eq.${selected.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ km_actual: Number(form.nuevo_km), estado: 'disponible' }) })
            showToast('Mantenimiento registrado', 'success'); setModal(null); cargar()
        }
        setSaving(false)
    }

    const toggleEstadoVehiculo = async (v: any, estado: string) => {
        await fetch(`${BASE}/eco_flota?id=eq.${v.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ estado }) })
        showToast(`Vehículo ${estado === 'inactivo' ? 'inactivado' : 'disponible'}`, estado === 'inactivo' ? 'warning' : 'success')
        cargar()
    }

    const criticalVehicles = flota.filter(v => docStatus(v.venc_soat) !== 'ok' || docStatus(v.venc_revision) !== 'ok')
    const criticalOps = operarios.filter(o => docStatus(o.venc_sanidad) !== 'ok' || docStatus(o.venc_capacitacion) !== 'ok')

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Nuevo Vehículo Modal */}
            {modal === 'nuevo-vehiculo' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 640, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16 }}>Nuevo Vehículo</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div><label className="eco-label">Placa *</label><input className="eco-input" placeholder="ABC-123" style={{ textTransform: 'uppercase' }} onChange={e => setForm({ ...form, placa: e.target.value })} /></div>
                            <div><label className="eco-label">Tipo *</label>
                                <select className="eco-select" onChange={e => setForm({ ...form, tipo: e.target.value })}>
                                    <option value="">Seleccione...</option>
                                    {['Compactador', 'Furgón', 'Volquete', 'Camioneta', 'Cisterna'].map(t => <option key={t}>{t}</option>)}
                                </select></div>
                            <div><label className="eco-label">Marca</label><input className="eco-input" onChange={e => setForm({ ...form, marca: e.target.value })} /></div>
                            <div><label className="eco-label">Modelo</label><input className="eco-input" onChange={e => setForm({ ...form, modelo: e.target.value })} /></div>
                            <div><label className="eco-label">Año</label><input className="eco-input" type="number" min="1990" max="2025" onChange={e => setForm({ ...form, año: e.target.value })} /></div>
                            <div><label className="eco-label">Capacidad (kg)</label><input className="eco-input" type="number" onChange={e => setForm({ ...form, capacidad_kg: e.target.value })} /></div>
                            <div><label className="eco-label">Km Actuales</label><input className="eco-input" type="number" onChange={e => setForm({ ...form, km_actual: e.target.value })} /></div>
                            <div><label className="eco-label">Tipos Habilitados (separados por ,)</label><input className="eco-input" placeholder="municipal, hospitalario..." onChange={e => setForm({ ...form, tipos_habilitados: e.target.value })} /></div>
                            <div><label className="eco-label">Vencimiento SOAT</label><input className="eco-input" type="date" onChange={e => setForm({ ...form, venc_soat: e.target.value })} /></div>
                            <div><label className="eco-label">Vencimiento Rev. Técnica</label><input className="eco-input" type="date" onChange={e => setForm({ ...form, venc_revision: e.target.value })} /></div>
                            <div><label className="eco-label">Vencimiento Credencial MINEM</label><input className="eco-input" type="date" onChange={e => setForm({ ...form, venc_minem: e.target.value })} /></div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={crearVehiculo}>Registrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Nuevo Operario Modal */}
            {modal === 'nuevo-operario' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 600, maxWidth: '95vw', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16 }}>Nuevo Operario</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div><label className="eco-label">Nombres *</label><input className="eco-input" onChange={e => setForm({ ...form, nombres: e.target.value })} /></div>
                            <div><label className="eco-label">Apellidos *</label><input className="eco-input" onChange={e => setForm({ ...form, apellidos: e.target.value })} /></div>
                            <div><label className="eco-label">DNI *</label><input className="eco-input" maxLength={8} onChange={e => setForm({ ...form, dni: e.target.value })} /></div>
                            <div><label className="eco-label">Cargo *</label>
                                <select className="eco-select" onChange={e => setForm({ ...form, cargo: e.target.value })}>
                                    <option value="">Seleccione...</option>
                                    {['conductor', 'ayudante', 'supervisor', 'operador'].map(c => <option key={c}>{c}</option>)}
                                </select></div>
                            <div><label className="eco-label">Teléfono</label><input className="eco-input" onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
                            <div><label className="eco-label">Venc. Carnet Sanidad</label><input className="eco-input" type="date" onChange={e => setForm({ ...form, venc_sanidad: e.target.value })} /></div>
                            <div><label className="eco-label">Venc. Capacitación MINEM</label><input className="eco-input" type="date" onChange={e => setForm({ ...form, venc_capacitacion: e.target.value })} /></div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={crearOperario}>Registrar Operario</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mantenimiento Modal */}
            {modal === 'mantenimiento' && selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 540, maxWidth: '95vw', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16 }}>Registrar Mantenimiento — {selected.placa}</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label className="eco-label">Fecha *</label><input className="eco-input" type="date" defaultValue={today} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>
                                <div><label className="eco-label">Tipo</label>
                                    <select className="eco-select" onChange={e => setForm({ ...form, tipo: e.target.value })}>
                                        {['preventivo', 'correctivo', 'predictivo', 'legal'].map(t => <option key={t}>{t}</option>)}
                                    </select></div>
                                <div><label className="eco-label">Km al momento</label><input className="eco-input" type="number" defaultValue={selected.km_actual} onChange={e => setForm({ ...form, km_registro: e.target.value })} /></div>
                                <div><label className="eco-label">Nuevos Km actuales</label><input className="eco-input" type="number" onChange={e => setForm({ ...form, nuevo_km: e.target.value })} /></div>
                            </div>
                            <div><label className="eco-label">Descripción del Trabajo *</label><textarea className="eco-input" rows={2} style={{ resize: 'none' }} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
                            <div><label className="eco-label">Costo Total S/. *</label><input className="eco-input" type="number" step="0.01" onChange={e => setForm({ ...form, costo: e.target.value })} /></div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={registrarMantenimiento}>Registrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="sg" style={{ fontSize: 20, fontWeight: 600 }}>Flota & Personal</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    {tab === 'flota' ? <button className="eco-btn-primary" onClick={() => { setForm({}); setModal('nuevo-vehiculo') }}>+ Nuevo Vehículo</button>
                        : <button className="eco-btn-primary" onClick={() => { setForm({}); setModal('nuevo-operario') }}>+ Nuevo Operario</button>}
                </div>
            </div>

            {/* KPIs */}
            {tab === 'flota' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                        { label: 'Disponibles', val: flota.filter(v => v.estado === 'disponible').length, color: 'var(--eco-green)' },
                        { label: 'En Ruta', val: flota.filter(v => v.estado === 'en_ruta').length, color: 'var(--eco-yellow)' },
                        { label: 'En Mantenimiento', val: flota.filter(v => v.estado === 'mantenimiento').length, color: 'var(--eco-red)' },
                        { label: 'Con DOC Crítico', val: criticalVehicles.length, color: criticalVehicles.length > 0 ? 'var(--eco-red)' : 'var(--eco-green)' },
                    ].map((k, i) => <div key={i} className="eco-card" style={{ cursor: 'default' }}>
                        <div style={{ fontSize: 12, color: 'var(--eco-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{k.label}</div>
                        <div className="sg" style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.val}</div>
                    </div>)}
                </div>
            )}

            {/* Sub-tab */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'var(--eco-surface)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
                {(['flota', 'personal'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: tab === t ? 'var(--eco-green)' : 'transparent', color: tab === t ? '#0a0f0d' : 'var(--eco-text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 200ms' }}>
                        {t === 'flota' ? '🚛 Vehículos' : '👷 Personal'}
                    </button>
                ))}
            </div>

            {/* FLOTA TABLE */}
            {tab === 'flota' && (
                <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="eco-table" style={{ minWidth: 1000 }}>
                            <thead><tr><th>Placa</th><th>Tipo</th><th>Marca / Modelo</th><th>Capacidad</th><th>Km</th><th>SOAT</th><th>Rev. Técn.</th><th>Cred. MINEM</th><th>Estado</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {loading ? <tr><td colSpan={10}><div style={{ height: 80, animation: 'ecoPulse 1.5s infinite', background: 'var(--eco-border)', margin: 12, borderRadius: 4 }} /></td></tr> :
                                    flota.map((v: any) => {
                                        const soatS = docStatus(v.venc_soat); const revS = docStatus(v.venc_revision); const minemS = v.venc_minem ? docStatus(v.venc_minem) : 'sin-doc'
                                        const [bg, c, l] = estadoFlotaColor[v.estado] || ['rgba(180,180,180,0.1)', '#aaa', v.estado]
                                        return (
                                            <tr key={v.id}>
                                                <td className="sg" style={{ color: 'var(--eco-green)', fontWeight: 700, fontSize: 14 }}>{v.placa}</td>
                                                <td><span style={{ background: 'var(--eco-blue-dim)', color: 'var(--eco-blue)', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{v.tipo}</span></td>
                                                <td style={{ color: 'var(--eco-text-muted)' }}>{v.marca} {v.modelo}</td>
                                                <td style={{ color: 'var(--eco-text-muted)' }}>{v.capacidad_kg ? v.capacidad_kg.toLocaleString('es-PE') + ' kg' : '—'}</td>
                                                <td style={{ color: 'var(--eco-text-muted)', fontSize: 12 }}>{Number(v.km_actual || 0).toLocaleString('es-PE')}</td>
                                                <td><span style={{ color: docColor[soatS], fontWeight: 600, fontSize: 12 }}>{soatS === 'vencido' ? '🔴 ' : soatS === 'por-vencer' ? '🟡 ' : '🟢 '}{v.venc_soat || '—'}</span></td>
                                                <td><span style={{ color: docColor[revS], fontWeight: 600, fontSize: 12 }}>{revS === 'vencido' ? '🔴 ' : revS === 'por-vencer' ? '🟡 ' : '🟢 '}{v.venc_revision || '—'}</span></td>
                                                <td><span style={{ color: docColor[minemS], fontSize: 12 }}>{v.venc_minem || 'N/A'}</span></td>
                                                <td><span style={{ background: bg, color: c, fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{l}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button title="Registrar Mantenimiento" onClick={() => { setSelected(v); setForm({}); setModal('mantenimiento') }} style={{ padding: '4px 8px', background: 'var(--eco-yellow-dim)', border: '1px solid var(--eco-yellow)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'var(--eco-yellow)' }}>🔧</button>
                                                        {v.estado !== 'mantenimiento' && <button title="Enviar a Mantenimiento" onClick={() => { if (confirm('¿Enviar a mantenimiento?')) { setSelected(v); setForm({}); setModal('mantenimiento'); fetch(`${BASE}/eco_flota?id=eq.${v.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ estado: 'mantenimiento' }) }).then(cargar) } }} style={{ padding: '4px 8px', background: 'var(--eco-red-dim)', border: '1px solid var(--eco-red)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'var(--eco-red)' }}>⚠</button>}
                                                        {v.estado === 'mantenimiento' && <button title="Marcar disponible" onClick={() => toggleEstadoVehiculo(v, 'disponible')} style={{ padding: '4px 8px', background: 'var(--eco-green-dim)', border: '1px solid var(--eco-green)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'var(--eco-green)' }}>✓</button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </table>
                    </div>

                    {/* Historial Mantenimiento */}
                    <div style={{ padding: 20, borderTop: '1px solid var(--eco-border)' }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'var(--eco-text)' }}>📋 Últimos Mantenimientos</div>
                        <table className="eco-table">
                            <thead><tr><th>Vehículo</th><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Costo</th></tr></thead>
                            <tbody>
                                {mantenimientos.slice(0, 8).map((m: any) => (
                                    <tr key={m.id}><td className="sg" style={{ color: 'var(--eco-green)' }}>{m.eco_flota?.placa}</td><td style={{ fontSize: 12, color: 'var(--eco-text-muted)' }}>{m.fecha}</td><td><span style={{ background: 'var(--eco-yellow-dim)', color: 'var(--eco-yellow)', fontSize: 11, padding: '2px 6px', borderRadius: 8 }}>{m.tipo}</span></td><td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{m.descripcion}</td><td style={{ color: 'var(--eco-green)', fontWeight: 600 }}>S/ {Number(m.costo || 0).toFixed(2)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PERSONAL TABLE */}
            {tab === 'personal' && (
                <div>
                    {criticalOps.length > 0 && (
                        <div style={{ background: 'var(--eco-red-dim)', borderLeft: '4px solid var(--eco-red)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                            <span style={{ color: 'var(--eco-red)', fontSize: 14 }}>⚠ {criticalOps.length} operarios con documentación próxima a vencer o vencida</span>
                        </div>
                    )}
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 12, overflow: 'hidden' }}>
                        <table className="eco-table">
                            <thead><tr><th>Apellidos</th><th>Nombres</th><th>DNI</th><th>Cargo</th><th>Teléfono</th><th>Carnet Sanidad</th><th>Cap. MINEM</th><th>Estado</th></tr></thead>
                            <tbody>
                                {loading ? <tr><td colSpan={8}><div style={{ height: 80, animation: 'ecoPulse 1.5s infinite', background: 'var(--eco-border)', margin: 12, borderRadius: 4 }} /></td></tr> :
                                    operarios.map((o: any) => {
                                        const sanS = docStatus(o.venc_sanidad); const capS = docStatus(o.venc_capacitacion)
                                        const cargoColor: any = { conductor: 'var(--eco-blue)', ayudante: 'var(--eco-green)', supervisor: 'var(--eco-yellow)', operador: 'var(--eco-purple)' }
                                        return (
                                            <tr key={o.id}>
                                                <td style={{ fontWeight: 500 }}>{o.apellidos}</td>
                                                <td>{o.nombres}</td>
                                                <td className="sg" style={{ fontSize: 12, color: 'var(--eco-text-muted)' }}>{o.dni}</td>
                                                <td><span style={{ background: (cargoColor[o.cargo] || '#aaa').replace(')', '-dim').replace('var(--eco-', 'var(--eco-'), color: cargoColor[o.cargo] || '#aaa', fontSize: 11, padding: '2px 8px', borderRadius: 10, display: 'inline-block' }}>{o.cargo}</span></td>
                                                <td style={{ fontSize: 12, color: 'var(--eco-text-muted)' }}>{o.telefono || '—'}</td>
                                                <td><span style={{ color: docColor[sanS], fontWeight: 600, fontSize: 12 }}>{sanS === 'vencido' ? '🔴 ' : sanS === 'por-vencer' ? '🟡 ' : '🟢 '}{o.venc_sanidad || '—'}</span></td>
                                                <td><span style={{ color: docColor[capS], fontWeight: 600, fontSize: 12 }}>{capS === 'vencido' ? '🔴 ' : capS === 'por-vencer' ? '🟡 ' : '🟢 '}{o.venc_capacitacion || '—'}</span></td>
                                                <td>{o.estado === 'activo' ? <span style={{ background: 'var(--eco-green-dim)', color: 'var(--eco-green)', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>Activo</span> : <span style={{ fontSize: 11, color: '#aaa' }}>Inactivo</span>}</td>
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
