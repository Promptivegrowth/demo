import { supabase } from './supabase'

/**
 * Helper conQuery para el módulo de Constructora
 * Proporciona una interfaz limpia para realizar peticiones a las tablas con_*
 */
export const conQuery = {
    // Clientes
    getClientes: () => supabase.from('con_clientes').select('*').order('razon_social'),
    getClienteById: (id: string) => supabase.from('con_clientes').select('*').eq('id', id).single(),

    // Proyectos
    getProyectos: () => supabase.from('con_proyectos').select('*, con_clientes(razon_social)').order('created_at', { ascending: false }),
    getProyectoById: (id: string) => supabase.from('con_proyectos').select('*, con_clientes(*), con_partidas(*)').eq('id', id).single(),
    getProyectosStats: () => supabase.from('con_proyectos').select('estado, presupuesto_base, monto_contrato'),

    // Cotizaciones
    getCotizaciones: () => supabase.from('con_cotizaciones').select('*, con_clientes(razon_social), con_proyectos(nombre)').order('numero', { ascending: false }),
    getCotizacionById: (id: string) => supabase.from('con_cotizaciones').select('*, con_clientes(*), con_proyectos(*), con_cotizacion_items(*)').eq('id', id).single(),

    // Contratos
    getContratos: () => supabase.from('con_contratos').select('*, con_clientes(razon_social), con_proyectos(nombre)').order('numero', { ascending: false }),

    // Valorizaciones
    getValorizaciones: () => supabase.from('con_valorizaciones').select('*, con_clientes(razon_social), con_proyectos(nombre)').order('fecha_presentacion', { ascending: false }),

    // Compras
    getOrdenesCompra: () => supabase.from('con_ordenes_compra').select('*, con_proveedores(razon_social), con_proyectos(nombre)').order('numero', { ascending: false }),
    getProveedores: () => supabase.from('con_proveedores').select('*').order('razon_social'),

    // Almacén
    getAlmacen: (proyectoId?: string) => {
        let q = supabase.from('con_almacen').select('*, con_proyectos(nombre)')
        if (proyectoId) q = q.eq('proyecto_id', proyectoId)
        return q.order('nombre')
    },
    getMovimientosAlmacen: () => supabase.from('con_movimientos_almacen').select('*, con_almacen(nombre, proyecto_id)').order('fecha', { ascending: false }),

    // Personal
    getPersonal: () => supabase.from('con_personal').select('*').order('nombre'),
    getAsistencia: (fecha: string) => supabase.from('con_asistencia').select('*, con_personal(nombre)').eq('fecha', fecha),

    // Finanzas
    getCajaPrincipal: (proyectoId?: string) => {
        let q = supabase.from('con_caja').select('*')
        if (proyectoId) q = q.eq('proyecto_id', proyectoId)
        return q
    },
    getMovimientosCaja: (cajaId?: string) => {
        let q = supabase.from('con_movimientos_caja').select('*')
        if (cajaId) q = q.eq('caja_id', cajaId)
        return q.order('fecha', { ascending: false })
    },

    // Incidencias
    getIncidencias: () => supabase.from('con_incidencias').select('*, con_proyectos(nombre, codigo)').order('fecha', { ascending: false })
}
