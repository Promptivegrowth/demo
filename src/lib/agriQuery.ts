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
        const { data, error } = await supabase
            .from('agri_ventas')
            .select('*, agri_agricultores(nombre, dni)')
            .order('fecha', { ascending: false });
        if (error) throw error;

        // Adaptamos los datos para la UI
        return data.map(v => ({
            ...v,
            serie_correlativo: v.numero || `F001-${v.id.slice(0, 5).toUpperCase()}`,
            tipo_documento: v.tipo,
            total: Number(v.total),
            created_at: v.fecha
        }));
    },

    async emitirFactura(ventaId: string, tipo: string) {
        const numero = `${tipo === 'Factura' ? 'F' : 'B'}001-${Math.floor(10000 + Math.random() * 90000)}`;
        const { error } = await supabase
            .from('agri_ventas')
            .update({ numero, tipo, comprobante: tipo })
            .eq('id', ventaId);
        if (error) throw error;
        return { success: true, numero };
    },

    // --- CRM INTELIGENTE ---
    async getCRMAnalytics() {
        const { data: sales } = await supabase.from('agri_ventas').select('total');
        const { data: farmers } = await supabase.from('agri_agricultores').select('id');

        const totalSales = sales?.reduce((acc, v) => acc + Number(v.total), 0) || 0;

        return {
            probabilidadRecompra: 85, // Algoritmo simulado
            clientesFieles: farmers?.length || 0,
            proyectosEnCurso: Math.floor((farmers?.length || 0) * 0.6),
            puntosFidelidadTotal: Math.floor(totalSales / 10)
        };
    },

    async getPurchasePredictions() {
        return [
            { cliente: 'José Mendoza', producto: 'Urea Granulada 46%', razon: 'Han pasado 30 días desde la siembra (Arroz)', probabilidad: 95, accion: 'Enviar oferta Fertilizantes' },
            { cliente: 'María Flores', producto: 'Insecticida Karate', razon: 'Ciclo crítico de plagas detectado por clima', probabilidad: 80, accion: 'Agendar llamada técnica' },
            { cliente: 'Luis Paredes', producto: 'Semilla Maíz', razon: 'Fin de campaña previa detectado', probabilidad: 70, accion: 'Enviar catálogo Campaña 2024' },
        ];
    },

    async getFidelizacion() {
        const { data: farmers } = await supabase.from('agri_agricultores').select('nombre, limite_credito, saldo_utilizado');
        return (farmers || []).map(f => ({
            nombre: f.nombre,
            nivel: Number(f.limite_credito) > 10000 ? 'Platinum' : 'Gold',
            puntos: Math.floor(Number(f.saldo_utilizado) / 5),
            proyectos: ['Campaña Actual']
        }));
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
            metaAlcanzada: 75
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
        const { error: cuotaError } = await supabase
            .from('agri_cuotas')
            .update({ estado: 'Pagada', fecha_pago: new Date().toISOString() })
            .eq('id', cuotaId);
        if (cuotaError) throw cuotaError;

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
        const { data: purchase, error: pError } = await supabase
            .from('agri_compras')
            .insert({
                proveedor_id: proveedorId,
                numero_orden: `OC-${Math.floor(1000 + Math.random() * 9000)}`,
                total: items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0),
                estado: 'Completada'
            })
            .select()
            .single();
        if (pError) throw pError;

        for (const item of items) {
            // Update product stock
            const { data: prod } = await supabase.from('agri_productos').select('stock_actual').eq('id', item.id).single();
            const nuevoStock = (prod?.stock_actual || 0) + item.cantidad;
            await supabase.from('agri_productos').update({ stock_actual: nuevoStock }).eq('id', item.id);

            // Register in Kardex
            await supabase.from('agri_kardex').insert({
                producto_id: item.id,
                tipo: 'Entrada',
                cantidad: item.cantidad,
                stock_restante: nuevoStock,
                motivo: `Compra OC: ${purchase.numero_orden}`,
                referencia: purchase.id
            });
        }
        return true;
    },

    // Movimientos (Kardex)
    async getMovimientos() {
        const { data, error } = await supabase
            .from('agri_kardex')
            .select('*, agri_productos(nombre)')
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) return [];
        return data;
    },

    async registrarAjuste(productoId: string, cantidad: number, motivo: string) {
        const { data: prod } = await supabase.from('agri_productos').select('stock_actual').eq('id', productoId).single();
        const nuevoStock = (Number(prod?.stock_actual) || 0) + cantidad;
        await supabase.from('agri_productos').update({ stock_actual: nuevoStock }).eq('id', productoId);

        await supabase.from('agri_kardex').insert({
            producto_id: productoId,
            tipo: 'Ajuste',
            cantidad: Math.abs(cantidad),
            stock_restante: nuevoStock,
            motivo: motivo,
            referencia: 'Ajuste Manual'
        });
        return true;
    },

    async registrarVentaAgente(agenteId: string, agricultorId: string, items: any[]) {
        const total = items.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
        const { data: v, error: ve } = await supabase.from('agri_ventas').insert([{
            agricultor_id: agricultorId,
            agente_id: agenteId,
            tipo: 'Crédito',
            total: total,
            estado: 'Completada',
            metodo_pago: 'Línea de Crédito'
        }]).select().single()

        if (ve) throw ve

        for (const item of items) {
            await supabase.from('agri_ventas_items').insert({
                venta_id: v.id,
                producto_id: item.id,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
                subtotal: item.cantidad * item.precio
            })

            const { data: p } = await supabase.from('agri_productos').select('stock_actual').eq('id', item.id).single()
            const nuevoStock = (p?.stock_actual || 0) - item.cantidad;
            await supabase.from('agri_productos').update({ stock_actual: nuevoStock }).eq('id', item.id)

            await supabase.from('agri_kardex').insert({
                producto_id: item.id,
                tipo: 'Salida',
                cantidad: item.cantidad,
                stock_restante: nuevoStock,
                motivo: `Venta Campo Agente ID: ${agenteId}`,
                referencia: v.id
            })
        }

        // Update farmer balance
        const { data: agri } = await supabase.from('agri_agricultores').select('saldo_utilizado').eq('id', agricultorId).single();
        await supabase.from('agri_agricultores').update({
            saldo_utilizado: (Number(agri?.saldo_utilizado) || 0) + total
        }).eq('id', agricultorId);

        return v
    },

    // --- AGRICULTURA INTELIGENTE ---
    async getParcelas(agricultorId?: string) {
        return [
            { id: 'p1', nombre: 'Lote Norte - Arroz', area: '15 Ha', salud_suelo: 85, ph: 6.5, n: 45, p: 22, k: 34, estado: 'Óptimo', ultima_revision: '2024-03-20', cultivo: 'Arroz INIA 508' },
            { id: 'p2', nombre: 'Sector Este - Maíz', area: '10 Ha', salud_suelo: 62, ph: 5.8, n: 30, p: 15, k: 20, estado: 'Requiere Nitrógeno', ultima_revision: '2024-03-22', cultivo: 'Maíz Dekalb 7088' },
            { id: 'p3', nombre: 'Pampa Sur - Semilleros', area: '5 Ha', salud_suelo: 45, ph: 7.2, n: 12, p: 8, k: 15, estado: 'Crítico: Alerta de Plagas', ultima_revision: '2024-03-24', cultivo: 'Algodón IPA 59' }
        ]
    },

    async getAlertasInteligentes() {
        return [
            { id: 1, tipo: 'Clima', titulo: 'Alerta de Lluvias Intensas', desc: 'Previsión de 40mm para el fin de semana. Posponer fertilización en Lote Norte.', severity: 'High', fecha: 'hace 2h' },
            { id: 2, tipo: 'Plaga', titulo: 'Detección de Gusano Cogollero', desc: 'Casos reportados en parcelas vecinas (radio 2km). Iniciar monitoreo preventivo.', severity: 'Medium', fecha: 'hace 5h' },
            { id: 3, tipo: 'Nutrición', titulo: 'Deficiencia de Potasio Detectada', desc: 'Análisis satelital muestra estrés hídrico y falta de K en Sector Este.', severity: 'Low', fecha: 'hace 1d' }
        ]
    },

    async getRecomendacionesIA(parcelaId: string) {
        const recoms: any = {
            'p1': {
                titulo: 'Optimización de Riego y N',
                consejos: [
                    'Mantener lámina de agua de 5cm constante.',
                    'Aplicar segunda dosis de Urea (50kg/ha) en 4 días.',
                    'Monitorear presencia de avispa barrenadora.'
                ],
                ahorro_estimado: 'S/ 450 por Ha'
            },
            'p2': {
                titulo: 'Corrección de Suelo Ácido',
                consejos: [
                    'Aplicar 2 TM de cal agrícola para elevar pH a 6.2.',
                    'Incorporar materia orgánica (compost) en el próximo abonado.',
                    'Reducir riego por gravedad para evitar lixiviación de N.'
                ],
                ahorro_estimado: 'S/ 320 por Ha'
            },
            'p3': {
                titulo: 'Control Fitosanitario Urgente',
                consejos: [
                    'Aplicar Insecticida Karate Zeon de forma focalizada.',
                    'Eliminar rastrojos infectados de la campaña anterior.',
                    'Instalar trampas de luz para monitoreo de adultos.'
                ],
                ahorro_estimado: 'S/ 1,200 (Evita pérdida de cosecha)'
            }
        };
        return recoms[parcelaId] || recoms['p1'];
    },

    // Facturación Avanzada
    async crearFacturaCompleta(ventaData: any) {
        // 1. Crear la venta
        const numero = `${ventaData.tipo === 'Factura' ? 'F' : 'B'}001-${Math.floor(10000 + Math.random() * 90000)}`;
        const { data: v, error: ve } = await supabase.from('agri_ventas').insert([{
            agricultor_id: ventaData.agricultor_id,
            tipo: ventaData.tipo,
            total: ventaData.total,
            estado: 'Completada',
            numero: numero,
            comprobante: ventaData.tipo,
            metodo_pago: ventaData.metodo_pago,
            fecha: new Date().toISOString()
        }]).select().single()

        if (ve) throw ve

        // 2. Insertar items y actualizar stock/kardex
        for (const item of ventaData.items) {
            await supabase.from('agri_ventas_items').insert({
                venta_id: v.id,
                producto_id: item.id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal: item.subtotal
            })

            // Stock
            const { data: p } = await supabase.from('agri_productos').select('stock_actual').eq('id', item.id).single()
            const nuevoStock = (p?.stock_actual || 0) - item.cantidad;
            await supabase.from('agri_productos').update({ stock_actual: nuevoStock }).eq('id', item.id)

            // Kardex
            await supabase.from('agri_kardex').insert({
                producto_id: item.id,
                tipo: 'Salida',
                cantidad: item.cantidad,
                stock_restante: nuevoStock,
                motivo: `Venta Directa: ${numero}`,
                referencia: v.id
            })
        }

        // 3. Si es a crédito, actualizar saldo del agricultor
        if (ventaData.metodo_pago === 'Línea de Crédito') {
            const { data: agri } = await supabase.from('agri_agricultores').select('saldo_utilizado').eq('id', ventaData.agricultor_id).single();
            await supabase.from('agri_agricultores').update({
                saldo_utilizado: (Number(agri?.saldo_utilizado) || 0) + Number(ventaData.total)
            }).eq('id', ventaData.agricultor_id);
        }

        return v;
    }
}
