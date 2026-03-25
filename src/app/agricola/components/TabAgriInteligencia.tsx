import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Cpu, Thermometer, Droplets, Wind, AlertTriangle,
    CheckCircle2, Info, TrendingUp, BarChart3, Leaf, Download
} from 'lucide-react'
import { agriService } from '@/lib/agriQuery'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export function TabAgriInteligencia() {
    const [parcelas, setParcelas] = useState<any[]>([])
    const [alertas, setAlertas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const [p, a] = await Promise.all([
                    agriService.getParcelas(),
                    agriService.getAlertasInteligentes()
                ])
                setParcelas(p)
                setAlertas(a)
            } catch (err) {
                toast.error('Error al conectar con el motor de IA')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const exportToPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(20)
        doc.text('REPORTE EJECUTIVO - INTELIGENCIA AGRÍCOLA', 20, 20)
        doc.setFontSize(10)
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30)

        // @ts-ignore
        doc.autoTable({
            startY: 40,
            head: [['Parcela', 'Área', 'Salud', 'pH', 'N', 'P', 'K']],
            body: parcelas.map(p => [p.nombre, p.area, `${p.salud_suelo}%`, p.ph, p.n, p.p, p.k]),
            theme: 'striped',
            headStyles: { fillColor: [22, 101, 52] }
        })

        doc.save('Reporte_Inteligencia_Agricola.pdf')
        toast.success('PDF generado con éxito')
    }

    const exportToExcel = () => {
        const headers = ['Parcela', 'Area', 'Salud', 'pH', 'Nitrogeno', 'Fosforo', 'Potasio']
        const csvContent = "data:text/csv;charset=utf-8," +
            headers.join(",") + "\n" +
            parcelas.map(p => `${p.nombre},${p.area},${p.salud_suelo},${p.ph},${p.n},${p.p},${p.k}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Consolidado_Inteligencia_Agricola.csv");
        document.body.appendChild(link);
        link.click();
        toast.success('Excel consolidado (CSV) generado')
    }

    if (loading) return <div className="h-full flex items-center justify-center font-black text-[#166534] animate-pulse uppercase tracking-tighter">Sincronizando con Satélites...</div>

    return (
        <div className="flex flex-col gap-8 h-full">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <Thermometer className="w-20 h-20 text-[#166534]" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Temperatura Campo</p>
                    <p className="text-4xl font-black text-slate-800 tabular-nums">28.4°C</p>
                    <p className="text-[10px] font-bold text-green-600 mt-2 uppercase tracking-tighter">Condiciones Ideales</p>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <Droplets className="w-20 h-20 text-blue-600" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Humedad Suelo</p>
                    <p className="text-4xl font-black text-slate-800 tabular-nums">42.8%</p>
                    <p className="text-[10px] font-bold text-amber-600 mt-2 uppercase tracking-tighter">Riego Programado: 6:00 PM</p>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <Wind className="w-20 h-20 text-slate-400" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Viento Promedio</p>
                    <p className="text-4xl font-black text-slate-800 tabular-nums">12 km/h</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">Viento de Cola Norte</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
                {/* Plots Analysis (Left) */}
                <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                    <div className="bg-slate-900 p-8 rounded-[3rem] text-white overflow-y-auto pr-2 custom-scrollbar">
                        <h4 className="font-black tracking-tight uppercase text-xs text-green-400 mb-8 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Análisis de Salud por Parcela
                        </h4>

                        <div className="space-y-6">
                            {parcelas.map(p => (
                                <motion.div
                                    key={p.id}
                                    whileHover={{ x: 10 }}
                                    className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all flex flex-col md:flex-row gap-8"
                                >
                                    <div className="md:w-1/3">
                                        <p className="text-lg font-black tracking-tight">{p.nombre}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Extensión: {p.area}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                                <div className="bg-green-500 h-full" style={{ width: `${p.salud_suelo}%` }} />
                                            </div>
                                            <span className="text-xs font-black">{p.salud_suelo}%</span>
                                        </div>
                                        <p className="text-[9px] font-black text-green-400 uppercase mt-2">{p.estado}</p>
                                    </div>

                                    <div className="flex-1 grid grid-cols-4 gap-4">
                                        {[
                                            { label: 'pH', val: p.ph, icon: Info, color: 'text-indigo-400' },
                                            { label: 'Nitrógeno (N)', val: `${p.n}mg/kg`, icon: Leaf, color: 'text-green-400' },
                                            { label: 'Fósforo (P)', val: `${p.p}mg/kg`, icon: Leaf, color: 'text-amber-400' },
                                            { label: 'Potasio (K)', val: `${p.k}mg/kg`, icon: Leaf, color: 'text-orange-400' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                                                <stat.icon className={`w-3 h-3 ${stat.color} mb-2`} />
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{stat.label}</p>
                                                <p className="text-xs font-black mt-1">{stat.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Intelligent Alerts (Right) */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
                    <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 flex-1 flex flex-col overflow-hidden">
                        <h4 className="font-black text-slate-800 tracking-tight mb-8 uppercase text-xs flex items-center justify-between">
                            Alertas de Inteligencia
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                        </h4>

                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                            {alertas.map(a => (
                                <div key={a.id} className={`p-5 rounded-[2rem] border-2 flex flex-col gap-3 transition-all hover:scale-[1.02] ${a.severity === 'High' ? 'bg-red-50 border-red-100' :
                                    a.severity === 'Medium' ? 'bg-amber-50 border-amber-100' :
                                        'bg-blue-50 border-blue-100'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${a.severity === 'High' ? 'bg-red-500 text-white' :
                                            a.severity === 'Medium' ? 'bg-amber-500 text-white' :
                                                'bg-blue-500 text-white'
                                            }`}>
                                            {a.tipo}
                                        </span>
                                        <p className="text-[8px] font-black text-slate-400 uppercase">Hace 2 horas</p>
                                    </div>
                                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter leading-tight">{a.titulo}</p>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{a.desc}</p>
                                </div>
                            ))}
                        </div>

                        <button className="mt-8 w-full py-4 bg-[#166534] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-950/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                            <Cpu className="w-4 h-4" />
                            Generar Recom. IA
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 border-2 border-slate-100 flex flex-col items-center justify-center text-center gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-200">
                    <Download className="w-10 h-10 text-slate-300" />
                </div>
                <div>
                    <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">Central de Reportes Ejecutivos</h4>
                    <p className="text-sm text-slate-400 font-medium px-10">Exporta la analítica consolidada para toma de decisiones estratégicas.</p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                    <button
                        onClick={exportToPDF}
                        className="px-10 py-4 bg-slate-800 text-white rounded-[2rem] font-black text-xs shadow-xl shadow-slate-900/20 hover:scale-105 transition-all uppercase tracking-widest"
                    >
                        PDF Ejecutivo
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="px-10 py-4 bg-[#ca8a04] text-slate-900 rounded-[2rem] font-black text-xs shadow-xl shadow-amber-950/20 hover:scale-105 transition-all uppercase tracking-widest"
                    >
                        Excel Consolidado
                    </button>
                </div>
            </div>
        </div>
    )
}
