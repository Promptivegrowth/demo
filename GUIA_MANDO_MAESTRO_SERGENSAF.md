# 🛡️ Sergensaf ERP: Guía de Mando Maestro (v6.0)
**"Command Center" de Alto Rendimiento para Directivos**

Bienvenido a la versión modernizada del ERP Sergensaf. Esta plataforma ha sido diseñada para ofrecer visibilidad total, trazabilidad en tiempo real y una gestión operativa impecable desde una perspectiva gerencial.

---

## 🚀 1. Acceso Rápido "One-Click" (Demo Mode)
Para esta demostración, hemos habilitado 5 estaciones de mando independientes. Esto permite que varios directivos prueben el sistema simultáneamente sin interferencias de sesión.

1.  **URL**: [https://demo-dtg1.vercel.app/login](https://demo-dtg1.vercel.app/login)
2.  **Estaciones**: En el login, verá **5 botones negros** etiquetados como **Test 1** al **Test 5**.
3.  **Acceso**: Simplemente haga clic en uno de ellos. El sistema creará su sesión, confirmará sus permisos administrativos y lo llevará al tablero principal de forma instantánea.

> [!TIP]
> Si experimenta lentitud por saturación de red, refresque la página (F5) o use un botón de Test diferente.

---

## 📊 2. Dashboard: Inteligencia de Negocios
El tablero principal ofrece KPIs dinámicos que se actualizan automáticamente según los movimientos de todos los módulos:
- **Ventas Mensuales**: Tracción financiera en tiempo real.
- **Stock en Planta**: Volumen total de agregados (m³) listos para despacho.
- **Eficiencia de Flota**: Porcentaje de unidades activas vs. en mantenimiento.
- **Utilidad proyectada**: Margen basado en las cotizaciones aprobadas del mes.

---

## 🛠️ 3. Recorrido por Módulos Críticos

### A. 📄 Cotizaciones y Ventas
Aquí nace el flujo de ingresos.
- **Funciones**: Crear presupuestos masivos con lógica de precios por zona.
- **Interactividad**: Cambie el estado a `Aprobada` para ver cómo se genera automáticamente una **Orden de Trabajo**.
- **Acción VIP**: Haga clic en el icono de **PDF** para generar el documento formal listo para enviar al cliente.

### B. 🏗️ Producción en Tiempo Real
Visualice el proceso de transformación de materiales.
- **Mapa de Proceso**: Verá un **Stepper Animado** con 4 etapas: `Extracción` → `Lavado` → `Clasificación` → `Acopio`.
- **Integración**: Cuando un lote pasa a `Finalizado`, el stock se suma automáticamente al módulo de Inventario, permitiendo ventas inmediatas.

### C. 🚛 Despachos y Logística (High-Tech)
Este es el módulo estrella de la trazabilidad.
- **Radar Satelital**: Haga clic en el icono de **Navegación** para abrir el **Monitor GPS**. Visualice ubicación, velocidad (KM/H) y telemetría de la unidad.
- **Guía Electrónica**: El botón de **Hoja de Ruta** genera el documento legal (Guía de Remisión) necesario para el tránsito masivo.
- **Cierre de Ciclo**: Al marcar `Entregado`, el sistema libera el camión, descuenta el inventario y actualiza la deuda del cliente.

### D. 📦 Inventario y Kárdex (Control)
Control absoluto sobre los activos de la empresa.
- **Alertas Inteligentes**: Los productos en **Rojo** están agotados; en **Amarillo** requieren reabastecimiento urgente.
- **Kárdex Avanzado**: Haga clic en el icono de **Reloj/Historial** para ver el "Timeline" exacto de movimientos: Entradas (Producción) vs Salidas (Ventas).

### E. 💰 Cobranzas y Finanzas
La salud del flujo de caja.
- **Timeline de Facturación**: Previsualización de facturas con sellos dinámicos. El sello de **"CANCELADO"** aparece tras confirmarse los abonos.
- **Gestión de Abonos**: Registre ingresos parciales y vea cómo la "Línea de Tiempo de Pagos" se construye automáticamente.

---

## 🎨 4. Leyenda de Colores e Iconos

| Color | Estado Operativo |
| :--- | :--- |
| 🟢 **Verde** | Operación Exitosa / Disponible / Factura Pagada. |
| 🔵 **Azul** | Actividad en Curso / Camión en Ruta / Producción Activa. |
| 🟡 **Naranja** | Atención Requerida / Alerta de Stock Bajo / Pendiente de Aprobación. |
| 🔴 **Rojo** | Bloqueo Crítico / Factura Vencida / Unidad en Mantenimiento. |

---

## 🛡️ Notas de Seguridad (Sandbox)
- Todos los datos en esta demo están en un ambiente de pruebas seguro (**Sandbox**).
- Los cambios realizados por `Test 1` no interfieren con `Test 2`, permitiendo una demo multi-usuario perfecta.
- **Sincronización**: Utilice el botón "Sincronizar" en cualquier módulo para refrescar los datos desde la base de datos central de Supabase.

---
**Documentación de Alto Nivel elaborada por Antigravity para SERGENSAF.**
