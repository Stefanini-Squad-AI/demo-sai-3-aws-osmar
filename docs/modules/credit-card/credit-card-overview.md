# 💳 Módulo CREDIT CARD - Tarjetas

## 📋 Resumen

**ID del Módulo**: `credit-card`  
**Propósito**: Gestión completa del ciclo de vida de tarjetas de crédito vinculadas a cuentas  
**Contexto de Negocio**: Permite a representantes de servicio y administradores listar, visualizar y actualizar información de tarjetas de crédito asociadas a cuentas de clientes

## 🎯 Responsabilidades Principales

- ✅ Listado de tarjetas con filtros por cuenta y número de tarjeta
- ✅ Visualización completa de información de tarjetas (CVV, nombre grabado, fecha de expiración)
- ✅ Actualización transaccional de datos de tarjeta
- ✅ Gestión de estado de tarjeta (Active, Inactive, Blocked, Expired)
- ✅ Validaciones de negocio en tiempo real
- ✅ Paginación de resultados (7 registros por página)
- ✅ Control de acceso por tipo de usuario (Admin/User)

## 🏗️ Componentes Clave

### Frontend Components

#### `CreditCardListScreen.tsx`
- **Ubicación**: `app/components/creditCard/CreditCardListScreen.tsx`
- **Responsabilidad**: Pantalla de búsqueda y listado de tarjetas
- **Características**:
  - Búsqueda por Account ID (11 dígitos) y/o Card Number (16 dígitos)
  - Tabla con paginación (7 registros por página)
  - Selección de acción por tarjeta (View/Update)
  - Control de navegación (Previous/Next)
  - Restricciones por tipo de usuario

#### `CreditCardViewScreen.tsx`
- **Ubicación**: `app/components/creditCard/CreditCardViewScreen.tsx`
- **Responsabilidad**: Visualización detallada de información de tarjeta
- **Características**:
  - Campos de búsqueda (Account Number, Card Number)
  - Tarjeta de información con todos los detalles
  - Formato de fecha de expiración (MM/YYYY)
  - Visualización de CVV Code
  - Estado de tarjeta con indicador visual

#### `CreditCardUpdateScreen.tsx`
- **Ubicación**: `app/components/creditCard/CreditCardUpdateScreen.tsx`
- **Responsabilidad**: Edición y actualización de tarjetas
- **Características**:
  - Búsqueda inicial de tarjeta
  - Modo edición con validación en tiempo real
  - Detección automática de cambios
  - Flujo de confirmación de cambios
  - Estados: NOT_FETCHED → SHOW_DETAILS → CHANGES_NOT_OK → CHANGES_OK_NOT_CONFIRMED → CHANGES_OKAYED_AND_DONE

### Custom Hooks

#### `useCreditCardList.ts`
- **Ubicación**: `app/hooks/useCreditCardList.ts`
- **Responsabilidad**: Lógica de listado y paginación de tarjetas
- **API**: 
  - `handleSearch(filters)` - Buscar tarjetas con filtros
  - `handlePageChange(newPage)` - Cambiar de página
  - `handleCardSelection(cardIndex, action)` - Seleccionar tarjeta para acción
  - `handleProcessSelection()` - Procesar selección (navegar a View/Update)
  - `handleExit()` - Volver al menú principal

#### `useCreditCardDetail.ts`
- **Ubicación**: `app/hooks/useCreditCardDetail.ts`
- **Responsabilidad**: Lógica de visualización de detalles de tarjeta
- **API**:
  - `handleSearch(request)` - Cargar detalles de tarjeta
  - `handleExit()` - Volver a la lista
  - `formatExpiryDate(month, year)` - Formatear fecha de expiración

