'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Search, ShoppingBag, Truck, Calendar,
    ArrowUpRight, ChevronRight, Loader2, User,
    Phone, Mail, MapPin, CheckCircle2, PackagePlus,
    BarChart2, History, AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { retQuery } from '@/lib/retQuery'

export function TabRetailCompras({ onTabChange }: { onTabChange?: (t: string) => void }) {
    const [proveedores, setProveedores] = useState<any[]>([])
    const [productos, setProductos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [selectedProv, setSelectedProv] = useState<any>(null)
    const [form, setForm] = useState({
        proveedor_id: '',
        producto_id: '',
        cantidad: 0,
        precio_compra: 0,
        motivo: 'Abastecimiento de Almacén',
        referencia: ''
    })
    const [movimientos, setMovimientos] = useState<any[]>([])

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [provs, prods, movs] = await Promise.all([
                retQuery.getProveedores(),
                retQuery.getProductos(),
                retQuery.getMovimientos()
            ])
            setProveedores(provs)
            setProductos(prods)
            setMovimientos(movs)
            setLoading(false)
        } catch (error) {
            toast.error('Error al cargar datos de abastecimiento')
        }
    }

    const handleRegisterCompra = async () => {
        if (!form.proveedor_id || !form.producto_id || form.cantidad <= 0) {
            toast.warning('Completa todos los campos obligatorios')
            return
        }
        try {
            const prod = productos.find(p => p.id === form.producto_id)
            await retQuery.saveMovimiento({
                producto_id: form.producto_id,
                tipo: 'entrada',
                cantidad: form.cantidad,
                precio_unitario: form.precio_compra,
                total: form.precio_compra * form.cantidad,
                motivo: form.motivo,
                referencia: form.referencia || 'OC-DIRECTA',
                proveedor_id: form.proveedor_id
            })
            toast.success('Entrada de mercadería registrada')
            setShowModal(false)
            loadData()
        } catch (error) {
            toast.error('Error al registrar compra')
        }
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Abastecimiento Estratégico</h3>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-500" /> Gestión de Proveedores y Órdenes de Compra
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-950 text-white rounded-[24px] text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-950/20"
                >
                    <PackagePlus className="w-5 h-5" /> Nueva Entrada
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Panel de Proveedores */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h4 className="text-lg font-black text-slate-900">Directorio de Socios Comerciales</h4>
                                <div className="p-2 bg-white rounded-xl border border-slate-200"><Search className="w-4 h-4 text-slate-400" /></div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {proveedores.map((prov) => (
                                    <div
                                        key={prov.id}
                                        onClick={() => setSelectedProv(prov)}
                                        className={`p-6 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between group ${selectedProv?.id === prov.id ? 'bg-emerald-50/50 border-l-4 border-l-emerald-500' : ''}`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                                <Truck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{prov.categoria}</p>
                                                <h5 className="text-base font-black text-slate-900">{prov.razon_social}</h5>
                                                <p className="text-xs text-slate-400 font-bold">RUC: {prov.ruc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Ficha del Proveedor */}
                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            {selectedProv ? (
                                <motion.div
                                    key={selectedProv.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-slate-900 rounded-[48px] p-8 text-white relative overflow-hidden shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                                    <div className="relative z-10 space-y-8">
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl mx-auto mb-4 flex items-center justify-center border border-white/10">
                                                <User className="w-10 h-10 text-emerald-400" />
                                            </div>
                                            <h4 className="text-xl font-black tracking-tight">{selectedProv.razon_social}</h4>
                                            <div className="mt-2 inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">Partner Verificado</div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-all"><Phone className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" /></div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase">Teléfono Directo</p>
                                                    <p className="text-sm font-bold">{selectedProv.telefono}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-all"><Mail className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" /></div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase">Correo Electrónico</p>
                                                    <p className="text-sm font-bold truncate max-w-[180px]">{selectedProv.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-all"><MapPin className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" /></div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase">Planta / Distribuidor</p>
                                                    <p className="text-[11px] font-bold text-slate-300 leading-tight">{selectedProv.direccion}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/10 space-y-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <History className="w-4 h-4 text-emerald-400" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Órdenes Recientes</p>
                                            </div>
                                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                {movimientos.filter(m => m.proveedor_id === selectedProv.id).length === 0 ? (
                                                    <p className="text-[10px] text-slate-500 font-bold italic">Sin movimientos registrados.</p>
                                                ) : (
                                                    movimientos.filter(m => m.proveedor_id === selectedProv.id).map((m, i) => (
                                                        <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center group/item hover:bg-white/10 transition-all">
                                                            <div>
                                                                <p className="text-sm font-black text-white">{m.ret_productos?.nombre}</p>
                                                                <p className="text-[9px] text-slate-500 font-bold uppercase">{new Date(m.fecha).toLocaleDateString()} • {m.cantidad} {m.ret_productos?.unidad}</p>
                                                            </div>
                                                            <p className="text-xs font-black text-emerald-400">S/ {m.total.toFixed(2)}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center text-center p-10 bg-slate-50/30">
                                    <div className="w-20 h-20 bg-white rounded-3xl border border-slate-100 flex items-center justify-center text-slate-200 mb-6 shadow-sm"><User className="w-10 h-10" /></div>
                                    <h4 className="text-lg font-black text-slate-400 mb-2">Selecciona un Proveedor</h4>
                                    <p className="text-sm text-slate-300 font-medium">Visualiza los detalles de contacto y rendimiento del socio comercial.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Modal Entrada de Mercadería */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-white w-full max-w-2xl rounded-[60px] shadow-[0_50px_100px_rgba(0,0,0,0.3)] overflow-hidden"
                        >
                            <div className="bg-slate-900 p-12 text-white flex justify-between items-start">
                                <div>
                                    <h3 className="text-4xl font-black tracking-tight mb-2">Registro de Ingreso</h3>
                                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Gestión de Abastecimiento Retail</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><X className="w-6 h-6 text-white" /></button>
                            </div>

                            <div className="p-12 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Seleccionar Socio Comercial</label>
                                        <div className="relative">
                                            <Truck className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                                            <select
                                                value={form.proveedor_id}
                                                onChange={e => setForm({ ...form, proveedor_id: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 pl-14 pr-6 text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all appearance-none"
                                            >
                                                <option value="">-- Seleccionar Proveedor --</option>
                                                {proveedores.map(p => <option key={p.id} value={p.id}>{p.razon_social} (RUC: {p.ruc})</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Producto a Ingresar</label>
                                        <div className="relative">
                                            <ShoppingBag className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                                            <select
                                                value={form.producto_id}
                                                onChange={e => setForm({ ...form, producto_id: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 pl-14 pr-6 text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all appearance-none"
                                            >
                                                <option value="">-- Seleccionar Producto del Catálogo --</option>
                                                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_actual})</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Cantidad de Unidades</label>
                                        <input
                                            type="number" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 px-8 text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Costo Unitario (S/)</label>
                                        <input
                                            type="number" value={form.precio_compra} onChange={e => setForm({ ...form, precio_compra: Number(e.target.value) })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 px-8 text-sm font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100/50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm"><BarChart2 className="w-6 h-6" /></div>
                                        <div>
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Inversión Estimada</p>
                                            <p className="text-xl font-black text-emerald-950 tracking-tight">S/ {(form.cantidad * form.precio_compra).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="w-8 h-8 text-emerald-300" />
                                </div>

                                <button
                                    onClick={handleRegisterCompra}
                                    className="w-full py-6 bg-emerald-500 text-slate-950 rounded-[28px] font-black text-sm uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-4"
                                >
                                    Confirmar Entrada <ArrowUpRight className="w-6 h-6" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
