const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvhrzqrdzykbvhifsoxk.supabase.co';
const supabaseKey = 'placeholder-key'; // I'll provide this from .env.local via shell execution if possible, or just use service role if I had it.
// Actually, I'll just use the run_command to execute a node script that reads .env.local.

const fs = require('fs');
const path = require('path');

async function run() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const url = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim().replace(/"/g, '');
    const key = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim().replace(/"/g, '');

    const supabase = createClient(url, key);

    console.log('--- Limpiando datos previos ---');
    await supabase.from('ret_ventas_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('ret_ventas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('ret_kardex').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('ret_productos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('ret_proveedores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('ret_categorias').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('--- Insertando Categorías ---');
    const { data: cats } = await supabase.from('ret_categorias').insert([
        { nombre: 'Bebidas Alcohólicas', descripcion: 'Cervezas, vinos y licores.' },
        { nombre: 'Bebidas no Alcohólicas', descripcion: 'Gaseosas, jugos y aguas.' },
        { nombre: 'Abarrotes Básicos', descripcion: 'Arroz, azúcar, aceites.' },
        { nombre: 'Lácteos y Embutidos', descripcion: 'Leche, quesos, jamonadas.' }
    ]).select();

    console.log('--- Insertando Proveedores ---');
    const { data: provs } = await supabase.from('ret_proveedores').insert([
        { ruc: '20100131772', razon_social: 'UNIÓN DE CERVECERÍAS PERUANAS BACKUS Y JOHNSTON S.A.A.', direccion: 'Av. Nicolás Ayllón 3986, Ate', telefono: '01 311-3000', email: 'ventas@backus.com.pe', categoria: 'Bebidas' },
        { ruc: '20100190795', razon_social: 'ALICORP S.A.A.', direccion: 'Av. Argentina 4793, Carmen de la Legua', telefono: '01 315-0000', email: 'pedidos@alicorp.com.pe', categoria: 'Abarrotes' },
        { ruc: '20100119217', razon_social: 'LECHE GLORIA S.A.', direccion: 'Av. República de Panamá 2461, Santa Catalina', telefono: '01 470-7170', email: 'servicio@gloria.com.pe', categoria: 'Lácteos' }
    ]).select();

    console.log('--- Insertando Productos Premium ---');
    const prodData = [
        { sku: 'RET-PIL-01', nombre: 'Cerveza Pilsen Callao 630ml (Caja x12)', categoria_id: cats[0].id, precio_compra: 48.00, precio_venta: 65.00, stock_actual: 120, stock_minimo: 20, unidad: 'caja', imagen_url: 'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?q=80&w=400' },
        { sku: 'RET-ARR-01', nombre: 'Arroz Costeño Extra 5kg', categoria_id: cats[2].id, precio_compra: 16.50, precio_venta: 21.00, stock_actual: 85, stock_minimo: 15, unidad: 'bolsa', imagen_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400' },
        { sku: 'RET-INK-01', nombre: 'Inka Kola 3L - Pack x4', categoria_id: cats[1].id, precio_compra: 32.00, precio_venta: 42.00, stock_actual: 40, stock_minimo: 10, unidad: 'pack', imagen_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400' },
        { sku: 'RET-ACE-01', nombre: 'Aceite Primor Premium 1L', categoria_id: cats[2].id, precio_compra: 8.20, precio_venta: 11.50, stock_actual: 150, stock_minimo: 30, unidad: 'botella', imagen_url: 'https://images.unsplash.com/photo-1474979266404-7eaacabc884d?q=80&w=400' },
        { sku: 'RET-GLO-01', nombre: 'Leche Gloria Azul 400g (Six-Pack)', categoria_id: cats[3].id, precio_compra: 19.50, precio_venta: 24.50, stock_actual: 60, stock_minimo: 12, unidad: 'sixpack', imagen_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400' }
    ];
    const { data: prods } = await supabase.from('ret_productos').insert(prodData).select();

    console.log('--- Generando Movimientos e Historial ---');
    for (const p of prods) {
        // Movimiento inicial de stock (Entrada por compra)
        const provId = p.sku.includes('PIL') ? provs[0].id : (p.sku.includes('ARR') || p.sku.includes('ACE') ? provs[1].id : provs[2].id);

        await supabase.from('ret_kardex').insert({
            producto_id: p.id,
            proveedor_id: provId,
            tipo: 'entrada',
            cantidad: p.stock_actual,
            precio_unitario: p.precio_compra,
            total: p.stock_actual * p.precio_compra,
            motivo: 'Abastecimiento Inicial - Stock de Apertura',
            referencia: 'OC-2026-001',
            fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        });
    }

    console.log('--- Proceso Completado ---');
}

run();