#### `useCreditCardUpdate.ts`
- **Ubicación**: `app/hooks/useCreditCardUpdate.ts`
- **Responsabilidad**: Lógica de actualización de tarjetas
- **API**:
  - `handleSearch(request)` - Cargar tarjeta para edición
  - `handleFieldChange(field, value)` - Actualizar campos localmente
  - `handleValidateChanges()` - Validar cambios antes de confirmar
  - `handleSaveChanges()` - Guardar cambios en el backend
  - `handleCancelChanges()` - Cancelar y resetear a valores originales
  - `mapBackendStatusToUI(status)` - Convertir estado del backend a UI
  - `getStatusDisplayName(status)` - Obtener nombre legible del estado

### Types

#### `creditCard.ts`
```typescript
interface CreditCard {
  accountNumber: string;      // 11 dígitos
  cardNumber: string;          // 16 dígitos
  cardStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'EXPIRED';
}

interface CreditCardFilter {
  accountId?: string;          // 11 dígitos
  cardNumber?: string;         // 16 dígitos
  pageNumber?: number;         // 1-based
  pageSize?: number;           // Default: 7
}

interface CreditCardListResponse {
  content: CreditCard[];
  totalElements: number;
  totalPages: number;
  number: number;              // 0-based (Spring)
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

interface CreditCardSelection {
  cardIndex: number;
  action: 'S' | 'U';          // S = View, U = Update
}
```

#### `creditCardDetail.ts`
```typescript
interface CreditCardDetailRequest {
  accountId: string;          // String, se convierte a Long en backend
  cardNumber: string;
}

interface CreditCardDetailResponse {
  accountId: number;
  cardNumber: string;
  cvvCode?: number;
  embossedName: string;
  activeStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'EXPIRED';
  expiryMonth: string;
  expiryYear: string;
  errorMessage?: string;
  infoMessage?: string;
  success: boolean;
}
```

#### `creditCardUpdate.ts`
```typescript
interface CreditCardUpdateRequest {
  accountId: string;
  cardNumber: string;
  embossedName: string;
  activeStatus: 'A' | 'I';    // A = Active, I = Inactive (CardStatus enum)
  expiryMonth: string;
  expiryYear: string;
  expiryDay?: string;         // Opcional, default '01'
}

interface CreditCardUpdateResponse {
  accountId: number;
  cardNumber: string;
  cvvCode?: number;
  embossedName: string;
  activeStatus: string;
  expiryMonth: string;
  expiryYear: string;
  errorMessage?: string;
  infoMessage?: string;
  success: boolean;
}

interface CreditCardUpdateState {
  changeAction: 'NOT_FETCHED' | 'SHOW_DETAILS' | 'CHANGES_NOT_OK' | 
                'CHANGES_OK_NOT_CONFIRMED' | 'CHANGES_OKAYED_AND_DONE' | 
                'CHANGES_FAILED';
  oldDetails?: CreditCardUpdateResponse;
  newDetails?: CreditCardUpdateRequest;
  validationErrors: Record<string, string>;
}
```

## 🌐 APIs Públicas

### POST /api/credit-cards/list
**Descripción**: Listar tarjetas con filtros y paginación  
**Headers**: `User-Type: ADMIN | USER`  
**Body**: `CreditCardFilter`  
**Response**: `CreditCardListResponse`

**Ejemplo de Request**:
```json
{
  "accountId": "00000000001",
  "cardNumber": "4000100000000101",
  "pageNumber": 1,
  "pageSize": 7
}
```

**Ejemplo de Response**:
```json
{
  "content": [
    {
      "accountNumber": "00000000001",
      "cardNumber": "4000100000000101",
      "cardStatus": "ACTIVE"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "number": 0,
  "size": 7,
  "first": true,
  "last": true,
  "numberOfElements": 1
}
```

### POST /api/credit-cards/details
**Descripción**: Obtener detalles completos de una tarjeta  
**Body**: `CreditCardDetailRequest`  
**Response**: `CreditCardDetailResponse`

**Ejemplo de Request**:
```json
{
  "accountId": 1,
  "cardNumber": "4000100000000101"
}
```

