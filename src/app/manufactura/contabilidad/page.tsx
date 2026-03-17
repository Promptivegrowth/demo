'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calculator, DollarSign, FileBarChart, CreditCard,
    ArrowUpRight, ArrowDownRight, Printer, Download,
    Search, Filter, CheckCircle2, AlertTriangle,
    Server, Globe, Database, RefreshCw, Cpu,
    History, ShieldCheck, Mail, Zap, Settings,
    Smartphone, Boxes, Factory, Users
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// --- MOCK DATA ---
const TRANSACTIONS = [
    { id: 'FAC-E001-4567', entity: 'Distribuidora Norte', category: 'Venta', amount: 'S/ 4,250.00', status: 'Pagado', date: '2024-03-24' },
    { id: 'CP-001-901', entity: 'Resinas del Perú', category: 'Compra MP', amount: 'S/ 12,800.00', status: 'Pendiente', date: '2024-03-22' },
    { id: 'FAC-E001-4568', entity: 'Supermercado Metro', category: 'Venta', amount: 'S/ 8,400.00', status: 'Pagado', date: '2024-03-24' },
    { id: 'PLAN-03-24', entity: 'Planilla Planta', category: 'Planilla', amount: 'S/ 25,000.00', status: 'Procesado', date: '2024-03-20' },
]

