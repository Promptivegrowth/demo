'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Truck, Search, Plus, Filter,
    ChevronRight, ExternalLink, Phone,
    Package, Calendar, CheckCircle2,
    AlertCircle, TrendingUp, History,
    FileText, Zap, MoreVertical, Settings,
    ArrowRightLeft, BadgeDollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// --- MOCK DATA ---
const PROVIDERS = [
    { id: 1, name: 'Motul Perú SA', contact: 'Carlos Mendoza', category: 'Lubricantes', status: 'Preferencial', lastPurchase: '2024-06-10', rating: 4.8 },
    { id: 2, name: 'Pirelli Importaciones', contact: 'Ana Silva', category: 'Llantas', status: 'Activo', lastPurchase: '2024-05-28', rating: 4.5 },
    { id: 3, name: 'Repuestos Global SAC', contact: 'Jorge Luque', category: 'General', status: 'Activo', lastPurchase: '2024-06-14', rating: 4.2 },
    { id: 4, name: 'Premium Helmets', contact: 'Elena Paz', category: 'Accesorios', status: 'Nuevo', lastPurchase: '---', rating: 5.0 },
]

const PURCHASES = [
    { id: 'OC-1025', provider: 'Motul Perú SA', total: 4500.0, items: 120, status: 'Entregado', date: '2024-06-10' },
    { id: 'OC-1026', provider: 'Repuestos Global SAC', total: 1250.0, items: 45, status: 'En Camino', date: '2024-06-14' },
    { id: 'OC-1027', provider: 'Pirelli Importaciones', total: 8900.0, items: 24, status: 'Pendiente', date: '2024-06-16' },
]

