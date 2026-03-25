'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Search, Receipt, Calendar,
    AlertCircle, CheckCircle2, DollarSign,
    ChevronRight, ArrowRight, Printer,
    Filter, Landmark, Wallet
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'
import { toast } from 'sonner'

export function TabAgriCreditos() {
    const [agricultores, setAgricultores] = useState<any[]>([])
    const [selectedAgri, setSelectedAgri] = useState<any>(null)
    const [cuotas, setCuotas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingCuotas, setLoadingCuotas] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function load() {
            try {
                const data = await agriService.getAgricultores()
                setAgricultores(data)
            } catch (err) {
                toast.error('Error al cargar agricultores')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const selectAgricultor = async (agri: any) => {
        setSelectedAgri(agri)
        setLoadingCuotas(true)
        try {
            const data = await agriService.getCuotasByAgricultor(agri.id)
            setCuotas(data)
        } catch (err) {
            toast.error('Error al cargar cuotas')
        } finally {
            setLoadingCuotas(false)
        }
    }

    const handlePayCuota = async (cuota: any) => {
        try {
            await agriService.registrarPagoCuota(cuota.id, selectedAgri.id, cuota.monto)
            toast.success('Pago registrado con éxito')
            // Refresh
            const data = await agriService.getCuotasByAgricultor(selectedAgri.id)
            setCuotas(data)
            // Update local agri stats
            setSelectedAgri({
                ...selectedAgri,
                saldo_utilizado: Math.max(0, Number(selectedAgri.saldo_utilizado) - Number(cuota.monto))
            })
        } catch (err) {
            toast.error('Error al procesar pago')
        }
    }

    const filtered = agricultores.filter(a =>
        a.nombre.toLowerCase().includes(search.toLowerCase()) ||
        a.dni.includes(search)
    )

    if (loading) return <div className="h-full flex items-center justify-center">Cargando Créditos...</div>

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full max-h-[85vh]">
            {/* Farmers List (Left) */}
            <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-black text-slate-800 tracking-tight uppercase text-xs">Directorio de Agricultores</h4>
                    <div className="flex items-center bg-slate-100 rounded-2xl px-4 py-3 gap-3">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o DNI..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-full font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {filtered.map(agri => (
                        <motion.div
                            key={agri.id}
                            onClick={() => selectAgricultor(agri)}
                            whileTap={{ scale: 0.98 }}
                            className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${selectedAgri?.id === agri.id
                                    ? 'bg-[#166534] border-[#166534] text-white shadow-lg shadow-green-900/20'
                                    : 'bg-white border-slate-100 text-slate-800 hover:border-green-200'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-bold truncate max-w-[180px]">{agri.nombre}</p>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${selectedAgri?.id === agri.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {agri.dni}
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className={`text-[10px] font-bold ${selectedAgri?.id === agri.id ? 'text-green-100' : 'text-slate-400'}`}>DEUDA TOTAL</p>
                                    <p className="text-lg font-black tracking-tighter">S/ {agri.saldo_utilizado?.toLocaleString() || '0'}</p>
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-[9px] font-black ${agri.estado_credito === 'En mora' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                                    }`}>
                                    {agri.estado_credito}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Account Details (Right) */}
            <div className="lg:col-span-8 overflow-hidden h-full">
                {!selectedAgri ? (
                    <div className="h-full bg-white rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center gap-4 opacity-40">
                        <div className="p-8 bg-slate-50 rounded-full">
                            <Users className="w-16 h-16 text-slate-300" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight">Seleccione un Agricultor</h4>
                            <p className="text-sm font-medium text-slate-400">Elija un registro de la lista izquierda para ver su estado de cuenta detallado</p>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="h-full flex flex-col gap-6"
                    >
                        {/* Header / Summary Card */}
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Landmark className="w-32 h-32" />
                            </div>

                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedAgri.nombre}</h3>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{selectedAgri.zona} • {selectedAgri.cultivos}</p>
                                </div>
                                <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all text-sm">
                                    <Printer className="w-4 h-4" />
                                    Edo. de Cuenta
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Adeudado</p>
                                    <p className="text-2xl font-black text-[#166534] tracking-tighter">S/ {selectedAgri.saldo_utilizado.toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Límite Disponible</p>
                                    <p className="text-2xl font-black text-blue-600 tracking-tighter">S/ {(selectedAgri.limite_credito - selectedAgri.saldo_utilizado).toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Condición</p>
                                    <p className={`text-2xl font-black tracking-tighter ${selectedAgri.estado_credito === 'En mora' ? 'text-red-600' : 'text-green-600'}`}>{selectedAgri.estado_credito}</p>
                                </div>
                            </div>
                        </div>

                        {/* Cuotas List */}
                        <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <h4 className="font-black text-slate-800 tracking-tight tracking-tighter">Plan de Pagos / Cuotas</h4>
                                    <p className="text-xs text-slate-400 font-medium">Cronograma detallado de vencimientos</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400"><Filter className="w-5 h-5" /></button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {loadingCuotas ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl" />)}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cuotas.map((cuota) => (
                                            <div key={cuota.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-2x flex items-center justify-center font-bold border-2 ${cuota.estado === 'Pagada'
                                                            ? 'bg-green-50 text-green-600 border-green-100'
                                                            : 'bg-white text-amber-600 border-amber-100'
                                                        } rounded-2xl`}>
                                                        {cuota.numero_cuota}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">Cuota #{cuota.numero_cuota}</p>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                                            <Receipt className="w-3 h-3" />
                                                            <span>DOC: {cuota.agri_ventas?.numero}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end">
                                                    <p className="text-lg font-black text-slate-800 tracking-tighter">S/ {cuota.monto.toFixed(2)}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        <span className={`text-[10px] font-bold ${cuota.estado === 'Pendiente' && new Date(cuota.fecha_vencimiento) < new Date() ? 'text-red-500' : 'text-slate-400'
                                                            }`}>
                                                            Vence: {cuota.fecha_vencimiento}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="ml-8">
                                                    {cuota.estado === 'Pagada' ? (
                                                        <div className="flex flex-col items-center">
                                                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                            <span className="text-[10px] font-black text-green-600 uppercase">Pagado</span>
                                                            <span className="text-[8px] text-slate-300 font-bold">{new Date(cuota.fecha_pago).toLocaleDateString()}</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handlePayCuota(cuota)}
                                                            className="px-6 py-2.5 bg-white border-2 border-green-100 text-[#166534] rounded-2xl font-bold text-xs hover:bg-[#166534] hover:text-white hover:border-[#166534] transition-all shadow-sm"
                                                        >
                                                            Pagar Cuota
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {cuotas.length === 0 && <p className="text-center py-10 text-slate-400 italic">No hay cuotas pendientes para este agricultor</p>}
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-800 to-slate-900 rounded-[2rem] text-white shadow-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                            <Wallet className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Liquidación Total</p>
                                            <p className="text-sm font-bold text-slate-200">Saldar todas las deudas del cliente</p>
                                        </div>
                                    </div>
                                    <button className="px-8 py-3 bg-green-500 text-green-950 rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-green-500/20">
                                        Liquidación Flash
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
