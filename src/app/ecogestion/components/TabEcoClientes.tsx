'use client'
import React, { useState, useEffect } from 'react'

const ecoBadge = (tipo: string) => {
    const map: any = {
        municipal: ['var(--eco-green-dim)', 'var(--eco-green)', 'Municipal'],
        industrial: ['var(--eco-blue-dim)', 'var(--eco-blue)', 'Industrial'],
        hospital: ['var(--eco-purple-dim)', 'var(--eco-purple)', 'Hospital'],
        construccion: ['var(--eco-yellow-dim)', 'var(--eco-yellow)', 'Construcción'],
        mixto: ['rgba(180,180,180,0.1)', '#aaa', 'Mixto'],
    }
    const [bg, color, txt] = map[tipo] || ['rgba(180,180,180,0.1)', '#aaa', tipo]
    return <span style={{ background: bg, color, fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20 }}>{txt}</span>
}

export default function TabEcoClientes({ showToast, ecoQuery }: any) {
    const [data, setData] = useState<any[]>([])
    const [filtrado, setFiltrado] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [buscar, setBuscar] = useState('')
    const [pillActivo, setPillActivo] = useState('Todos')
    const [modal, setModal] = useState<any>(null) // 'nuevo' | 'editar' | 'detalle'
    const [formData, setFormData] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [detalleData, setDetalleData] = useState<any>(null)

    const cargar = async () => {
        setLoading(true)
        const r = await ecoQuery('eco_clientes', { select: '*', filters: ['order=razon_social.asc'] })
        const arr = Array.isArray(r) ? r : []
        setData(arr); setFiltrado(arr)
        setLoading(false)
    }

    useEffect(() => { cargar() }, [])

    const filtrar = (lista: any[], busq: string, pill: string) => {
        let res = lista
        if (busq) res = res.filter((c: any) => c.razon_social?.toLowerCase().includes(busq.toLowerCase()) || c.ruc?.includes(busq))
        if (pill !== 'Todos') {
            if (['Municipal', 'Industrial', 'Hospital', 'Construcción', 'Mixto'].includes(pill)) {
                const mp: any = { Municipal: 'municipal', Industrial: 'industrial', Hospital: 'hospital', Construcción: 'construccion', Mixto: 'mixto' }
                res = res.filter((c: any) => c.tipo === mp[pill])
            } else if (pill === 'Activo') res = res.filter((c: any) => c.estado === 'activo')
            else if (pill === 'Inactivo') res = res.filter((c: any) => c.estado === 'inactivo')
        }
        setFiltrado(res)
    }

    const handleBuscar = (v: string) => { setBuscar(v); filtrar(data, v, pillActivo) }
    const handlePill = (p: string) => { setPillActivo(p); filtrar(data, buscar, p) }

    const verDetalle = async (id: string) => {
        const cli = data.find((c: any) => c.id === id)
        const [conts, ords] = await Promise.all([
            ecoQuery('eco_contratos', { select: '*', filters: [`cliente_id=eq.${id}`, 'limit=3', 'order=created_at.desc'] }),
            ecoQuery('eco_ordenes', { select: 'numero,fecha_programada,estado,tipo_residuo', filters: [`cliente_id=eq.${id}`, 'limit=5', 'order=created_at.desc'] }),
        ])
        setDetalleData({ cli, contratos: Array.isArray(conts) ? conts : [], ordenes: Array.isArray(ords) ? ords : [] })
        setModal('detalle')
    }

    const abrirEditar = (cli: any) => { setFormData({ ...cli }); setModal('editar') }
    const abrirNuevo = () => { setFormData({ estado: 'activo', tiene_contrato: false }); setModal('nuevo') }

    const guardar = async () => {
        if (!formData.razon_social) { showToast('Razón social requerida', 'error'); return }
        setSaving(true)
        try {
            if (modal === 'nuevo') {
                const r = await ecoQuery('eco_clientes', { insert: { razon_social: formData.razon_social, ruc: formData.ruc, tipo: formData.tipo, contacto: formData.contacto, telefono: formData.telefono, email: formData.email, direccion: formData.direccion, distrito: formData.distrito, tiene_contrato: false, estado: 'activo', saldo_pendiente: 0 } })
                if (Array.isArray(r)) { showToast('Cliente registrado', 'success'); setModal(null); cargar() }
                else showToast('Error al registrar', 'error')
            } else {
                const r = await fetch(`https://yvhrzqrdzykbvhifsoxk.supabase.co/rest/v1/eco_clientes?id=eq.${formData.id}`, {
                    method: 'PATCH', headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHJ6cXJkenlrYnZoaWZzb3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTExMTQsImV4cCI6MjA4ODY2NzExNH0.8hwx4D0tbe8e8b9sFhG6shO7yLgM-3Q-ViZNkavC4iE', Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHJ6cXJkenlrYnZoaWZzb3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTExMTQsImV4cCI6MjA4ODY2NzExNH0.8hwx4D0tbe8e8b9sFhG6shO7yLgM-3Q-ViZNkavC4iE', 'Content-Type': 'application/json', Prefer: 'return=representation' },
                    body: JSON.stringify({ razon_social: formData.razon_social, ruc: formData.ruc, tipo: formData.tipo, contacto: formData.contacto, telefono: formData.telefono, email: formData.email, direccion: formData.direccion, distrito: formData.distrito })
                })
                if (r.ok) { showToast('Cliente actualizado', 'success'); setModal(null); cargar() }
                else showToast('Error al guardar', 'error')
            }
        } finally { setSaving(false) }
    }

    const toggleEstado = async (cli: any) => {
        const nuevoEstado = cli.estado === 'activo' ? 'inactivo' : 'activo'
        if (!confirm(`¿${nuevoEstado === 'inactivo' ? 'Desactivar' : 'Activar'} a ${cli.razon_social}?`)) return
        await fetch(`https://yvhrzqrdzykbvhifsoxk.supabase.co/rest/v1/eco_clientes?id=eq.${cli.id}`, {
            method: 'PATCH', headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHJ6cXJkenlrYnZoaWZzb3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTExMTQsImV4cCI6MjA4ODY2NzExNH0.8hwx4D0tbe8e8b9sFhG6shO7yLgM-3Q-ViZNkavC4iE', Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHJ6cXJkenlrYnZoaWZzb3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTExMTQsImV4cCI6MjA4ODY2NzExNH0.8hwx4D0tbe8e8b9sFhG6shO7yLgM-3Q-ViZNkavC4iE', 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        showToast(`Cliente ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`, nuevoEstado === 'activo' ? 'success' : 'warning')
        cargar()
    }

    const pills = ['Todos', 'Municipal', 'Industrial', 'Hospital', 'Construcción', 'Activo', 'Inactivo']
    const resumen = [
        { label: 'Total Activos', val: data.filter((c: any) => c.estado === 'activo').length, color: 'var(--eco-green)' },
        { label: 'Con Contrato', val: data.filter((c: any) => c.tiene_contrato).length, color: 'var(--eco-blue)' },
        { label: 'Sin Contrato', val: data.filter((c: any) => !c.tiene_contrato && c.estado === 'activo').length, color: 'var(--eco-yellow)' },
        { label: 'Nuevos este Mes', val: data.filter((c: any) => new Date(c.created_at).getMonth() === new Date().getMonth()).length, color: 'var(--eco-purple)' },
    ]

    const FormModal = () => (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 600, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="sg" style={{ fontWeight: 600, fontSize: 16, color: 'var(--eco-text)' }}>{modal === 'nuevo' ? 'Nuevo Cliente' : 'Editar Cliente'}</span>
                    <button onClick={() => setModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                </div>
                <div style={{ padding: 24, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[
                        { key: 'razon_social', label: 'Razón Social *' }, { key: 'ruc', label: 'RUC', maxLen: 11 },
                        { key: 'contacto', label: 'Contacto' }, { key: 'telefono', label: 'Teléfono' },
                        { key: 'email', label: 'Email', type: 'email' }, { key: 'direccion', label: 'Dirección' },
                        { key: 'distrito', label: 'Distrito' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="eco-label">{f.label}</label>
                            <input className="eco-input" type={f.type || 'text'} maxLength={f.maxLen} value={formData[f.key] || ''} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} />
                        </div>
                    ))}
                    <div>
                        <label className="eco-label">Tipo</label>
                        <select className="eco-select" value={formData.tipo || ''} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                            <option value="">Seleccione...</option>
                            {['municipal', 'industrial', 'hospital', 'construccion', 'mixto'].map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                    <button className="eco-btn-primary" onClick={guardar} disabled={saving}>{saving ? 'Guardando...' : modal === 'nuevo' ? 'Registrar Cliente' : 'Guardar Cambios'}</button>
                </div>
            </div>
        </div>
    )

    const DetalleModal = () => !detalleData ? null : (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 16, width: 700, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="sg" style={{ fontWeight: 600, fontSize: 16, color: 'var(--eco-text)' }}>{detalleData.cli.razon_social}</span>
                    <button onClick={() => setModal(null)} style={{ background: 'transparent', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
                </div>
                <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                        {[['RUC', detalleData.cli.ruc], ['Tipo', detalleData.cli.tipo], ['Contacto', detalleData.cli.contacto], ['Teléfono', detalleData.cli.telefono], ['Email', detalleData.cli.email], ['Distrito', detalleData.cli.distrito]].map(([k, v]) => (
                            <div key={k} style={{ background: 'var(--eco-surface2)', borderRadius: 8, padding: 12 }}>
                                <div style={{ fontSize: 11, color: 'var(--eco-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                                <div style={{ fontSize: 13, color: 'var(--eco-text)' }}>{v || '—'}</div>
                            </div>
                        ))}
                    </div>
                    {detalleData.cli.saldo_pendiente > 0 && <div style={{ background: 'var(--eco-red-dim)', border: '1px solid var(--eco-red)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                        <span style={{ color: 'var(--eco-red)', fontWeight: 600 }}>Saldo pendiente: S/ {Number(detalleData.cli.saldo_pendiente).toFixed(2)}</span>
                    </div>}
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--eco-text)' }}>Contratos</div>
                        {detalleData.contratos.length === 0 ? <div style={{ color: 'var(--eco-text-muted)', fontSize: 13 }}>Sin contratos</div> :
                            <table className="eco-table"><thead><tr><th>N°</th><th>Tipo</th><th>Estado</th><th>Vence</th></tr></thead>
                                <tbody>{detalleData.contratos.map((c: any) => (<tr key={c.id}><td className="sg" style={{ color: 'var(--eco-green)' }}>{c.numero}</td><td>{c.tipo_residuo}</td><td>{c.estado}</td><td>{c.fecha_fin}</td></tr>))}</tbody>
                            </table>}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--eco-text)' }}>Últimas Órdenes</div>
                        {detalleData.ordenes.length === 0 ? <div style={{ color: 'var(--eco-text-muted)', fontSize: 13 }}>Sin órdenes</div> :
                            <table className="eco-table"><thead><tr><th>N° OS</th><th>Fecha</th><th>Estado</th></tr></thead>
                                <tbody>{detalleData.ordenes.map((o: any) => (<tr key={o.id}><td className="sg" style={{ color: 'var(--eco-green)' }}>{o.numero}</td><td>{o.fecha_programada}</td><td>{o.estado}</td></tr>))}</tbody>
                            </table>}
                    </div>
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button className="eco-btn-secondary" onClick={() => setModal(null)}>Cerrar</button>
                    <button className="eco-btn-primary" onClick={() => { setModal(null); abrirEditar(detalleData.cli) }}>Editar Cliente</button>
                </div>
            </div>
        </div>
    )

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {(modal === 'nuevo' || modal === 'editar') && <FormModal />}
            {modal === 'detalle' && <DetalleModal />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="sg" style={{ fontSize: 20, fontWeight: 600, color: 'var(--eco-text)' }}>Clientes</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input className="eco-input" style={{ width: 240 }} placeholder="Buscar por nombre o RUC..." value={buscar} onChange={e => handleBuscar(e.target.value)} />
                    <button className="eco-btn-primary" onClick={abrirNuevo}>+ Nuevo Cliente</button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {pills.map(p => (
                    <button key={p} onClick={() => handlePill(p)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '1px solid', borderColor: pillActivo === p ? 'var(--eco-green)' : 'var(--eco-border)', background: pillActivo === p ? 'var(--eco-green-dim)' : 'transparent', color: pillActivo === p ? 'var(--eco-green)' : 'var(--eco-text-muted)', transition: 'all 200ms' }}>{p}</button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {resumen.map((r, i) => (
                    <div key={i} className="eco-card" style={{ cursor: 'default' }}>
                        <div style={{ fontSize: 12, color: 'var(--eco-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{r.label}</div>
                        <div className="sg" style={{ fontSize: 28, fontWeight: 700, color: r.color }}>{r.val}</div>
                    </div>
                ))}
            </div>

            <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 12, overflow: 'hidden' }}>
                <table className="eco-table">
                    <thead><tr><th>Razón Social</th><th>RUC</th><th>Tipo</th><th>Distrito</th><th>Teléfono</th><th>Contrato</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan={8}><div style={{ height: 80, animation: 'ecoPulse 1.5s infinite', background: 'var(--eco-border)', margin: 12, borderRadius: 4 }} /></td></tr> :
                            filtrado.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--eco-text-muted)', padding: 32 }}>📭 No se encontraron clientes</td></tr> :
                                filtrado.map((c: any) => (
                                    <tr key={c.id}>
                                        <td style={{ fontWeight: 500 }}>{c.razon_social}</td>
                                        <td className="sg" style={{ fontSize: 13, color: 'var(--eco-text-muted)' }}>{c.ruc || '—'}</td>
                                        <td>{ecoBadge(c.tipo)}</td>
                                        <td style={{ color: 'var(--eco-text-muted)' }}>{c.distrito || '—'}</td>
                                        <td style={{ color: 'var(--eco-text-muted)' }}>{c.telefono || '—'}</td>
                                        <td>{c.tiene_contrato ? <span style={{ background: 'var(--eco-green-dim)', color: 'var(--eco-green)', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500 }}>Vigente</span> : <span style={{ background: 'rgba(180,180,180,0.1)', color: '#aaa', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>Sin contrato</span>}</td>
                                        <td>{c.estado === 'activo' ? <span style={{ background: 'var(--eco-green-dim)', color: 'var(--eco-green)', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>Activo</span> : <span style={{ background: 'rgba(180,180,180,0.1)', color: '#aaa', padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>Inactivo</span>}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                {[['👁', 'Ver', () => verDetalle(c.id), 'var(--eco-blue)'], ['✏️', 'Editar', () => abrirEditar(c), 'var(--eco-green)'], [c.estado === 'activo' ? '🔴' : '🟢', c.estado === 'activo' ? 'Desactivar' : 'Activar', () => toggleEstado(c), c.estado === 'activo' ? 'var(--eco-red)' : 'var(--eco-green)']].map(([ico, tip, fn, col]: any) => (
                                                    <button key={tip} title={tip} onClick={fn} style={{ width: 30, height: 30, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'var(--eco-surface2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{ico}</button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
