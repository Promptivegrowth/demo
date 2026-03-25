'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ClipboardList, Search, Plus, Trash2,
    Truck, Package, DollarSign, CheckCircle2,
    ChevronDown, ArrowRight, Receipt, Landmark
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'
import { toast } from 'sonner'

export function TabAgriCompras() {
    const [proveedores, setProveedores] = useState<any[]>([])
    const [productos, setProductos] = useState<any[]>([])
    const [selectedProv, setSelectedProv] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const [provs, prods] = await Promise.all([
                    agriService.getProveedores(),
                    agriService.getProductos()
                ])
                setProveedores(provs)
                setProductos(prods)
            } catch (err) {
                toast.error('Error al cargar datos de compras')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const addItem = (prodId: string) => {
        const prod = productos.find(p => p.id === prodId)
        if (!prod) return
        const existing = items.find(i => i.id === prodId)
        if (existing) {
            setItems(items.map(i => i.id === prodId ? { ...i, cantidad: i.cantidad + 1 } : i))
        } else {
            setItems([...items, { ...prod, cantidad: 1, precio: prod.precio_contado * 0.85 }]) // Cost usually lower than sale price
        }
    }

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id))
    }

    const updateItem = (id: string, field: string, val: number) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i))
    }

    const total = items.reduce((acc, i) => acc + (i.cantidad * i.precio), 0)

    const handleSave = async () => {
        if (!selectedProv) return toast.error('Seleccione un proveedor')
        if (items.length === 0) return toast.error('No hay items en la compra')

        setIsSaving(true)
        try {
            await agriService.registrarCompra(selectedProv.id, items)
            toast.success('Orden de compra registrada y stock actualizado')
            setItems([])
            setSelectedProv(null)
        } catch (err) {
            toast.error('Error al registrar compra')
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) return <div className="h-full flex items-center justify-center">Cargando Compras...</div>

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full max-h-[85vh]">
            {/* Configuration (Left) */}
            <div className="lg:col-span-5 flex flex-col gap-6 overflow-hidden">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                    <div>
                        <h4 className="font-black text-slate-800 tracking-tight uppercase text-xs mb-4">Abastecimiento</h4>
                        <div className="relative">
                            <select
                                onChange={(e) => setSelectedProv(proveedores.find(p => p.id === e.target.value))}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-green-500 appearance-none"
                            >
                                <option value="">Seleccione Proveedor (Bayer, Syngenta...)</option>
                                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                            <ChevronDown className="absolute right-5 top-4.5 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {selectedProv && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4">
                            <Truck className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="font-black text-green-900 text-sm">{selectedProv.nombre}</p>
                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">{selectedProv.contacto || 'Sin contacto'}</p>
                            </div>
                        </motion.div>
                    )}

                    <div>
                        <h4 className="font-black text-slate-800 tracking-tight uppercase text-xs mb-4">Seleccionar Insumos</h4>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {productos.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-green-300 transition-all">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate">{p.nombre}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">STOCK: {p.stock_actual}</p>
                                    </div>
                                    <button
                                        onClick={() => addItem(p.id)}
                                        className="p-2 bg-white rounded-xl shadow-sm text-green-600 hover:bg-green-600 hover:text-white transition-all border border-slate-100"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cart / Order Summary (Right) */}
            <div className="lg:col-span-7 flex flex-col gap-6 overflow-hidden">
                <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h4 className="font-black text-slate-800 tracking-tight">Orden de Abastecimiento</h4>
                            <p className="text-xs text-slate-400 font-medium italic">Los precios cargados son referenciales (Costo Promedio)</p>
                        </div>
                        <span className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 uppercase">{items.length} PRODUCTOS</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                        <AnimatePresence>
                            {items.map(item => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={item.id}
                                    className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-green-900/5 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                                        <Package className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-sm font-black text-slate-800 truncate">{item.nombre}</h5>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.marca}</p>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col gap-1 w-24">
                                            <label className="text-[8px] font-black text-slate-400 uppercase">Cantidad</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.cantidad}
                                                onChange={(e) => updateItem(item.id, 'cantidad', Number(e.target.value))}
                                                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 w-28">
                                            <label className="text-[8px] font-black text-slate-400 uppercase">Costo Unit.</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-400">S/</span>
                                                <input
                                                    type="number"
                                                    value={item.precio}
                                                    onChange={(e) => updateItem(item.id, 'precio', Number(e.target.value))}
                                                    className="bg-white border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-black text-slate-800 focus:ring-2 focus:ring-green-500 outline-none w-full"
                                                />
                                            </div>
                                        </div>
                                        <button onClick={() => removeItem(item.id)} className="p-2.5 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {items.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 text-center gap-4">
                                <div className="p-8 bg-slate-50 rounded-full border border-dashed border-slate-200">
                                    <ClipboardList className="w-16 h-16 text-slate-300" />
                                </div>
                                <p className="font-black text-slate-400">Añada productos desde el panel izquierdo</p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-slate-50/80 border-t border-slate-100 space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inversión Estimada</p>
                                <div className="flex items-center gap-3">
                                    <Landmark className="w-6 h-6 text-green-600 opacity-40" />
                                    <span className="text-4xl font-black text-slate-800 tracking-tighter">S/ {total.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Estado: Borrador</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">FECHA: 2026-03-25</p>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving || items.length === 0}
                            className={`w-full py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 ${isSaving || items.length === 0
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-br from-[#166534] to-[#072c14] text-white shadow-green-900/30 hover:scale-[1.02]'
                                }`}
                        >
                            {isSaving ? 'Registrando Abastecimiento...' : (
                                <>
                                    <Receipt className="w-5 h-5 opacity-40" />
                                    Procesar Entrada de Almacén
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
