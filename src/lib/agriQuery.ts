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

    // Productos (Insumos)
    async getProductos() {
        const { data, error } = await supabase
            .from('agri_productos')
            .select('*, agri_proveedores(nombre)')
            .order('nombre', { ascending: true });
        if (error) throw error;
        return data;
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
    }
}