export default function ComprasAutomotriz() {
    const [activeTab, setActiveTab] = useState<'compras' | 'proveedores'>('compras')

    return (
        <div className="space-y-8 pb-10">
            {/* Upper Navigation & Global Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex bg-white border border-border rounded-2xl p-1.5 shadow-sm">
                    <button
                        onClick={() => setActiveTab('compras')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'compras' ? 'bg-[#3841F2] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                        )}
                    >
                        Órdenes de Compra
                    </button>
                    <button
                        onClick={() => setActiveTab('proveedores')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'proveedores' ? 'bg-[#3841F2] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                        )}
                    >
                        Directorio de Proveedores
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#3841F2]" />
                        <input
                            type="text"
                            placeholder="Buscar orden o proveedor..."
                            className="h-11 pl-10 pr-4 bg-white border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-[#3841F2] shadow-sm w-full"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#3841F2] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#3841F2]/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Plus className="h-4 w-4" />
                        NUEVA ORDEN
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main List Column */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'compras' ? (
                        <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Abastecimiento Activo</h3>
                                <div className="flex gap-2">
                                    <Badge className="bg-emerald-100 text-emerald-700 font-bold text-[9px]">1 ENTREGADO</Badge>
                                    <Badge className="bg-amber-100 text-amber-700 font-bold text-[9px]">1 EN CAMINO</Badge>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-border">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Orden / Fecha</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Proveedor</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Items</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Estado</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 italic">
                                        {PURCHASES.map((row) => (
                                            <tr key={row.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                                                <td className="px-6 py-4">
                                                    <p className="text-[11px] font-black text-slate-800 uppercase leading-tight italic">{row.id}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground">{row.date}</p>
                                                </td>
                                                <td className="px-6 py-4 text-[11px] font-bold text-slate-700">{row.provider}</td>
                                                <td className="px-6 py-4 text-[11px] font-black text-slate-500">{row.items} uds</td>
                                                <td className="px-6 py-4">
                                                    <Badge className={cn(
                                                        "text-[8px] font-black uppercase tracking-tighter px-2",
                                                        row.status === 'Entregado' ? 'bg-emerald-100 text-emerald-700' :
                                                            row.status === 'En Camino' ? 'bg-blue-100 text-[#3841F2]' : 'bg-amber-100 text-amber-700'
                                                    )}>
                                                        {row.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-xs text-slate-900 italic">S/ {row.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-border flex items-center justify-center">
                                <button className="text-[10px] font-black text-[#3841F2] uppercase tracking-widest hover:underline">Ver Histórico de Compras</button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {PROVIDERS.map((prov) => (
                                <div key={prov.id} className="bg-white p-6 rounded-[2rem] border border-border shadow-sm hover:border-[#3841F2] transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-12 w-12 rounded-2xl bg-[#020659] text-white flex items-center justify-center font-black text-lg group-hover:bg-[#3841F2] transition-colors">
                                            {prov.name.substring(0, 1)}
                                        </div>
                                        <Badge className="bg-blue-100 text-[#3841F2] border-none font-black text-[9px] uppercase">{prov.status}</Badge>
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900 italic mb-1">{prov.name}</h4>
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                            <Settings className="h-3 w-3" />
                                            <span>{prov.category}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            <span>{prov.contact}</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                                            <TrendingUp className="h-3 w-3" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">Rating: {prov.rating}</span>
                                        </div>
                                        <button className="text-[10px] font-black text-[#3841F2] uppercase flex items-center gap-1">
                                            Detalles <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Insights & AI */}
                <div className="space-y-6">
                    {/* IA Procurement Suggestion */}
                    <div className="bg-[#020659] rounded-3xl p-8 text-white space-y-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-blue-400 opacity-20 rotate-12 group-hover:scale-110 transition-transform">
                            <Zap className="h-24 w-24" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#3841F2] rounded-xl flex items-center justify-center">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-200">Reabastecimiento IA</h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <p className="text-blue-100/80 text-sm font-medium italic">
                                "Se sugiere reponer <span className="text-white font-black underline decoration-[#3841F2]">Pastillas de Freno Honda</span> (8 uds) y <span className="text-white font-black underline decoration-[#3841F2]">Aceite Motul</span> (24 uds) para cubrir la demanda estimada de Julio."
                            </p>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Inversión Estimada</p>
                                    <p className="text-xl font-black italic">S/ 4,200.00</p>
                                </div>
                                <ArrowRightLeft className="h-6 w-6 text-[#3841F2]" />
                            </div>
                            <button className="w-full py-4 bg-[#3841F2] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-[#3841F2]/20">
                                Generar Órdenes Automáticas
                            </button>
                        </div>
                    </div>

                    {/* Pending Payments / Debt */}
                    <div className="bg-card rounded-3xl p-8 border border-border shadow-md space-y-6">
                        <div className="flex items-center gap-3">
                            <BadgeDollarSign className="h-5 w-5 text-slate-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Cuentas por Pagar</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Motul Perú SA', amount: 4500.0, due: '6 días' },
                                { name: 'Pirelli Imp.', amount: 2300.0, due: 'Vencido' },
                            ].map((debt, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                                    <div>
                                        <p className="text-[11px] font-black text-slate-900 truncate italic">{debt.name}</p>
                                        <p className={cn(
                                            "text-[9px] font-black uppercase",
                                            debt.due === 'Vencido' ? 'text-red-500' : 'text-amber-600'
                                        )}>{debt.due}</p>
                                    </div>
                                    <p className="text-xs font-black italic">S/ {debt.amount.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tracking Step */}
                    <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
                        <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5 text-[#3841F2]" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Truck Live Tracking</h3>
                        </div>
                        <div className="flex items-center justify-between opacity-50 px-2 italic">
                            <span className="text-[9px] font-bold">OC-1026: En Tránsito (Lima - Sede Sur)</span>
                            <span className="text-[9px] font-black">74%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div animate={{ width: '74%' }} className="h-full bg-[#3841F2]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Integration Banner */}
            <div className="p-4 bg-[#3841F2]/5 border border-[#3841F2]/10 rounded-2xl flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3841F2]" />
                    <span className="text-[10px] font-black text-[#3841F2] uppercase tracking-widest">Stock Automático POS ✓</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3841F2]" />
                    <span className="text-[10px] font-black text-[#3841F2] uppercase tracking-widest">Conciliación con Caja ✓</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3841F2]" />
                    <span className="text-[10px] font-black text-[#3841F2] uppercase tracking-widest">Validación de Factura Electrónica ✓</span>
                </div>
            </div>
        </div>
    )
}