**Ejemplo de Response**:
```json
{
  "accountId": 1,
  "cardNumber": "4000100000000101",
  "cvvCode": 123,
  "embossedName": "JOHN DOE",
  "activeStatus": "ACTIVE",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "success": true
}
```

### POST /api/credit-cards/search
**Descripción**: Buscar tarjeta para edición (carga datos originales)  
**Body**: `{ accountId: number, cardNumber: string }`  
**Response**: `CreditCardUpdateResponse`

### PUT /api/credit-cards/update
**Descripción**: Actualizar información de tarjeta  
**Body**: `CreditCardUpdateRequest`  
**Response**: `CreditCardUpdateResponse`

**Ejemplo de Request**:
```json
{
  "accountId": 1,
  "cardNumber": "4000100000000101",
  "embossedName": "JANE SMITH",
  "activeStatus": "A",
  "expiryMonth": 6,
  "expiryYear": 2026,
  "expiryDay": 1
}
```

## 📋 Reglas de Negocio

### Identificación y Búsqueda
- **RN-CC-001**: El Account ID debe ser exactamente de 11 dígitos numéricos
- **RN-CC-002**: El Card Number debe ser exactamente de 16 dígitos numéricos
- **RN-CC-003**: Usuarios no-admin requieren obligatoriamente Account ID en el listado
- **RN-CC-004**: Admin puede listar todas las tarjetas sin filtro de cuenta

### Paginación
- **RN-CC-005**: El tamaño de página por defecto es 7 registros
- **RN-CC-006**: La numeración de páginas es 1-based en UI, 0-based en backend (Spring)
- **RN-CC-007**: Se debe validar si hay páginas siguiente/anterior antes de navegar

### Validaciones de Actualización
- **RN-CC-008**: El Embossed Name solo puede contener letras y espacios
- **RN-CC-009**: El Embossed Name no puede exceder 50 caracteres
- **RN-CC-010**: El Embossed Name se guarda en mayúsculas
- **RN-CC-011**: Active Status debe ser 'A' (Active) o 'I' (Inactive) según enum CardStatus
- **RN-CC-012**: Expiry Month debe estar entre 1 y 12
- **RN-CC-013**: Expiry Year debe ser >= año actual y <= 2099
- **RN-CC-014**: La fecha de expiración no puede estar en el pasado
- **RN-CC-015**: Expiry Day es opcional, por defecto '01'

### Estados de Tarjeta
- **RN-CC-016**: Estados válidos: ACTIVE, INACTIVE, BLOCKED, EXPIRED
- **RN-CC-017**: Backend usa enum CardStatus: A, B, E, I
- **RN-CC-018**: UI mapea: A → Active, I/B/E → Inactive
- **RN-CC-019**: Solo se puede actualizar entre Active (A) e Inactive (I)

### Selección y Navegación
- **RN-CC-020**: Solo se puede seleccionar una tarjeta a la vez
- **RN-CC-021**: Acción 'S' navega a vista de detalles (read-only)
- **RN-CC-022**: Acción 'U' navega a pantalla de actualización
- **RN-CC-023**: Al volver de View/Update se mantiene el estado de búsqueda

## 🔗 Dependencias

### Módulos Internos
- **Auth Module**: Autenticación y roles de usuario (Admin/User)
- **Account Module**: Relación con cuentas de cliente
- **Menu Module**: Navegación al menú principal

### Librerías Externas
- **Material-UI**: TextField, Card, Button, Table, Pagination, Select, MenuItem, Alert
- **React**: useState, useCallback, useEffect, useRef
- **React Router**: useNavigate, useLocation

### Backend Dependencies
- CreditCard Entity (JPA)
- CardXrefRecord Entity (JPA)
- Account Entity (JPA)
- CreditCardService
- CreditCardValidationService
- CardStatus Enum (A, B, E, I)

## 📊 Patrones de User Stories

### Listado de Tarjetas
**Como** representante de servicio al cliente  
**Quiero** listar todas las tarjetas asociadas a una cuenta  
**Para** consultar el estado de tarjetas del cliente

