'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText, Search, Plus, Calendar,
    User, Send, Download, RefreshCw,
    X, CheckCircle2, AlertCircle, ShoppingCart,
    ArrowRight, MessageSquare, Mail, Printer,
    Clock, MoreVertical, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// --- MOCK DATA ---
const PRODUCTS = [
    { id: 1, name: 'Aceite Motul 10W-40 1L', code: '7891234560001', price: 45.0, stock: 24, category: 'Lubricantes' },
    { id: 2, name: 'Pastilla de Freno Trasera Honda CB190', code: '7891234560002', price: 65.0, stock: 12, category: 'Frenos' },
    { id: 3, name: 'Filtro de Aire Universal K&N', code: '7891234560003', price: 120.0, stock: 4, category: 'Filtros' },
    { id: 4, name: 'Kit de Cadena 428 x 120 eslabones', code: '7891234560004', price: 85.0, stock: 18, category: 'Cadenas' },
    { id: 5, name: 'Llanta Pirelli MT 60 90/90-21', code: '7891234560005', price: 380.0, stock: 9, category: 'Llantas' },
]

const QUOTES = [
    {
        id: 'COT-0952',
        client: 'Corporación MotoExpress SAC',
        date: '2024-06-12',
        expiryDate: '2024-06-20',
        total: 2450.0,
        items: 5,
        status: 'Pendiente',
        prob: '80%'
    },
    {
        id: 'COT-0948',
        client: 'Juan Manuel Torres',
        date: '2024-06-08',
        expiryDate: '2024-06-15',
        total: 820.0,
        items: 2,
        status: 'Vencida',
        prob: '0%'
    },
    {
        id: 'COT-0950',
        client: 'Mecánica Los Olivos EIRL',
        date: '2024-06-10',
        expiryDate: '2024-06-18',
        total: 12400.0,
        items: 14,
        status: 'Aceptada',
        prob: '100%'
    }
]

