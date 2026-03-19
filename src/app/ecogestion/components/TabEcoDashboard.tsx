'use client'
import React, { useState, useEffect, useRef } from 'react'

const ecoBadge = (tipo: string) => {
    const map: any = {
        municipal: ['var(--eco-green-dim)', 'var(--eco-green)', 'Municipal'],
        peligroso: ['var(--eco-red-dim)', 'var(--eco-red)', 'Peligroso'],
        hospitalario: ['var(--eco-purple-dim)', 'var(--eco-purple)', 'Hospitalario'],
        desmonte: ['var(--eco-yellow-dim)', 'var(--eco-yellow)', 'Desmonte'],
        industrial: ['var(--eco-blue-dim)', 'var(--eco-blue)', 'Industrial'],
        mixto: ['rgba(180,180,180,0.1)', '#aaa', 'Mixto'],
        construccion: ['var(--eco-yellow-dim)', 'var(--eco-yellow)', 'Construcción'],
        hospital: ['var(--eco-purple-dim)', 'var(--eco-purple)', 'Hospital'],
    }
    const [bg, color, txt] = map[tipo] || ['rgba(180,180,180,0.1)', '#aaa', tipo]
    return <span style={{ background: bg, color, fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20, display: 'inline-flex', alignItems: 'center' }}>{txt}</span>
}

const ecoEstadoBadge = (estado: string) => {
    const map: any = {
        programado: ['var(--eco-blue-dim)', 'var(--eco-blue)', 'Programado'],
        en_ruta: ['var(--eco-yellow-dim)', 'var(--eco-yellow)', '⚡ En Ruta'],
        recogido: ['var(--eco-green-dim)', 'var(--eco-green)', 'Recogido'],
        en_planta: ['var(--eco-green-dim)', 'var(--eco-green)', 'En Planta'],
        completado: ['var(--eco-green-dim)', 'var(--eco-green)', '✓ Completado'],
        cancelado: ['var(--eco-red-dim)', 'var(--eco-red)', 'Cancelado'],
    }
    const [bg, color, txt] = map[estado] || ['rgba(180,180,180,0.1)', '#aaa', estado]
    return <span style={{ background: bg, color, fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20 }}>{txt}</span>
}

function countUp(el: HTMLElement | null, target: number, duration = 800) {
    if (!el) return
    const start = Date.now()
    const step = () => {
        const prog = Math.min((Date.now() - start) / duration, 1)
        el.textContent = Math.floor(prog * target).toLocaleString('es-PE')
        if (prog < 1) requestAnimationFrame(step)
        else el.textContent = target.toLocaleString('es-PE')
    }
    requestAnimationFrame(step)
}