export default function ContabilidadAdministracion() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#0f4c81] rounded-2xl text-white shadow-lg">
                        <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase leading-none mb-1">Contabilidad & Administración</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-tight uppercase italic">Control Financiero y Núcleo del Servidor Local</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 py-1 px-3">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        SERVIDOR OK
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="contabilidad" className="w-full">
                <TabsList className="bg-slate-100/80 p-1 rounded-2xl h-auto mb-8 border border-slate-200">
                    <TabsTrigger value="contabilidad" className="data-[state=active]:bg-[#0f4c81] data-[state=active]:text-white font-black uppercase tracking-widest text-xs py-2.5 px-6 italic rounded-xl">
                        Estado Financiero
                    </TabsTrigger>
                    <TabsTrigger value="servidor" className="data-[state=active]:bg-[#e8820c] data-[state=active]:text-white font-black uppercase tracking-widest text-xs py-2.5 px-6 italic rounded-xl">
                        Adm. del Servidor
                    </TabsTrigger>
                </TabsList>

                {/* CONTABILIDAD VIEW */}
                <TabsContent value="contabilidad" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Financial Metrics */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <div className="p-6 bg-white rounded-3xl border-2 border-emerald-500/10 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600">
                                        <ArrowUpRight className="h-6 w-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">Cobros Hoy</span>
                                </div>
                                <h3 className="text-3xl font-black text-slate-800 italic tracking-tighter mb-1">S/ 42,850</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ingresos en tiempo real</p>
                            </div>
                            <div className="p-6 bg-white rounded-3xl border-2 border-red-500/10 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 bg-red-50 rounded-2xl text-red-600">
                                        <ArrowDownRight className="h-6 w-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg uppercase tracking-widest">Pagos Hoy</span>
                                </div>
                                <h3 className="text-3xl font-black text-slate-800 italic tracking-tighter mb-1">S/ 18,200</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Gastos y Proveedores</p>
                            </div>
                        </div>

                        {/* P&L Mini Card */}
                        <div className="p-6 bg-[#0f4c81] rounded-3xl text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <FileBarChart className="h-16 w-16" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest italic mb-6 text-white/60">Profit & Loss (Mes)</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-3xl font-black italic tracking-tighter">S/ 124,500</span>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[9px] uppercase tracking-tighter">Última Auditoría OK</Badge>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-emerald-400" />
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">
                                    <span>Gasto: S/ 45k</span>
                                    <span>Meta: S/ 200k</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ledger / Transactions */}
                    <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-sm font-black italic uppercase tracking-widest text-[#0f4c81]">Libro Mayor (Últimos Movimientos)</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase italic border-slate-200">
                                    <Download className="h-3 w-3 mr-2" /> PDF
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase italic border-slate-200">
                                    <Printer className="h-3 w-3 mr-2" /> Imprimir
                                </Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Documento</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Entidad / Detalle</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Monto</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">SUNAT</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {TRANSACTIONS.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-[#0f4c81] tracking-tighter">{t.id}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase">{t.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-800 italic uppercase leading-none mb-0.5">{t.entity}</span>
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">{t.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "text-sm font-black italic",
                                                    t.category.includes('Venta') ? "text-emerald-600" : "text-red-500"
                                                )}>{t.amount}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={cn(
                                                    "font-black text-[9px] uppercase italic tracking-tighter leading-none border-none",
                                                    t.status === 'Pagado' ? "bg-emerald-100 text-emerald-700" :
                                                        t.status === 'Procesado' ? "bg-blue-100 text-blue-700" :
                                                            "bg-amber-100 text-amber-700"
                                                )}>
                                                    {t.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* SERVIDOR VIEW */}
                <TabsContent value="servidor" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Server Status Center */}
                        <div className="lg:col-span-8 bg-card rounded-3xl border border-border shadow-md overflow-hidden">
                            <div className="p-8 bg-[#0f4c81] text-white">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                                            <Server className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Promptive-NodeX</h3>
                                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em]">Servidor Industrial Local</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,.8)]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">En Línea</span>
                                        </div>
                                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">IP: 192.168.1.104</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'CPU Load', value: '12.4%', icon: Cpu },
                                        { label: 'DB Uptime', value: '142 Días', icon: Database },
                                        { label: 'Sync Latency', value: '15ms', icon: Globe },
                                        { label: 'Backup', value: 'Hace 4h', icon: RefreshCw },
                                    ].map(stat => (
                                        <div key={stat.label} className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-2 opacity-50">
                                                <stat.icon className="h-3 w-3" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">{stat.label}</span>
                                            </div>
                                            <span className="text-lg font-black italic tracking-tighter">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Sync Mapping Visualizer */}
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-6">Mapeo de Sincronización Local ⟷ Nube</h4>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'Catálogo de Productos', type: 'Unidireccional (Local 🠆 Cloud)', status: 'OK', color: 'text-[#0f4c81]' },
                                            { name: 'Pedidos Fuerza Ventas', type: 'Bidireccional (Cloud ⟷ Local)', status: 'OK', color: 'text-[#e8820c]' },
                                            { name: 'Facturación / SUNAT', type: 'Unidireccional (Local 🠆 SUNAT)', status: 'Transmitiendo', color: 'text-emerald-500' },
                                            { name: 'Cartera de Clientes', type: 'Bidireccional (Cloud ⟷ Local)', status: 'OK', color: 'text-blue-500' },
                                        ].map(sync => (
                                            <div key={sync.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#0f4c81]/20 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform", sync.color)}>
                                                        {sync.name.includes('Catálogo') ? <Boxes className="h-4 w-4" /> :
                                                            sync.name.includes('Pedidos') ? <Smartphone className="h-4 w-4" /> :
                                                                sync.name.includes('Facturación') ? <ShieldCheck className="h-4 w-4" /> :
                                                                    <Users className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-black text-slate-800 uppercase italic leading-none mb-1">{sync.name}</h5>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{sync.type}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] uppercase italic h-5 px-2">
                                                    {sync.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side Panel: Security & Backups */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-6 bg-white rounded-3xl border border-border shadow-sm flex flex-col items-center text-center">
                                <div className="p-4 bg-emerald-50 rounded-full mb-4 shadow-xl shadow-emerald-500/10">
                                    <ShieldCheck className="h-10 w-10 text-emerald-500" />
                                </div>
                                <h4 className="text-sm font-black text-slate-800 uppercase italic tracking-widest leading-none mb-2">Escudo de Seguridad</h4>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6 italic">
                                    Tus datos están protegidos por encriptación AES-256 y respaldados automáticamente cada 4 horas en el nodo secundario.
                                </p>
                                <Button className="w-full bg-[#0f4c81] hover:bg-[#1a3a5a] text-white rounded-2xl h-11 font-black text-[10px] uppercase italic tracking-widest">
                                    Ver Auditoría de Accesos
                                </Button>
                            </div>

                            <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Database className="h-16 w-16" />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest italic mb-6 text-white/50">Mantenimiento Base Datos</h4>
                                <div className="space-y-4 mb-6 relative">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-white/40">
                                        <span>Espacio Utilizado</span>
                                        <span>42.5 GB / 100 GB</span>
                                    </div>
                                    <Progress value={42.5} className="h-1.5 bg-white/5" />
                                </div>
                                <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-tighter italic h-12 gap-2">
                                    <RefreshCw className="h-3 w-3" />
                                    Optimizar Indexado
                                </Button>
                            </div>

                            <div className="p-6 bg-white rounded-3xl border border-border shadow-sm relative group cursor-pointer overflow-hidden border-l-4 border-l-[#e8820c]">
                                <h4 className="text-[9px] font-black text-[#e8820c] uppercase tracking-widest italic mb-2">Logs de Errores</h4>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-[10px] font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                                        <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                                        <span className="italic leading-none">Sync re-intentado en tabla 'inv_lots' - Hace 5 min</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-[10px] font-bold text-slate-400">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                                        <span className="italic leading-none">Copia de seguridad completada con éxito.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
