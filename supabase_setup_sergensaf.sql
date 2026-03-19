-- Script de Instalación Supabase - SERGENSAF
-- Ejecute este script en el Editor SQL de su proyecto Supabase

-- 1. saf_productos
CREATE TABLE IF NOT EXISTS saf_productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    unidad TEXT DEFAULT 'm³',
    stock_actual NUMERIC DEFAULT 0,
    stock_minimo NUMERIC DEFAULT 0,
    precio_unitario NUMERIC DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. saf_clientes
CREATE TABLE IF NOT EXISTS saf_clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razon_social TEXT NOT NULL,
    ruc TEXT UNIQUE,
    contacto TEXT,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    tipo TEXT DEFAULT 'regular', -- 'regular' | 'frecuente' | 'vip'
    credito_habilitado BOOLEAN DEFAULT false,
    limite_credito NUMERIC DEFAULT 0,
    saldo_pendiente NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. saf_cotizaciones
CREATE TABLE IF NOT EXISTS saf_cotizaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero TEXT UNIQUE, -- COT-0001
    cliente_id UUID REFERENCES saf_clientes(id),
    fecha DATE,
    fecha_vencimiento DATE,
    estado TEXT DEFAULT 'pendiente', -- pendiente | aprobada | rechazada | vencida
    subtotal NUMERIC,
    igv NUMERIC,
    total NUMERIC,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. saf_cotizacion_items
CREATE TABLE IF NOT EXISTS saf_cotizacion_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cotizacion_id UUID REFERENCES saf_cotizaciones(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES saf_productos(id),
    cantidad NUMERIC,
    precio_unitario NUMERIC,
    subtotal NUMERIC
);

-- 5. saf_ordenes
CREATE TABLE IF NOT EXISTS saf_ordenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero TEXT UNIQUE, -- ORD-0001
    cotizacion_id UUID REFERENCES saf_cotizaciones(id),
    cliente_id UUID REFERENCES saf_clientes(id),
    fecha DATE,
    fecha_requerida DATE,
    estado TEXT DEFAULT 'pendiente', -- pendiente | en_proceso | despachado | anulado
    subtotal NUMERIC,
    igv NUMERIC,
    total NUMERIC,
    tipo_pago TEXT, -- contado | credito
    observaciones TEXT,
    motivo_anulacion TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. saf_orden_items
CREATE TABLE IF NOT EXISTS saf_orden_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id UUID REFERENCES saf_ordenes(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES saf_productos(id),
    cantidad NUMERIC,
    precio_unitario NUMERIC,
    subtotal NUMERIC
);

-- 7. saf_despachos
CREATE TABLE IF NOT EXISTS saf_despachos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id UUID REFERENCES saf_ordenes(id),
    fecha_despacho DATE,
    hora_salida TIME,
    placa TEXT,
    conductor TEXT,
    dni_conductor TEXT,
    destino TEXT,
    estado TEXT DEFAULT 'en_ruta', -- en_ruta | entregado
    hora_entrega TIME,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. saf_produccion
CREATE TABLE IF NOT EXISTS saf_produccion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE,
    producto_id UUID REFERENCES saf_productos(id),
    cantidad_producida NUMERIC,
    horas_maquina NUMERIC,
    combustible_litros NUMERIC,
    operador TEXT,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. saf_cuentas_por_cobrar
CREATE TABLE IF NOT EXISTS saf_cuentas_por_cobrar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id UUID REFERENCES saf_ordenes(id),
    cliente_id UUID REFERENCES saf_clientes(id),
    numero_factura TEXT,
    fecha_emision DATE,
    fecha_vencimiento DATE,
    monto_total NUMERIC,
    monto_pagado NUMERIC DEFAULT 0,
    saldo NUMERIC,
    estado TEXT DEFAULT 'pendiente', -- pendiente | parcial | pagado | vencido
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. saf_pagos
CREATE TABLE IF NOT EXISTS saf_pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cuenta_id UUID REFERENCES saf_cuentas_por_cobrar(id),
    fecha DATE,
    monto NUMERIC,
    metodo TEXT, -- efectivo | transferencia | cheque
    referencia TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. saf_flota