export default function TabEcoDashboard({ showToast, ecoQuery, setActiveTab }: any) {
    const [data, setData] = useState<any>({ serviciosMes: 0, kgMes: 0, facturadoMes: 0, porCobrar: 0, ordenesHoy: 0, manifiestos: 0 })
    const [ordenes, setOrdenes] = useState<any[]>([])
    const [alertas, setAlertas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState(0)
    const timerRef = useRef<any>(null)

    const cargar = async () => {
        setLoading(true)
        try {
            const today = new Date().toISOString().split('T')[0]
            const mesStart = today.slice(0, 7) + '-01'
            const [ords, cuentas, mans, hoy, ultimas, flotaAlerts, opAlerts] = await Promise.all([
                ecoQuery('eco_ordenes', { select: 'id,estado,kg_reales,fecha_programada,tipo_residuo,created_at', filters: [`fecha_programada=gte.${mesStart}`, 'estado=neq.cancelado'] }),
                ecoQuery('eco_cuentas', { select: 'monto_total,saldo,estado,fecha_emision', filters: [`fecha_emision=gte.${mesStart}`] }),
                ecoQuery('eco_manifiestos', { select: 'id,estado,fecha_generacion', filters: ['estado=neq.cerrado'] }),
                ecoQuery('eco_ordenes', { select: 'id,numero,estado,tipo_residuo,vehiculo_id', filters: [`fecha_programada=eq.${today}`, 'estado=neq.cancelado'] }),
                ecoQuery('eco_ordenes', { select: 'id,numero,estado,tipo_residuo,fecha_programada,eco_clientes(razon_social)', filters: ['limit=5', 'order=created_at.desc'] }),
                ecoQuery('eco_flota', { select: 'placa,venc_soat', filters: [`venc_soat=lt.${new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}`] }),
                ecoQuery('eco_operarios', { select: 'nombres,venc_sanidad', filters: [`venc_sanidad=lt.${new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}`] }),
            ])
            const ordsArr = Array.isArray(ords) ? ords : []
            const cuentasArr = Array.isArray(cuentas) ? cuentas : []
            const mansArr = Array.isArray(mans) ? mans : []
            const hoyArr = Array.isArray(hoy) ? hoy : []
            const kgTotal = ordsArr.filter((o: any) => o.estado === 'completado').reduce((s: number, o: any) => s + (Number(o.kg_reales) || 0), 0)
            const facturado = cuentasArr.reduce((s: number, c: any) => s + (Number(c.monto_total) || 0), 0)
            const porCobrar = cuentasArr.reduce((s: number, c: any) => s + (c.estado !== 'pagado' ? Number(c.saldo) || 0 : 0), 0)
            setData({ serviciosMes: ordsArr.length, kgMes: kgTotal, facturadoMes: facturado, porCobrar, ordenesHoy: hoyArr.length, manifiestos: mansArr.length })
            setOrdenes(Array.isArray(ultimas) ? ultimas.slice(0, 5) : [])
            // Build alerts
            const als: any[] = []
                ; (Array.isArray(flotaAlerts) ? flotaAlerts : []).forEach((v: any) => { als.push({ txt: `SOAT próximo/vencido: ${v.placa}`, color: '#e63946', tab: 'flota' }) })
                ; (Array.isArray(opAlerts) ? opAlerts : []).forEach((o: any) => { als.push({ txt: `Carnet sanidad: ${o.nombres}`, color: '#f4a261', tab: 'flota' }) })
            mansArr.filter((m: any) => Math.floor((Date.now() - new Date(m.fecha_generacion).getTime()) / 86400000) > 30).forEach((m: any) => {
                als.push({ txt: `Manifiesto sin cerrar >30 días`, color: '#e63946', tab: 'manifiestos' })
            })
            hoyArr.filter((o: any) => !o.vehiculo_id).forEach(() => { als.push({ txt: 'Orden hoy sin vehículo asignado', color: '#4cc9f0', tab: 'ordenes' }) })
            setAlertas(als.slice(0, 6))
        } catch (e) { showToast('Error cargando dashboard', 'error') }
        finally { setLoading(false); setLastUpdate(Date.now()) }
    }

    useEffect(() => {
        cargar()
        timerRef.current = setInterval(cargar, 60000)
        return () => clearInterval(timerRef.current)
    }, [])

    const h = new Date().getHours()
    const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
    const fecha = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const kpis = [
        { label: 'Servicios del Mes', val: data.serviciosMes, color: 'var(--eco-green)', sub: '▲ +12% vs mes anterior', onClick: () => setActiveTab('ordenes') },
        { label: 'Kg Recolectados', val: data.kgMes, color: 'var(--eco-text)', sub: 'Este mes', fmt: (v: number) => v.toLocaleString('es-PE') + ' kg', onClick: () => setActiveTab('ordenes') },
        { label: 'Facturado el Mes', val: data.facturadoMes, color: 'var(--eco-green)', sub: 'Ingresos del período', fmt: (v: number) => 'S/ ' + v.toLocaleString('es-PE', { minimumFractionDigits: 2 }), onClick: () => setActiveTab('cobranzas') },
        { label: 'Por Cobrar', val: data.porCobrar, color: data.porCobrar > 0 ? 'var(--eco-yellow)' : 'var(--eco-green)', sub: 'Saldo pendiente', fmt: (v: number) => 'S/ ' + v.toLocaleString('es-PE', { minimumFractionDigits: 2 }), onClick: () => setActiveTab('cobranzas') },
        { label: 'Órdenes Hoy', val: data.ordenesHoy, color: 'var(--eco-blue)', sub: 'Programadas para hoy', onClick: () => setActiveTab('ordenes') },
        { label: 'Manifiestos Activos', val: data.manifiestos, color: data.manifiestos > 0 ? 'var(--eco-yellow)' : 'var(--eco-green)', sub: 'Sin cerrar', onClick: () => setActiveTab('manifiestos') },
    ]

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Greeting */}
            <div style={{ marginBottom: 28 }}>
                <div className="sg" style={{ fontSize: 24, fontWeight: 700, color: 'var(--eco-text)' }}>{saludo} — EcoGestión</div>
                <div style={{ fontSize: 13, color: 'var(--eco-text-muted)', marginTop: 4, textTransform: 'capitalize' }}>{fecha}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--eco-green)', animation: 'ecoPulse 2s infinite' }} />
                    <span style={{ fontSize: 12, color: 'var(--eco-text-muted)' }}>Sistema actualizado {lastUpdate ? `hace ${Math.floor((Date.now() - lastUpdate) / 1000)}s` : '...'}</span>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
                {kpis.map((k, i) => (
                    <div key={i} className="eco-card" onClick={k.onClick} style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: 12, color: 'var(--eco-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{k.label}</div>
                        {loading ? <div style={{ height: 40, background: 'var(--eco-border)', borderRadius: 4, animation: 'ecoPulse 1.5s infinite' }} /> :
                            <div className="sg" style={{ fontSize: 32, fontWeight: 700, color: k.color }}>{k.fmt ? k.fmt(k.val) : k.val.toLocaleString('es-PE')}</div>}
                        <div style={{ fontSize: 12, color: 'var(--eco-text-muted)', marginTop: 4 }}>{k.sub}</div>
                    </div>
                ))}
            </div>

            {/* Bottom tables */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Recent orders */}
                <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: 'var(--eco-text)' }}>Últimas 5 Órdenes</div>
                    {loading ? <div style={{ height: 120, background: 'var(--eco-border)', borderRadius: 4, animation: 'ecoPulse 1.5s infinite' }} /> :
                        <table className="eco-table">
                            <thead><tr><th>N° OS</th><th>Cliente</th><th>Tipo</th><th>Estado</th></tr></thead>
                            <tbody>
                                {ordenes.map((o: any) => (
                                    <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setActiveTab('ordenes')}>
                                        <td className="sg" style={{ color: 'var(--eco-green)', fontWeight: 600 }}>{o.numero}</td>
                                        <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.eco_clientes?.razon_social || '—'}</td>
                                        <td>{ecoBadge(o.tipo_residuo)}</td>
                                        <td>{ecoEstadoBadge(o.estado)}</td>
                                    </tr>
                                ))}
                                {ordenes.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--eco-text-muted)' }}>Sin órdenes</td></tr>}
                            </tbody>
                        </table>
                    }
                </div>

                {/* Alerts */}
                <div style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: 'var(--eco-text)' }}>Alertas Activas</div>
                    {alertas.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 32 }}>
                            <div style={{ fontSize: 40 }}>✓</div>
                            <div style={{ color: 'var(--eco-green)', fontWeight: 600 }}>Todo en orden</div>
                            <div style={{ color: 'var(--eco-text-muted)', fontSize: 13 }}>Sin alertas activas</div>
                        </div>
                    ) : alertas.map((a, i) => (
                        <div key={i} style={{ borderLeft: `3px solid ${a.color}`, background: a.color === 'var(--eco-red)' ? 'var(--eco-red-dim)' : 'var(--eco-yellow-dim)', borderRadius: '0 8px 8px 0', padding: '10px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: 'var(--eco-text)' }}>{a.txt}</span>
                            <button onClick={() => setActiveTab(a.tab)} style={{ fontSize: 12, color: a.color, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '4px 8px' }}>Ver →</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
