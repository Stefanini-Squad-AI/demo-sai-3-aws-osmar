# 💸 Módulo TRANSACTION - Transacciones

## 📋 Resumen

**ID del Módulo**: `transaction`  
**Propósito**: Registrar, consultar y reportar movimientos financieros sobre las tarjetas del ecosistema CardDemo.  
**Contexto de Negocio**: Este módulo apoya a back-office y analistas financieros cuando necesitan auditar cargos, corregir errores heredados o generar reportes (mensuales, anuales o personalizados) que alimentan decisiones de riesgo y cumplimiento.

## 🎯 Responsabilidades Principales

- ✅ Búsqueda paginada de transacciones por Transaction ID con validación numérica y navegación por páginas (F7/F8).  
- ✅ Visualización detallada de una transacción (montos, comerciante, fechas, metadata del programa).  
- ✅ Registro manual con validación estricta de account/card, monto, fechas y confirmación `Y`.  
- ✅ Generación y exportación de reportes mensuales, anuales o personalizados en formato TXT o impresión.  
- ✅ Atajos del sistema (F3=salir, F4=limpiar, F5=volver al listado) y alertas enriquecidas para errores del backend.

## 🏗️ Componentes Clave

### Frontend Components

#### `TransactionListScreen.tsx`
- Ubicación: `app/components/transaction/TransactionListScreen.tsx`  
- Encapsula la pantalla de listado con encabezado `SystemHeader` (transactionId `CT00`, programName `COTRN00C`), búsqueda guiada, tabla MUI con acciones (ver, seleccionar), chips de página, navegadores manuales (F7/F8) y formato de montos en USD.

#### `TransactionViewScreen.tsx`
- Ubicación: `app/components/transaction/TransactionViewScreen.tsx`  
- Interfaz read-only para un `Transaction ID`, muestra metadata del backend (`currentDate`, `programName`), formatea montos/fechas y habilita navegaciones rápidas (F4 borra pantalla, F5 regresa a listado, Enter dispara búsqueda).

#### `TransactionAddScreen.tsx`
- Ubicación: `app/components/transaction/TransactionAddScreen.tsx`  
- Formulario dividido por secciones (identificación, transacción, comerciante, confirmación). Incluye datos de prueba (grocery, gas, ATM, ecommerce), validaciones inline y mensaje de confirmación antes de enviar.

#### `TransactionReportsScreen.tsx` + `TransactionReportTable.tsx`
- Ubicación: `app/components/transaction/TransactionReportsScreen.tsx` y `TransactionReportTable.tsx`  
- Permite escoger tipo de reporte (mensual, anual, custom), validar rangos de fecha y confirmar (`Y`). Al generar, despliega un diálogo con tabla sticky, totales por cuenta y opción de descargar en TXT/ imprimir.

### Hooks

#### `useTransactionList.ts`
- Encapsula peticiones a `/transactions/list`, `/transactions/next-page`, `/transactions/previous-page`. Mantiene `currentPage`, `hasNextPage/hasPreviousPage`, `firstTransactionId`, `lastTransactionId` y validación numérica.
- Expone controles (`handleSearch`, `handleTransactionSelect`, `handleNextPage`, `handlePreviousPage`, `handleExit`) y usa `apiClient.post`.

#### `useTransactionView.ts`
- Lógica para `/transaction-view/search` y `/transaction/clear`, validación de ID no vacío, manejo de errores (bloquea si el backend regresa `errorMessage`) y shortcuts para navegar dentro del módulo.

#### `useTransactionAdd.ts`
- Valida account/card (`11` o `16` dígitos), monto (`^-?\d{1,8}(\.\d{1,2})?$`), fechas `YYYY-MM-DD` y confirmación `Y`. Convertimos fechas a ISO, monto a `parseFloat` y limpiamos el formulario tras el éxito.

#### `useTransactionReports.ts`
- Configura `/v1/reports/transactions/{monthly|yearly|custom}` con confirmación (Y) y validación de rangos. Controla `reportData`, habilita descarga TXT y administración del estado `showReport`.

## 🧾 Tipos Relevantes

```typescript
interface TransactionListRequest {
  transactionId?: string;
  pageNumber?: number;
  selectionFlag?: string;
  selectedTransactionId?: string;
}

interface TransactionListResponse {
  transactions: TransactionItem[];
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  firstTransactionId?: string;
  lastTransactionId?: string;
  message?: string;
  errorMessage?: string;
}
```

```typescript
interface TransactionViewResponse {
  transactionId?: string;
  cardNumber?: string;
  transactionAmount?: string; // BigDecimal como string
  transactionDescription?: string;
  originalTimestamp?: string;
  processedTimestamp?: string;
  merchantName?: string;
  merchantCity?: string;
  merchantZip?: string;
  currentDate?: string;
  programName?: string;
  transactionName?: string;
  errorMessage?: string;
}
```

```typescript
interface TransactionAddRequest {
  accountId?: string;
  cardNumber?: string;
  transactionTypeCode: string;
  transactionCategoryCode: string;
  transactionSource: string;
  transactionDescription: string;
  transactionAmount: string;
  originalDate: string;
  processDate: string;
  merchantId: string;
  merchantName: string;
  merchantCity: string;
  merchantZip: string;
  confirmation: 'Y' | 'N' | '';
}

interface TransactionReportResponse {
  success: boolean;
  message: string;
  reportType?: string;
  reportData?: ReportData;
}
```

## 🌐 APIs Públicas

### `POST /transactions/list`  
- Request: `{ transactionId?, pageNumber = 1 }`  
- Response: `TransactionListResponse` incluyendo `transactions`, `currentPage`, `hasNextPage/hasPreviousPage`, `firstTransactionId` y `lastTransactionId`.  
- Se usa para cargar la página inicial y la búsqueda del listado.

