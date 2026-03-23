'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, ShoppingCart, Trash2, Plus, Minus,
    CreditCard, Banknote, CheckCircle2, Package,
    Filter, X, Loader2
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
        <div className="flex h-full gap-6 overflow-hidden">
            {/* Catalog Section */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o código..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-[20px] py-3.5 pl-12 pr-4 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 px-1 max-w-md no-scrollbar">
                        <button
                            onClick={() => setSelectedCat('all')}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCat === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            Todo
                        </button>
                        {categorias.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCat(cat.id)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCat === cat.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                {cat.nombre}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />)}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                            {filtered.map((prod) => (
                                <motion.div
                                    layout
                                    key={prod.id}
                                    onClick={() => addToCart(prod)}
                                    className="bg-white rounded-[32px] overflow-hidden border border-slate-200 group hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer flex flex-col"
                                >
                                    <div className="relative h-40 bg-slate-100 overflow-hidden">
                                        {prod.imagen_url ? (
                                            <img src={`/brain/cf9f9bb3-b40e-4d4e-b2ea-cc0e8a7169a4/${prod.imagen_url}`} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full"><Package className="w-8 h-8 text-slate-300" /></div>
                                        )}
                                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg shadow-sm">
                                            <p className="text-[10px] font-black text-slate-900">S/ {prod.precio_venta.toFixed(2)}</p>
                                        </div>
                                        {prod.stock_actual <= prod.stock_minimo && (
                                            <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white rounded-lg shadow-sm">
                                                <p className="text-[8px] font-black uppercase">Stock Bajo</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">{prod.ret_categorias?.nombre}</p>
                                        <h4 className="text-sm font-bold text-slate-900 leading-tight mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">{prod.nombre}</h4>
                                        <div className="mt-auto flex items-center justify-between">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Stock: <span className={prod.stock_actual > 0 ? "text-slate-600" : "text-red-500"}>{prod.stock_actual}</span></p>
                                            <button className="p-2 rounded-xl bg-slate-900 text-white group-hover:bg-emerald-500 transition-colors shadow-lg">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Cart Section */}
            <div className="w-[380px] bg-white rounded-[40px] border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-emerald-500" /> Carrito
                    </h3>
                    <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black">{cart.length} ITEMS</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                            <ShoppingCart className="w-16 h-16" />
                            <p className="font-bold text-sm">El carrito está vacío</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 pr-4">
                                        <h4 className="text-sm font-bold text-slate-800 leading-snug">{item.nombre}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold">S/ {item.precio_venta.toFixed(2)} / und</p>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
                                        <button onClick={() => updateQty(item.id, -1)} className="p-1 px-2.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-500"><Minus className="w-3 h-3" /></button>
                                        <span className="px-3 text-xs font-black text-slate-900">{item.cantidad}</span>
                                        <button onClick={() => updateQty(item.id, 1)} className="p-1 px-2.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-500"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <p className="text-sm font-black text-slate-950">S/ {(item.precio_venta * item.cantidad).toFixed(2)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-8 bg-slate-900 rounded-t-[48px] shadow-[0_-20px_50px_rgba(15,23,42,0.1)]">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-slate-400">
                            <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                            <span className="text-white font-bold">S/ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span className="text-xs font-bold uppercase tracking-widest">IGV (18%)</span>
                            <span className="text-white font-bold">S/ {igv.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-slate-800 my-2" />
                        <div className="flex justify-between text-emerald-400 items-baseline">
                            <span className="text-lg font-black uppercase tracking-widest">Total</span>
                            <span className="text-3xl font-black">S/ {total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-widest rounded-3xl transition-all border border-slate-700/50">
                            <Banknote className="w-4 h-4" /> Efectivo
                        </button>
                        <button className="flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-3xl transition-all">
                            <CreditCard className="w-4 h-4" /> Tarjeta
                        </button>
                    </div>

                    <button
                        onClick={handleFinalize}
                        disabled={cart.length === 0 || processing}
                        className="w-full mt-4 py-5 bg-white text-slate-950 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-black text-xs uppercase tracking-[0.2em] rounded-[24px] transition-all flex items-center justify-center gap-3 shadow-xl"
                    >
                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finalizar Venta <CheckCircle2 className="w-5 h-5" /></>}
                    </button>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSuccess(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative bg-white w-full max-w-sm rounded-[48px] p-12 text-center overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-2">¡Venta Exitosa!</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed">El comprobante ha sido generado y el inventario actualizado automáticamente.</p>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="w-full py-4 bg-slate-950 text-white font-black text-xs uppercase tracking-widest rounded-3xl hover:bg-slate-800 transition-all shadow-lg"
                            >
                                Siguiente Venta
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
