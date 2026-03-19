const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://igxqxrqdvfjrhssagize.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHF4cnFkdmZqcmhzc2FnaXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0ODQ5MTIsImV4cCI6MjA4ODA2MDkxMn0.h2A-45__Hq30AFrNIriawRk24MD1p71yvqn6tMlGOGY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function injectData() {
    console.log("🚀 Iniciando inyección masiva de datos Sergensaf...");

    try {
        let { data: clientes } = await supabase.from('saf_clientes').select('id, saldo_pendiente');
        if (!clientes || clientes.length === 0) {
            console.log("🧑‍💼 Registrando Clientes...");
            await supabase.from('saf_clientes').insert([
                { razon_social: 'Constructora del Sol SAC', ruc: '20123456781', contacto: 'Juan Perez', telefono: '987654321', email: 'contacto@delsol.com', direccion: 'Av. Sol 123', tipo: 'frecuente', credito_habilitado: true, limite_credito: 100000, saldo_pendiente: 0 },
                { razon_social: 'Obras y Minería Los Andes', ruc: '20987654321', contacto: 'Maria Gomez', telefono: '912345678', email: 'compras@losandes.pe', direccion: 'Calle Andes 456', tipo: 'vip', credito_habilitado: true, limite_credito: 250000, saldo_pendiente: 0 },
                { razon_social: 'Maestranza El Martillo EIRL', ruc: '10456123789', contacto: 'Carlos R.', telefono: '999888777', email: 'ventas@elmartillo.com', direccion: 'Jr. Martillo 789', tipo: 'regular', credito_habilitado: false, limite_credito: 0, saldo_pendiente: 0 }
            ]);
            const c = await supabase.from('saf_clientes').select('id, saldo_pendiente');
            clientes = c.data;
        }

        let { data: productos } = await supabase.from('saf_productos').select('id, precio_unitario, stock_actual');
        if (!productos || productos.length === 0) {
            console.log("🧱 Registrando Productos...");
            await supabase.from('saf_productos').insert([
                { nombre: 'Arena Gruesa Extra', unidad: 'm³', stock_actual: 500, stock_minimo: 100, precio_unitario: 45, activo: true },
                { nombre: 'Piedra Chancada 1/2"', unidad: 'm³', stock_actual: 300, stock_minimo: 50, precio_unitario: 65, activo: true },
                { nombre: 'Arena Fina Premium', unidad: 'm³', stock_actual: 400, stock_minimo: 80, precio_unitario: 55, activo: true },
                { nombre: 'Afirmado Controlado', unidad: 'm³', stock_actual: 800, stock_minimo: 200, precio_unitario: 35, activo: true }
            ]);
            const p = await supabase.from('saf_productos').select('id, precio_unitario, stock_actual');
            productos = p.data;
        }

        let { data: flota } = await supabase.from('saf_flota').select('id, placa, chofer_asignado');
        if (!flota || flota.length === 0) {
            console.log("🚚 Registrando Flota...");
            await supabase.from('saf_flota').insert([
                { placa: 'ABC-123', marca: 'Volvo', modelo: 'FMX', capacidad_m3: 15, chofer_asignado: 'Carlos Ruiz', vencimiento_soat: '2026-10-10', vencimiento_rev_tecnica: '2026-08-05', estado: 'disponible' },
                { placa: 'XYZ-987', marca: 'Mercedes', modelo: 'Actros', capacidad_m3: 20, chofer_asignado: 'Luis Perez', vencimiento_soat: '2025-01-10', vencimiento_rev_tecnica: '2025-12-12', estado: 'disponible' },
                { placa: 'TGH-555', marca: 'Scania', modelo: 'P360', capacidad_m3: 15, chofer_asignado: 'Miguel Santos', vencimiento_soat: '2026-02-28', vencimiento_rev_tecnica: '2025-11-20', estado: 'mantenimiento' }
            ]);
            const f = await supabase.from('saf_flota').select('id, placa, chofer_asignado');
            flota = f.data;
        }

        const unMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const hoy = new Date();

        console.log("📦 Generando Órdenes...");
        const estadosOrden = ['pendiente', 'en_proceso', 'despachado', 'entregado'];
        for (let i = 0; i < 15; i++) {
            const cliente = clientes[Math.floor(Math.random() * clientes.length)];
            const prod = productos[Math.floor(Math.random() * productos.length)];

            const cant = Math.floor(Math.random() * 50) + 10;
            const precio = prod.precio_unitario;
            const subtotal = cant * precio;
            const igv = subtotal * 0.18;
            const total = subtotal + igv;

            const fecRandom = new Date(unMesAtras.getTime() + Math.random() * (hoy.getTime() - unMesAtras.getTime()));

            const { data: orden, error: errO } = await supabase.from('saf_ordenes').insert({
                cliente_id: cliente.id,
                numero: `ORD-${Date.now().toString().slice(-6)}-${i}`,
                fecha: fecRandom.toISOString(),
                subtotal, igv, total,
                tipo_pago: Math.random() > 0.5 ? 'contado' : 'credito',
                estado: estadosOrden[Math.floor(Math.random() * estadosOrden.length)],
                observaciones: 'Venta regular'
            }).select().single();

            if (errO) continue;

            await supabase.from('saf_orden_items').insert({
                orden_id: orden.id,
                producto_id: prod.id,
                cantidad: cant,
                precio_unitario: precio,
                monto_total: subtotal
            });

            if (orden.tipo_pago === 'credito') {
                const diasVenc = Math.floor(Math.random() * 30);
                const fecVenc = new Date(fecRandom.getTime() + diasVenc * 24 * 60 * 60 * 1000);
                const esPagado = Math.random() > 0.6 && fecVenc < hoy;
                const saldo = esPagado ? 0 : total;

                const { data: cxc } = await supabase.from('saf_cuentas_por_cobrar').insert({
                    cliente_id: cliente.id,
                    orden_id: orden.id,
                    numero_factura: `F001-${Math.floor(Math.random() * 99999).toString().padStart(6, '0')}`,
                    monto_total: total,
                    saldo: saldo,
                    fecha_emision: fecRandom.toISOString(),
                    fecha_vencimiento: fecVenc.toISOString(),
                    estado: esPagado ? 'pagado' : 'pendiente'
                }).select().single();

                if (esPagado && cxc) {
                    await supabase.from('saf_pagos').insert({
                        cuenta_cobrar_id: cxc.id,
                        monto: total,
                        fecha_pago: fecVenc.toISOString(),
                        metodo_pago: 'transferencia',
                        referencia: `TR-${Math.floor(Math.random() * 10000)}`
                    });
                }
            }

            if (['en_proceso', 'despachado', 'entregado'].includes(orden.estado)) {
                const vehiculo = flota[Math.floor(Math.random() * flota.length)];
                const fecDespacho = new Date(fecRandom.getTime() + (Math.random() * 2 * 24 * 60 * 60 * 1000));
                await supabase.from('saf_despachos').insert({
                    orden_id: orden.id,
                    vehiculo_id: vehiculo.id,
                    numero_guia: `GR-${Math.floor(Math.random() * 99999).toString().padStart(6, '0')}`,
                    fecha_despacho: fecDespacho.toISOString(),
                    conductor: vehiculo.chofer_asignado || `Conductor ${vehiculo.placa}`,
                    volumen_m3: cant,
                    estado: orden.estado === 'entregado' ? 'entregado' : 'en_ruta'
                });
            }
        }

        console.log("🏭 Generando Producción...");
        for (let i = 0; i < 20; i++) {
            const prod = productos[Math.floor(Math.random() * productos.length)];
            const cant = Math.floor(Math.random() * 100) + 20;
            const turno = ['mañana', 'tarde', 'noche'][Math.floor(Math.random() * 3)];
            const fecRandom = new Date(unMesAtras.getTime() + Math.random() * (hoy.getTime() - unMesAtras.getTime()));

            await supabase.from('saf_produccion').insert({
                producto_id: prod.id,
                lote: `LOTE-${fecRandom.getTime().toString().slice(-6)}-${i}`,
                fecha: fecRandom.toISOString(),
                turno: turno,
                cantidad_producida: cant,
                costo_lote_estimado: cant * (prod.precio_unitario * 0.4),
                observaciones: 'Producción Regular'
            });
        }

        console.log("✅ Datos inyectados de forma exitosa!");
    } catch (error) {
        console.error("❌ Error grave during data injection", error);
    }
}

injectData();
