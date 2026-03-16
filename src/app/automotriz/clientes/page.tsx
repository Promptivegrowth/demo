'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Search, UserPlus, CreditCard,
    History, Phone, Mail, MapPin,
    ArrowUpRight, ArrowDownRight, MoreHorizontal,
    FileText, CheckCircle2, AlertCircle,
    TrendingUp, BarChart3, Filter, Plus,
    Edit3, Undo2, LogOut, Clock, ShieldCheck, X
} from 'lucide-react'
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Cell
} from 'recharts'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// --- MOCK DATA ---
const CONSUMPTION_DATA = [
    { month: 'Ene', amount: 1200 },
    { month: 'Feb', amount: 850 },
    { month: 'Mar', amount: 1500 },
    { month: 'Abr', amount: 2100 },
    { month: 'May', amount: 1800 },
    { month: 'Jun', amount: 2400 },
]

const CLIENTS = [
    {
        id: 1,
        name: 'Corporación MotoExpress SAC',
        document: '20608542301',
        type: 'Empresa',
        phone: '987 654 321',
        email: 'ventas@motoexpress.pe',
        creditLine: 5000,
        creditUsed: 1200,
        totalPurchased: 15400,
        lastPurchase: '2024-06-12',
        status: 'Activo'
    },
    {
        id: 2,
        name: 'Roberto Gómez Silva',
        document: '75482319',
        type: 'Persona',
        phone: '992 112 334',
        email: 'roberto.gomez@gmail.com',
        creditLine: 1000,
        creditUsed: 0,
        totalPurchased: 3200,
        lastPurchase: '2024-06-10',
        status: 'Activo'
    },
    {
        id: 3,
        name: 'Mecánica Los Olivos EIRL',
        document: '20456182901',
        type: 'Empresa',
        phone: '955 882 110',
        email: 'taller@losolivos.com',
        creditLine: 8000,
        creditUsed: 7500,
        totalPurchased: 45000,
        lastPurchase: '2024-06-15',
        status: 'Alerta'
    }
]

