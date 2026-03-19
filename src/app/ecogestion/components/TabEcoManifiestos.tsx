'use client'
import React, { useState, useEffect } from 'react'

const ECO_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHJ6cXJkenlrYnZoaWZzb3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTExMTQsImV4cCI6MjA4ODY2NzExNH0.8hwx4D0tbe8e8b9sFhG6shO7yLgM-3Q-ViZNkavC4iE'
const BASE = 'https://yvhrzqrdzykbvhifsoxk.supabase.co/rest/v1'
const H = { apikey: ECO_ANON, Authorization: `Bearer ${ECO_ANON}`, 'Content-Type': 'application/json' }

export default function TabEcoManifiestos({ showToast, ecoQuery }: any) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState<any>(null)
    const [selected, setSelected] = useState<any>(null)
    const [form, setForm] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [ordenesSinManifiesto, setOrdenesSinManifiesto] = useState<any[]>([])

    const today = new Date().toISOString().split('T')[0]

    const cargar = async () => {
        setLoading(true)
        const [r, ords] = await Promise.all([
            ecoQuery('eco_manifiestos', { select: '*,eco_clientes(razon_social),eco_ordenes(numero)', filters: ['order=created_at.desc'] }),
            ecoQuery('eco_ordenes', { select: 'id,numero,tipo_residuo,kg_estimados,cliente_id', filters: ['requiere_manifiesto=eq.true', 'order=created_at.desc'] }),
        ])
        const manifArr = Array.isArray(r) ? r : []
        setData(manifArr)
        const manifOrdIds = new Set(manifArr.map((m: any) => m.orden_id))
        setOrdenesSinManifiesto((Array.isArray(ords) ? ords : []).filter((o: any) => !manifOrdIds.has(o.id)))
        setLoading(false)
    }

    useEffect(() => { cargar() }, [])

    const diasActivo = (fecha: string) => Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000)

    const estadosBadge: any = {
        generado: ['var(--eco-blue-dim)', 'var(--eco-blue)', 'Generado'],
        en_transporte: ['var(--eco-yellow-dim)', 'var(--eco-yellow)', 'En Transporte'],
        recibido: ['var(--eco-green-dim)', 'var(--eco-green)', 'Recibido'],
        disposicion_final: ['var(--eco-green-dim)', 'var(--eco-green)', 'Disposición Final'],
        cerrado: ['rgba(180,180,180,0.05)', '#aaa', 'Cerrado ✓'],
    }

    const siguienteEstado: any = { generado: 'en_transporte', en_transporte: 'recibido', recibido: 'disposicion_final', disposicion_final: 'cerrado' }
    const titulosAvance: any = { en_transporte: 'Confirmar Salida a Transporte', recibido: 'Confirmar Recepción en Planta', disposicion_final: 'Registrar Disposición Final', cerrado: 'Cerrar Manifiesto' }

    const avanzarEstado = async () => {
        if (!selected) return
        const sig = siguienteEstado[selected.estado]
        setSaving(true)
        const body: any = { estado: sig }
        if (sig === 'disposicion_final') { body.empresa_disposicion = form.empresa; body.numero_certificado = form.certificado; body.fecha_disposicion = form.fecha_disposicion }
        if (sig === 'cerrado') { if (!form.num_minem) { showToast('N° Registro MINEM requerido', 'error'); setSaving(false); return } body.numero_certificado = form.num_minem }
        await fetch(`${BASE}/eco_manifiestos?id=eq.${selected.id}`, { method: 'PATCH', headers: H, body: JSON.stringify(body) })
        showToast(`Manifiesto ${selected.numero}: ${sig}`, 'success')
        setModal(null); cargar()
        setSaving(false)
    }

    const crearManifiesto = async () => {
        if (!form.orden_id || !form.descripcion) { showToast('Complete los campos requeridos', 'error'); return }
        setSaving(true)
        const maxR = await ecoQuery('eco_manifiestos', { select: 'numero', filters: ['order=numero.desc', 'limit=1'] })
        const last = Array.isArray(maxR) && maxR[0] ? parseInt(maxR[0].numero.split('-')[1]) : 0
        const numero = 'MAN-' + String(last + 1).padStart(4, '0')
        const orden = ordenesSinManifiesto.find((o: any) => o.id === form.orden_id)
        const r = await fetch(`${BASE}/eco_manifiestos`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ numero, orden_id: form.orden_id, cliente_id: orden?.cliente_id, tipo_residuo: form.tipo_residuo || orden?.tipo_residuo, codigo_residuo: form.codigo_residuo, descripcion: form.descripcion, cantidad_kg: form.cantidad_kg || orden?.kg_estimados, empresa_disposicion: form.empresa_disposicion, fecha_generacion: today, estado: 'generado' }) })
        if (r.ok) { showToast(`Manifiesto ${numero} generado`, 'success'); setModal(null); cargar() }
        else showToast('Error al generar manifiesto', 'error')
        setSaving(false)
    }

    const criticos = data.filter((m: any) => diasActivo(m.fecha_generacion) > 30 && m.estado !== 'cerrado')
    const resumen = [
        { label: 'Manifiestos Activos', val: data.filter((m: any) => m.estado !== 'cerrado').length, color: 'var(--eco-yellow)' },
        { label: 'Pendientes Transporte', val: data.filter((m: any) => m.estado === 'generado').length, color: 'var(--eco-blue)' },
        { label: 'En Proceso', val: data.filter((m: any) => ['en_transporte', 'recibido'].includes(m.estado)).length, color: 'var(--eco-green)' },
        { label: 'Sin cerrar >30 días', val: criticos.length, color: 'var(--eco-red)' },
    ]

    const etapas = ['generado', 'en_transporte', 'recibido', 'disposicion_final', 'cerrado']
    const etapaLabels = ['Generado', 'En Transporte', 'Recibido', 'Disp. Final', 'Cerrado']

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Modal Nuevo Manifiesto */}
            {modal === 'nuevo' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 600, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16 }}>Generar Manifiesto</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div><label className="eco-label">Orden de Servicio *</label>
                                <select className="eco-select" onChange={e => { const o = ordenesSinManifiesto.find((x: any) => x.id === e.target.value); setForm({ ...form, orden_id: e.target.value, tipo_residuo: o?.tipo_residuo, cantidad_kg: o?.kg_estimados }) }}>
                                    <option value="">Seleccione OS con manifiesto requerido...</option>
                                    {ordenesSinManifiesto.map((o: any) => <option key={o.id} value={o.id}>{o.numero} — {o.tipo_residuo}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label className="eco-label">Código Residuo MINEM</label><input className="eco-input" placeholder="Ej: A4-210" onChange={e => setForm({ ...form, codigo_residuo: e.target.value })} /></div>
                                <div><label className="eco-label">Kg</label><input className="eco-input" type="number" value={form.cantidad_kg || ''} onChange={e => setForm({ ...form, cantidad_kg: Number(e.target.value) })} /></div>
                            </div>
                            <div><label className="eco-label">Descripción del Residuo *</label><textarea className="eco-input" rows={2} style={{ resize: 'none' }} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label className="eco-label">Empresa de Disposición Final</label><input className="eco-input" onChange={e => setForm({ ...form, empresa_disposicion: e.target.value })} /></div>
                                <div><label className="eco-label">Fecha Programada Disposición</label><input className="eco-input" type="date" onChange={e => setForm({ ...form, fecha_disposicion: e.target.value })} /></div>
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={crearManifiesto}>{saving ? 'Generando...' : 'Generar Manifiesto'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Avanzar Estado */}
            {modal === 'avanzar' && selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 500, maxWidth: '95vw', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16 }}>{titulosAvance[siguienteEstado[selected.estado]]}</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {siguienteEstado[selected.estado] === 'en_transporte' && (<>
                                <div><label className="eco-label">Hora de salida</label><input className="eco-input" type="time" defaultValue={new Date().toTimeString().slice(0, 5)} onChange={e => setForm({ ...form, hora: e.target.value })} /></div>
                                <div><label className="eco-label">Nombre del transportista</label><input className="eco-input" onChange={e => setForm({ ...form, transportista: e.target.value })} /></div>
                            </>)}
                            {siguienteEstado[selected.estado] === 'recibido' && (<>
                                <div><label className="eco-label">Fecha de recepción</label><input className="eco-input" type="date" defaultValue={today} onChange={e => setForm({ ...form, fecha_rec: e.target.value })} /></div>
                                <div><label className="eco-label">Nombre del receptor</label><input className="eco-input" onChange={e => setForm({ ...form, receptor: e.target.value })} /></div>
                            </>)}
                            {siguienteEstado[selected.estado] === 'disposicion_final' && (<>
                                <div><label className="eco-label">Empresa de Disposición</label><input className="eco-input" onChange={e => setForm({ ...form, empresa: e.target.value })} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div><label className="eco-label">N° Certificado</label><input className="eco-input" onChange={e => setForm({ ...form, certificado: e.target.value })} /></div>
                                    <div><label className="eco-label">Fecha</label><input className="eco-input" type="date" defaultValue={today} onChange={e => setForm({ ...form, fecha_disposicion: e.target.value })} /></div>
                                </div>
                            </>)}
                            {siguienteEstado[selected.estado] === 'cerrado' && (<>
                                <div style={{ background: 'var(--eco-surface2)', borderRadius: 8, padding: 10, fontSize: 13, color: 'var(--eco-text-muted)' }}>Al cerrar este manifiesto, el proceso legal quedará completado.</div>
                                <div><label className="eco-label">N° de Registro MINEM *</label><input className="eco-input" onChange={e => setForm({ ...form, num_minem: e.target.value })} /></div>
                            </>)}
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={avanzarEstado}>{saving ? 'Guardando...' : 'Confirmar'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalle */}
            {modal === 'detalle' && selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 680, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16, color: 'var(--eco-green)' }}>{selected.numero}</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                            {/* Timeline */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, overflowX: 'auto' }}>
                                {etapas.map((e, i) => {
                                    const idx = etapas.indexOf(selected.estado)
                                    const done = i < idx; const current = i === idx
                                    return (
                                        <React.Fragment key={e}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? 'var(--eco-green-dark)' : current ? 'var(--eco-green)' : 'var(--eco-surface2)', border: `2px solid ${done || current ? 'var(--eco-green)' : 'var(--eco-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: done ? 'white' : current ? '#0a0f0d' : 'var(--eco-text-muted)', fontWeight: 700 }}>
                                                    {done ? '✓' : i + 1}
                                                </div>
                                                <div style={{ fontSize: 9, marginTop: 4, color: current ? 'var(--eco-green)' : 'var(--eco-text-muted)', textAlign: 'center' }}>{etapaLabels[i]}</div>
                                            </div>
                                            {i < etapas.length - 1 && <div style={{ flex: 1, height: 2, background: done ? 'var(--eco-green)' : 'var(--eco-border)', minWidth: 20 }} />}
                                        </React.Fragment>
                                    )
                                })}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                {[['Código Residuo', selected.codigo_residuo], ['Tipo Residuo', selected.tipo_residuo], ['Kg', selected.cantidad_kg], ['Empresa Disposición', selected.empresa_disposicion], ['F. Generación', selected.fecha_generacion], ['F. Disposición', selected.fecha_disposicion || '—'], ['OS Vinculada', selected.eco_ordenes?.numero], ['Cliente', selected.eco_clientes?.razon_social]].map(([k, v]) => (
                                    <div key={k} style={{ background: 'var(--eco-surface2)', borderRadius: 8, padding: 10 }}>
                                        <div style={{ fontSize: 11, color: 'var(--eco-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                                        <div style={{ fontSize: 13 }}>{v || '—'}</div>
                                    </div>
                                ))}
                            </div>
                            {selected.estado === 'cerrado' && selected.numero_certificado && (
                                <div style={{ background: 'var(--eco-green-dim)', border: '1px solid var(--eco-green)', borderRadius: 8, padding: 12, fontSize: 14, color: 'var(--eco-green)', fontWeight: 600 }}>
                                    ✓ Certificado: {selected.numero_certificado}
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cerrar</button>
                            {selected.estado !== 'cerrado' && <button className="eco-btn-primary" onClick={() => { setForm({}); setModal('avanzar') }}>Avanzar Estado →</button>}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="sg" style={{ fontSize: 20, fontWeight: 600 }}>Manifiestos MINEM</span>
                <button className="eco-btn-primary" onClick={() => { setForm({}); setModal('nuevo') }}>+ Generar Manifiesto</button>
            </div>

            {criticos.length > 0 && (
                <div style={{ background: 'var(--eco-red-dim)', borderLeft: '4px solid var(--eco-red)', borderRadius: 8, padding: '14px 20px', marginBottom: 16 }}>
                    <span style={{ color: 'var(--eco-red)', fontSize: 14 }}>⚠ Tienes {criticos.length} manifiestos con más de 30 días sin cerrar. Esto puede generar observaciones de MINEM.</span>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {resumen.map((r, i) => <div key={i} className="eco-card" style={{ cursor: 'default', borderColor: r.label.includes('30 días') && r.val > 0 ? 'var(--eco-red)' : undefined }}>
                    <div style={{ fontSize: 12, color: 'var(--eco-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{r.label}</div>
                    <div className="sg" style={{ fontSize: 28, fontWeight: 700, color: r.color }}>{r.val}</div>
                </div>)}
            </div>

            <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="eco-table" style={{ minWidth: 900 }}>
                        <thead><tr><th>N° Manifiesto</th><th>N° OS</th><th>Cliente</th><th>Tipo</th><th>Kg</th><th>Empresa</th><th>F. Generación</th><th>Días</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan={10}><div style={{ height: 80, animation: 'ecoPulse 1.5s infinite', background: 'var(--eco-border)', margin: 12, borderRadius: 4 }} /></td></tr> :
                                data.length === 0 ? <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'var(--eco-text-muted)' }}>Sin manifiestos</td></tr> :
                                    data.map((m: any) => {
                                        const dias = diasActivo(m.fecha_generacion)
                                        const critico = dias > 30 && m.estado !== 'cerrado'
                                        const [bg, c, t] = estadosBadge[m.estado] || ['rgba(180,180,180,0.1)', '#aaa', m.estado]
                                        return (
                                            <tr key={m.id}>
                                                <td className="sg" style={{ color: 'var(--eco-green)', fontWeight: 600 }}>{m.numero}</td>
                                                <td style={{ color: 'var(--eco-text-muted)', fontSize: 12 }}>{m.eco_ordenes?.numero}</td>
                                                <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.eco_clientes?.razon_social}</td>
                                                <td><span style={{ background: 'var(--eco-purple-dim)', color: 'var(--eco-purple)', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{m.tipo_residuo}</span></td>
                                                <td style={{ color: 'var(--eco-text-muted)' }}>{m.cantidad_kg} kg</td>
                                                <td style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--eco-text-muted)' }}>{m.empresa_disposicion || '—'}</td>
                                                <td style={{ fontSize: 12, color: 'var(--eco-text-muted)' }}>{m.fecha_generacion}</td>
                                                <td style={{ fontWeight: critico ? 700 : 400, color: critico ? 'var(--eco-red)' : 'var(--eco-text-muted)', fontSize: 13 }}>{dias}d</td>
                                                <td><span style={{ background: bg, color: c, fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{t}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button onClick={() => { setSelected(m); setForm({}); setModal('detalle') }} style={{ padding: '4px 8px', background: 'var(--eco-surface2)', border: '1px solid var(--eco-border)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'var(--eco-text-muted)' }}>👁</button>
                                                        {m.estado !== 'cerrado' && <button onClick={() => { setSelected(m); setForm({}); setModal('avanzar') }} style={{ padding: '4px 8px', background: 'var(--eco-green-dim)', border: '1px solid var(--eco-green)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: 'var(--eco-green)' }}>→</button>}
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