CREATE TABLE IF NOT EXISTS saf_flota (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa TEXT UNIQUE,
    marca TEXT,
    modelo TEXT,
    año INT,
    capacidad_m3 NUMERIC,
    estado TEXT DEFAULT 'disponible', -- disponible | en_ruta | mantenimiento
    km_actual NUMERIC DEFAULT 0,
    vencimiento_soat DATE,
    vencimiento_revision DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. saf_mantenimientos
CREATE TABLE IF NOT EXISTS saf_mantenimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehiculo_id UUID REFERENCES saf_flota(id),
    fecha DATE,
    tipo TEXT, -- preventivo | correctivo
    descripcion TEXT,
    costo NUMERIC,
    km_en_mantenimiento NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- DATA INSERTION LOGIC --------------------------------------------------------
-- Productos
INSERT INTO saf_productos (nombre, stock_actual, stock_minimo, precio_unitario) VALUES
    ('Arena Fina', 450, 100, 45.00),
    ('Arena Gruesa', 380, 100, 42.00),
    ('Hormigón', 520, 150, 38.00),
    ('Piedra Chancada 1/2"', 290, 80, 55.00),
    ('Piedra Chancada 3/4"', 310, 80, 52.00),
    ('Confitillo', 180, 60, 48.00),
    ('Piedra de Zanja', 95, 50, 35.00)
ON CONFLICT DO NOTHING;

-- Clientes reales de Lima
INSERT INTO saf_clientes (razon_social, ruc, contacto, telefono, email, direccion, tipo, credito_habilitado, limite_credito) VALUES
    ('Constructora Málaga Hnos', '20101234567', 'Ing. Carlos Ruiz', '999123456', 'cruiz@malaga.pe', 'Av. Paseo de la República 3245, San Isidro', 'vip', true, 50000),
    ('Consorcio Vial Sur', '20556677889', 'Luis Cárdenas', '988555444', 'compras@vialsur.com', 'Panamericana Sur Km 18, V.E.S.', 'frecuente', true, 20000),
    ('Bloquetas Lurin SAC', '20443322110', 'María Tello', '977666222', 'mtello@bloquetas.pe', 'Antigua Panamericana Km 35, Lurin', 'regular', false, 0),
    ('Ferretería El Buen Constructor', '10088998877', 'Pepe Lucho', '966444333', 'ferreteria@constructor.pe', 'Av. Universitaria 1205, SMP', 'regular', false, 0),
    ('Edificaciones Lima', '20998877665', 'Ana Rojas', '955111222', 'proyectos@edificalima.com', 'Av. Benavides 456, Miraflores', 'vip', true, 30000)
ON CONFLICT (ruc) DO NOTHING;

-- Flota (crear vehículos para despachos)
INSERT INTO saf_flota (placa, marca, modelo, año, capacidad_m3, km_actual, vencimiento_soat, vencimiento_revision) VALUES
    ('A1B-234', 'Volvo', 'FMX', 2020, 15, 120000, '2026-12-01', '2026-10-15'),
    ('C5D-678', 'Mercedes-Benz', 'Actros', 2021, 20, 85000, '2026-11-20', '2026-09-30'),
    ('F9G-012', 'Scania', 'P360', 2018, 15, 210000, '2026-05-10', '2026-04-05')
ON CONFLICT (placa) DO NOTHING;

-- Insertar Órdenes Históricas (Simulación)
DO $$
DECLARE
    cliente1_id UUID;
    cliente2_id UUID;
    cliente3_id UUID;
    prod1_id UUID;
    prod2_id UUID;
    ord1_id UUID;
    ord2_id UUID;
    ord3_id UUID;
    ord4_id UUID;
BEGIN
    SELECT id INTO cliente1_id FROM saf_clientes WHERE ruc = '20101234567' LIMIT 1;
    SELECT id INTO cliente2_id FROM saf_clientes WHERE ruc = '20556677889' LIMIT 1;
    SELECT id INTO cliente3_id FROM saf_clientes WHERE ruc = '10088998877' LIMIT 1;
    
    SELECT id INTO prod1_id FROM saf_productos WHERE nombre = 'Arena Gruesa' LIMIT 1;
    SELECT id INTO prod2_id FROM saf_productos WHERE nombre = 'Piedra Chancada 1/2"' LIMIT 1;

    IF cliente1_id IS NOT NULL AND prod1_id IS NOT NULL THEN
        -- Orden 1: Despachada
        INSERT INTO saf_ordenes (numero, cliente_id, fecha, fecha_requerida, estado, subtotal, igv, total, tipo_pago)
        VALUES ('ORD-0001', cliente1_id, current_date - interval '15 days', current_date - interval '14 days', 'despachado', 840, 151.2, 991.2, 'contado')
        RETURNING id INTO ord1_id;
        
        INSERT INTO saf_orden_items (orden_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (ord1_id, prod1_id, 20, 42.00, 840);

        -- Orden 2: En Proceso
        INSERT INTO saf_ordenes (numero, cliente_id, fecha, fecha_requerida, estado, subtotal, igv, total, tipo_pago)
        VALUES ('ORD-0002', cliente2_id, current_date - interval '2 days', current_date, 'en_proceso', 1650, 297, 1947, 'credito')
        RETURNING id INTO ord2_id;
        
        INSERT INTO saf_orden_items (orden_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (ord2_id, prod2_id, 30, 55.00, 1650);

        -- Orden 3: Pendiente
        INSERT INTO saf_ordenes (numero, cliente_id, fecha, fecha_requerida, estado, subtotal, igv, total, tipo_pago)
        VALUES ('ORD-0003', cliente3_id, current_date, current_date + interval '1 day', 'pendiente', 420, 75.6, 495.6, 'contado')
        RETURNING id INTO ord3_id;
        
        INSERT INTO saf_orden_items (orden_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (ord3_id, prod1_id, 10, 42.00, 420);
        
        -- Orden 4: Anulada
        INSERT INTO saf_ordenes (numero, cliente_id, fecha, fecha_requerida, estado, subtotal, igv, total, tipo_pago, motivo_anulacion)
        VALUES ('ORD-0004', cliente1_id, current_date - interval '5 days', current_date - interval '4 days', 'anulado', 550, 99, 649, 'contado', 'Error en pedido del cliente')
        RETURNING id INTO ord4_id;
        
        INSERT INTO saf_orden_items (orden_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (ord4_id, prod2_id, 10, 55.00, 550);
        
        -- Cuenta por cobrar para Orden 2 (Crédito)
        INSERT INTO saf_cuentas_por_cobrar (orden_id, cliente_id, numero_factura, fecha_emision, fecha_vencimiento, monto_total, saldo, estado)
        VALUES (ord2_id, cliente2_id, 'F001-000001', current_date - interval '2 days', current_date + interval '28 days', 1947, 1947, 'pendiente');
        
        UPDATE saf_clientes SET saldo_pendiente = 1947 WHERE id = cliente2_id;
    END IF;
END $$;
