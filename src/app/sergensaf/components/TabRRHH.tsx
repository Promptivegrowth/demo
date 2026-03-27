'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, UserPlus, Search, Calendar, FileText, Wallet, Clock,
    MoreVertical, CheckCircle, AlertCircle, TrendingUp, Download, Eye, X, Plus
} from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TabRRHH({ showToast }: { showToast: Function }) {
    const [activeTab, setActiveTab] = useState('personal')
    const [empleados, setEmpleados] = useState<any[]>([])
    const [planillas, setPlanillas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalEmpleado, setModalEmpleado] = useState<{ show: boolean, data?: any }>({ show: false })
    const [modalPlanilla, setModalPlanilla] = useState<{ show: boolean }>({ show: false })

    const fetchData = async () => {
        try {
            setLoading(true)
            const [eRes, pRes] = await Promise.all([
                supabase.from('saf_empleados').select('*').order('apellidos'),
                supabase.from('saf_planilla').select('*').order('año', { ascending: false }).order('mes', { ascending: false })
            ])
            setEmpleados(eRes.data || [])
            setPlanillas(pRes.data || [])
        } catch (err) {
            showToast('Error cargando datos de RRHH', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    return (
        <div className="space-y-6 text-[#e6edf3]">
            {/* SUB-NAVBAR */}
            <div className="flex items-center justify-between border-b border-[#30363d]">
                <div className="flex gap-8">
                    {[
                        { id: 'personal', label: 'Gestión de Personal', icon: Users },
                        { id: 'asistencia', label: 'Control Asistencia', icon: Clock },
                        { id: 'planilla', label: 'Planillas (Generador)', icon: Wallet },
                        { id: 'ley', label: 'Beneficios y CTS', icon: FileText },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 pb-4 px-1 text-sm font-semibold transition-all relative ${activeTab === tab.id ? 'text-[#f0a500]' : 'text-[#8b949e] hover:text-white'}`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="hrActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f0a500]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'personal' && <SectionPersonal empleados={empleados} loading={loading} setModal={setModalEmpleado} />}
                    {activeTab === 'asistencia' && <SectionAsistencia empleados={empleados} />}
                    {activeTab === 'planilla' && <SectionPlanilla planillas={planillas} empleados={empleados} setModal={setModalPlanilla} />}
                    {activeTab === 'ley' && <SectionBeneficios empleados={empleados} />}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

// --- SUB-SECCIONES ---

function SectionPersonal({ empleados, loading, setModal }: any) {
    const [busqueda, setBusqueda] = useState('')
    const filtered = empleados.filter((e: any) => `${e.nombres} ${e.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
                    <input
                        type="text" placeholder="Buscar empleado..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#f0a500]"
                    />
                </div>
                <button
                    onClick={() => setModal({ show: true })}
                    className="flex items-center gap-2 px-4 py-2 bg-[#f0a500] hover:bg-[#e06c00] text-[#0d1117] font-bold rounded-lg text-sm transition-colors"
                >
                    <UserPlus className="h-4 w-4" /> Nuevo Empleado
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full py-20 text-center"><div className="w-8 h-8 border-4 border-[#f0a500] border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : filtered.map((e: any) => (
                    <div key={e.id} className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 hover:border-[#f0a500]/50 transition-all group relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#21262d] to-[#0d1117] border border-[#30363d] flex items-center justify-center text-[#8b949e] font-bold text-xl uppercase">
                                {e.nombres[0]}{e.apellidos[0]}
                            </div>
                            <div>
                                <h4 className="text-white font-bold">{e.nombres} {e.apellidos}</h4>
                                <p className="text-xs text-[#8b949e] uppercase font-semibold">{e.cargo}</p>
                            </div>
                            <button
                                onClick={() => setModal({ show: true, data: e })}
                                className="ml-auto p-2 text-[#8b949e] hover:text-white"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d]">
                                <p className="text-[10px] text-[#8b949e] uppercase">Sueldo Base</p>
                                <p className="text-sm font-rajdhani font-bold text-[#f0a500]">S/ {e.sueldo_base?.toLocaleString()}</p>
                            </div>
                            <div className="bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d]">
                                <p className="text-[10px] text-[#8b949e] uppercase">Régimen</p>
                                <p className="text-sm font-bold text-white">{e.regimen_pension === 'afp' ? e.afp_nombre : 'ONP'}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px]">
                                <span className="text-[#8b949e]">Fecha Ingreso:</span>
                                <span className="text-white">{new Date(e.fecha_ingreso).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                                <span className="text-[#8b949e]">Estado:</span>
                                <span className="text-[#238636] font-bold">ACTIVO</span>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-[#30363d] flex gap-2">
                            <button className="flex-1 py-1.5 bg-[#30363d] hover:bg-[#484f58] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"><Eye className="h-3 w-3" /> Legajo</button>
                            <button className="flex-1 py-1.5 bg-[#f0a500]/10 text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0d1117] text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1"><Calendar className="h-3 w-3" /> Asistencia</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function SectionAsistencia({ empleados }: any) {
    return (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center">
            <Calendar className="h-12 w-12 text-[#f0a500] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-2">Monitor de Asistencia en Tiempo Real</h3>
            <p className="text-sm text-[#8b949e] max-w-md mx-auto mb-6">Visualiza las tardanzas, faltas y horas extra de hoy. Sincronizado con el reloj biométrico de planta.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-[#0d1117] rounded-xl border border-[#30363d]">
                    <p className="text-2xl font-bold text-[#238636]">14</p>
                    <p className="text-xs text-[#8b949e]">Presentes</p>
                </div>
                <div className="p-4 bg-[#0d1117] rounded-xl border border-[#30363d]">
                    <p className="text-2xl font-bold text-[#f0a500]">2</p>
                    <p className="text-xs text-[#8b949e]">Tardanzas</p>
                </div>
                <div className="p-4 bg-[#0d1117] rounded-xl border border-[#30363d]">
                    <p className="text-2xl font-bold text-[#da3633]">1</p>
                    <p className="text-xs text-[#8b949e]">Faltas</p>
                </div>
            </div>
        </div>
    )
}

function SectionPlanilla({ planillas, empleados, setModal }: any) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-rajdhani font-bold text-white">Generación de Planillas Mensuales</h3>
                    <p className="text-xs text-[#8b949e]">Cálculo automático bajo normativa SUNAT y régimen general</p>
                </div>
                <button
                    onClick={() => setModal({ show: true })}
                    className="px-4 py-2 bg-[#1f6feb] hover:bg-[#1158c7] text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                    <TrendingUp className="h-4 w-4" /> Ejecutar Cierre Mensual
                </button>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/20 text-[#8b949e] uppercase text-[10px] tracking-wider border-b border-[#30363d]">
                        <tr>
                            <th className="px-6 py-4">Periodo (Mes/Año)</th>
                            <th className="px-6 py-4">Colaboradores</th>
                            <th className="px-6 py-4">Bruto Total</th>
                            <th className="px-6 py-4">Aportes / Contr.</th>
                            <th className="px-6 py-4">Neto a Pagar</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                        {planillas.map((p: any) => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 font-bold text-white uppercase">{p.mes} {p.año}</td>
                                <td className="px-6 py-4 text-white">{p.total_empleados}</td>
                                <td className="px-6 py-4 text-white">S/ {p.total_bruto?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-[#da3633]">S/ {(p.total_bruto - p.total_neto)?.toLocaleString()}</td>
                                <td className="px-6 py-4 text-[#238636] font-bold">S/ {p.total_neto?.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.estado === 'pagado' ? 'bg-[#238636]/20 text-[#238636]' : 'bg-[#f0a500]/20 text-[#f0a500]'}`}>
                                        {p.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button className="p-1.5 text-[#8b949e] hover:text-[#1f6feb]"><Download className="h-4 w-4" /></button>
                                        <button className="p-1.5 text-[#8b949e] hover:text-white"><Eye className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function SectionBeneficios({ empleados }: any) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                <h4 className="text-[#f0a500] font-bold mb-4 flex items-center gap-2"><FileText className="h-4 w-4" /> Provisión de CTS</h4>
                <p className="text-xs text-[#8b949e] mb-6">Estimado acumulado de Compensación por Tiempo de Servicio para el próximo depósito (Mayo/Noviembre).</p>
                <div className="space-y-3">
                    {empleados.slice(0, 4).map((e: any) => (
                        <div key={e.id} className="flex justify-between items-center p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                            <span className="text-xs text-white">{e.nombres} {e.apellidos}</span>
                            <span className="text-sm font-rajdhani font-bold text-white">S/ {(e.sueldo_base / 2).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                <h4 className="text-[#1f6feb] font-bold mb-4 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Gestión de Vacaciones</h4>
                <p className="text-xs text-[#8b949e] mb-6">Días disponibles y gozados según periodo laboral vigente.</p>
                <div className="space-y-4">
                    <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363d]">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-[#8b949e]">Total Días por Gozar (Flota)</span>
                            <span className="text-white font-bold">45 días</span>
                        </div>
                        <div className="w-full bg-[#30363d] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#1f6feb] h-full" style={{ width: '30%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- COMPONENTES DE MODAL ---

function ModalWrapper({ isOpen, onClose, title, children }: any) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#161b22] border border-[#30363d] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="flex justify-between items-center p-6 border-b border-[#30363d]">
                    <h3 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider">{title}</h3>
                    <button onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors"><X className="h-6 w-6" /></button>
                </div>
                <div className="p-6 text-[#e6edf3]">
                    {children}
                </div>
            </motion.div>
        </div>
    )
}

function ModalEmpleado({ isOpen, onClose, data, showToast, refresh }: any) {
    const [formData, setFormData] = useState<any>({
        nombres: '', apellidos: '', dni: '', cargo: '',
        sueldo_base: 1025, regimen_pension: 'afp', afp_nombre: 'Integra',
        fecha_ingreso: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        if (data) setFormData(data)
        else setFormData({
            nombres: '', apellidos: '', dni: '', cargo: '',
            sueldo_base: 1025, regimen_pension: 'afp', afp_nombre: 'Integra',
            fecha_ingreso: new Date().toISOString().split('T')[0]
        })
    }, [data, isOpen])

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        try {
            const { error } = await supabase.from('saf_empleados').upsert(formData)
            if (error) throw error
            showToast('Empleado guardado correctamente', 'success')
            refresh()
            onClose()
        } catch (err: any) {
            showToast(err.message, 'error')
        }
    }

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={data ? 'Editar Ficha' : 'Nuevo Colaborador'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Nombres" required value={formData.nombres || ''} onChange={e => setFormData({ ...formData, nombres: e.target.value })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white" />
                    <input placeholder="Apellidos" required value={formData.apellidos || ''} onChange={e => setFormData({ ...formData, apellidos: e.target.value })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="DNI" required value={formData.dni || ''} onChange={e => setFormData({ ...formData, dni: e.target.value })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white" />
                    <input placeholder="Cargo" required value={formData.cargo || ''} onChange={e => setFormData({ ...formData, cargo: e.target.value })} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase font-bold">Sueldo Base S/</label>
                        <input type="number" value={formData.sueldo_base || 0} onChange={e => setFormData({ ...formData, sueldo_base: parseFloat(e.target.value) })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-[#8b949e] uppercase font-bold">Régimen</label>
                        <select value={formData.regimen_pension || 'afp'} onChange={e => setFormData({ ...formData, regimen_pension: e.target.value })} className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white">
                            <option value="afp">AFP</option>
                            <option value="onp">ONP</option>
                        </select>
                    </div>
                </div>
                <button type="submit" className="w-full py-3 bg-[#f0a500] text-[#0d1117] font-bold rounded-xl shadow-lg hover:brightness-110 mt-4">Guardar Empleado</button>
            </form>
        </ModalWrapper>
    )
}

function ModalPlanilla({ isOpen, onClose, showToast, refresh }: any) {
    const [mes, setMes] = useState('MARZO')
    const [año, setAño] = useState(2024)

    const handleEjecutar = async () => {
        try {
            const { data: emps } = await supabase.from('saf_empleados').select('*')
            if (!emps) return

            const resumen = {
                mes, año,
                total_empleados: emps.length,
                total_bruto: emps.reduce((acc, curr) => acc + curr.sueldo_base, 0),
                total_neto: emps.reduce((acc, curr) => acc + (curr.sueldo_base * 0.87), 0),
                estado: 'pendiente'
            }

            const { error } = await supabase.from('saf_planilla').insert(resumen)
            if (error) throw error
            showToast(`Planilla de ${mes} ${año} generada con éxito`, 'success')
            refresh()
            onClose()
        } catch (err: any) {
            showToast(err.message, 'error')
        }
    }

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Cierre Mensual de Planilla">
            <div className="space-y-6">
                <p className="text-sm text-[#8b949e]">Esta acción calculará los sueldos, descuentos de ley (AFP/ONP) y aportes del empleador (EsSalud) para todos los trabajadores activos.</p>
                <div className="grid grid-cols-2 gap-4">
                    <select value={mes} onChange={e => setMes(e.target.value)} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white">
                        <option value="ENERO">ENERO</option>
                        <option value="FEBRERO">FEBRERO</option>
                        <option value="MARZO">MARZO</option>
                    </select>
                    <select value={año} onChange={e => setAño(parseInt(e.target.value))} className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white">
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                    </select>
                </div>
                <div className="bg-[#f0a500]/10 border border-[#f0a500]/20 p-4 rounded-xl">
                    <p className="text-xs text-[#f0a500] font-bold uppercase mb-1">Nota importante</p>
                    <p className="text-[11px] text-[#f0a500]/80">El sistema tomará la asistencia registrada en el módulo de 'Control Asistencia' para realizar los descuentos por tardanzas o faltas.</p>
                </div>
                <button onClick={handleEjecutar} className="w-full py-4 bg-[#1f6feb] text-white font-bold rounded-xl shadow-lg hover:brightness-110">Procesar y Generar PDF</button>
            </div>
        </ModalWrapper>
    )
}
