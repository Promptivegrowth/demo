'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, MapPin, Smartphone, TrendingUp,
    Target, Calendar, CheckCircle2, Clock,
    ChevronRight, Phone, MessageSquare, Briefcase
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'
import { toast } from 'sonner'

export function TabAgriAgentes() {
    const [agentes, setAgentes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAgent, setSelectedAgent] = useState<any>(null)
    const [mode, setMode] = useState<'manager' | 'agent'>('manager')

    // Agent Mode States
    const [agricultores, setAgricultores] = useState<any[]>([])
    const [productos, setProductos] = useState<any[]>([])
    const [cart, setCart] = useState<any[]>([])
    const [selAgri, setSelAgri] = useState<any>(null)

    async function load() {
        setLoading(true)
        try {
            const [aData, agriData, pData] = await Promise.all([
                agriService.getAgentes(),
                agriService.getAgricultores(),
                agriService.getProductos()
            ])
            setAgentes(aData)
            setAgricultores(agriData)
            setProductos(pData)
            if (aData.length > 0) setSelectedAgent(aData[0])
        } catch (err) {
            toast.error('Error al cargar datos de agentes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleFieldSale = async () => {
        if (!selAgri || cart.length === 0) return toast.error('Seleccione agricultor e ítems');
        try {
            await agriService.registrarVentaAgente(selectedAgent.id, selAgri.id, cart);
            toast.success('Pedido registrado con éxito');
            setCart([]);
            setSelAgri(null);
            load();
        } catch (err) {
            toast.error('Error al registrar pedido');
        }
    }

    const addToCart = (p: any) => {
        const ext = cart.find(c => c.id === p.id);
        if (ext) {
            setCart(cart.map(c => c.id === p.id ? { ...c, cantidad: c.cantidad + 1 } : c));
        } else {
            setCart([...cart, { ...p, cantidad: 1, precio: p.precio_credito }]);
        }
        toast.success(`${p.nombre} añadido al pedido`);
    }

    if (loading) return <div className="h-full flex items-center justify-center font-black text-[#166534] animate-pulse">CARGANDO ECOSISTEMA DE CAMPO...</div>

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Mode Switcher */}
            <div className="flex items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-200">
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('manager')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'manager' ? 'bg-[#166534] text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Vista Supervisor
                    </button>
                    <button
                        onClick={() => setMode('agent')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'agent' ? 'bg-[#ca8a04] text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Modo WebApp Agente
                    </button>
                </div>
                {mode === 'agent' && (
                    <div className="flex items-center gap-2 text-[#166534]">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                        <span className="text-[10px] font-black uppercase">GPS ACTIVO: {selectedAgent?.nombre}</span>
                    </div>
                )}
            </div>

            {mode === 'manager' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full max-h-[75vh]">
                    {/* Agents List (Left) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-2">
                            <h4 className="font-black text-slate-800 tracking-tight uppercase text-xs">Fuerza de Venta en Campo</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Asesores Técnicos Activos</p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {agentes.map(agente => (
                                <motion.div
                                    key={agente.id}
                                    onClick={() => setSelectedAgent(agente)}
                                    whileTap={{ scale: 0.98 }}
                                    className={`p-5 rounded-[2.5rem] border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedAgent?.id === agente.id
                                        ? 'bg-[#052c16] border-[#052c16] text-white shadow-xl shadow-green-950/40'
                                        : 'bg-white border-slate-100 text-slate-800 hover:border-green-200'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${selectedAgent?.id === agente.id ? 'bg-white/10 text-white' : 'bg-green-50 text-[#166534]'
                                        }`}>
                                        {agente.nombre[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold truncate">{agente.nombre}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${agente.estado === 'Activo' ? 'bg-green-400' : 'bg-slate-300'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${selectedAgent?.id === agente.id ? 'text-green-300' : 'text-slate-400'}`}>
                                                {agente.especialidad || 'Asesor General'}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedAgent?.id === agente.id && <ChevronRight className="w-5 h-5 text-white/40" />}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Agent Detail / Performance (Right) */}
                    <div className="lg:col-span-8 overflow-hidden h-full">
                        {selectedAgent && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full flex flex-col gap-6"
                            >
                                {/* Profile Header */}
                                <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Smartphone className="w-32 h-32" />
                                    </div>

                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-3xl font-black text-white shadow-lg text-shadow-sm">
                                        {selectedAgent.nombre[0]}
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-1">{selectedAgent.nombre}</h3>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <div className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                                                <Phone className="w-3 h-3" />
                                                {selectedAgent.telefono}
                                            </div>
                                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <div className="flex items-center gap-1 text-[#166534] font-black text-xs uppercase tracking-widest">
                                                <Briefcase className="w-3 h-3" />
                                                {selectedAgent.especialidad}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setMode('agent')}
                                            className="px-6 py-3 bg-[#166534] text-white rounded-2xl font-bold shadow-lg shadow-green-950/20 hover:scale-105 transition-all text-sm flex items-center gap-2"
                                        >
                                            <Smartphone className="w-4 h-4" />
                                            Ver como Agente
                                        </button>
                                    </div>
                                </div>

                                {/* KPIs Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Ventas Mes', val: 'S/ 48.5K', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                                        { label: 'Visitas Hoy', val: '12 / 15', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
                                        { label: 'Efectividad', val: '92%', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
                                        { label: 'NPS Campo', val: '4.8', icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    ].map((kpi, idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
                                            <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                                            <p className="text-xl font-black text-slate-800 tracking-tighter">{kpi.val}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Activity & Map Simulation */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
                                    <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm flex flex-col">
                                        <h4 className="font-black text-slate-800 tracking-tight mb-6 uppercase text-xs">Ruta de Visitas Sugerida</h4>
                                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                            {agricultores.slice(0, 5).map((a, i) => (
                                                <div key={a.id} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-green-200 transition-all">
                                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 font-bold text-xs text-[#166534]">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-slate-800">{a.nombre}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium tracking-tighter">Deuda: S/ {a.saldo_utilizado.toLocaleString()} • {a.ubicacion || 'Sector Norte'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[9px] font-black uppercase text-amber-600">Pendiente</span>
                                                        <p className="text-[8px] font-bold text-slate-300 uppercase">Distancia: {(i + 1) * 1.2} km</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 rounded-[3rem] p-8 relative overflow-hidden flex flex-col items-center justify-center border-4 border-slate-800 shadow-2xl">
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-79.84, -6.77,12/400x400?access_token=mock')] bg-cover" />
                                        <motion.div
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="relative z-10 w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center"
                                        >
                                            <MapPin className="w-8 h-8 text-green-400" />
                                            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                                        </motion.div>
                                        <div className="relative z-10 mt-6 text-center text-white">
                                            <p className="font-black text-lg">Zona Lambayeque</p>
                                            <p className="text-[10px] font-black text-green-400 tracking-widest uppercase">Monitoreo GPS Activo</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    {/* Left: Sales & Inventory (FIELD WEB APP) */}
                    <div className="lg:col-span-8 space-y-6 flex flex-col overflow-hidden">
                        <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 flex flex-col gap-6">
                            <h4 className="font-black text-slate-800 tracking-tight uppercase text-xs flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-[#ca8a04]" />
                                Terminal de Venta en Campo
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Seleccionar Agricultor</label>
                                    <select
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-sm outline-none focus:border-[#ca8a04]"
                                        value={selAgri?.id || ''}
                                        onChange={(e) => setSelAgri(agricultores.find(a => a.id === e.target.value))}
                                    >
                                        <option value="">Buscar en zona...</option>
                                        {agricultores.map(a => (
                                            <option key={a.id} value={a.id}>{a.nombre} (S/ {(a.linea_credito - a.saldo_utilizado).toLocaleString()} Disp)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="bg-[#ca8a04]/5 p-4 rounded-2xl border border-dashed border-[#ca8a04]/30 flex flex-col justify-center">
                                    <p className="text-[10px] font-black text-[#ca8a04] uppercase">Línea de Crédito Disponible</p>
                                    <p className="text-xl font-black text-slate-800">S/ {selAgri ? (selAgri.linea_credito - selAgri.saldo_utilizado).toLocaleString() : '0.00'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[3rem] p-8 border-2 border-slate-100 flex-1 flex flex-col overflow-hidden">
                            <h4 className="font-black text-slate-800 tracking-tight mb-6 uppercase text-xs">Inventario en Tiempo Real</h4>
                            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pr-2 custom-scrollbar">
                                {productos.map(p => (
                                    <div key={p.id} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 font-bold text-green-700">
                                            {p.nombre[0]}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[11px] font-black text-slate-800 tracking-tight">{p.nombre}</p>
                                            <p className="text-[9px] font-bold text-slate-400">Stock: {p.stock_actual} {p.presentacion}</p>
                                        </div>
                                        <button
                                            onClick={() => addToCart(p)}
                                            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-[#166534] font-black text-[10px] hover:bg-[#166534] hover:text-white transition-all shadow-sm"
                                        >
                                            + AGREGAR
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Cart & Summary */}
                    <div className="lg:col-span-4 bg-slate-900 rounded-[3rem] p-8 text-white flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-black tracking-tight uppercase text-xs text-amber-400">Carrito Móvil</h4>
                            <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase">Offline Support</div>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar mb-8">
                            {cart.length === 0 ? (
                                <div className="text-center py-20 text-slate-500 font-black text-xs uppercase tracking-widest border-2 border-dashed border-white/10 rounded-[2.5rem]">
                                    PEDIDO VACÍO
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                                        <div className="flex-1">
                                            <p className="text-xs font-black">{item.nombre}</p>
                                            <p className="text-[9px] text-amber-400 font-black">{item.cantidad} UND x S/ {item.precio}</p>
                                        </div>
                                        <p className="font-black text-sm">S/ {(item.cantidad * item.precio).toLocaleString()}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="space-y-4 border-t border-white/10 pt-8">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimado</span>
                                <span className="text-2xl font-black tracking-tighter text-amber-400">S/ {cart.reduce((acc, i) => acc + (i.precio * i.cantidad), 0).toLocaleString()}</span>
                            </div>
                            <button
                                onClick={handleFieldSale}
                                className="w-full py-5 bg-[#ca8a04] hover:bg-amber-500 text-slate-900 rounded-3xl font-black text-sm shadow-2xl shadow-amber-950/40 transition-all active:scale-95 uppercase"
                            >
                                Registrar y Sincronizar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
