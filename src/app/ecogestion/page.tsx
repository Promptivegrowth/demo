'use client'
import React, { useState, useEffect } from 'react'
import TabEcoDashboard from './components/TabEcoDashboard'
import TabEcoClientes from './components/TabEcoClientes'
import TabEcoContratos from './components/TabEcoContratos'
import TabEcoOrdenes from './components/TabEcoOrdenes'
import TabEcoRutas from './components/TabEcoRutas'
import TabEcoManifiestos from './components/TabEcoManifiestos'
import TabEcoCobranzas from './components/TabEcoCobranzas'
import TabEcoFlota from './components/TabEcoFlota'

const ECO_URL = 'https://yvhrzqrdzykbvhifsoxk.supabase.co'
const ECO_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aHJ6cXJkenlrYnZoaWZzb3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTExMTQsImV4cCI6MjA4ODY2NzExNH0.8hwx4D0tbe8e8b9sFhG6shO7yLgM-3Q-ViZNkavC4iE'

export { ECO_URL, ECO_KEY }

export async function ecoQuery(tabla: string, options: any = {}) {
    const { select, filters, insert, update, id, method: m } = options
    const headers: any = {
        'apikey': ECO_KEY,
        'Authorization': 'Bearer ' + ECO_KEY,
        'Content-Type': 'application/json',
        'Prefer': insert ? 'return=representation' : ''
    }
    let url = ECO_URL + '/rest/v1/' + tabla
    const params: string[] = []
    if (select) params.push('select=' + select)
    if (id) params.push('id=eq.' + id)
    if (filters) filters.forEach((f: string) => params.push(f))
    if (params.length > 0) url += '?' + params.join('&')
    const method = insert ? 'POST' : update ? 'PATCH' : m || 'GET'
    const body = (insert || update) ? JSON.stringify(insert || update) : undefined
    const res = await fetch(url, { method, headers, body })
    return res.json()
}

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'clientes', label: 'Clientes', icon: '🏢' },
    { id: 'contratos', label: 'Contratos', icon: '📋' },
    { id: 'ordenes', label: 'Órdenes', icon: '📦' },
    { id: 'rutas', label: 'Rutas', icon: '🗺' },
    { id: 'manifiestos', label: 'Manifiestos', icon: '📄' },
    { id: 'cobranzas', label: 'Cobranzas', icon: '💰' },
    { id: 'flota', label: 'Flota & Personal', icon: '🚛' },
]

