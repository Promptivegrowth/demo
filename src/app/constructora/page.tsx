'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard, Users, HardHat, FileText, ScrollText,
    TrendingUp, ShoppingCart, Boxes, Wallet,
    AlertTriangle, ChevronRight, Menu, X, Building2
} from 'lucide-react'
import { Toaster } from 'sonner'

// Components (To be created)
import { ConHeader } from './components/ConHeader'
import { TabDashboard } from './components/TabDashboard'
import { TabClientes } from './components/TabClientes'
import { TabProyectos } from './components/TabProyectos'
import { TabCotizaciones } from './components/TabCotizaciones'
import { TabContratos } from './components/TabContratos'
import { TabValorizaciones } from './components/TabValorizaciones'
import { TabCompras } from './components/TabCompras'
import { TabAlmacen } from './components/TabAlmacen'
import { TabPersonal } from './components/TabPersonal'
import { TabAsistencia } from './components/TabAsistencia'
import { TabCaja } from './components/TabCaja'
import { TabIncidencias } from './components/TabIncidencias'

const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'proyectos', label: 'Proyectos', icon: HardHat },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'cotizaciones', label: 'Cotizaciones', icon: FileText },
    { id: 'contratos', label: 'Contratos', icon: ScrollText },
    { id: 'valorizaciones', label: 'Valorizaciones', icon: TrendingUp },
    { id: 'compras', label: 'Compras & OC', icon: ShoppingCart },
    { id: 'almacen', label: 'Almacén', icon: Boxes },
    { id: 'personal', label: 'Personal & SCTR', icon: Users },
    { id: 'asistencia', label: 'Asistencia Diaria', icon: Users },
    { id: 'caja', label: 'Caja & Finanzas', icon: Wallet },
    { id: 'incidencias', label: 'Incidencias', icon: AlertTriangle },
]

export default function ConstructoraPage() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    // Responsive sidebar handling
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false)
            } else {
                setIsSidebarOpen(true)
            }
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-[#f8fafc] rounded-3xl overflow-hidden border border-slate-200 shadow-xl font-sans relative">
            {/* Branding CSS Variables */}
            <style jsx global>{`
        :root {
          --con-primary: #0f172a; /* Slate 900 */
          --con-secondary: #334155; /* Slate 700 */
          --con-accent: #3b82f6; /* Blue 500 */
          --con-surface: #ffffff;
          --con-bg: #f8fafc;
        }
        .con-glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .con-shadow {
            shadow-sm shadow-slate-200/50;
        }
      `}</style>

            <Toaster position="top-right" richColors />

            <div className="flex flex-1 overflow-hidden">
                {/* Module Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                    className="bg-slate-900 text-white flex flex-col shrink-0 overflow-hidden relative z-20"
                >
                    <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl">
                            <Building2 className="w-6 h-6 text-blue-400 font-bold" />
                        </div>
                        <div className="overflow-hidden whitespace-nowrap">
                            <h1 className="font-bold text-lg tracking-tight">Constructora</h1>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">ERP Operational</p>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                                <span className="truncate">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">JD</div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold truncate">Ing. Residente</p>
                                <p className="text-[10px] text-slate-500 truncate">V.1.0 — PROMPTIVE</p>
                            </div>
                        </div>
                    </div>
                </motion.aside>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Header */}
                    <ConHeader
                        activeTabLabel={tabs.find(t => t.id === activeTab)?.label || ''}
                        isSidebarOpen={isSidebarOpen}
                        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    />

                    {/* Main Container */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 custom-scrollbar relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {activeTab === 'dashboard' && <TabDashboard />}
                                {activeTab === 'clientes' && <TabClientes />}
                                {activeTab === 'proyectos' && <TabProyectos />}
                                {activeTab === 'cotizaciones' && <TabCotizaciones />}
                                {activeTab === 'contratos' && <TabContratos />}
                                {activeTab === 'valorizaciones' && <TabValorizaciones />}
                                {activeTab === 'compras' && <TabCompras />}
                                {activeTab === 'almacen' && <TabAlmacen />}
                                {activeTab === 'personal' && <TabPersonal />}
                                {activeTab === 'asistencia' && <TabAsistencia />}
                                {activeTab === 'caja' && <TabCaja />}
                                {activeTab === 'incidencias' && <TabIncidencias />}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    )
}
