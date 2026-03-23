'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, ShoppingCart, Trash2, Plus, Minus,
    CreditCard, Banknote, CheckCircle2, Package,
    Filter, X, Loader2, Zap, ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { retQuery } from '@/lib/retQuery'

export function TabRetailPOS() {
    const [productos, setProductos] = useState<any[]>([])
    const [categorias, setCategorias] = useState<any[]>([])
    const [selectedCat, setSelectedCat] = useState('all')
    const [search, setSearch] = useState('')
    const [cart, setCart] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            const [p, c] = await Promise.all([
                retQuery.getProductos(),
                retQuery.getCategorias()
            ])
            setProductos(p)
            setCategorias(c)
            setLoading(false)
        } catch (error) {
            toast.error('Error al cargar datos del POS')
        }
    }

    const filtered = productos.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
        const matchesCat = selectedCat === 'all' || p.categoria_id === selectedCat
        return matchesSearch && matchesCat
    })

    const addToCart = (p: any) => {
        if (p.stock_actual <= 0) {
            toast.warning('Stock agotado', { description: `No hay unidades de ${p.nombre}` })
            return
        }

        setCart(prev => {
            const exists = prev.find(item => item.id === p.id)
            if (exists) {
                if (exists.cantidad >= p.stock_actual) {
                    toast.warning('Límite de stock', { description: 'No hay más unidades disponibles' })
                    return prev
                }
                return prev.map(item => item.id === p.id ? { ...item, cantidad: item.cantidad + 1 } : item)
            }
            return [...prev, { ...p, cantidad: 1 }]
        })
    }

    const removeFromCart = (pId: string) => {
        setCart(prev => prev.filter(item => item.id !== pId))
    }

    const updateQty = (pId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === pId) {
                const newQty = item.cantidad + delta
                if (newQty <= 0) return item
                if (newQty > item.stock_actual) return item
                return { ...item, cantidad: newQty }
            }
            return item
        }))
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0)
    const igv = subtotal * 0.18
    const total = subtotal + igv

    const handleFinalize = async () => {
        if (cart.length === 0) return
        setProcessing(true)
        try {
            const numVenta = `B001-${Math.floor(Date.now() / 1000)}`
            const venta = {
                numero: numVenta,
                subtotal,
                igv,
                total,
                metodo_pago: 'efectivo',
                estado: 'pagado'
            }
            const items = cart.map(it => ({
                producto_id: it.id,
                nombre_producto: it.nombre,
                cantidad: it.cantidad,
                precio_unitario: it.precio_venta,
                subtotal: it.precio_venta * it.cantidad
            }))

            await retQuery.registarVenta(venta, items)
            setCart([])
            setShowSuccess(true)
            loadData() // Recargar stocks
        } catch (error) {
            toast.error('Error al procesar la venta')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="flex h-full gap-6 overflow-hidden bg-slate-50/30 p-2 rounded-[40px]">
            {/* Catalog Section */}
            <div className="flex-1 flex flex-col min-w-0 bg-white rounded-[40px] border border-slate-200 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Zap className="w-6 h-6 text-emerald-500" /> Venta Rápida
                        </h3>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Catálogo Maestro</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all text-slate-400"><Filter className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Escanea el código o busca el producto..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-[28px] py-5 pl-14 pr-6 text-base font-bold focus:ring-8 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex gap-2 bg-slate-100 p-2 rounded-[24px]">
                        <button
                            onClick={() => setSelectedCat('all')}
                            className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${selectedCat === 'all' ? 'bg-slate-900 text-white shadow-xl shadow-slate-950/20' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
                        >
                            Todo
                        </button>
                        {categorias.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCat(cat.id)}
                                className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${selectedCat === cat.id ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
                            >
                                {cat.nombre}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[40px] animate-pulse" />)}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
                            {filtered.map((prod) => (
                                <motion.div
                                    layout
                                    key={prod.id}
                                    onClick={() => addToCart(prod)}
                                    whileHover={{ y: -5 }}
                                    className="bg-white rounded-[40px] overflow-hidden border border-slate-100 group hover:border-emerald-500 hover:shadow-2xl transition-all cursor-pointer flex flex-col relative"
                                >
                                    <div className="relative h-44 bg-slate-50 overflow-hidden">
                                        {prod.imagen_url ? (
                                            <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full"><Package className="w-12 h-12 text-slate-200" /></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white">
                                            <p className="text-xs font-black text-slate-900 leading-none">S/ {prod.precio_venta.toFixed(2)}</p>
                                        </div>
                                        {prod.stock_actual <= prod.stock_minimo && (
                                            <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20">
                                                <p className="text-[9px] font-black uppercase tracking-tighter">Stock Crítico</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <h4 className="text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">{prod.nombre}</h4>
                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="px-3 py-1 bg-slate-50 rounded-lg group-hover:bg-emerald-50">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Stock: {prod.stock_actual}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white group-hover:bg-emerald-500 transition-all flex items-center justify-center shadow-lg group-hover:rotate-12">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Cart Section */}
            <div className="w-[440px] bg-slate-900 rounded-[50px] shadow-2xl flex flex-col overflow-hidden relative border border-white/5">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none" />

                <div className="p-10 border-b border-white/5 flex items-center justify-between relative z-10 bg-white/5 backdrop-blur-md">
                    <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                            Orden Actual
                        </h3>
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Generación de Boleta</p>
                    </div>
                    <span className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center text-lg font-black shadow-xl shadow-emerald-500/30">{cart.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar relative z-10">
                    <AnimatePresence mode="popLayout">
                        {cart.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-white/20 gap-6">
                                <div className="w-24 h-24 rounded-[40px] bg-white/5 flex items-center justify-center border border-white/5">
                                    <ShoppingCart className="w-12 h-12" />
                                </div>
                                <p className="font-bold text-base tracking-widest uppercase text-white/30">Esperando Selección...</p>
                            </motion.div>
                        ) : (
                            cart.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    key={item.id}
                                    className="p-5 rounded-[32px] border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 pr-6">
                                            <h4 className="text-white font-black text-base leading-tight line-clamp-2">{item.nombre}</h4>
                                            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">S/ {item.precio_venta.toFixed(2)} por unidad</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="p-2.5 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                                            <button onClick={() => updateQty(item.id, -1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors"><Minus className="w-4 h-4 text-emerald-500" /></button>
                                            <span className="px-6 text-base font-black text-white">{item.cantidad}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors"><Plus className="w-4 h-4 text-emerald-500" /></button>
                                        </div>
                                        <p className="text-xl font-black text-white tracking-tighter">S/ {(item.precio_venta * item.cantidad).toFixed(2)}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-10 bg-white/5 rounded-t-[60px] border-t border-white/10 backdrop-blur-2xl relative z-10">
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-white/40">
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Subtotal</span>
                            <span className="text-white font-black text-lg">S/ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/40">
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Cargos IGV (18%)</span>
                            <span className="text-white font-black text-lg">S/ {igv.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-white/10 my-4" />
                        <div className="flex justify-between text-emerald-500 items-baseline">
                            <span className="text-lg font-black uppercase tracking-[0.3em]">Total Neto</span>
                            <span className="text-5xl font-black tracking-tighter shadow-emerald-500/20 drop-shadow-2xl">S/ {total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 py-5 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-3xl transition-all border border-white/5">
                            <Banknote className="w-5 h-5 text-emerald-400" /> Efectivo
                        </button>
                        <button className="flex items-center justify-center gap-3 py-5 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-3xl transition-all border border-white/5">
                            <CreditCard className="w-5 h-5 text-blue-400" /> Tarjeta
                        </button>
                    </div>

                    <button
                        onClick={handleFinalize}
                        disabled={cart.length === 0 || processing}
                        className="w-full mt-6 py-6 bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-white/20 disabled:cursor-not-allowed font-black text-sm uppercase tracking-[0.3em] rounded-[32px] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-emerald-500/30 active:scale-[0.98]"
                    >
                        {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Finalizar Orden <ArrowRight className="w-6 h-6" /></>}
                    </button>
                </div>
            </div>

            {/* Success Modal Élite */}
            <AnimatePresence>
                {showSuccess && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSuccess(false)} className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative bg-white w-full max-w-md rounded-[60px] p-12 text-center overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
                        >
                            <div className="absolute top-0 left-0 w-full h-3 bg-emerald-500" />
                            <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner group overflow-hidden relative">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border-2 border-dashed border-emerald-200" />
                                <CheckCircle2 className="w-16 h-16 text-emerald-500 relative z-10" />
                            </div>
                            <h3 className="text-4xl font-black text-slate-950 mb-4 tracking-tighter">¡Venta Exitosa!</h3>
                            <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed max-w-xs mx-auto text-center">La boleta electrónica ha sido emitida satisfactoriamente y el inventario actualizado.</p>

                            <div className="space-y-4">
                                <button className="w-full py-5 bg-slate-950 text-white font-black text-xs uppercase tracking-[.2em] rounded-3xl hover:bg-emerald-600 transition-all shadow-xl">Imprimir Ticket</button>
                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
                                >
                                    Siguiente Operación
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
