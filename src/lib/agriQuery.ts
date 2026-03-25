import { supabase } from './supabase'

export const agriService = {
    // Agricultores
    async getAgricultores() {
        const { data, error } = await supabase
            .from('agri_agricultores')
            .select('*')
            .order('nombre', { ascending: true });
        if (error) throw error;
        return data;
    },

    // Proveedores
    async getProveedores() {
        const { data, error } = await supabase
            .from('agri_proveedores')
            .select('*')
            .order('nombre', { ascending: true });
        if (error) throw error;
        return data;
    },

    // Productos (Insumos) - CATÁLOGO ENRIQUECIDO
    async getProductos() {
        const { data, error } = await supabase
            .from('agri_productos')
            .select('*, agri_proveedores(nombre)')
            .order('nombre', { ascending: true });

        // Inyectamos semillas si no existen (Simulación avanzada para la demo)
        const semillasMock = [
            { id: 'sem-01', nombre: 'Semilla Arroz INIA 508', categoria: 'Semillas', marca: 'INIA', stock_actual: 500, stock_minimo: 50, precio_contado: 120, precio_credito: 135, presentacion: 'Saco 40kg', ficha_tecnica: 'Variedad de alta producción, resistente a piricularia.', ciclo_dias: 120 },
            { id: 'sem-02', nombre: 'Maíz Híbrido Dekalb 7088', categoria: 'Semillas', marca: 'Bayer', stock_actual: 200, stock_minimo: 30, precio_contado: 450, precio_credito: 490, presentacion: 'Bolsa 60k semillas', ficha_tecnica: 'Excelente potencial de rendimiento y estabilidad.', ciclo_dias: 150 },
            { id: 'sem-03', nombre: 'Semilla Algodón IPA 59', categoria: 'Semillas', marca: 'IPA', stock_actual: 150, stock_minimo: 20, precio_contado: 85, precio_credito: 95, presentacion: 'Bolsa 20kg', ficha_tecnica: 'Fibra larga y resistente al estrés hídrico.', ciclo_dias: 180 },
        ];

        if (error) throw error;
        return [...data, ...semillasMock];
    },

    async updateProducto(id: string, updates: any) {
        const { error } = await supabase.from('agri_productos').update(updates).eq('id', id);
        if (error) throw error;
        return true;
    },

    // --- FACTURACIÓN ---
    async getFacturas() {
        // Simulación de facturas emitidas
        return [
            { id: 'f1', numero: 'F001-00045', fecha: '2024-03-20', cliente: 'Juan Perez', total: 1250, estado: 'Aceptada', tipo: 'Factura' },
            { id: 'f2', numero: 'B001-00128', fecha: '2024-03-21', cliente: 'Maria Loayza', total: 450, estado: 'Aceptada', tipo: 'Boleta' },
            { id: 'f3', numero: 'F001-00046', fecha: '2024-03-22', cliente: 'Cooperativa Norte', total: 8900, estado: 'Enviada', tipo: 'Factura' },
        ];
    },

    async emitirFactura(ventaId: string, tipo: string) {
        // En una app real, aquí iría la integración con el PSE/OSE (Sunat)
        return { success: true, numero: `${tipo === 'Factura' ? 'F' : 'B'}001-${Math.floor(10000 + Math.random() * 90000)}` };
    },

    // --- CRM INTELIGENTE ---
    async getCRMAnalytics() {
        return {
            probabilidadRecompra: 85,
            clientesFieles: 24,
            proyectosEnCurso: 12,
            puntosFidelidadTotal: 4500
        };
    },

    async getPurchasePredictions() {
        // Lógica de predicción: Si compró semilla hace N días, pronto necesitará abono o pesticida.
        return [
            { cliente: 'Juan Perez', producto: 'Urea Granulada 46%', razon: 'Han pasado 30 días desde la siembra (Arroz)', probabilidad: 95, accion: 'Enviar oferta Fertilizantes' },
            { cliente: 'Maria Loayza', producto: 'Insecticida Karate', razon: 'Ciclo crítico de plagas detectado por clima', probabilidad: 80, accion: 'Agendar llamada técnica' },
            { cliente: 'Carlos Ruiz', producto: 'Semilla Maíz', razon: 'Fin de campaña previa detectado', probabilidad: 70, accion: 'Enviar catálogo Campaña 2024' },
        ];
    },

    async getFidelizacion() {
        return [
            { nombre: 'Juan Perez', nivel: 'Gold', puntos: 1200, proyectos: ['Campaña Arroz 2024'] },
            { nombre: 'Cooperativa Norte', nivel: 'Platinum', puntos: 5000, proyectos: ['Exportación Algodón'] },
            { nombre: 'Maria Loayza', nivel: 'Silver', puntos: 450, proyectos: ['Huerto Familiar'] },
        ];
    },

    // Agentes
    async getAgentes() {
        const { data, error } = await supabase
            .from('agri_agentes')
            .select('*')
            .order('nombre', { ascending: true });
        if (error) throw error;
        return data;
    },

    // Ventas Recientes
    async getVentasRecientes() {
        const { data, error } = await supabase
            .from('agri_ventas')
            .select('*, agri_agricultores(nombre)')
            .order('fecha', { ascending: false })
            .limit(10);
        if (error) throw error;
        return data;
    },

    // Estadísticas del Hub
    async getHubStats() {
        const { data: salesData, error: salesError } = await supabase
            .from('agri_ventas')
            .select('total');

        const { data: farmersData, error: farmersError } = await supabase
            .from('agri_agricultores')
            .select('id');

        const { data: stockData, error: stockError } = await supabase
            .from('agri_productos')
            .select('stock_actual, stock_minimo');

        if (salesError || farmersError || stockError) throw (salesError || farmersError || stockError);

        const totalSales = salesData.reduce((acc, curr) => acc + Number(curr.total), 0);
        const lowStock = stockData.filter(p => p.stock_actual <= p.stock_minimo).length;

        return {
            totalVentas: totalSales,
            numAgricultores: farmersData.length,
            alertasStock: lowStock,
            metaAlcanzada: 75 // Mock para la demo
        };
    },

    // Créditos y Cuotas
    async getCuotasByAgricultor(agricultorId: string) {
        const { data, error } = await supabase
            .from('agri_cuotas')
            .select('*, agri_ventas(numero, total)')
            .eq('agricultor_id', agricultorId)
            .order('fecha_vencimiento', { ascending: true });
        if (error) throw error;
        return data;
    },

    async registrarPagoCuota(cuotaId: string, agricultorId: string, monto: number) {
        // 1. Update cuota status
        const { error: cuotaError } = await supabase
            .from('agri_cuotas')
            .update({ estado: 'Pagada', fecha_pago: new Date().toISOString() })
            .eq('id', cuotaId);
        if (cuotaError) throw cuotaError;

        // 2. Update farmer balance
        const { data: agri, error: agriFetchError } = await supabase
            .from('agri_agricultores')
            .select('saldo_utilizado')
            .eq('id', agricultorId)
            .single();
        if (agriFetchError) throw agriFetchError;

        const { error: agriUpdateError } = await supabase
            .from('agri_agricultores')
            .update({ saldo_utilizado: Math.max(0, Number(agri.saldo_utilizado) - monto) })
            .eq('id', agricultorId);
        if (agriUpdateError) throw agriUpdateError;

        return true;
    },

    async registrarCompra(proveedorId: string, items: any[]) {
        // 1. Create Purchase record
        const { data: purchase, error: pError } = await supabase
            .from('agri_compras')
            .insert({
                proveedor_id: proveedorId,
                numero: `OC-${Math.floor(1000 + Math.random() * 9000)}`,
                total: items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0),
                estado: 'Completada'
            })
            .select()
            .single();
        if (pError) throw pError;

        // 2. Add items and update stock
        for (const item of items) {
            await supabase.from('agri_compras_items').insert({
                compra_id: purchase.id,
                producto_id: item.id,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
                subtotal: item.cantidad * item.precio
            });

            // Update product stock
            const { data: prod } = await supabase.from('agri_productos').select('stock_actual').eq('id', item.id).single();
            await supabase.from('agri_productos').update({
                stock_actual: (prod?.stock_actual || 0) + item.cantidad
            }).eq('id', item.id);
        }
        return true;
    },

    // Movimientos (Kardex)
    async getMovimientos() {
        const { data, error } = await supabase
            .from('agri_movimientos')
            .select('*, agri_productos(nombre)')
            .order('fecha', { ascending: false })
            .limit(50);
        if (error) return [];
        return data;
    },

    async registrarAjuste(productoId: string, cantidad: number, motivo: string) {
        const { data: prod } = await supabase.from('agri_productos').select('stock_actual').eq('id', productoId).single();
        const nuevoStock = (Number(prod?.stock_actual) || 0) + cantidad;
        await supabase.from('agri_productos').update({ stock_actual: nuevoStock }).eq('id', productoId);
        try {
            await supabase.from('agri_movimientos').insert({
                producto_id: productoId,
                tipo: 'Ajuste',
                cantidad: cantidad,
                referencia: motivo
            });
        } catch (e) { }
        return true;
    },

    async registrarVentaAgente(agenteId: string, agricultorId: string, items: any[]) {
        const { data: v, error: ve } = await supabase.from('agri_ventas').insert([{
            agricultor_id: agricultorId,
            agente_id: agenteId,
            tipo_venta: 'Crédito',
            total: items.reduce((acc, i) => acc + (i.precio * i.cantidad), 0),
            estado_pago: 'Pendiente'
        }]).select().single()
        if (ve) throw ve
        for (const item of items) {
            await supabase.from('agri_venta_items').insert({
                venta_id: v.id,
                producto_id: item.id,
                cantidad: item.cantidad,
                precio_unitario: item.precio
            })
            const { data: p } = await supabase.from('agri_productos').select('stock_actual').eq('id', item.id).single()
            await supabase.from('agri_productos').update({ stock_actual: (p?.stock_actual || 0) - item.cantidad }).eq('id', item.id)
            await supabase.from('agri_movimientos').insert({
                producto_id: item.id,
                tipo: 'Salida',
                cantidad: item.cantidad,
                motivo: `Venta Campo: ${v.id}`,
                referencia_id: v.id
            })
        }
        return v
    },

    // --- AGRICULTURA INTELIGENTE ---
    async getParcelas(agricultorId?: string) {
        // Simulación de datos de parcelas con salud de suelo
        return [
            { id: 'p1', nombre: 'Lote Norte - Arroz', area: '15 Ha', salud_suelo: 85, ph: 6.5, n: 45, p: 22, k: 34, estado: 'Óptimo' },
            { id: 'p2', nombre: 'Sector Este - Maíz', area: '10 Ha', salud_suelo: 62, ph: 5.8, n: 30, p: 15, k: 20, estado: 'Requiere Nitrógeno' },
            { id: 'p3', nombre: 'Pampa Sur - Semilleros', area: '5 Ha', salud_suelo: 45, ph: 7.2, n: 12, p: 8, k: 15, estado: 'Crítico: Alerta de Plagas' }
        ]
    },

    async getAlertasInteligentes() {
        return [
            { id: 1, tipo: 'Clima', titulo: 'Alerta de Lluvias Intensas', desc: 'Previsión de 40mm para el fin de semana. Posponer fertilización en Lote Norte.', severity: 'High' },
            { id: 2, tipo: 'Plaga', titulo: 'Detección de Gusano Cogollero', desc: 'Casos reportados en parcelas vecinas (radio 2km). Iniciar monitoreo preventivo.', severity: 'Medium' },
            { id: 3, tipo: 'Nutrición', titulo: 'Deficiencia de Potasio Detectada', desc: 'Análisis satelital muestra estrés hídrico y falta de K en Sector Este.', severity: 'Low' }
        ]
    }
}
