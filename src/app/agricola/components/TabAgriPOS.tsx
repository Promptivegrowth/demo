'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShoppingCart, User, Search, Plus, Minus,
    Trash2, CreditCard, Wallet, Calendar,
    ChevronRight, BadgePercent, CheckCircle2,
    AlertCircle, Receipt, Landmark
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface TabAgriPOSProps {
    onTabChange: (tab: string) => void
}

export function TabAgriPOS({ onTabChange }: TabAgriPOSProps) {
    const [productos, setProductos] = useState<any[]>([])
    const [agricultores, setAgricultores] = useState<any[]>([])
    const [cart, setCart] = useState<any[]>([])
    const [selectedAgri, setSelectedAgri] = useState<any>(null)
    const [paymentType, setPaymentType] = useState<'contado' | 'credito'>('contado')
    const [installments, setInstallments] = useState(1)
    const [loading, setLoading] = useState(true)
    const [searchProd, setSearchProd] = useState('')
    const [isFinishing, setIsFinishing] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const [p, a] = await Promise.all([
                    agriService.getProductos(),
                    agriService.getAgricultores()
                ])
                setProductos(p)
                setAgricultores(a)
            } catch (err) {
                toast.error('Error al cargar datos del POS')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const addToCart = (prod: any) => {
        const existing = cart.find(item => item.id === prod.id)
        if (existing) {
            setCart(cart.map(item => item.id === prod.id ? { ...item, qty: item.qty + 1 } : item))
        } else {
            setCart([...cart, { ...prod, qty: 1 }])
        }
    }

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id))
    }

    const updateQty = (id: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta)
                return { ...item, qty: newQty }
            }
            return item
        }))
    }

    const total = cart.reduce((acc, item) => {
        const price = paymentType === 'contado' ? item.precio_contado : (item.precio_credito || item.precio_contado)
        return acc + (price * item.qty)
    }, 0)

    const handleFinishSale = async () => {
        if (cart.length === 0) return toast.error('El carrito está vacío')
        if (paymentType === 'credito' && !selectedAgri) return toast.error('Seleccione un agricultor para el crédito')

        setIsFinishing(true)
        try {
            // 1. Create Sale
            const saleNum = `AG-${Math.floor(100000 + Math.random() * 900000)}`
            const { data: saleData, error: saleError } = await supabase
                .from('agri_ventas')
                .insert({
                    numero: saleNum,
                    tipo: paymentType === 'contado' ? 'Venta Contado' : 'Venta Crédito',
                    agricultor_id: selectedAgri?.id || null,
                    total: total,
                    metodo_pago: paymentType.toUpperCase(),
                    estado: 'Completada'
                })
                .select()
                .single()

            if (saleError) throw saleError

            // 2. Create Items
            const items = cart.map(item => ({
                venta_id: saleData.id,
                producto_id: item.id,
                cantidad: item.qty,
                precio_unitario: paymentType === 'contado' ? item.precio_contado : (item.precio_credito || item.precio_contado),
                subtotal: item.qty * (paymentType === 'contado' ? item.precio_contado : (item.precio_credito || item.precio_contado))
            }))

            const { error: itemsError } = await supabase.from('agri_ventas_items').insert(items)
            if (itemsError) throw itemsError

            // 3. Create Installments if Credit
            if (paymentType === 'credito') {
                const cuotaAmt = total / installments
                const cuotas = []
                for (let i = 1; i <= installments; i++) {
                    const vDate = new Date()
                    vDate.setMonth(vDate.getMonth() + i)
                    cuotas.push({
                        venta_id: saleData.id,
                        agricultor_id: selectedAgri.id,
                        numero_cuota: i,
                        monto: cuotaAmt,
                        fecha_vencimiento: vDate.toISOString().split('T')[0],
                        estado: 'Pendiente'
                    })
                }
                await supabase.from('agri_cuotas').insert(cuotas)

                // Update Farmer Balance
                await supabase.from('agri_agricultores')
                    .update({ saldo_utilizado: (selectedAgri.saldo_utilizado || 0) + total })
                    .eq('id', selectedAgri.id)
            }

            toast.success(`Venta ${saleNum} completada con éxito`)
            setCart([])
            setSelectedAgri(null)
            setPaymentType('contado')
        } catch (err: any) {
            toast.error('Error al procesar venta: ' + err.message)
        } finally {
            setIsFinishing(false)
        }
    }

    const filteredProds = productos.filter(p =>
        p.nombre.toLowerCase().includes(searchProd.toLowerCase()) ||
        p.marca.toLowerCase().includes(searchProd.toLowerCase())
    )

    if (loading) return <div className="h-full flex items-center justify-center">Cargando POS Agricola...</div>

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full max-h-[85vh]">
            {/* Product Selection (Left) */}
            <div className="xl:col-span-8 flex flex-col gap-6 overflow-hidden">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="flex-1 flex items-center bg-slate-100 rounded-2xl px-4 py-3 gap-3 border border-transparent focus-within:border-green-500 focus-within:bg-white transition-all">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Escribe para buscar insumos..."
                            value={searchProd}
                            onChange={(e) => setSearchProd(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-2xl text-xs font-bold border border-green-100 italic">
                        <CheckCircle2 className="w-4 h-4" />
                        Precios Actualizados 2026
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProds.map(prod => (
                        <motion.div
                            key={prod.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addToCart(prod)}
                            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-green-500 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col h-full justify-between gap-3">
                                <div>
                                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">{prod.categoria}</span>
                                    <h4 className="font-bold text-slate-800 line-clamp-2 mt-2 leading-tight group-hover:text-green-700">{prod.nombre}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{prod.marca}</p>
                                </div>

                                <div className="flex items-end justify-between border-t border-slate-50 pt-3">
                                    <div className="text-left">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-1">Stock: {prod.stock_actual}</p>
                                        <p className="text-lg font-black text-slate-800 tracking-tighter leading-none">S/ {paymentType === 'contado' ? prod.precio_contado : (prod.precio_credito || prod.precio_contado)}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Ticket & Checkout (Right) */}
            <div className="xl:col-span-4 flex flex-col gap-6 overflow-hidden">
                {/* Agricultor Selector */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-green-600" />
                            <h4 className="font-black text-slate-800 tracking-tight uppercase text-xs">Cliente / Agricultor</h4>
                        </div>
                        {selectedAgri && <button onClick={() => setSelectedAgri(null)} className="text-[10px] font-bold text-red-500 hover:underline">Cambiar</button>}
                    </div>

                    {!selectedAgri ? (
                        <div className="relative">
                            <select
                                onChange={(e) => {
                                    const val = e.target.value
                                    if (val) setSelectedAgri(agricultores.find(a => a.id === val))
                                }}
                                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-green-500 appearance-none"
                            >
                                <option value="">Seleccione agricultor...</option>
                                {agricultores.map(a => (
                                    <option key={a.id} value={a.id}>{a.nombre} - {a.dni}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-4 top-3.5 w-4 h-4 text-slate-400 pointer-events-none rotate-90" />
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50/50 p-4 rounded-3xl border border-green-100 flex items-center justify-between">
                            <div>
                                <p className="font-black text-green-900 text-sm">{selectedAgri.nombre}</p>
                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">{selectedAgri.zona}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase">Límite Crédito</span>
                                        <span className="text-[10px] font-black text-slate-700">S/ {selectedAgri.limite_credito.toLocaleString()}</span>
                                    </div>
                                    <div className="h-6 w-px bg-green-200 mx-1" />
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase">Utilizado</span>
                                        <span className={`text-[10px] font-black ${selectedAgri.saldo_utilizado > selectedAgri.limite_credito ? 'text-red-600' : 'text-slate-700'}`}>S/ {selectedAgri.saldo_utilizado.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-green-100 shadow-sm">
                                <BadgePercent className="w-5 h-5 text-green-600" />
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Cart Listing */}
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h4 className="font-black text-slate-800 tracking-tight uppercase text-xs">Resumen de Venta</h4>
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500">{cart.length} ITEMS</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50/30 rounded-2xl border border-slate-100 group">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{item.nombre}</p>
                                    <p className="text-[10px] font-medium text-slate-400">S/ {paymentType === 'contado' ? item.precio_contado : (item.precio_credito || item.precio_contado)} x {item.qty}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-100 p-1">
                                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><Minus className="w-3 h-3" /></button>
                                    <span className="text-xs font-black min-w-[20px] text-center">{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><Plus className="w-3 h-3" /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                                <ShoppingCart className="w-12 h-12 mb-3" />
                                <p className="text-xs font-bold text-slate-400">El carrito está vacío</p>
                            </div>
                        )}
                    </div>

                    {/* Checkout Area */}
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-4">
                        {/* Payment Type Toggle */}
                        <div className="bg-white p-1.5 rounded-2xl border border-slate-100 flex gap-1">
                            <button
                                onClick={() => setPaymentType('contado')}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${paymentType === 'contado' ? 'bg-[#166534] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                <Wallet className="w-3 h-3" /> Contado
                            </button>
                            <button
                                onClick={() => setPaymentType('credito')}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${paymentType === 'credito' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                <CreditCard className="w-3 h-3" /> Crédito
                            </button>
                        </div>

                        {paymentType === 'credito' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3 overflow-hidden">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Nro de Cuotas:</span>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setInstallments(Math.max(1, installments - 1))} className="w-6 h-6 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">-</button>
                                        <span className="text-sm font-black text-slate-700">{installments}</span>
                                        <button onClick={() => setInstallments(Math.min(12, installments + 1))} className="w-6 h-6 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">+</button>
                                    </div>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-amber-700">
                                        <span>Monto por Cuota:</span>
                                        <span>S/ {(total / installments).toFixed(2)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total a Pagar</span>
                            <span className="text-3xl font-black text-[#166534] tracking-tighter">S/ {total.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleFinishSale}
                            disabled={isFinishing || cart.length === 0}
                            className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${isFinishing || cart.length === 0
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-br from-[#166534] to-[#072c14] text-white shadow-green-900/30 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {isFinishing ? 'Procesando...' : (
                                <>
                                    <Receipt className="w-5 h-5 opacity-50" />
                                    Finalizar Venta
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
