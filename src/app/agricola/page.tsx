'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard, ShoppingCart, Package, History,
    ClipboardList, FileBarChart, Users, Settings,
    Menu, X, Sprout, Tractor, Leaf, Smartphone,
    Receipt, Boxes, BarChart3, Home
} from 'lucide-react'
import { Toaster } from 'sonner'

// Components
import { AgriHeader } from '@/app/agricola/components/AgriHeader'
import { TabAgriHub } from '@/app/agricola/components/TabAgriHub'
import { TabAgriCatalogo } from '@/app/agricola/components/TabAgriCatalogo'
import { TabAgriPOS } from '@/app/agricola/components/TabAgriPOS'
import { TabAgriCreditos } from '@/app/agricola/components/TabAgriCreditos'
import { TabAgriAgentes } from '@/app/agricola/components/TabAgriAgentes'
import { TabAgriCompras } from '@/app/agricola/components/TabAgriCompras'
import { TabAgriInventario } from '@/app/agricola/components/TabAgriInventario'
import { TabAgriInteligencia } from '@/app/agricola/components/TabAgriInteligencia'

const tabs = [
    { id: 'hub', label: 'Hub Agrícola', icon: Home, color: '#16a34a' },
    { id: 'catalogo', label: 'Catálogo Insumos', icon: Package, color: '#16a34a' },
    { id: 'pos', label: 'Venta Agrícola', icon: ShoppingCart, color: '#16a34a' },
    { id: 'creditos', label: 'Créditos & Agricultores', icon: Receipt, color: '#ca8a04' },
    { id: 'agentes', label: 'Agentes de Campo', icon: Smartphone, color: '#16a34a' },
    { id: 'compras', label: 'Compras Proveedores', icon: ClipboardList, color: '#16a34a' },
    { id: 'inventario', label: 'Stock & Lotes', icon: Boxes, color: '#16a34a' },
    { id: 'analytics', label: 'Inteligencia Agrícola', icon: BarChart3, color: '#16a34a' },
]

export default function AgricolaPage() {
    const [activeTab, setActiveTab] = useState('hub')
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
        <div className="flex flex-col h-[calc(100vh-140px)] bg-[#fcfdfc] rounded-3xl overflow-hidden border border-green-100 shadow-2xl font-sans relative">
            <Toaster position="top-right" richColors />

            <div className="flex flex-1 overflow-hidden">
                {/* Module Sidebar (Agricultural Theme) */}
                <motion.aside
                    initial={false}
                    animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                    className="bg-[#052c16] text-white flex flex-col shrink-0 overflow-hidden relative z-20"
                >
                    <div className="p-6 border-b border-green-900/50 flex items-center gap-3">
                        <div className="bg-green-500/20 p-2.5 rounded-2xl border border-green-500/30">
                            <Tractor className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="overflow-hidden whitespace-nowrap">
                            <h1 className="font-bold text-lg tracking-tight">Cosecha Inteligente</h1>
                            <p className="text-[10px] text-green-400/70 uppercase tracking-widest font-black">SOLUCIÓN AGRÍCOLA</p>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group relative ${activeTab === tab.id
                                    ? 'bg-green-600/90 text-white shadow-lg shadow-green-950/40 translate-x-1'
                                    : 'text-green-300/60 hover:text-white hover:bg-green-900/50'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-white' : 'text-green-500'}`} />
                                <span className="truncate">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="active-pill-agri"
                                        className="absolute right-2 w-1.5 h-6 bg-white rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="p-5 border-t border-green-900/50 bg-green-950/50">
                        <div className="flex items-center gap-3 p-3 bg-green-900/40 rounded-2xl border border-green-500/10">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold text-xs text-green-950 shadow-inner">DEMO</div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold truncate text-white">Modo Interactivo</p>
                                <p className="text-[10px] text-green-400/60 truncate font-black">PROMPTIVE AGRO</p>
                            </div>
                        </div>
                    </div>
                </motion.aside>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <AgriHeader
                        activeTabLabel={tabs.find(t => t.id === activeTab)?.label || ''}
                        isSidebarOpen={isSidebarOpen}
                        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    />

                    <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8faf8] custom-scrollbar relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/30 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="h-full relative z-10"
                            >
                                {activeTab === 'hub' && <TabAgriHub onTabChange={setActiveTab} />}
                                {activeTab === 'catalogo' && <TabAgriCatalogo onTabChange={setActiveTab} />}
                                {activeTab === 'pos' && <TabAgriPOS onTabChange={setActiveTab} />}
                                {activeTab === 'creditos' && <TabAgriCreditos />}
                                {activeTab === 'agentes' && <TabAgriAgentes />}
                                {activeTab === 'compras' && <TabAgriCompras />}
                                {activeTab === 'inventario' && <TabAgriInventario />}
                                {activeTab === 'analytics' && <TabAgriInteligencia />}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    )
}
