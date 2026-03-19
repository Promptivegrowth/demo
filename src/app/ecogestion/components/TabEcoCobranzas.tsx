'use client'
import React, { useState, useEffect } from 'react'

const ECO_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHJ6cXJkenlrYnZoaWZzb3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTExMTQsImV4cCI6MjA4ODY2NzExNH0.8hwx4D0tbe8e8b9sFhG6shO7yLgM-3Q-ViZNkavC4iE'
const BASE = 'https://yvhrzqrdzykbvhifsoxk.supabase.co/rest/v1'
const H = { apikey: ECO_ANON, Authorization: `Bearer ${ECO_ANON}`, 'Content-Type': 'application/json' }

export default function TabEcoCobranzas({ showToast, ecoQuery }: any) {
    const [cuentas, setCuentas] = useState<any[]>([])
    const [pagos, setPagos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState<any>(null)
    const [selected, setSelected] = useState<any>(null)
    const [form, setForm] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [clientes, setClientes] = useState<any[]>([])
    const [ordenesSinFacturar, setOrdenesSinFacturar] = useState<any[]>([])
    const [selectedOrdenes, setSelectedOrdenes] = useState<Set<string>>(new Set())

    const today = new Date().toISOString().split('T')[0]

    const cargar = async () => {
        setLoading(true)
        const [c, p] = await Promise.all([
            ecoQuery('eco_cuentas', { select: '*,eco_clientes(razon_social)', filters: ['order=created_at.desc'] }),
            ecoQuery('eco_pagos', { select: '*', filters: ['order=created_at.desc'] }),
        ])
        const arr = Array.isArray(c) ? c : []
        // Mark overdue
        const updated = await Promise.all(arr.map(async (x: any) => {
            if (x.fecha_vencimiento < today && x.estado !== 'pagado' && x.estado !== 'vencido') {
                await fetch(`${BASE}/eco_cuentas?id=eq.${x.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ estado: 'vencido' }) })
                return { ...x, estado: 'vencido' }
            }
            return x
        }))
        setCuentas(updated)
        setPagos(Array.isArray(p) ? p : [])
        setLoading(false)
    }

    useEffect(() => {
        cargar()
        ecoQuery('eco_clientes', { select: 'id,razon_social', filters: ['estado=eq.activo'] }).then((r: any) => setClientes(Array.isArray(r) ? r : []))
    }, [])

    const estadoColor: any = { pagado: ['var(--eco-green-dim)', 'var(--eco-green)', 'Pagado ✓'], pendiente: ['var(--eco-blue-dim)', 'var(--eco-blue)', 'Pendiente'], vencido: ['var(--eco-red-dim)', 'var(--eco-red)', 'Vencido ⚠'], parcial: ['var(--eco-yellow-dim)', 'var(--eco-yellow)', 'Parcial'] }

    const registrarPago = async () => {
        const monto = Number(form.monto)
        if (!monto || monto <= 0 || monto > Number(selected.saldo)) { showToast('Monto inválido', 'error'); return }
        if (!form.metodo) { showToast('Seleccione método de pago', 'error'); return }
        setSaving(true)
        const nuevoMontoPagado = Number(selected.monto_pagado) + monto
        const nuevoSaldo = Number(selected.monto_total) - nuevoMontoPagado
        const nuevoEstado = nuevoSaldo <= 0 ? 'pagado' : nuevoMontoPagado < Number(selected.monto_total) ? 'parcial' : 'pendiente'
        await Promise.all([
            fetch(`${BASE}/eco_pagos`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ cuenta_id: selected.id, fecha: form.fecha || today, monto, metodo: form.metodo, referencia: form.referencia }) }),
            fetch(`${BASE}/eco_cuentas?id=eq.${selected.id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ monto_pagado: nuevoMontoPagado, saldo: Math.max(0, nuevoSaldo), estado: nuevoEstado }) }),
        ])
        showToast(`Pago registrado. Nuevo saldo: S/ ${Math.max(0, nuevoSaldo).toFixed(2)}`, 'success')
        setModal(null); cargar(); setSaving(false)
    }

    const generarFactura = async () => {
        if (!form.cliente_id || selectedOrdenes.size === 0 || !form.numero_factura) { showToast('Complete todos los campos y seleccione al menos una OS', 'error'); return }
        setSaving(true)
        const total = Array.from(selectedOrdenes).reduce((s: number, id: string) => s + (ordenesSinFacturar.find((o: any) => o.id === id)?.precio || 0), 0)
        const r = await fetch(`${BASE}/eco_cuentas`, { method: 'POST', headers: { ...H, Prefer: 'return=representation' }, body: JSON.stringify({ cliente_id: form.cliente_id, numero_factura: form.numero_factura, periodo: form.periodo, monto_total: total, saldo: total, fecha_emision: form.fecha_emision || today, fecha_vencimiento: form.fecha_vencimiento, estado: 'pendiente' }) })
        if (r.ok) {
            await Promise.all(Array.from(selectedOrdenes).map((id: string) => fetch(`${BASE}/eco_ordenes?id=eq.${id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ facturada: true }) })))
            showToast('Factura generada', 'success'); setModal(null); cargar()
        } else showToast('Error al generar factura', 'error')
        setSaving(false)
    }

    const cargarOrdenesSinFacturar = async (clienteId: string) => {
        const r = await ecoQuery('eco_ordenes', { select: 'id,numero,fecha_programada,descripcion,precio', filters: [`cliente_id=eq.${clienteId}`, 'estado=eq.completado', 'facturada=eq.false'] })
        setOrdenesSinFacturar(Array.isArray(r) ? r : [])
    }

    const totalAlDia = cuentas.filter((c: any) => c.estado === 'pendiente' && c.fecha_vencimiento > new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]).reduce((s: number, c: any) => s + Number(c.saldo || 0), 0)
    const totalPorVencer = cuentas.filter((c: any) => c.estado === 'pendiente' && c.fecha_vencimiento <= new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]).reduce((s: number, c: any) => s + Number(c.saldo || 0), 0)
    const totalVencido = cuentas.filter((c: any) => c.estado === 'vencido').reduce((s: number, c: any) => s + Number(c.saldo || 0), 0)
    const totalGeneral = totalAlDia + totalPorVencer + totalVencido

    const textoRecordatorio = selected ? `Estimado(a) ${selected.eco_clientes?.razon_social},\n\nLe recordamos que la factura N° ${selected.numero_factura} por el monto de S/ ${Number(selected.monto_total).toFixed(2)} con fecha de vencimiento ${selected.fecha_vencimiento} se encuentra pendiente de pago.\n\nLe agradecemos gestionar el pago a la brevedad posible.\n\nAtentamente,\nEcoGestión SAC` : ''

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Modal Pago */}
            {modal === 'pago' && selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 500, maxWidth: '95vw', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16 }}>Registrar Pago</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ background: 'var(--eco-surface2)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                                <div style={{ fontSize: 12, color: 'var(--eco-text-muted)' }}>Saldo Pendiente</div>
                                <div className="sg" style={{ fontSize: 32, fontWeight: 700, color: 'var(--eco-green)' }}>S/ {Number(selected.saldo).toFixed(2)}</div>
                            </div>
                            <div><label className="eco-label">Monto a Pagar *</label>
                                <input className="eco-input" type="number" max={selected.saldo} step="0.01" defaultValue={selected.saldo} onChange={e => setForm({ ...form, monto: e.target.value })} />
                            </div>
                            <div><label className="eco-label">Método de Pago *</label>
                                <select className="eco-select" onChange={e => setForm({ ...form, metodo: e.target.value })}>
                                    <option value="">Seleccione...</option>
                                    {['Efectivo', 'Transferencia Bancaria', 'Cheque', 'Detracción SUNAT', 'Yape', 'Plin'].map(m => <option key={m}>{m}</option>)}
                                </select>
                            </div>
                            {['Transferencia Bancaria', 'Cheque'].includes(form.metodo) && (
                                <div><label className="eco-label">N° de Referencia *</label><input className="eco-input" onChange={e => setForm({ ...form, referencia: e.target.value })} /></div>
                            )}
                            <div><label className="eco-label">Fecha del Pago</label><input className="eco-input" type="date" defaultValue={today} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={registrarPago}>{saving ? 'Procesando...' : 'Confirmar Pago'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Recordatorio */}
            {modal === 'recordatorio' && selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 540, maxWidth: '95vw', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16 }}>Recordatorio de Cobro</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24 }}>
                            <textarea className="eco-input" rows={8} defaultValue={textoRecordatorio} style={{ resize: 'none', fontFamily: 'monospace', fontSize: 12 }} />
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cerrar</button>
                            <button className="eco-btn-primary" onClick={() => { navigator.clipboard.writeText(textoRecordatorio); showToast('Texto copiado al portapapeles', 'info') }}>📋 Copiar para WhatsApp</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Generar Factura */}
            {modal === 'factura' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 760, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16 }}>Generar Factura</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label className="eco-label">Cliente *</label>
                                    <select className="eco-select" onChange={e => { setForm({ ...form, cliente_id: e.target.value }); setSelectedOrdenes(new Set()); if (e.target.value) cargarOrdenesSinFacturar(e.target.value) }}>
                                        <option value="">Seleccione...</option>
                                        {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                                    </select></div>
                                <div><label className="eco-label">N° Factura *</label><input className="eco-input" placeholder="F001-00001" onChange={e => setForm({ ...form, numero_factura: e.target.value })} /></div>
                                <div><label className="eco-label">Período</label><input className="eco-input" placeholder="Marzo 2025" onChange={e => setForm({ ...form, periodo: e.target.value })} /></div>
                                <div><label className="eco-label">Fecha de Emisión</label><input className="eco-input" type="date" defaultValue={today} onChange={e => setForm({ ...form, fecha_emision: e.target.value })} /></div>
                                <div><label className="eco-label">Fecha de Vencimiento</label><input className="eco-input" type="date" onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })} /></div>
                            </div>
                            {ordenesSinFacturar.length > 0 && (
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Órdenes completadas sin facturar:</div>
                                    {ordenesSinFacturar.map((o: any) => (
                                        <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--eco-border)', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={selectedOrdenes.has(o.id)} onChange={e => { const ns = new Set(selectedOrdenes); e.target.checked ? ns.add(o.id) : ns.delete(o.id); setSelectedOrdenes(ns) }} />
                                            <span style={{ flex: 1, fontSize: 13 }}>{o.numero} — {o.descripcion?.slice(0, 40)}</span>
                                            <span style={{ color: 'var(--eco-green)', fontSize: 13, fontWeight: 600 }}>S/ {Number(o.precio || 0).toFixed(2)}</span>
                                        </label>
                                    ))}
                                    <div style={{ marginTop: 12, background: 'var(--eco-surface2)', borderRadius: 8, padding: 12, fontSize: 14 }}>
                                        Total seleccionado: <strong style={{ color: 'var(--eco-green)' }}>S/ {Array.from(selectedOrdenes).reduce((s: number, id: string) => s + (ordenesSinFacturar.find((o: any) => o.id === id)?.precio || 0), 0).toFixed(2)}</strong>
                                    </div>
                                </div>
                            )}
                            {form.cliente_id && ordenesSinFacturar.length === 0 && <div style={{ color: 'var(--eco-text-muted)', fontSize: 13 }}>Sin órdenes completadas pendientes de facturar para este cliente.</div>}
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="eco-btn-primary" disabled={saving} onClick={generarFactura}>{saving ? 'Generando...' : 'Generar Factura'}</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="sg" style={{ fontSize: 20, fontWeight: 600 }}>Cobranzas</span>
                <button className="eco-btn-primary" onClick={() => { setForm({}); setSelectedOrdenes(new Set()); setOrdenesSinFacturar([]); setModal('factura') }}>+ Generar Factura</button>
            </div>

            {/* Barra visual de estado */}
            {totalGeneral > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', height: 24, borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
                        {totalAlDia > 0 && <div style={{ width: `${(totalAlDia / totalGeneral * 100).toFixed(1)}%`, background: 'var(--eco-green)' }} />}
                        {totalPorVencer > 0 && <div style={{ width: `${(totalPorVencer / totalGeneral * 100).toFixed(1)}%`, background: 'var(--eco-yellow)' }} />}
                        {totalVencido > 0 && <div style={{ width: `${(totalVencido / totalGeneral * 100).toFixed(1)}%`, background: 'var(--eco-red)' }} />}
                    </div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
                        <span style={{ color: 'var(--eco-green)' }}>● Al día: S/ {totalAlDia.toFixed(2)}</span>
                        <span style={{ color: 'var(--eco-yellow)' }}>● Por vencer: S/ {totalPorVencer.toFixed(2)}</span>
                        <span style={{ color: 'var(--eco-red)' }}>● Vencido: S/ {totalVencido.toFixed(2)}</span>
                    </div>
                </div>
            )}

            <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="eco-table" style={{ minWidth: 850 }}>
                        <thead><tr><th>N° Factura</th><th>Período</th><th>Cliente</th><th>Total S/.</th><th>Pagado S/.</th><th>Saldo S/.</th><th>Vencimiento</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan={9}><div style={{ height: 80, animation: 'ecoPulse 1.5s infinite', background: 'var(--eco-border)', margin: 12, borderRadius: 4 }} /></td></tr> :
                                cuentas.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--eco-text-muted)' }}>Sin cuentas por cobrar</td></tr> :
                                    cuentas.map((c: any) => {
                                        const [bg, col, lbl] = estadoColor[c.estado] || ['rgba(180,180,180,0.1)', '#aaa', c.estado]
                                        const vencCol = c.fecha_vencimiento < today ? 'var(--eco-red)' : c.fecha_vencimiento < new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] ? 'var(--eco-yellow)' : 'var(--eco-text-muted)'
                                        return (
                                            <tr key={c.id}>
                                                <td className="sg" style={{ color: 'var(--eco-green)', fontWeight: 600, fontSize: 12 }}>{c.numero_factura}</td>
                                                <td style={{ color: 'var(--eco-text-muted)', fontSize: 12 }}>{c.periodo || '—'}</td>
                                                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.eco_clientes?.razon_social}</td>
                                                <td style={{ fontWeight: 600 }}>S/ {Number(c.monto_total).toFixed(2)}</td>
                                                <td style={{ color: 'var(--eco-green)' }}>S/ {Number(c.monto_pagado || 0).toFixed(2)}</td>
                                                <td style={{ color: c.estado === 'vencido' ? 'var(--eco-red)' : 'var(--eco-text)', fontWeight: 600 }}>S/ {Number(c.saldo || 0).toFixed(2)}</td>
                                                <td style={{ color: vencCol, fontSize: 12 }}>{c.fecha_vencimiento}</td>
                                                <td><span style={{ background: bg, color: col, fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{lbl}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        {c.estado !== 'pagado' && <button title="Registrar Pago" onClick={() => { setSelected(c); setForm({ monto: c.saldo }); setModal('pago') }} style={{ padding: '4px 8px', background: 'var(--eco-green-dim)', border: '1px solid var(--eco-green)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: 'var(--eco-green)' }}>$ Pagar</button>}
                                                        {['pendiente', 'vencido'].includes(c.estado) && <button title="Recordatorio" onClick={() => { setSelected(c); setModal('recordatorio') }} style={{ padding: '4px 8px', background: 'var(--eco-blue-dim)', border: '1px solid var(--eco-blue)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: 'var(--eco-blue)' }}>💬</button>}
                                                        <button title="Historial" onClick={() => { setSelected(c); setModal('historial') }} style={{ padding: '4px 8px', background: 'var(--eco-surface2)', border: '1px solid var(--eco-border)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: 'var(--eco-text-muted)' }}>🕐</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Historial */}
            {modal === 'historial' && selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 540, maxWidth: '95vw', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="sg" style={{ fontWeight: 600, fontSize: 16 }}>Historial de Pagos — {selected.numero_factura}</span>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                        </div>
                        <div style={{ padding: 24 }}>
                            {(() => {
                                const hist = pagos.filter((p: any) => p.cuenta_id === selected.id)
                                const total = hist.reduce((s: number, p: any) => s + Number(p.monto || 0), 0)
                                const pct = Math.min(100, (total / Number(selected.monto_total)) * 100)
                                return (
                                    <>
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--eco-text-muted)', marginBottom: 4 }}>
                                                <span>Progreso de pago</span><span>{pct.toFixed(0)}%</span>
                                            </div>
                                            <div style={{ height: 8, background: 'var(--eco-surface2)', borderRadius: 4, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--eco-green)', transition: 'width 400ms' }} />
                                            </div>
                                        </div>
                                        {hist.length === 0 ? <div style={{ color: 'var(--eco-text-muted)', fontSize: 13 }}>Sin pagos registrados</div> :
                                            <table className="eco-table">
                                                <thead><tr><th>Fecha</th><th>Monto</th><th>Método</th><th>Referencia</th></tr></thead>
                                                <tbody>
                                                    {hist.map((p: any) => (<tr key={p.id}><td style={{ fontSize: 12 }}>{p.fecha}</td><td style={{ color: 'var(--eco-green)', fontWeight: 600 }}>S/ {Number(p.monto).toFixed(2)}</td><td style={{ fontSize: 12 }}>{p.metodo}</td><td style={{ fontSize: 11, color: 'var(--eco-text-muted)' }}>{p.referencia || '—'}</td></tr>))}
                                                </tbody>
                                            </table>}
                                        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--eco-text-muted)' }}>Total pagado: <strong style={{ color: 'var(--eco-green)' }}>S/ {total.toFixed(2)}</strong></div>
                                    </>
                                )
                            })()}
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
