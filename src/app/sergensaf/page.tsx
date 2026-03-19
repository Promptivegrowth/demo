'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package, FileText, ShoppingCart, Truck, Factory,
    DollarSign, Car, BarChart2, Bell, X, RefreshCw,
    CheckCircle2 as CheckCircle, AlertTriangle, Info
} from 'lucide-react'
import { supabase } from './lib/supabase'

import TabInventario from './components/TabInventario'
import TabDashboard from './components/TabDashboard'
import TabCotizaciones from './components/TabCotizaciones'
import TabOrdenes from './components/TabOrdenes'
import TabDespachos from './components/TabDespachos'
import TabProduccion from './components/TabProduccion'
import TabCobranzas from './components/TabCobranzas'
import TabFlota from './components/TabFlota'

export default function SergensafModule() {
    const [activeTab, setActiveTab] = useState('Dashboard')
    const [isConnected, setIsConnected] = useState<boolean | null>(null)
    const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([])
    const [isAlertsOpen, setIsAlertsOpen] = useState(false)
    const [toasts, setToasts] = useState<any[]>([])

    // Global Navigation Tabs
    const TABS = [
        { id: 'Inventario', icon: Package, label: 'Inventario' },
        { id: 'Cotizaciones', icon: FileText, label: 'Cotizaciones' },
        { id: 'Ordenes', icon: ShoppingCart, label: 'Órdenes' },
        { id: 'Despachos', icon: Truck, label: 'Despachos' },
        { id: 'Produccion', icon: Factory, label: 'Producción' },
        { id: 'Cobranzas', icon: DollarSign, label: 'Cobranzas' },
        { id: 'Flota', icon: Car, label: 'Flota' },
        { id: 'Dashboard', icon: BarChart2, label: 'Dashboard' }
    ]

    // Initialize Supabase & check connection
    useEffect(() => {
        async function checkConnection() {
            try {
                const { data, error } = await supabase.from('saf_productos').select('id, nombre, stock_actual, stock_minimo')
                if (error) {
                    setIsConnected(false)
                    console.error('Supabase connection error:', error)
                } else {
                    setIsConnected(true)
                    const lowStock = data.filter(p => p.stock_actual < p.stock_minimo)
                    setLowStockAlerts(lowStock)
                }
            } catch (err) {
                setIsConnected(false)
            }
        }
        checkConnection()
    }, [])

    // Toast System
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        const id = Date.now()
        setToasts(prev => [...prev.slice(-2), { id, message, type }]) // Max 3 visible
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
    }

    // Active Component Renderer
    const renderTab = () => {
        switch (activeTab) {
            case 'Dashboard': return <TabDashboard showToast={showToast} />
            case 'Inventario': return <TabInventario showToast={showToast} />
            case 'Cotizaciones': return <TabCotizaciones showToast={showToast} />
            case 'Ordenes': return <TabOrdenes showToast={showToast} />
            case 'Despachos': return <TabDespachos showToast={showToast} />
            case 'Produccion': return <TabProduccion showToast={showToast} />
            case 'Cobranzas': return <TabCobranzas showToast={showToast} />
            case 'Flota': return <TabFlota showToast={showToast} />
            default: return <TabDashboard showToast={showToast} />
        }
    }

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* HEADER */}
            <header className="h-16 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold font-rajdhani text-[#f0a500] tracking-tight leading-none">SERGENSAF</h1>
                        <span className="text-[10px] text-[#8b949e] uppercase tracking-widest font-medium">Proceso y Venta de Agregados</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Connection Badge */}
                    <div className="flex items-center gap-2 bg-[#0d1117] px-3 py-1.5 rounded-full border border-[#30363d]">
                        <div className={`h-2 w-2 rounded-full animate-pulse ${isConnected === null ? 'bg-yellow-500' : isConnected ? 'bg-[#238636]' : 'bg-[#da3633]'}`} />
                        <span className="text-xs font-medium text-[#8b949e]">
                            {isConnected === null ? 'Conectando...' : isConnected ? 'Conectado a Supabase' : 'Error de Conexión'}
                        </span>
                    </div>

                    {/* Bell Icon */}
                    <div className="relative">
                        <button
                            className="p-2 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-lg transition-colors relative"
                            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                        >
                            <Bell className="h-5 w-5" />
                            {lowStockAlerts.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-[#da3633] rounded-full border border-[#161b22]" />
                            )}
                        </button>

                        <AnimatePresence>
                            {isAlertsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-72 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden z-50"
                                >
                                    <div className="p-3 bg-[#21262d] border-b border-[#30363d] flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-[#e6edf3] uppercase tracking-widest">Alertas de Stock</h3>
                                        <span className="text-[10px] bg-[#da3633]/20 text-[#da3633] px-2 py-0.5 rounded-full font-bold">{lowStockAlerts.length}</span>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {lowStockAlerts.length === 0 ? (
                                            <div className="p-4 text-center text-[#8b949e] text-xs">No hay alertas pendientes</div>
                                        ) : (
                                            lowStockAlerts.map(alert => (
                                                <div key={alert.id} className="p-3 border-b border-[#30363d]/50 hover:bg-[#21262d] cursor-pointer transition-colors" onClick={() => { setActiveTab('Inventario'); setIsAlertsOpen(false) }}>
                                                    <p className="text-sm font-medium text-[#e6edf3] truncate">{alert.nombre}</p>
                                                    <p className="text-xs text-[#8b949e]">Stock actual: <span className="text-[#da3633] font-bold">{alert.stock_actual}</span> {alert.unidad}</p>
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

            {/* TABS NAVIGATION */}
            <nav className="bg-[#161b22] border-b border-[#30363d] sticky top-16 z-40 overflow-x-auto no-scrollbar">
                <div className="flex px-4 min-w-max">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all relative ${activeTab === tab.id
                                ? 'text-[#f0a500]'
                                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f0a500]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 p-6 lg:p-8 bg-[#0d1117] overflow-y-auto relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="max-w-7xl mx-auto"
                    >
                        {renderTab()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* TOAST SYSTEM */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border w-80 relative overflow-hidden ${toast.type === 'success' ? 'bg-[#161b22] border-[#238636]/30' :
                                toast.type === 'error' ? 'bg-[#161b22] border-[#da3633]/30' :
                                    toast.type === 'warning' ? 'bg-[#161b22] border-[#9e6a03]/30' :
                                        'bg-[#161b22] border-[#1f6feb]/30'
                                }`}
                        >
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${toast.type === 'success' ? 'bg-[#238636]/20 text-[#238636]' :
                                toast.type === 'error' ? 'bg-[#da3633]/20 text-[#da3633]' :
                                    toast.type === 'warning' ? 'bg-[#9e6a03]/20 text-[#f0a500]' :
                                        'bg-[#1f6feb]/20 text-[#1f6feb]'
                                }`}>
                                {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
                                    toast.type === 'error' ? <AlertTriangle className="h-4 w-4" /> :
                                        toast.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                                            <Info className="h-4 w-4" />}
                            </div>
                            <p className="text-sm font-medium text-[#e6edf3] flex-1">{toast.message}</p>
                            <button
                                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                className="text-[#8b949e] hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            {/* Progress Bar Animation */}
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: 0 }}
                                transition={{ duration: 4, ease: "linear" }}
                                className={`absolute bottom-0 left-0 right-0 h-0.5 ${toast.type === 'success' ? 'bg-[#238636]' :
                                    toast.type === 'error' ? 'bg-[#da3633]' :
                                        toast.type === 'warning' ? 'bg-[#f0a500]' :
                                            'bg-[#1f6feb]'
                                    }`}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

// ----------------------------------------------------------------------
