'use client'

import { Search, Bell, Menu, X, Settings2, HelpCircle, ChevronRight } from 'lucide-react'

interface ConHeaderProps {
    activeTabLabel: string
    isSidebarOpen: boolean
    toggleSidebar: () => void
}

export function ConHeader({ activeTabLabel, isSidebarOpen, toggleSidebar }: ConHeaderProps) {
    return (
        <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 relative z-10 shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 lg:flex items-center justify-center"
                >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />

                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <span>Módulo Constructora</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-blue-500">PROMPTIVE</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{activeTabLabel}</h2>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="hidden lg:flex items-center bg-slate-100 rounded-2xl px-4 py-2 border border-slate-200/50 w-64 group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
                    <input
                        type="text"
                        placeholder="Buscar en el módulo..."
                        className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 text-slate-600 placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all relative text-slate-500 hover:text-slate-900">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-900">
                        <Settings2 className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-900">
                        <HelpCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    )
}
