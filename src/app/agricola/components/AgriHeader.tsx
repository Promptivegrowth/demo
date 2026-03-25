import React from 'react'
import { motion } from 'framer-motion'
import {
    Menu, X, Bell, Search, User, Leaf,
    Sprout, Tractor, CloudRain
} from 'lucide-react'

interface AgriHeaderProps {
    activeTabLabel: string
    isSidebarOpen: boolean
    toggleSidebar: () => void
}

export function AgriHeader({ activeTabLabel, isSidebarOpen, toggleSidebar }: AgriHeaderProps) {
    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors lg:hidden"
                >
                    {isSidebarOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
                </button>

                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#16a34a] bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                            Sector Agrícola
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{activeTabLabel}</h2>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Gestión Integral de Insumos y Campo</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Weather Indicator (Visual Detail) */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-blue-50/50 rounded-2xl border border-blue-100/50 mr-4">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <div className="text-left leading-none">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Clima Local</p>
                        <p className="text-sm font-black text-blue-900 tracking-tight">24°C <span className="text-[10px] font-normal opacity-70">Humid. 78%</span></p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center bg-slate-100 px-4 py-2.5 rounded-2xl gap-3 w-64 border border-transparent focus-within:border-green-500/30 focus-within:bg-white transition-all">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar agricultores, lotes..."
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 font-medium"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button className="relative p-2.5 hover:bg-slate-100 rounded-2xl transition-all group">
                        <Bell className="w-5 h-5 text-slate-500 group-hover:text-green-600" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#166534] to-[#16a34a] p-[1px] shadow-lg shadow-green-900/20">
                        <div className="h-full w-full rounded-[15px] bg-white flex items-center justify-center overflow-hidden">
                            <User className="w-5 h-5 text-[#166534]" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