### `POST /transactions/next-page` / `POST /transactions/previous-page`  
- Permiten navegar con `lastTransactionId` o `firstTransactionId` (keyset pagination) y mantienen `hasNextPage/hasPreviousPage`.  

### `GET /transaction-view/search?transactionId={id}`  
- Devuelve `TransactionViewResponse` con los detalles financieros y metadata (`currentDate`, `programName`, `transactionName`).  
- Regresa `errorMessage` si el ID no existe o está vacío.

### `POST /transaction/clear`  
- Reinicia la vista (equivalente a `initializeEmptyView` en el backend).  

### `POST /transactions`  
- Request: `TransactionAddRequest` (montos convertidos a BigDecimal, fechas en ISO).  
- Response: `{ success, transactionId, message }`.  
- La confirmación `Y` es obligatoria para que la transacción sea persistida.

### `/v1/reports/transactions/{monthly|yearly|custom}`  
- Body: `{ confirmed: true, startDate?, endDate? }`.  
- Response: `TransactionReportResponse` con `reportData` (agrupaciones por cuenta, totales parciales y gran total).  
- El reporte custom valida que `startDate <= endDate` y requiere confirmación explícita del usuario.

## 📋 Reglas de Negocio

- **RN-TR-001**: El Transaction ID debe ser numérico y no puede estar vacío para consultas o visualizaciones.  
- **RN-TR-002**: Solo se registra una transacción si `confirmation = 'Y'`; la pantalla de registro bloquéa cualquier otra letra.  
- **RN-TR-003**: El monto debe respetar `^-?\d{1,8}(\.\d{1,2})?$` y admite negativos para retiros (transactionTypeCode `03`).  
- **RN-TR-004**: El registro necesita Account ID (11 dígitos) o Card Number (16 dígitos).  
- **RN-TR-005**: Los reportes requieren `confirmed: true` y rangos de fecha válidos (`startDate <= endDate`).  
- **RN-TR-006**: La paginación usa `firstTransactionId`/`lastTransactionId` para evitar datos inconsistentes y navegar solo si `hasNextPage/hasPreviousPage` está activo.

## 🔗 Dependencias

- **Auth Module**: Controla accesos a listar, registrar y generar reportes.  
- **Account Module**: Valida que la Account ID esté activa antes de permitir un registro.  
- **Credit Card Module**: Complementa el flujo cuando el usuario provee un Card Number para registrar la transacción.  
- **Librerías**: Material-UI (Tables, Dialog, Chips), React Router DOM (navegación), React Hooks (`useState`, `useCallback`), `apiClient` para el fetch y MSW para mocks.

## 📊 Patrones de User Stories

- Como analista de fraude, quiero listar las transacciones del día para detectar desviaciones antes de cerrar el jornada.  
- Como oficial de operaciones, quiero ver los detalles de un Transaction ID específico para validar si el cargo fue autorizado.  
- Como back-office, quiero registrar manualmente una transacción de ajuste con validaciones estrictas para corregir errores de sistemas legados.  
- Como auditor, quiero generar el reporte mensual y descargarlo en TXT para adjuntarlo a la bitácora.

## 📊 Complejidad de Historias

- **Simple (1-2 pts)**: Cambiar helper text de búsqueda, ajustar formato de moneda mostrado por el hook `useTransactionList`.  
- **Medio (3-5 pts)**: Agregar filtros por fechas o merchant, habilitar exportación CSV adicional en reportes.  
- **Complejo (5-8 pts)**: Integrar streaming de transacciones en tiempo real, construir workflow de aprobación de registros manuales con auditoría por usuario.

## ⚡ Factores de Aceleración

- `useTransactionList` maneja búsquedas, paginación y selección con un solo hook reutilizable.  
- `SystemHeader` reutiliza transactionId/programName y shortcuts nativos (F3/F4/F5).  
- MSW provee transacciones mock (50 registros) y reproduce el backend para validar errores.  
- `TransactionReportTable` encapsula la tabla del diálogo y permite descarga/impresión sin escribir HTML adicional.

## ⚡ Presupuestos de Performance

- **Listados**: < 600ms (P95) al responder con 100 transacciones.  
- **Búsqueda por ID**: < 400ms (P95) y validación local previa.  
- **Registro manual**: < 1s (P95) incluyendo validaciones.  
- **Reportes**: < 2s (P95) para mensuales/anuales.  
- **Throughput**: 80 búsquedas concurrentes/segundo (MSW delay simulado entre 300-800ms).

## 🚨 Riesgos y Mitigaciones

- **Riesgo**: Dependencia de `firstTransactionId`/`lastTransactionId` para paginación puede provocar loops si el backend no regresa esos IDs.  
  **Mitigación**: Validar que existan antes de navegar y mostrar mensaje de error (aprox. 4).  
- **Riesgo**: Los regex de validación pueden divergir del backend.  
  **Mitigación**: Mantener sincronizados los patrones y documentar cambios en `useTransactionAdd`.  
- **Riesgo**: Reportes `custom` sin límites de fecha pueden saturar la memoria.  
  **Mitigación**: Restringir rangos (ej: 30 días) o paginar manualmente antes de llamar al backend.

## 📈 Métricas de Éxito

- **Adopción**: 90% de los agentes usan el módulo diariamente para auditorías.  
- **Engagement**: 40+ búsquedas/visualizaciones por día por usuario.  
- **Impacto**: 60% menos errores en correcciones manuales gracias a validaciones.  
- **Calidad técnica**: 0 bugs críticos en endpoints listados y cobertura >70% en hooks.

---

**Última actualización**: 2026-02-06  
**Precisión del módulo**: 95%  
**Estado**: ✅ Completado