### Visualización de Tarjetas
**Como** representante de servicio  
**Quiero** ver los detalles completos de una tarjeta específica  
**Para** responder consultas sobre fecha de expiración, CVV y estado

### Actualización de Tarjetas
**Como** administrador de tarjetas  
**Quiero** actualizar el nombre grabado en la tarjeta  
**Para** corregir errores de captura o cambios de nombre del titular

### Control de Estado
**Como** oficial de seguridad  
**Quiero** cambiar el estado de una tarjeta a inactiva  
**Para** bloquear temporalmente tarjetas sospechosas

## 📊 Complejidad de Stories

### Simple (1-2 pts)
- Agregar campo de solo lectura en vista de detalles
- Cambiar formato de fecha de expiración
- Agregar validación regex existente
- Modificar mensaje de error

### Medio (3-5 pts)
- Implementar filtro adicional de búsqueda (por fecha, por status)
- Agregar campo editable con validación client/server
- Implementar exportación de resultados a CSV
- Agregar histórico de cambios de estado

### Complejo (5-8 pts)
- Integrar con sistema de autenticación biométrica para CVV
- Implementar activación/desactivación masiva de tarjetas
- Agregar notificaciones push cuando se actualiza una tarjeta
- Implementar auditoría completa con trazabilidad de cambios

## ⚡ Factores de Aceleración

- **useCreditCardList Hook**: Reutilizable, incluye lógica de paginación y selección
- **useCreditCardDetail Hook**: Validaciones integradas, manejo de errores
- **useCreditCardUpdate Hook**: Máquina de estados completa, detección automática de cambios
- **Material-UI Components**: Reduce tiempo de UI en 60%
- **MSW Mocks**: 5 tarjetas de prueba predefinidas para desarrollo sin backend
- **Validaciones Compartidas**: Regex patterns reutilizables entre hooks

## ⚡ Performance Budgets

- **Tiempo de Respuesta**: < 800ms (P95) para listados
- **Tiempo de Respuesta**: < 500ms (P95) para búsquedas individuales
- **Throughput**: 50 búsquedas concurrentes/segundo
- **Uso de Memoria**: < 30MB por sesión de usuario
- **Índices DB**: Requeridos en cardNumber, accountId, activeStatus

## 🚨 Riesgos y Mitigaciones

### ⚠️ Seguridad del CVV
**Riesgo**: CVV expuesto en respuestas de API  
**Mitigación**: Implementar enmascaramiento en backend, solo mostrar en casos autorizados (8 puntos)

### ⚠️ Falta de i18n
**Riesgo**: Mensajes y labels hardcodeados en inglés  
**Mitigación**: Implementar react-i18next con archivos de traducción (5 puntos)

### ⚠️ Sin Auditoría de Cambios
**Riesgo**: No hay trazabilidad de quién modificó qué y cuándo  
**Mitigación**: Implementar Audit Trail con Spring Data Envers (5 puntos)

### ⚠️ Paginación en Memoria
**Riesgo**: Rendimiento degradado con miles de tarjetas  
**Mitigación**: Implementar cursor-based pagination en backend (3 puntos)

### ⚠️ Estados de Tarjeta Inconsistentes
**Riesgo**: Mapeo manual entre backend enum y UI puede fallar  
**Mitigación**: Ya implementado con funciones de mapeo seguras en useCreditCardUpdate

## 📈 Métricas de Éxito

### Adopción
- Target: 90% de representantes usan el módulo diariamente
- Engagement: > 30 consultas de tarjetas por usuario/día
- Retención: 100% uso mensual

### Impacto en Negocio
- Reducción de tiempo de consulta: -50% (de 3 min a 1.5 min)
- Reducción de errores en actualización: -80%
- Satisfacción de clientes: > 85% NPS
- Tiempo de respuesta a solicitudes: < 2 minutos

---

**Última actualización**: 2026-01-27  
**Precisión del módulo**: 95%  
**Estado**: ✅ Completado
