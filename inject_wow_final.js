const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://igxqxrqdvfjrhssagize.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneHF4cnFkdmZqcmhzc2FnaXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0ODQ5MTIsImV4cCI6MjA4ODA2MDkxMn0.h2A-45__Hq30AFrNIriawRk24MD1p71yvqn6tMlGOGY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function injectWOW() {
    console.log("🚀 Iniciando Inyección WOW Sergensaf...");

    try {
        let { data: clientes } = await supabase.from('saf_clientes').select('id, saldo_pendiente');
        if (!clientes?.length) return console.log("Faltan clientes.");

        let { data: productos } = await supabase.from('saf_productos').select('id, precio_unitario, stock_actual');
        if (!productos?.length) return console.log("Faltan productos.");

        console.log("🚚 Registrando Flota Ficticia Extra (con SOAT Vencido)...");
        await supabase.from('saf_flota').insert([
            { placa: 'WOW-001', marca: 'Freightliner', modelo: 'Cascadia', capacidad_m3: 30, chofer_asignado: 'Roberto D.', vencimiento_soat: '2023-05-10', vencimiento_rev_tecnica: '2024-01-10', estado: 'disponible' },
            { placa: 'WOW-002', marca: 'Kenworth', modelo: 'T680', capacidad_m3: 25, chofer_asignado: 'Armando L.', vencimiento_soat: '2025-10-10', vencimiento_rev_tecnica: '2023-08-05', estado: 'mantenimiento' },
            { placa: 'WOW-003', marca: 'International', modelo: 'ProStar', capacidad_m3: 20, chofer_asignado: 'Luis C.', vencimiento_soat: '2024-02-15', vencimiento_rev_tecnica: '2024-02-15', estado: 'disponible' },
            { placa: 'WOW-004', marca: 'Hino', modelo: 'Serie 500', capacidad_m3: 15, chofer_asignado: 'Martin P.', vencimiento_soat: '2026-12-31', vencimiento_rev_tecnica: '2026-11-30', estado: 'disponible' }
        ]);
        let { data: flota } = await supabase.from('saf_flota').select('id, placa, chofer_asignado');

        const tresMesesAtras = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const hoy = new Date();

        console.log("📦 Generando 80 Órdenes, Cuentas por Cobrar y Despachos...");
        const estadosOrden = ['pendiente', 'en_proceso', 'despachado', 'entregado'];
        for (let i = 0; i < 80; i++) {
            const cliente = clientes[Math.floor(Math.random() * clientes.length)];
            const prod = productos[Math.floor(Math.random() * productos.length)];
            const cant = Math.floor(Math.random() * 80) + 10;
            const precio = prod.precio_unitario;
            const subtotal = cant * precio;
            const igv = subtotal * 0.18;
            const total = subtotal + igv;

            const fecRandom = new Date(tresMesesAtras.getTime() + Math.random() * (hoy.getTime() - tresMesesAtras.getTime()));

            let estOrd = estadosOrden[Math.floor(Math.random() * estadosOrden.length)];
            // Forzar a tener algunas entregadas o despachadas recientes para mapas WOW
            if (i < 10) estOrd = 'en_proceso';
            if (i >= 10 && i < 20) estOrd = 'despachado';

            const { data: orden, error: errO } = await supabase.from('saf_ordenes').insert({
                cliente_id: cliente.id,
                numero: `ORD-W${Date.now().toString().slice(-5)}-${i}`,
                fecha: fecRandom.toISOString(),
                subtotal, igv, total,
                tipo_pago: Math.random() > 0.4 ? 'contado' : 'credito',
                estado: estOrd,
                observaciones: 'Simulación Efecto WOW'
            }).select().single();

            if (errO) continue;

            await supabase.from('saf_orden_items').insert({
                orden_id: orden.id,
                producto_id: prod.id,
                cantidad: cant,
                precio_unitario: precio,
                monto_total: subtotal
            });

            if (orden.tipo_pago === 'credito' || Math.random() > 0.5) {
                const diasVenc = Math.floor(Math.random() * 45);
                const fecVenc = new Date(fecRandom.getTime() + diasVenc * 24 * 60 * 60 * 1000);
                const esPagado = Math.random() > 0.4 && fecVenc < hoy;
                const saldo = esPagado ? 0 : total;

                const { data: cxc } = await supabase.from('saf_cuentas_por_cobrar').insert({
                    cliente_id: cliente.id,
                    orden_id: orden.id,
                    numero_factura: `F-WOW-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
                    monto_total: total,
                    saldo: saldo,
                    fecha_emision: fecRandom.toISOString(),
                    fecha_vencimiento: fecVenc.toISOString(),
                    estado: esPagado ? 'pagado' : 'pendiente'
                }).select().single();

                if (cxc && estOrd !== 'pendiente') {
                    // Pagos parciales o completos
                    const numPagos = esPagado ? 1 : (Math.random() > 0.5 ? 2 : 0);
                    if (numPagos > 0) {
                        for (let p = 0; p < numPagos; p++) {
                            await supabase.from('saf_pagos').insert({
                                cuenta_cobrar_id: cxc.id,
                                monto: total / numPagos,
                                fecha_pago: new Date(fecVenc.getTime() - (Math.random() * 5 * 24 * 60 * 60 * 1000)).toISOString(),
                                metodo_pago: ['transferencia', 'efectivo', 'cheque'][Math.floor(Math.random() * 3)],
                                referencia: `TR-${Math.floor(Math.random() * 10000)}`
                            });
                        }
                    }
                }
            }

            if (['en_proceso', 'despachado', 'entregado'].includes(orden.estado)) {
                const vehiculo = flota[Math.floor(Math.random() * flota.length)];
                const fecDespacho = new Date(fecRandom.getTime() + (Math.random() * 2 * 24 * 60 * 60 * 1000));
                await supabase.from('saf_despachos').insert({
                    orden_id: orden.id,
                    vehiculo_id: vehiculo.id,
                    numero_guia: `GR-WOW-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
                    fecha_despacho: fecDespacho.toISOString(),
                    conductor: vehiculo.chofer_asignado || `Conductor ${vehiculo.placa}`,
                    volumen_m3: cant,
                    estado: orden.estado === 'entregado' ? 'entregado' : (orden.estado === 'despachado' ? 'en_ruta' : 'preparando')
                });
            }
        }

        console.log("🏭 Generando 100 lotes Producción...");
        for (let i = 0; i < 100; i++) {
            const prod = productos[Math.floor(Math.random() * productos.length)];
            const cant = Math.floor(Math.random() * 150) + 50;
            const turno = ['mañana', 'tarde', 'noche'][Math.floor(Math.random() * 3)];
            const fecRandom = new Date(tresMesesAtras.getTime() + Math.random() * (hoy.getTime() - tresMesesAtras.getTime()));

            await supabase.from('saf_produccion').insert({
                producto_id: prod.id,
                lote: `LT-WOW-${fecRandom.getTime().toString().slice(-4)}-${i}`,
                fecha: fecRandom.toISOString(),
                turno: turno,
                cantidad_producida: cant,
                costo_lote_estimado: cant * (prod.precio_unitario * (Math.random() * 0.2 + 0.3)), // 30-50% costo
                observaciones: 'Lote Simulacion Ultra WOW'
            });
        }

        console.log("✅ Datos WOW inyectados de forma hiper masiva!");
    } catch (error) {
        console.error("❌ Error grave during data injection", error);
    }
}

injectWOW();
