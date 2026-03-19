'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Building2,
    FileText,
    Package,
    MapIcon,
    FileCheck,
    Wallet,
    Truck,
    Bell,
    CheckCircle2,
    AlertCircle,
    X,
    Leaf
} from 'lucide-react'

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
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', Icon: Building2 },
    { id: 'contratos', label: 'Contratos', Icon: FileText },
    { id: 'ordenes', label: 'Órdenes', Icon: Package },
    { id: 'rutas', label: 'Rutas', Icon: MapIcon },
    { id: 'manifiestos', label: 'Manifiestos', Icon: FileCheck },
    { id: 'cobranzas', label: 'Cobranzas', Icon: Wallet },
    { id: 'flota', label: 'Flota & Personal', Icon: Truck },
]

export default function EcoGestionPage() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [connected, setConnected] = useState<boolean | null>(null)
    const [alertCount, setAlertCount] = useState(0)
    const [alertsOpen, setAlertsOpen] = useState(false)
    const [alerts, setAlerts] = useState<any[]>([])
    const [toasts, setToasts] = useState<any[]>([])

    const showToast = (msg: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'info') => {
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
                        if (v.venc_soat < today) alertList.push({ txt: `SOAT vencido: ${v.placa}`, color: 'text-rose-500', bg: 'bg-rose-500/10', tab: 'flota' })
                        else alertList.push({ txt: `SOAT próximo a vencer: ${v.placa}`, color: 'text-amber-500', bg: 'bg-amber-500/10', tab: 'flota' })
                    })
                    ; (Array.isArray(op) ? op : []).forEach((o: any) => {
                        alertList.push({ txt: `Carnet de sanidad próximo: ${o.nombres}`, color: 'text-amber-500', bg: 'bg-amber-500/10', tab: 'flota' })
                    })
                    ; (Array.isArray(man) ? man : []).forEach((m: any) => {
                        const days = Math.floor((Date.now() - new Date(m.fecha_generacion).getTime()) / 86400000)
                        if (days > 30) alertList.push({ txt: `Manifiesto ${m.numero} sin cerrar (${days}d)`, color: 'text-rose-500', bg: 'bg-rose-500/10', tab: 'manifiestos' })
                    })

                setAlerts(alertList.slice(0, 10))
                setAlertCount(alertList.length)
            } catch { setConnected(false) }
        }
        init()
    }, [])

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
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#00c96e]/20 selection:text-[#00c96e]">
            {/* STICKY HEADER */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#00c96e] to-[#00955a] shadow-lg shadow-[#00c96e]/20 text-white">
                        <Leaf className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            EcoGestión
                            <span className="px-2 py-0.5 rounded-full bg-[#00c96e]/10 text-[#00955a] text-xs font-semibold uppercase tracking-wider">Pro</span>
                        </h1>
                        <p className="text-sm border-l-2 pl-2 border-[#00c96e] text-slate-500 font-medium leading-none mt-1">
                            Gestión Integral de Residuos Sólidos
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* ENVIROMENT STATUS INDICATOR */}
                    <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <div className={`relative flex items-center justify-center w-2.5 h-2.5`}>
                            {connected === true && (
                                <span className="absolute inline-flex h-full w-full rounded-full bg-[#00c96e] opacity-75 animate-ping" />
                            )}
                            <span className={`relative inline-flex rounded-full w-2.5 h-2.5 ${connected === null ? 'bg-amber-400' : connected ? 'bg-[#00c96e]' : 'bg-rose-500'}`} />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                            {connected === null ? 'Conectando...' : connected ? 'Sistema En Línea' : 'Desconectado'}
                        </span>
                    </div>

                    {/* ALERTS DROPDOWN */}
                    <div className="relative">
                        <button
                            onClick={() => setAlertsOpen(!alertsOpen)}
                            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors focus:ring-2 focus:ring-[#00c96e]/20 outline-none"
                        >
                            <Bell className="w-5 h-5" />
                            {alertCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                    {alertCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {alertsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden origin-top-right z-50"
                                >
                                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                                        <h3 className="text-sm font-semibold text-slate-800">Alertas Operativas</h3>
                                        <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{alertCount}</span>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {alerts.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-600">Todo en orden</p>
                                                <p className="text-xs text-slate-400 mt-1">No hay alertas críticas en el sistema.</p>
                                            </div>
                                        ) : (
                                            alerts.map((a, i) => (
                                                <div key={i} className="group flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 transition-colors">
                                                    <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${a.bg} ${a.color}`}>
                                                        <AlertCircle className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-700 leading-snug">{a.txt}</p>
                                                        <button
                                                            onClick={() => { setActiveTab(a.tab); setAlertsOpen(false) }}
                                                            className={`mt-1.5 text-xs font-semibold ${a.color} hover:underline opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1`}
                                                        >
                                                            Atender ahora <span className="font-serif">→</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* HORIZONTAL NAVIGATION */}
            <div className="sticky top-[73px] z-40 bg-white/60 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
                <div className="px-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {TABS.map(t => {
                        const isActive = activeTab === t.id
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`relative flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap outline-none transition-colors ${isActive ? 'text-[#00955a]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                                    }`}
                            >
                                <t.Icon className={`w-4 h-4 ${isActive ? 'text-[#00c96e]' : 'text-slate-400'}`} />
                                {t.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="ecotabs-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00c96e]"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-140px)]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {renderTab()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* TOAST NOTIFICATIONS */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-[380px] max-w-[calc(100vw-48px)] pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl p-4 flex items-start gap-3 pointer-events-auto overflow-hidden relative"
                        >
                            <div className={`mt-0.5 shrink-0 w-2 h-2 rounded-full shadow-[0_0_8px] ${t.tipo === 'success' ? 'bg-emerald-500 shadow-emerald-500/50' :
                                    t.tipo === 'error' ? 'bg-rose-500 shadow-rose-500/50' :
                                        t.tipo === 'warning' ? 'bg-amber-500 shadow-amber-500/50' :
                                            'bg-blue-500 shadow-blue-500/50'
                                }`} />
                            <div className="flex-1 text-sm font-medium pr-6 text-slate-100">{t.msg}</div>
                            <button
                                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                                className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Global style for hiding scrollbar in nav if needed */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
        </div>
    )
}
