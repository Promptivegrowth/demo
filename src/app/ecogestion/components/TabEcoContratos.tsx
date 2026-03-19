'use client'
import React, { useState, useEffect } from 'react'

const ECO_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHJ6cXJkenlrYnZoaWZzb3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTExMTQsImV4cCI6MjA4ODY2NzExNH0.8hwx4D0tbe8e8b9sFhG6shO7yLgM-3Q-ViZNkavC4iE'
const ECO_BASE = 'https://yvhrzqrdzykbvhifsoxk.supabase.co/rest/v1'
const h = { apikey: ECO_ANON, Authorization: `Bearer ${ECO_ANON}`, 'Content-Type': 'application/json' }

export default function TabEcoContratos({ showToast, ecoQuery }: any) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState<any>(null)
    const [detalle, setDetalle] = useState<any>(null)
    const [form, setForm] = useState<any>({})
    const [clientes, setClientes] = useState<any[]>([])
    const [saving, setSaving] = useState(false)

    const cargar = async () => {
        setLoading(true)
        const r = await ecoQuery('eco_contratos', { select: '*,eco_clientes(razon_social,ruc)', filters: ['order=created_at.desc'] })
        setData(Array.isArray(r) ? r : [])
        setLoading(false)
    }

    useEffect(() => {
        cargar()
        ecoQuery('eco_clientes', { select: 'id,razon_social', filters: ['estado=eq.activo', 'order=razon_social.asc'] }).then((r: any) => setClientes(Array.isArray(r) ? r : []))
    }, [])

    const today = new Date().toISOString().split('T')[0]
    const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

    const estadoVenc = (fecha: string) => {
        if (!fecha) return ''
        if (fecha < today) return 'vencido'
        if (fecha < in30) return 'por_vencer'
        return 'ok'
    }

    const verDetalle = async (c: any) => {
        const [ords, cuentas] = await Promise.all([
            ecoQuery('eco_ordenes', { select: 'numero,fecha_programada,estado,tipo_residuo', filters: [`contrato_id=eq.${c.id}`, 'limit=5', 'order=created_at.desc'] }),
            ecoQuery('eco_cuentas', { select: 'monto_total,estado', filters: [`cliente_id=eq.${c.cliente_id}`] }),
        ])
        const total = (Array.isArray(cuentas) ? cuentas : []).reduce((s: number, x: any) => s + Number(x.monto_total || 0), 0)
        setDetalle({ contrato: c, ordenes: Array.isArray(ords) ? ords : [], totalFacturado: total })
        setModal('detalle')
    }

    const renovar = async () => {
        if (!form.fecha_inicio || !form.fecha_fin) { showToast('Fechas requeridas', 'error'); return }
        setSaving(true)
        const cont = detalle?.contrato
        if (!cont) return
        // Patch old
        await fetch(`${ECO_BASE}/eco_contratos?id=eq.${cont.id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ estado: 'vencido' }) })
        // Get next number
        const maxR = await ecoQuery('eco_contratos', { select: 'numero', filters: ['order=numero.desc', 'limit=1'] })
        const last = Array.isArray(maxR) && maxR[0] ? parseInt(maxR[0].numero.split('-')[1]) : 0
        const nuevoNumero = 'CONT-' + String(last + 1).padStart(4, '0')
        const payload = { numero: nuevoNumero, cliente_id: cont.cliente_id, fecha_inicio: form.fecha_inicio, fecha_fin: form.fecha_fin, tipo_residuo: cont.tipo_residuo, frecuencia: cont.frecuencia, precio: form.precio || cont.precio, modalidad: cont.modalidad, estado: 'vigente' }
        const nr = await fetch(`${ECO_BASE}/eco_contratos`, { method: 'POST', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify(payload) })
        if (nr.ok) { showToast(`Contrato renovado: ${nuevoNumero}`, 'success'); setModal(null); cargar() }
        else showToast('Error al renovar', 'error')
        setSaving(false)
    }

    const suspender = async () => {
        if (!form.motivo || form.motivo.length < 5) { showToast('Motivo requerido', 'error'); return }
        const cont = detalle?.contrato
        await fetch(`${ECO_BASE}/eco_contratos?id=eq.${cont.id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ estado: 'suspendido' }) })
        showToast('Contrato suspendido', 'warning')
        setModal(null); cargar()
    }

    const guardarNuevo = async () => {
        if (!form.cliente_id || !form.tipo_residuo || !form.fecha_inicio || !form.fecha_fin) { showToast('Complete todos los campos requeridos', 'error'); return }
        setSaving(true)
        const maxR = await ecoQuery('eco_contratos', { select: 'numero', filters: ['order=numero.desc', 'limit=1'] })
        const last = Array.isArray(maxR) && maxR[0] ? parseInt(maxR[0].numero.split('-')[1]) : 0
        const numero = 'CONT-' + String(last + 1).padStart(4, '0')
        const r = await fetch(`${ECO_BASE}/eco_contratos`, { method: 'POST', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify({ ...form, numero, estado: 'vigente' }) })
        if (r.ok) { showToast('Contrato creado: ' + numero, 'success'); setModal(null); cargar() }
        else showToast('Error al crear', 'error')
        setSaving(false)
    }

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* New Contract Modal */}
            {modal === 'nuevo' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 600, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16, color: 'var(--eco-text)' }}>Nuevo Contrato</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={{ gridColumn: '1/-1' }}>
                                <label className="eco-label">Cliente *</label>
                                <select className="eco-select" value={form.cliente_id || ''} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
                                    <option value="">Seleccione...</option>
                                    {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                                </select>
                            </div>
                            <div><label className="eco-label">Tipo de Residuo *</label>
                                <select className="eco-select" value={form.tipo_residuo || ''} onChange={e => setForm({ ...form, tipo_residuo: e.target.value })}>
                                    <option value="">Seleccione...</option>
                                    {['municipal', 'peligroso', 'hospitalario', 'desmonte'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div><label className="eco-label">Frecuencia</label>
                                <select className="eco-select" value={form.frecuencia || ''} onChange={e => setForm({ ...form, frecuencia: e.target.value })}>
                                    {['Diaria', 'Interdiaria', 'Semanal', 'Quincenal', 'Por requerimiento'].map(f => <option key={f}>{f}</option>)}
                                </select>
                            </div>
                            <div><label className="eco-label">Fecha Inicio *</label>
                                <input className="eco-input" type="date" value={form.fecha_inicio || ''} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} />
                            </div>
                            <div><label className="eco-label">Fecha Fin *</label>
                                <input className="eco-input" type="date" value={form.fecha_fin || ''} onChange={e => setForm({ ...form, fecha_fin: e.target.value })} />
                            </div>
                            <div><label className="eco-label">Precio S/.</label>
                                <input className="eco-input" type="number" value={form.precio || ''} onChange={e => setForm({ ...form, precio: e.target.value })} />
                            </div>
                            <div><label className="eco-label">Modalidad</label>
                                <select className="eco-select" value={form.modalidad || ''} onChange={e => setForm({ ...form, modalidad: e.target.value })}>
                                    {['mensual', 'por-servicio', 'anual'].map(m => <option key={m}>{m}</option>)}
                                </select>
                            </div>
                            <div style={{ gridColumn: '1/-1' }}><label className="eco-label">Observaciones</label>
                                <textarea className="eco-input" rows={2} value={form.observaciones || ''} onChange={e => setForm({ ...form, observaciones: e.target.value })} style={{ resize: 'none' }} />
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={guardarNuevo}>{saving ? 'Guardando...' : 'Crear Contrato'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detalle Modal */}
            {modal === 'detalle' && detalle && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 680, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16, color: 'var(--eco-text)' }}>Contrato {detalle.contrato.numero}</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                                {[['Cliente', detalle.contrato.eco_clientes?.razon_social], ['Tipo de Residuo', detalle.contrato.tipo_residuo], ['Frecuencia', detalle.contrato.frecuencia], ['Precio S/.', detalle.contrato.precio], ['Inicio', detalle.contrato.fecha_inicio], ['Fin', detalle.contrato.fecha_fin], ['Modalidad', detalle.contrato.modalidad], ['Estado', detalle.contrato.estado]].map(([k, v]) => (
                                    <div key={k} style={{ background: 'var(--eco-surface2)', borderRadius: 8, padding: 12 }}>
                                        <div style={{ fontSize: 11, color: 'var(--eco-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                                        <div style={{ fontSize: 13, color: 'var(--eco-text)' }}>{v || '—'}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontWeight: 600, marginBottom: 8 }}>Órdenes del Contrato</div>
                                {detalle.ordenes.length === 0 ? <div style={{ color: 'var(--eco-text-muted)', fontSize: 13 }}>Sin órdenes</div> :
                                    <table className="eco-table"><thead><tr><th>N° OS</th><th>Fecha</th><th>Estado</th></tr></thead>
                                        <tbody>{detalle.ordenes.map((o: any) => (<tr key={o.id}><td className="sg" style={{ color: 'var(--eco-green)' }}>{o.numero}</td><td>{o.fecha_programada}</td><td>{o.estado}</td></tr>))}</tbody>
                                    </table>}
                            </div>
                            <div style={{ background: 'var(--eco-green-dim)', borderRadius: 8, padding: 12, fontSize: 13 }}>
                                Total facturado: <strong style={{ color: 'var(--eco-green)' }}>S/ {detalle.totalFacturado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                            </div>

                            {/* Renovar */}
                            {(detalle.contrato.estado === 'vencido' || estadoVenc(detalle.contrato.fecha_fin) !== 'ok') && (
                                <div style={{ marginTop: 16, background: 'var(--eco-surface2)', borderRadius: 12, padding: 16 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--eco-yellow)', marginBottom: 12 }}>Renovar Contrato</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div><label className="eco-label">Nueva fecha inicio</label><input className="eco-input" type="date" defaultValue={today} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} /></div>
                                        <div><label className="eco-label">Nueva fecha fin</label><input className="eco-input" type="date" onChange={e => setForm({ ...form, fecha_fin: e.target.value })} /></div>
                                        <div><label className="eco-label">Nuevo precio S/.</label><input className="eco-input" type="number" placeholder={detalle.contrato.precio} onChange={e => setForm({ ...form, precio: e.target.value })} /></div>
                                    </div>
                                    <button className="eco-btn-primary" style={{ marginTop: 12 }} disabled={saving} onClick={renovar}>Renovar Contrato</button>
                                </div>
                            )}

                            {/* Suspender */}
                            {detalle.contrato.estado === 'vigente' && (
                                <div style={{ marginTop: 12, background: 'var(--eco-surface2)', borderRadius: 12, padding: 16 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--eco-yellow)', marginBottom: 8 }}>Suspender Contrato</div>
                                    <textarea className="eco-input" rows={2} placeholder="Motivo de suspensión (obligatorio)" style={{ resize: 'none', marginBottom: 8 }} onChange={e => setForm({ ...form, motivo: e.target.value })} />
                                    <button className="eco-btn-danger" onClick={suspender}>Confirmar Suspensión</button>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span className="sg" style={{ fontSize: 20, fontWeight: 600 }}>Contratos</span>
                <button className="eco-btn-primary" onClick={() => { setForm({}); setModal('nuevo') }}>+ Nuevo Contrato</button>
            </div>

            <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 12, overflow: 'hidden' }}>
                <table className="eco-table">
                    <thead><tr><th>N° Contrato</th><th>Cliente</th><th>Tipo Residuo</th><th>Frecuencia</th><th>Precio S/.</th><th>Inicio</th><th>Vence</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan={9}><div style={{ height: 80, animation: 'ecoPulse 1.5s infinite', background: 'var(--eco-border)', margin: 12, borderRadius: 4 }} /></td></tr> :
                            data.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--eco-text-muted)', padding: 32 }}>Sin contratos</td></tr> :
                                data.map((c: any) => {
                                    const ev = estadoVenc(c.fecha_fin)
                                    const vencColor = ev === 'vencido' ? 'var(--eco-red)' : ev === 'por_vencer' ? 'var(--eco-yellow)' : 'var(--eco-text-muted)'
                                    const estadoColors: any = { vigente: ['var(--eco-green-dim)', 'var(--eco-green)'], vencido: ['var(--eco-red-dim)', 'var(--eco-red)'], suspendido: ['var(--eco-yellow-dim)', 'var(--eco-yellow)'] }
                                    const [bg, col] = estadoColors[c.estado] || ['rgba(180,180,180,0.1)', '#aaa']
                                    return (
                                        <tr key={c.id}>
                                            <td className="sg" style={{ color: 'var(--eco-green)', fontWeight: 600 }}>{c.numero}</td>
                                            <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.eco_clientes?.razon_social}</td>
                                            <td><span style={{ background: 'var(--eco-green-dim)', color: 'var(--eco-green)', fontSize: 11, padding: '2px 8px', borderRadius: 12 }}>{c.tipo_residuo}</span></td>
                                            <td style={{ color: 'var(--eco-text-muted)' }}>{c.frecuencia}</td>
                                            <td style={{ fontWeight: 600, color: 'var(--eco-green)' }}>S/ {Number(c.precio || 0).toLocaleString('es-PE')}</td>
                                            <td style={{ color: 'var(--eco-text-muted)', fontSize: 12 }}>{c.fecha_inicio}</td>
                                            <td style={{ color: vencColor, fontWeight: ev !== 'ok' ? 600 : 400, fontSize: 12 }}>{c.fecha_fin}{ev !== 'ok' ? ` ⚠` : ''}</td>
                                            <td><span style={{ background: bg, color: col, fontSize: 11, padding: '2px 8px', borderRadius: 12 }}>{c.estado}</span></td>
                                            <td>
                                                <button onClick={() => verDetalle(c)} style={{ padding: '4px 10px', background: 'var(--eco-surface2)', border: '1px solid var(--eco-border)', borderRadius: 6, color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 12 }}>Ver →</button>
                                            </td>
                                        </tr>
                                    )
                                })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
