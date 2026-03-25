import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Cpu, Thermometer, Droplets, Wind, AlertTriangle,
    CheckCircle2, Info, TrendingUp, BarChart3, Leaf, Download, Clock
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
        doc.setFontSize(22)
        doc.setTextColor(22, 101, 52)
        doc.text('REPORTE EJECUTIVO - INTELIGENCIA AGRÍCOLA', 20, 25)

        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 20, 35)

        doc.setFontSize(14)
        doc.text('1. Salud de Suelo por Parcela', 20, 50)
        // @ts-ignore
        doc.autoTable({
            startY: 55,
            head: [['Parcela', 'Área', 'Salud', 'pH', 'N', 'P', 'K']],
            body: parcelas.map(p => [p.nombre, p.area, `${p.salud_suelo}%`, p.ph, p.n, p.p, p.k]),
            theme: 'grid',
            headStyles: { fillColor: [22, 101, 52], fontStyle: 'bold' }
        })

        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY || 100;

        doc.setFontSize(14)
        doc.text('2. Alertas de Inteligencia Detectadas', 20, finalY + 20)
        // @ts-ignore
        doc.autoTable({
            startY: finalY + 25,
            head: [['Tipo', 'Alerta', 'Gravedad', 'Descripción']],
            body: alertas.map(a => [a.tipo, a.titulo, a.severity, a.desc]),
            theme: 'striped',
            headStyles: { fillColor: [202, 138, 4], textColor: [0, 0, 0] }
        })

        doc.save('Reporte_Ejecutivo_Agricola_V2.pdf')
        toast.success('Reporte PDF (Parcelas + Alertas) generado')
    }

    const exportToExcel = () => {
        const headers = ['Parcela', 'Area', 'Salud', 'pH', 'Nitrogeno', 'Fosforo', 'Potasio']
        const csvContent = "data:text/csv;charset=utf-8," +
            headers.join(",") + "\n" +
            parcelas.map(p => `${p.nombre},${p.area},${p.salud_suelo},${p.ph},${p.n},${p.p},${p.k}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Consolidado_Agro_IA.csv");
        document.body.appendChild(link);
        link.click();
        toast.success('Excel consolidado generado')
    }

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#166534] animate-pulse uppercase tracking-tighter">Sincronizando con Satélites...</div>

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header / Stats Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Temperatura Campo', val: '28.4°C', sub: 'Condiciones Ideales', icon: Thermometer, color: 'text-[#166534]' },
                    { label: 'Humedad Suelo', val: '42.8%', sub: 'Riego Programado: 6:00 PM', icon: Droplets, color: 'text-blue-600' },
                    { label: 'Viento Promedio', val: '12 km/h', sub: 'Viento de Cola Norte', icon: Wind, color: 'text-slate-400' }
                ].map((s, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                            <s.icon className={`w-20 h-20 ${s.color}`} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-4xl font-black text-slate-800 tabular-nums tracking-tighter">{s.val}</p>
                        <p className={`text-[10px] font-bold mt-2 uppercase tracking-tighter ${s.color}`}>{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
                {/* Plots Analysis (Left) */}
                <div className="lg:col-span-8 bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col shadow-2xl relative">
                    <h4 className="font-black tracking-tight uppercase text-xs text-green-400 mb-8 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Análisis de Salud por Parcela
                    </h4>

                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-6 max-h-[800px]">
                        {parcelas.map(p => (
                            <motion.div
                                key={p.id}
                                whileHover={{ x: 10 }}
                                className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all flex flex-col xl:flex-row gap-8"
                            >
                                <div className="xl:w-1/3">
                                    <p className="text-xl font-black tracking-tight mb-1">{p.nombre}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Extensión: {p.area}</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-white/10 h-3 rounded-full overflow-hidden">
                                            <div className="bg-green-500 h-full" style={{ width: `${p.salud_suelo}%` }} />
                                        </div>
                                        <span className="text-sm font-black text-green-400">{p.salud_suelo}%</span>
                                    </div>
                                    <p className="text-[10px] font-black text-white/40 uppercase mt-3 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${p.salud_suelo > 80 ? 'bg-green-500' : 'bg-amber-500'}`} />
                                        {p.estado}
                                    </p>
                                </div>

                                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: 'pH Suelo', val: p.ph, icon: Info, color: 'text-indigo-400' },
                                        { label: 'Nitrógeno (N)', val: `${p.n}mg/kg`, icon: Leaf, color: 'text-green-400' },
                                        { label: 'Fósforo (P)', val: `${p.p}mg/kg`, icon: Leaf, color: 'text-amber-400' },
                                        { label: 'Potasio (K)', val: `${p.k}mg/kg`, icon: Leaf, color: 'text-orange-400' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center group/stat hover:bg-white/10 transition-all">
                                            <stat.icon className={`w-4 h-4 ${stat.color} mb-3 group-hover/stat:scale-125 transition-transform`} />
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1">{stat.label}</p>
                                            <p className="text-sm font-black">{stat.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Intelligent Alerts (Right) */}
                <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col relative">
                    <h4 className="font-black text-slate-800 tracking-tight mb-8 uppercase text-xs flex items-center justify-between">
                        Alertas de Inteligencia
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </h4>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[800px] mb-6">
                        {alertas.map(a => (
                            <div key={a.id} className={`p-6 rounded-[1.5rem] border-2 flex flex-col gap-3 transition-all hover:translate-x-1 ${a.severity === 'High' ? 'bg-red-50 border-red-100' :
                                a.severity === 'Medium' ? 'bg-amber-50 border-amber-100' :
                                    'bg-blue-50 border-blue-100'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${a.severity === 'High' ? 'bg-red-500 text-white' :
                                        a.severity === 'Medium' ? 'bg-amber-500 text-white' :
                                            'bg-blue-500 text-white'
                                        }`}>
                                        {a.tipo}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-300" />
                                        <p className="text-[8px] font-black text-slate-400 uppercase">2h</p>
                                    </div>
                                </div>
                                <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter leading-tight">{a.titulo}</p>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{a.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <button
                            onClick={() => toast.success('Analizando patrones de cultivo... Generando recomendaciones personalizadas.', { icon: <Cpu className="w-4 h-4 text-green-600" /> })}
                            className="w-full py-5 bg-[#166534] text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Cpu className="w-5 h-5 text-green-300" />
                            Generar Recom. IA
                        </button>
                    </div>
                </div>
            </div>

            {/* Export Center */}
            <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-200 flex flex-col items-center justify-center text-center gap-8 shadow-inner">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 shadow-sm">
                    <Download className="w-10 h-10 text-slate-400 animate-bounce" />
                </div>
                <div className="max-w-2xl">
                    <h4 className="text-3xl font-black text-slate-800 tracking-tight mb-3 uppercase tracking-tighter">Central de Reportes Ejecutivos</h4>
                    <p className="text-sm text-slate-400 font-medium px-8 italic">Exporta la analítica consolidada de salud de suelo, alertas críticas y proyecciones climáticas para la toma de decisiones estratégicas en gerencia.</p>
                </div>
                <div className="flex flex-wrap gap-6 justify-center">
                    <button
                        onClick={exportToPDF}
                        className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs shadow-2xl shadow-slate-900/30 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest border border-white/10"
                    >
                        PDF Ejecutivo de Campaña
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="px-12 py-5 bg-[#ca8a04] text-slate-900 rounded-[2rem] font-black text-xs shadow-2xl shadow-amber-950/30 hover:bg-amber-500 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                    >
                        Data Consolidada (Excel/CSV)
                    </button>
                </div>
            </div>
        </div>
    )
}