export default function CotizacionesAutomotriz() {
    const [activeFilter, setActiveFilter] = useState('Todas')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const [showProductPicker, setShowProductPicker] = useState(false)
    const [searchProduct, setSearchProduct] = useState('')

    const total = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    const addItem = (p: any) => {
        const existing = selectedItems.find(i => i.id === p.id)
        if (existing) {
            setSelectedItems(selectedItems.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i))
        } else {
            setSelectedItems([...selectedItems, { ...p, quantity: 1 }])
        }
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Interaction Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 italic tracking-tight">Presupuestos y Cotizaciones</h2>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sánchez Repuestos — Gestión Pre-Venta</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[#3841F2]" />
                        <input
                            type="text"
                            placeholder="Buscar cotización o cliente..."
                            className="h-11 pl-10 pr-4 bg-white border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-[#3841F2] shadow-sm w-full"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#3841F2] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#3841F2]/20 hover:scale-[1.02] active:scale-[0.98] transition-all italic"
                    >
                        <Plus className="h-4 w-4" />
                        CREAR COTIZACIÓN
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Cotizado Mes', val: 'S/ 84,200', sub: '128 Cotizaciones', color: 'text-[#3841F2]' },
                    { label: 'Conversión', val: '24%', sub: '+3.2% vs Mayo', color: 'text-emerald-500' },
                    { label: 'Por Vencer', val: '8', sub: 'Próximos 3 días', color: 'text-amber-500' },
                    { label: 'Ticket Promedio', val: 'S/ 658', sub: 'Preventa', color: 'text-slate-900' },
                ].map((card, i) => (
                    <div key={i} className="bg-card p-6 rounded-3xl border border-border shadow-sm group hover:border-[#3841F2] transition-colors">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">{card.label}</p>
                        <p className={cn("text-3xl font-black italic", card.color)}>{card.val}</p>
                        <p className="text-xs font-bold text-slate-400 mt-2">{card.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quotes Table */}
                <div className="lg:col-span-2 bg-card rounded-[2.5rem] border border-border shadow-md overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-border bg-slate-50/50 flex items-center justify-between">
                        <div className="flex bg-white p-1 rounded-xl border border-border shadow-inner">
                            {['Todas', 'Pendiente', 'Aceptada', 'Vencida'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        activeFilter === f ? 'bg-[#3841F2] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[450px]">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-border">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase">Cotización</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase">Cliente</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase text-center">Estado</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase text-center">Items</th>
                                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {QUOTES.map((q) => (
                                    <tr key={q.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                        <td className="px-8 py-5">
                                            <p className="text-xs font-black text-slate-900 uppercase italic tracking-tighter">{q.id}</p>
                                            <p className="text-xs font-bold text-muted-foreground">{q.date}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-black text-slate-800 leading-tight italic truncate max-w-[200px]">{q.client}</p>
                                            <p className="text-xs font-black text-[#3841F2] uppercase tracking-tighter">Probabilidad: {q.prob}</p>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <Badge className={cn(
                                                "text-[8px] font-black uppercase tracking-tighter px-2",
                                                q.status === 'Aceptada' ? 'bg-emerald-100 text-emerald-700' :
                                                    q.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                            )}>
                                                {q.status}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-5 text-center font-black text-xs text-slate-500">{q.items} uds</td>
                                        <td className="px-8 py-5 text-right font-black text-sm text-[#020659] italic">
                                            S/ {q.total.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel: Detail View */}
                <div className="space-y-6">
                    <div className="bg-[#020659] rounded-[2.5rem] p-8 text-white space-y-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-blue-400 opacity-20 pointer-events-none group-hover:rotate-12 transition-transform">
                            <FileText className="h-32 w-32" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-blue-300">Detalle Selección</h3>
                                <p className="text-2xl font-black italic">COT-0952</p>
                                <Badge className="bg-[#3841F2] text-white border-none text-[9px] font-black">VALIDO HASTA JUN 20</Badge>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { name: 'Aceite Motul 10W-40 (x4)', price: 180.0 },
                                    { name: 'Kit Arrastre DID (x1)', price: 580.0 },
                                    { name: 'Llantas Pirelli MT (x2)', price: 1690.0 },
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-2xl">
                                        <span className="text-xs font-black uppercase text-blue-100 italic truncate max-w-[140px]">{item.name}</span>
                                        <span className="text-sm font-black italic">S/ {item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-white/10 space-y-4">
                                <button onClick={() => toast.success('Cotización convertida en Venta')} className="w-full py-4 bg-[#3841F2] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#3841F2]/30 group/btn">
                                    <ShoppingCart className="h-4 w-4" />
                                    CONVERTIR EN VENTA
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <div className="grid grid-cols-3 gap-3">
                                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                                        <MessageSquare className="h-4 w-4 text-blue-300" />
                                    </button>
                                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                                        <Mail className="h-4 w-4 text-blue-300" />
                                    </button>
                                    <button className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                                        <Printer className="h-4 w-4 text-blue-300" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 space-y-4">
                        <div className="flex items-center gap-3 text-emerald-600">
                            <Zap className="h-5 w-5" />
                            <h3 className="text-sm font-black uppercase tracking-widest">Sugerencia de Cierre</h3>
                        </div>
                        <p className="text-[11px] font-bold text-emerald-700 italic">
                            "El cliente ha visualizado el catálogo 4 veces. Ofrezca un <span className="underline font-black">descuento del 5%</span> en mano de obra para cerrar la venta hoy."
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal: Crear Cotización */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#020659]/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[40px] p-10 max-w-2xl w-full shadow-2xl space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-slate-900 italic">Nueva Cotización</h2>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sánchez Business Intelligence</p>
                                </div>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cliente (DNI/RUC o Nombre)</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input type="text" placeholder="Buscar cliente..." className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-[#3841F2] outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Fecha Emisión</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input type="date" className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Validez (Días)</label>
                                    <select className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none">
                                        <option>7 Días</option>
                                        <option>15 Días</option>
                                        <option>30 Días</option>
                                    </select>
                                </div>
                                <div className="col-span-2 space-y-4">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Productos a Cotizar</label>

                                    <div className="space-y-3">
                                        {selectedItems.map(item => (
                                            <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                                                <div className="flex items-center gap-3">
                                                    <Badge className="bg-[#3841F2] text-white font-black">{item.quantity}x</Badge>
                                                    <span className="text-xs font-black uppercase text-slate-700">{item.name}</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-900 border-b-2 border-slate-200">S/ {(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}

                                        {showProductPicker ? (
                                            <div className="p-6 bg-slate-100 rounded-3xl space-y-4 border border-[#3841F2]/20">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar producto..."
                                                        value={searchProduct}
                                                        onChange={(e) => setSearchProduct(e.target.value)}
                                                        className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#3841F2]"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                                                    {PRODUCTS.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase())).map(p => (
                                                        <button
                                                            key={p.id}
                                                            onClick={() => { addItem(p); setShowProductPicker(false); setSearchProduct(''); }}
                                                            className="flex justify-between items-center p-3 bg-white rounded-xl hover:border-[#3841F2] border border-transparent transition-all text-left"
                                                        >
                                                            <span className="text-[10px] font-black uppercase text-slate-600 italic">{p.name}</span>
                                                            <span className="text-xs font-black text-[#3841F2]">S/ {p.price.toFixed(2)}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <button onClick={() => setShowProductPicker(false)} className="w-full py-2 text-[10px] font-black uppercase text-slate-400">Cancelar</button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setShowProductPicker(true)}
                                                className="p-4 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-[#3841F2] hover:text-[#3841F2] cursor-pointer transition-all group"
                                            >
                                                <Plus className="h-8 w-8 group-hover:rotate-90 transition-transform" />
                                                <span className="text-xs font-black uppercase">Agregar Item del Inventario</span>
                                            </div>
                                        )}
                                    </div>

                                    {selectedItems.length > 0 && (
                                        <div className="pt-4 flex justify-between items-end border-t border-slate-100">
                                            <p className="text-[10px] font-black uppercase text-slate-400">Total Presupuestado</p>
                                            <p className="text-2xl font-black italic text-[#3841F2]">S/ {total.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-5 px-8 border border-slate-200 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                                >
                                    Descartar
                                </button>
                                <button
                                    onClick={() => {
                                        toast.success('Cotización COT-0953 generada correctamente');
                                        setIsCreateModalOpen(false);
                                    }}
                                    className="flex-[2] py-5 px-8 bg-[#3841F2] text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#3841F2]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    <Send className="h-5 w-5" />
                                    GENERAR Y ENVIAR
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
