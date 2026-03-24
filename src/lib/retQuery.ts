import { supabase } from './supabase'

export const retQuery = {
    // Categorías
    getCategorias: async () => {
        const { data, error } = await supabase.from('ret_categorias').select('*').order('nombre')
        if (error) throw error
        return data
    },

    // Productos
    getProductos: async () => {
        const { data, error } = await supabase.from('ret_productos')
            .select('*, ret_categorias(nombre)')
            .order('nombre')
        if (error) throw error
        return data
    },

    saveProducto: async (producto: any) => {
        const { data, error } = await supabase.from('ret_productos').upsert(producto).select()
        if (error) throw error
        return data[0]
    },

    deleteProducto: async (id: string) => {
        const { error } = await supabase.from('ret_productos').delete().eq('id', id)
        if (error) throw error
    },

    // Kardex
    getKardex: async (limit: number = 20) => {
        const { data, error } = await supabase.from('ret_kardex')
            .select('*, ret_productos(nombre, sku), ret_proveedores(razon_social)')
            .order('created_at', { ascending: false })
            .limit(limit)
        if (error) throw error
        return data
    },

    saveMovimiento: async (mov: any) => {
        // 1. Guardar movimiento
        const { data, error } = await supabase.from('ret_kardex').insert(mov).select()
        if (error) throw error

        // 2. Actualizar stock del producto
        const factor = mov.tipo === 'entrada' ? 1 : -1
        const { error: stockError } = await supabase.rpc('update_retail_stock', {
            p_id: mov.producto_id,
            p_cant: mov.cantidad * factor
        })

        return data[0]
    },

    // Ventas
    getVentas: async () => {
        const { data, error } = await supabase.from('ret_ventas').select('*').order('fecha', { ascending: false })
        if (error) throw error
        return data
    },

    getVentaDetalle: async (ventaId: string) => {
        const { data, error } = await supabase.from('ret_ventas_items')
            .select('*, ret_productos(nombre, sku)')
            .eq('venta_id', ventaId)
        if (error) throw error
        return data
    },

    registarVenta: async (venta: any, items: any[]) => {
        const { data: vData, error: vError } = await supabase.from('ret_ventas').insert(venta).select()
        if (vError) throw vError

        const ventaId = vData[0].id
        const itemsWithId = items.map(it => ({ ...it, venta_id: ventaId }))

        const { error: iError } = await supabase.from('ret_ventas_items').insert(itemsWithId)
        if (iError) throw iError

        for (const item of items) {
            await retQuery.saveMovimiento({
                producto_id: item.producto_id,
                tipo: 'salida',
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                total: item.subtotal,
                motivo: 'Venta ' + venta.numero,
                referencia: ventaId
            })
        }

        return vData[0]
    },

    // Proveedores
    getProveedores: async () => {
        const { data, error } = await supabase.from('ret_proveedores').select('*').order('razon_social')
        if (error) throw error
        return data
    },

    // Gestión de Caja (Sesiones)
    getSesionActiva: async () => {
        const { data, error } = await supabase.from('ret_sesiones_caja')
            .select('*')
            .eq('estado', 'abierta')
            .maybeSingle()
        if (error) throw error
        return data
    },

    abrirCaja: async (sesion: { usuario: string, saldo_inicial: number }) => {
        const { data, error } = await supabase.from('ret_sesiones_caja').insert({
            ...sesion,
            estado: 'abierta',
            fecha_apertura: new Date().toISOString()
        }).select()
        if (error) throw error
        return data[0]
    },

    cerrarCaja: async (id: string, saldo_final: number) => {
        const { data, error } = await supabase.from('ret_sesiones_caja').update({
            estado: 'cerrada',
            fecha_cierre: new Date().toISOString(),
            saldo_final
        }).eq('id', id).select()
        if (error) throw error
        return data[0]
    },

    getMovimientos: async () => {
        const { data, error } = await supabase.from('ret_kardex')
            .select('*, ret_productos(nombre, sku), ret_proveedores(razon_social)')
            .order('created_at', { ascending: false })
        if (error) throw error
        return data
    }
}