export default function EcoGestionPage() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [connected, setConnected] = useState<boolean | null>(null)
    const [alertCount, setAlertCount] = useState(0)
    const [alertsOpen, setAlertsOpen] = useState(false)
    const [alerts, setAlerts] = useState<any[]>([])
    const [toasts, setToasts] = useState<any[]>([])

    const showToast = (msg: string, tipo: string = 'info') => {
        const id = Date.now()
        setToasts(prev => [...prev.slice(-3), { id, msg, tipo }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
    }

    useEffect(() => {
        async function init() {
            try {
                const r = await ecoQuery('eco_clientes', { select: 'id', filters: ['limit=1'] })
                setConnected(Array.isArray(r))
                // Load alerts
                const today = new Date().toISOString().split('T')[0]
                const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
                const [fl, op, man] = await Promise.all([
                    ecoQuery('eco_flota', { select: 'placa,venc_soat', filters: [`venc_soat=lt.${in30}`, 'limit=20'] }),
                    ecoQuery('eco_operarios', { select: 'nombres,venc_sanidad', filters: [`venc_sanidad=lt.${in30}`, 'limit=20'] }),
                    ecoQuery('eco_manifiestos', { select: 'numero,estado,fecha_generacion', filters: [`estado=neq.cerrado`, 'limit=20'] }),
                ])
                const alertList: any[] = []
                    ; (Array.isArray(fl) ? fl : []).forEach((v: any) => {
                        if (v.venc_soat < today) alertList.push({ txt: `SOAT vencido: ${v.placa}`, color: '#e63946', tab: 'flota' })
                        else alertList.push({ txt: `SOAT próximo: ${v.placa}`, color: '#f4a261', tab: 'flota' })
                    })
                    ; (Array.isArray(op) ? op : []).forEach((o: any) => {
                        alertList.push({ txt: `Carnet sanidad próximo: ${o.nombres}`, color: '#f4a261', tab: 'flota' })
                    })
                    ; (Array.isArray(man) ? man : []).forEach((m: any) => {
                        const days = Math.floor((Date.now() - new Date(m.fecha_generacion).getTime()) / 86400000)
                        if (days > 30) alertList.push({ txt: `Manifiesto ${m.numero} sin cerrar (${days}d)`, color: '#e63946', tab: 'manifiestos' })
                    })
                setAlerts(alertList.slice(0, 10))
                setAlertCount(alertList.length)
            } catch { setConnected(false) }
        }
        init()
    }, [])

    const toastColors: any = { success: '#00c96e', error: '#e63946', warning: '#f4a261', info: '#4cc9f0' }

    const renderTab = () => {
        const props = { showToast, ecoQuery, ECO_URL, ECO_KEY }
        switch (activeTab) {
            case 'dashboard': return <TabEcoDashboard {...props} setActiveTab={setActiveTab} />
            case 'clientes': return <TabEcoClientes {...props} />
            case 'contratos': return <TabEcoContratos {...props} />
            case 'ordenes': return <TabEcoOrdenes {...props} />
            case 'rutas': return <TabEcoRutas {...props} />
            case 'manifiestos': return <TabEcoManifiestos {...props} />
            case 'cobranzas': return <TabEcoCobranzas {...props} />
            case 'flota': return <TabEcoFlota {...props} />
            default: return <TabEcoDashboard {...props} setActiveTab={setActiveTab} />
        }
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Space+Grotesk:wght@600;700&display=swap');
        :root {
          --eco-bg: #0a0f0d; --eco-surface: #111a15; --eco-surface2: #162010;
          --eco-border: #1e3a2a; --eco-border-hover: #2d6642;
          --eco-green: #00c96e; --eco-green-dark: #00955a; --eco-green-dim: rgba(0,201,110,0.12);
          --eco-text: #e8f5ee; --eco-text-muted: #7aab8e;
          --eco-red: #e63946; --eco-red-dim: rgba(230,57,70,0.12);
          --eco-yellow: #f4a261; --eco-yellow-dim: rgba(244,162,97,0.12);
          --eco-purple: #c77dff; --eco-purple-dim: rgba(199,125,255,0.12);
          --eco-blue: #4cc9f0; --eco-blue-dim: rgba(76,201,240,0.12);
        }
        .eco-module * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .eco-module .sg { font-family: 'Space Grotesk', sans-serif; }
        @keyframes ecoPulse { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes ecoProgress { from{width:100%} to{width:0} }
        .eco-pulse { animation: ecoPulse 1.5s ease-in-out infinite; }
        .eco-tab-btn { padding:14px 20px; font-size:14px; font-weight:500; color:var(--eco-text-muted); cursor:pointer; border:none; background:transparent; border-bottom:2px solid transparent; transition:all 200ms; white-space:nowrap; }
        .eco-tab-btn:hover { color:var(--eco-text); border-bottom-color:var(--eco-border-hover); }
        .eco-tab-btn.active { color:var(--eco-green); border-bottom-color:var(--eco-green); background:var(--eco-green-dim); }
        .eco-card { background:var(--eco-surface); border:1px solid var(--eco-border); border-radius:12px; padding:20px; cursor:pointer; transition:border-color 200ms,transform 200ms; }
        .eco-card:hover { border-color:var(--eco-border-hover); transform:translateY(-1px); }
        .eco-btn-primary { background:var(--eco-green); color:#0a0f0d; border:none; border-radius:8px; padding:9px 18px; font-weight:600; font-size:14px; cursor:pointer; transition:background 200ms; }
        .eco-btn-primary:hover { background:var(--eco-green-dark); }
        .eco-btn-secondary { background:transparent; color:var(--eco-text-muted); border:1px solid var(--eco-border); border-radius:8px; padding:9px 18px; font-weight:500; font-size:14px; cursor:pointer; }
        .eco-btn-danger { background:transparent; color:var(--eco-red); border:1px solid var(--eco-red-dim); border-radius:8px; padding:9px 18px; cursor:pointer; }
        .eco-table { width:100%; border-collapse:collapse; } 
        .eco-table th { font-size:11px; color:var(--eco-text-muted); text-transform:uppercase; padding:8px 12px; border-bottom:1px solid var(--eco-border); text-align:left; font-weight:500; }
        .eco-table td { font-size:13px; color:var(--eco-text); padding:11px 12px; border-bottom:1px solid var(--eco-border); }
        .eco-table tr:hover td { background:var(--eco-surface2); }
        .eco-input { background:var(--eco-surface); border:1px solid var(--eco-border); border-radius:8px; padding:9px 14px; color:var(--eco-text); font-size:14px; outline:none; transition:border-color 200ms; width:100%; }
        .eco-input:focus { border-color:var(--eco-green); }
        .eco-select { background:var(--eco-surface); border:1px solid var(--eco-border); border-radius:8px; padding:9px 14px; color:var(--eco-text); font-size:14px; outline:none; width:100%; }
        .eco-label { font-size:12px; color:var(--eco-text-muted); font-weight:500; margin-bottom:4px; display:block; }
        .eco-pill { padding:3px 8px; border-radius:20px; font-size:11px; font-weight:500; display:inline-flex; align-items:center; }
      `}</style>

            <div className="eco-module" style={{ minHeight: '100vh', background: 'var(--eco-bg)' }}>
                {/* HEADER */}
                <header style={{ background: 'var(--eco-surface)', borderBottom: '1px solid var(--eco-border)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
                    <div>
                        <div className="sg" style={{ fontSize: 22, fontWeight: 700, color: 'var(--eco-green)' }}>♻ EcoGestión</div>
                        <div style={{ fontSize: 13, color: 'var(--eco-text-muted)', marginTop: 2 }}>Gestión Integral de Residuos Sólidos</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'var(--eco-surface2)', border: '1px solid var(--eco-border)', borderRadius: 20, padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected === null ? '#f4a261' : connected ? 'var(--eco-green)' : 'var(--eco-red)', animation: 'ecoPulse 2s infinite' }} />
                            <span style={{ color: 'var(--eco-text-muted)' }}>{connected === null ? 'Conectando...' : connected ? 'Conectado' : 'Sin conexión'}</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setAlertsOpen(!alertsOpen)} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--eco-border)', background: 'var(--eco-surface2)', color: 'var(--eco-text)', cursor: 'pointer', fontSize: 16, position: 'relative' }}>
                                🔔
                                {alertCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--eco-red)', color: 'white', fontSize: 10, borderRadius: '50%', minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{alertCount}</span>}
                            </button>
                            {alertsOpen && (
                                <div style={{ position: 'absolute', top: 44, right: 0, width: 320, background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderRadius: 12, zIndex: 1000, overflow: 'hidden' }}>
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--eco-border)', fontWeight: 600, fontSize: 13 }}>Alertas del Sistema ({alertCount})</div>
                                    {alerts.length === 0 ? <div style={{ padding: 16, color: 'var(--eco-text-muted)', fontSize: 13 }}>Sin alertas activas</div> :
                                        alerts.map((a, i) => (
                                            <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--eco-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: 13, color: a.color }}>{a.txt}</span>
                                                <button onClick={() => { setActiveTab(a.tab); setAlertsOpen(false) }} style={{ fontSize: 12, color: a.color, background: 'transparent', border: 'none', cursor: 'pointer' }}>Ver →</button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* TABS */}
                <nav style={{ background: 'var(--eco-bg)', borderBottom: '1px solid var(--eco-border)', padding: '0 24px', display: 'flex', overflowX: 'auto', gap: 0, position: 'sticky', top: 69, zIndex: 40 }}>
                    {TABS.map(t => (
                        <button key={t.id} className={`eco-tab-btn${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </nav>

                {/* CONTENT */}
                <main style={{ background: 'var(--eco-bg)', minHeight: 'calc(100vh - 120px)', padding: 24 }}>
                    {renderTab()}
                </main>

                {/* TOASTS */}
                <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, width: 320 }}>
                    {toasts.map((t: any) => (
                        <div key={t.id} style={{ background: 'var(--eco-surface)', border: '1px solid var(--eco-border)', borderLeft: `3px solid ${toastColors[t.tipo] || '#4cc9f0'}`, borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
                            <span style={{ fontSize: 13, color: 'var(--eco-text)', flex: 1 }}>{t.msg}</span>
                            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{ background: 'transparent', border: 'none', color: 'var(--eco-text-muted)', cursor: 'pointer', fontSize: 16, marginLeft: 8 }}>×</button>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: toastColors[t.tipo], opacity: 0.4, animation: 'ecoProgress 5s linear forwards' }} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}
