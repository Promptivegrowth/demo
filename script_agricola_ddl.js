const https = require('https');

const PROJECT_REF = 'igxqxrqdvfjrhssagize';
const ACCESS_TOKEN = 'sbp_8ba5503dae0a9435e5d53621cbc5eff806dcb083';

const sql = `
-- 1. Agricultores (Clientes)
CREATE TABLE IF NOT EXISTS public.agri_agricultores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    zona VARCHAR(100),
    cultivos TEXT,
    telefono VARCHAR(50),
    limite_credito DECIMAL(10,2) DEFAULT 0,
    saldo_utilizado DECIMAL(10,2) DEFAULT 0,
    estado_credito VARCHAR(50) DEFAULT 'Al día',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Agentes de Campo
CREATE TABLE IF NOT EXISTS public.agri_agentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    zona_asignada VARCHAR(100),
    meta_diaria DECIMAL(10,2) DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'Desconectado',
    ultimo_reporte TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Proveedores
CREATE TABLE IF NOT EXISTS public.agri_proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    ruc VARCHAR(20) NOT NULL UNIQUE,
    suministros TEXT,
    plazo_habitual INT DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Productos (Insumos)
CREATE TABLE IF NOT EXISTS public.agri_productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    marca VARCHAR(100),
    principio_activo VARCHAR(255),
    presentacion VARCHAR(100),
    precio_costo DECIMAL(10,2) DEFAULT 0,
    precio_contado DECIMAL(10,2) NOT NULL,
    precio_credito DECIMAL(10,2),
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 10,
    stock_maximo INT DEFAULT 100,
    ubicacion VARCHAR(100),
    proveedor_id UUID REFERENCES public.agri_proveedores(id),
    cultivos_compatibles TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Ventas (POS y Facturación)
CREATE TABLE IF NOT EXISTS public.agri_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) UNIQUE,
    tipo VARCHAR(50) NOT NULL, 
    comprobante VARCHAR(50), 
    agricultor_id UUID REFERENCES public.agri_agricultores(id),
    agente_id UUID REFERENCES public.agri_agentes(id), 
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50),
    estado VARCHAR(50) DEFAULT 'Completada',
    fecha TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Items de Venta
CREATE TABLE IF NOT EXISTS public.agri_ventas_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID REFERENCES public.agri_ventas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.agri_productos(id),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- 7. Cuotas (Crédito)
CREATE TABLE IF NOT EXISTS public.agri_cuotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID REFERENCES public.agri_ventas(id) ON DELETE CASCADE,
    agricultor_id UUID REFERENCES public.agri_agricultores(id),
    numero_cuota INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente', 
    fecha_pago TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Pedidos de Campo
CREATE TABLE IF NOT EXISTS public.agri_pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agente_id UUID REFERENCES public.agri_agentes(id),
    agricultor_id UUID REFERENCES public.agri_agricultores(id),
    total DECIMAL(10,2) NOT NULL,
    tipo VARCHAR(50) NOT NULL, 
    estado VARCHAR(50) DEFAULT 'Pendiente Aprobación',
    fecha TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Items Pedido
CREATE TABLE IF NOT EXISTS public.agri_pedidos_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES public.agri_pedidos(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES public.agri_productos(id),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- 10. Compras (Manejo de plazos)
CREATE TABLE IF NOT EXISTS public.agri_compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor_id UUID REFERENCES public.agri_proveedores(id),
    numero_orden VARCHAR(50),
    total DECIMAL(10,2) NOT NULL,
    condicion_pago INT,
    fecha_emision DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(50) DEFAULT 'Pendiente',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Cuotas de Compras (Vencimientos a proveedores)
CREATE TABLE IF NOT EXISTS public.agri_compras_cuotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID REFERENCES public.agri_compras(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Kardex
CREATE TABLE IF NOT EXISTS public.agri_kardex (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES public.agri_productos(id),
    tipo VARCHAR(20) NOT NULL, 
    cantidad INT NOT NULL,
    stock_restante INT NOT NULL,
    referencia VARCHAR(100), 
    motivo VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Lotes y Vencimientos
CREATE TABLE IF NOT EXISTS public.agri_lotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID REFERENCES public.agri_productos(id),
    numero_lote VARCHAR(50) NOT NULL,
    cantidad INT NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserción de PROVEEDORES
INSERT INTO public.agri_proveedores (id, nombre, ruc, suministros, plazo_habitual) VALUES
('b192e4ab-bc13-40f4-90aa-6216447c23a1', 'Bayer CropScience Perú', '20100062756', 'Fungicidas e Insecticidas', 60),
('b192e4ab-bc13-40f4-90aa-6216447c23a2', 'Química Suiza SAC', '20100114136', 'Herbicidas y Fertilizantes', 45),
('b192e4ab-bc13-40f4-90aa-6216447c23a3', 'Semillas del Sur SAC', '20512345678', 'Semillas certificadas', 30) ON CONFLICT (id) DO NOTHING;

-- Inserción de PRODUCTOS
INSERT INTO public.agri_productos (id, codigo, nombre, categoria, marca, principio_activo, presentacion, precio_costo, precio_contado, precio_credito, stock_actual, stock_minimo, proveedor_id, cultivos_compatibles) VALUES
('c292e4ab-bc13-40f4-90aa-6216447c23b1', 'HER-001', 'Glifosato 48% SL 1L', 'Herbicidas', 'Monsanto', 'Glifosato 48%', '1 Litro', 20.00, 28.00, 32.00, 145, 50, 'b192e4ab-bc13-40f4-90aa-6216447c23a2', 'Malezas en general'),
('c292e4ab-bc13-40f4-90aa-6216447c23b2', 'INS-001', 'Clorpirifós 48% EC 1L', 'Insecticidas', 'Bayer', 'Clorpirifós 48%', '1 Litro', 35.00, 45.00, 50.00, 89, 30, 'b192e4ab-bc13-40f4-90aa-6216447c23a1', 'Maíz, Papa'),
('c292e4ab-bc13-40f4-90aa-6216447c23b3', 'FUN-001', 'Mancozeb 80% WP 1Kg', 'Fungicidas', 'Syngenta', 'Mancozeb 80%', '1 Kilo', 24.00, 32.00, 36.00, 67, 20, 'b192e4ab-bc13-40f4-90aa-6216447c23a1', 'Papa, Tomate'),
('c292e4ab-bc13-40f4-90aa-6216447c23b4', 'FER-001', 'Nitrato de Amonio 50Kg', 'Fertilizantes', 'Misti', 'Nitrato de Amonio 33%', '50 Kilos', 95.00, 120.00, 135.00, 34, 15, 'b192e4ab-bc13-40f4-90aa-6216447c23a2', 'Arroz, Caña'),
('c292e4ab-bc13-40f4-90aa-6216447c23b5', 'INS-002', 'Cipermectrina 10% EC 250ml', 'Insecticidas', 'Bayer', 'Cipermectrina 10%', '250 ml', 12.00, 18.50, 22.00, 203, 50, 'b192e4ab-bc13-40f4-90aa-6216447c23a1', 'Frutales') ON CONFLICT (id) DO NOTHING;

-- Inserción de AGRICULTORES
INSERT INTO public.agri_agricultores (id, nombre, dni, zona, cultivos, limite_credito, saldo_utilizado, estado_credito) VALUES
('d392e4ab-bc13-40f4-90aa-6216447c23d1', 'José Mendoza Llontop', '42781234', 'Lambayeque', 'Arroz y maíz', 12000.00, 7800.00, 'Al día'),
('d392e4ab-bc13-40f4-90aa-6216447c23d2', 'María Flores Quispe', '31456789', 'La Libertad', 'Espárrago', 8000.00, 0.00, 'Al día'),
('d392e4ab-bc13-40f4-90aa-6216447c23d3', 'Roberto Chávez Sánchez', '45123678', 'Piura', 'Caña de azúcar', 20000.00, 15000.00, 'En mora') ON CONFLICT (id) DO NOTHING;

-- Inserción de AGENTES
INSERT INTO public.agri_agentes (id, nombre, zona_asignada, meta_diaria, estado) VALUES
('e492e4ab-bc13-40f4-90aa-6216447c23e1', 'Juan Quispe', 'Zona Norte (Lambayeque)', 5000.00, 'En ruta'),
('e492e4ab-bc13-40f4-90aa-6216447c23e2', 'Ana Torres', 'Zona Sur (Ica)', 4000.00, 'En visita') ON CONFLICT (id) DO NOTHING;

-- Seguridad
ALTER TABLE public.agri_agricultores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_agentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_proveedores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_ventas_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_cuotas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_pedidos_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_compras DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_compras_cuotas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_kardex DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agri_lotes DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
`;

const postData = JSON.stringify({ query: sql });

const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: '/v1/projects/' + PROJECT_REF + '/database/query',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        console.log('Status HTTP:', res.statusCode);
        try {
            const parsedData = JSON.parse(rawData);
            console.log('Respuesta:', JSON.stringify(parsedData, null, 2));
        } catch (e) {
            console.error('Error parseando JSON, rawData:', rawData);
        }
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e.message);
});

req.write(postData);
req.end();