export default function ClientesAutomotriz() {
    const [clients, setClients] = useState(CLIENTS)
    const [selectedClient, setSelectedClient] = useState<any>(CLIENTS[0])
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.document.includes(searchQuery)
    )

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Main Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-[#3841F2] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por DNI, RUC o Nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-6 bg-card border border-border rounded-2xl text-sm font-medium focus:outline-none focus:border-[#3841F2] shadow-sm transition-all"
                    />
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#3841F2] text-white rounded-xl text-xs font-black shadow-lg shadow-[#3841F2]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <UserPlus className="h-4 w-4" />
                    NUEVO CLIENTE
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Column */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col h-full max-h-[700px]">
                        <div className="p-5 border-b border-border bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Base de Clientes</h3>
                            <Badge className="bg-blue-100 text-[#3841F2] border-none font-black text-[10px]">{filteredClients.length}</Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                            {filteredClients.map((client) => (
                                <button
                                    key={client.id}
                                    onClick={() => setSelectedClient(client)}
                                    className={cn(
                                        "w-full p-5 text-left transition-all hover:bg-slate-50 border-l-4",
                                        selectedClient?.id === client.id ? 'border-[#3841F2] bg-blue-50/30' : 'border-transparent'
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-[13px] font-black text-slate-900 leading-tight truncate">{client.name}</p>
                                        <Badge className={cn(
                                            "text-[8px] font-black uppercase tracking-tighter px-1.5 py-0",
                                            client.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                        )}>
                                            {client.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-[10px] font-black text-[#3841F2] uppercase tracking-tighter italic">{client.document}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{client.lastPurchase}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detail Column */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedClient && (
                            <motion.div
                                key={selectedClient.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Overview Card */}
                                <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden">
                                    <div className="h-24 bg-[#020659] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#3841F2]/20 to-transparent" />
                                    </div>
                                    <div className="px-8 pb-8 -mt-10 relative">
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                            <div className="flex items-end gap-6">
                                                <div className="h-24 w-24 rounded-3xl bg-[#3841F2] border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-black">
                                                    {selectedClient.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0 pb-2">
                                                    <h2 className="text-2xl font-black text-slate-900 truncate">{selectedClient.name}</h2>
                                                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-muted-foreground mt-1">
                                                        <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {selectedClient.phone}</span>
                                                        <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {selectedClient.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-all">
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button className="p-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-all text-blue-600">
                                                    <History className="h-4 w-4" />
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#3841F2] text-white rounded-xl text-xs font-black shadow-lg shadow-[#3841F2]/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                                    NUEVA VENTA
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border bg-slate-50/50">
                                        <div className="p-6 border-r border-border text-center">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Comprado</p>
                                            <p className="text-xl font-black italic text-[#3841F2]">S/ {selectedClient.totalPurchased.toLocaleString()}</p>
                                        </div>
                                        <div className="p-6 border-r border-border text-center">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">N° Compras</p>
                                            <p className="text-xl font-black italic">24</p>
                                        </div>
                                        <div className="p-6 border-r border-border text-center">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Crédito Disponible</p>
                                            <p className="text-xl font-black italic text-emerald-600">S/ {(selectedClient.creditLine - selectedClient.creditUsed).toLocaleString()}</p>
                                        </div>
                                        <div className="p-6 text-center">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Última Visita</p>
                                            <p className="text-sm font-black uppercase tracking-tighter">Hace 2 días</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Credit Card Section */}
                                    <div className="p-8 bg-[#020659] rounded-3xl text-white space-y-6 shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 text-blue-300 opacity-20 group-hover:scale-110 transition-transform">
                                            <CreditCard className="h-24 w-24" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#3841F2] rounded-xl">
                                                <ShieldCheck className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-sm font-black uppercase tracking-widest">Gestión de Crédito</h3>
                                        </div>
                                        <div className="space-y-4 relative z-10">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Saldo Utilizado</p>
                                                    <p className="text-3xl font-black italic">S/ {selectedClient.creditUsed.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Línea Total</p>
                                                    <p className="text-sm font-black opacity-60">S/ {selectedClient.creditLine.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(selectedClient.creditUsed / selectedClient.creditLine) * 100}%` }}
                                                    className={cn(
                                                        "h-full transition-all duration-1000",
                                                        (selectedClient.creditUsed / selectedClient.creditLine) > 0.8 ? 'bg-red-500' : 'bg-[#3841F2]'
                                                    )}
                                                />
                                            </div>
                                            <div className="pt-4 flex gap-3">
                                                <button className="flex-1 py-3 bg-white text-[#020659] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-lg">
                                                    Aplicar Pago
                                                </button>
                                                <button className="flex-1 py-3 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all text-white">
                                                    Ver Cuotas
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Monthly Activity Graph */}
                                    <div className="bg-card rounded-3xl p-8 border border-border shadow-md space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <BarChart3 className="h-4 w-4 text-[#3841F2]" />
                                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Actividad Mensual</h3>
                                            </div>
                                        </div>
                                        <div className="h-40 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={CONSUMPTION_DATA}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                    <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
                                                    <Tooltip
                                                        cursor={{ fill: 'rgba(56, 65, 242, 0.05)' }}
                                                        contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 800 }}
                                                    />
                                                    <Bar dataKey="amount" fill="#3841F2" radius={[4, 4, 0, 0]} barSize={20}>
                                                        {CONSUMPTION_DATA.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={index === 5 ? '#3841F2' : '#E2E8F0'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Purchase History Table */}
                                <div className="bg-white rounded-3xl border border-border shadow-md overflow-hidden">
                                    <div className="p-6 border-b border-border bg-slate-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <History className="h-5 w-5 text-slate-400" />
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Historial de Compras</h3>
                                        </div>
                                        <button className="text-[10px] font-black text-[#3841F2] uppercase tracking-widest hover:underline">Ver Reporte Full</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-border">
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Fecha</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">N° Ticket</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Items</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">M. Pago</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {[
                                                    { date: '2024-06-12', doc: 'TK-002410', items: 3, method: 'Tarjeta', total: 450.0 },
                                                    { date: '2024-06-05', doc: 'TK-002380', items: 12, method: 'Factura', total: 2100.0 },
                                                    { date: '2024-05-28', doc: 'TK-002315', items: 1, method: 'Efectivo', total: 15.0 },
                                                ].map((row, i) => (
                                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 text-[11px] font-bold text-slate-600">{row.date}</td>
                                                        <td className="px-6 py-4 font-black text-[11px] text-slate-800 italic uppercase">{row.doc}</td>
                                                        <td className="px-6 py-4 text-[11px] font-bold text-slate-600">{row.items} uds</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                                <span className="text-[10px] font-black text-slate-700 uppercase">{row.method}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-black text-xs text-[#3841F2]">S/ {row.total.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Integration Banner */}
            <div className="p-4 rounded-2xl bg-[#3841F2]/5 border border-[#3841F2]/10 flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3841F2]" />
                    <span className="text-[10px] font-black text-[#3841F2] uppercase tracking-widest">Sincronización de Historial POS ✓</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3841F2]" />
                    <span className="text-[10px] font-black text-[#3841F2] uppercase tracking-widest">Validación de Crédito Central ✓</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#3841F2]" />
                    <span className="text-[10px] font-black text-[#3841F2] uppercase tracking-widest">Integración CRM PROMPTIVE ✓</span>
                </div>
            </div>

            {/* --- MODALES --- */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-slate-900 italic">Nuevo Cliente</h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Razón Social / Nombre</label>
                                    <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="Nombre completo..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo Doc.</label>
                                        <select className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                                            <option>DNI</option>
                                            <option>RUC</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">N° Documento</label>
                                        <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="00000000" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                                    <input type="email" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="correo@ejemplo.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Línea de Crédito Inicial (S/)</label>
                                    <input type="number" className="w-full h-12 px-4 bg-blue-50 border border-blue-100 rounded-xl font-black text-[#3841F2]" defaultValue="1000" />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        toast.success('Cliente registrado correctamente');
                                        setIsAddModalOpen(false);
                                    }}
                                    className="flex-[2] py-4 px-6 bg-[#3841F2] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#3841F2]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Guardar Cliente
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
