'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard, ShoppingCart, Package, History,
    ClipboardList, FileBarChart, Store
} from 'lucide-react'
import { Toaster } from 'sonner'

// Components
import { RetHeader } from './components/RetHeader'
import { TabRetailDashboard } from './components/TabRetailDashboard'
import { TabRetailPOS } from './components/TabRetailPOS'
import { TabRetailInventario } from './components/TabRetailInventario'
import { TabRetailKardex } from './components/TabRetailKardex'
import { TabRetailCompras } from './components/TabRetailCompras'
import { TabRetailVentas } from './components/TabRetailVentas'

const tabs = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'pos', label: 'Punto de Venta', icon: ShoppingCart },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'kardex', label: 'Movimientos', icon: History },
    { id: 'compras', label: 'Compras', icon: ClipboardList },
    { id: 'ventas', label: 'Historial Ventas', icon: FileBarChart },
]

function RetailContent() {
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab')
    const [activeTab, setActiveTab] = useState(tabParam || 'dashboard')
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    // Sync state if URL changes
    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam)
        }
    }, [tabParam, activeTab])

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) setIsSidebarOpen(false)
            else setIsSidebarOpen(true)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-[#f8fafc] rounded-3xl overflow-hidden border border-slate-200 shadow-xl font-sans relative">
            <Toaster position="top-right" richColors />

            <div className="flex flex-1 overflow-hidden">
                {/* Module Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                    className="bg-emerald-950 text-white flex flex-col shrink-0 overflow-hidden relative z-20"
                >
                    <div className="p-6 border-b border-emerald-900/50 flex items-center gap-3">
                        <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
                            <Store className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="overflow-hidden whitespace-nowrap">
                            <h1 className="font-bold text-lg tracking-tight">Retail Abarrotes</h1>
                            <p className="text-[10px] text-emerald-400/70 uppercase tracking-widest font-black">Sistema POS/ERP</p>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative ${activeTab === tab.id
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                                    : 'text-emerald-300/60 hover:text-white hover:bg-emerald-900/50'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-400'}`} />
                                <span className="truncate">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="active-pill-retail"
                                        className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-emerald-900/50">
                        <div className="flex items-center gap-3 p-3 bg-emerald-900/30 rounded-2xl border border-emerald-500/10">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs text-emerald-950 uppercase">PV</div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold truncate">Punto de Venta</p>
                                <p className="text-[10px] text-emerald-500/60 truncate font-black">PROMPTIVE RETAIL</p>
                            </div>
                        </div>
                    </div>
                </motion.aside>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <RetHeader
                        activeTabLabel={tabs.find(t => t.id === activeTab)?.label || ''}
                        isSidebarOpen={isSidebarOpen}
                        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    />

                    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 custom-scrollbar relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="h-full"
                            >
                                {activeTab === 'dashboard' && <TabRetailDashboard onTabChange={setActiveTab} />}
                                {activeTab === 'pos' && <TabRetailPOS onTabChange={setActiveTab} />}
                                {activeTab === 'inventario' && <TabRetailInventario onTabChange={setActiveTab} />}
                                {activeTab === 'kardex' && <TabRetailKardex onTabChange={setActiveTab} />}
                                {activeTab === 'compras' && <TabRetailCompras onTabChange={setActiveTab} />}
                                {activeTab === 'ventas' && <TabRetailVentas onTabChange={setActiveTab} />}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default function RetailPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <RetailContent />
        </Suspense>
    )
}
