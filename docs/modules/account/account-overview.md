# 💳 Módulo ACCOUNT - Cuentas

## 📋 Resumen

**ID del Módulo**: `account`  
**Propósito**: Gestión completa del ciclo de vida de cuentas de tarjetas de crédito  
**Contexto de Negocio**: Permite a representantes de servicio y administradores consultar, visualizar y actualizar información financiera y personal de cuentas de clientes

## 🎯 Responsabilidades Principales

- ✅ Búsqueda de cuentas por ID de 11 dígitos
- ✅ Visualización completa de información financiera (límites, balances, ciclos)
- ✅ Actualización transaccional de datos de cuenta y cliente
- ✅ Protección de datos sensibles (SSN, números de tarjeta)
- ✅ Validaciones de negocio en tiempo real
- ✅ Gestión de estado de cuenta (activo/inactivo)

## 🏗️ Componentes Clave

### Frontend Components

#### `AccountViewScreen.tsx`
- **Ubicación**: `app/components/account/AccountViewScreen.tsx`
- **Responsabilidad**: Pantalla de búsqueda y visualización de cuentas
- **Características**:
  - Búsqueda por ID de 11 dígitos
  - 4 tarjetas de información (Account Info, Financial Info, Customer Overview, Contact & Personal)
  - Enmascarado de datos sensibles (SSN, tarjetas)
  - Toggle para mostrar/ocultar datos sensibles
  - Cuentas de prueba para desarrollo

#### `AccountUpdateScreen.tsx`
- **Ubicación**: `app/components/account/AccountUpdateScreen.tsx`
- **Responsabilidad**: Edición y actualización de cuentas
- **Características**:
  - Modo edición con toggle
  - Detección automática de cambios
  - Validación en tiempo real
  - Confirmación de guardado
  - Reseteo de formulario

### Custom Hooks

#### `useAccountView.ts`
- **Ubicación**: `app/hooks/useAccountView.ts`
- **Responsabilidad**: Lógica de búsqueda y visualización
- **API**: 
  - `searchAccount(request)` - Buscar cuenta
  - `initializeScreen()` - Inicializar pantalla
  - `clearData()` - Limpiar datos

#### `useAccountUpdate.ts`
- **Ubicación**: `app/hooks/useAccountUpdate.ts`
- **Responsabilidad**: Lógica de actualización de cuentas
- **API**:
  - `searchAccount(request)` - Cargar cuenta para edición
  - `updateAccount(data)` - Guardar cambios
  - `updateLocalData(updates)` - Actualizar campos localmente
  - `resetForm()` - Resetear a valores originales
  - `hasChanges` - Indicador de cambios pendientes

### Types

#### `account.ts`
```typescript
interface AccountViewRequest {
  accountId: string;
}

interface AccountViewResponse {
  // Control fields
  currentDate: string;
  currentTime: string;
  transactionId: string;
  programName: string;
  
  // Account data
  accountId: number;
  accountStatus: string;
  creditLimit: number;
  currentBalance: number;
  cashCreditLimit: number;
  currentCycleCredit: number;
  currentCycleDebit: number;
  openDate: string;
  expirationDate: string;
  reissueDate: string;
  groupId: string;
  
  // Customer data
  customerId: number;
  customerSsn: string;
  ficoScore: number;
  dateOfBirth: string;
  firstName: string;
  middleName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber1: string;
  phoneNumber2: string;
  governmentId: string;
  eftAccountId: string;
  primaryCardHolderFlag: string;
  cardNumber: string;
  
  // Validation flags
  inputValid: boolean;
  accountFilterValid: boolean;
  customerFilterValid: boolean;
  foundAccountInMaster: boolean;
  foundCustomerInMaster: boolean;
  errorMessage?: string;
  infoMessage?: string;
}
```

#### `accountUpdate.ts`
```typescript
interface AccountUpdateData {
  // Account data
  accountId: number;
  activeStatus: string;
  currentBalance: number;
  creditLimit: number;
  cashCreditLimit: number;
  openDate: string;
  expirationDate: string;
  reissueDate: string;
  currentCycleCredit: number;
  currentCycleDebit: number;
  groupId: string;

  // Customer data
  customerId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  stateCode: string;
  countryCode: string;
  zipCode: string;
  phoneNumber1: string;
  phoneNumber2?: string;
  ssn: string;
  governmentIssuedId: string;
  dateOfBirth: string;
  eftAccountId: string;
  primaryCardIndicator: string;
  ficoScore: number;
}
```

## 🌐 APIs Públicas

### GET /api/account-view
**Descripción**: Buscar y obtener cuenta completa con datos de cliente  
**Query Params**: `accountId` (string, 11 dígitos)  
**Response**: `AccountViewResponse`

### GET /api/account-view/initialize
**Descripción**: Inicializar pantalla con metadata del sistema  
**Response**: `AccountViewResponse` con fecha/hora/transactionId

### GET /api/accounts/{accountId}
**Descripción**: Obtener datos de cuenta para formulario de edición  
**Response**: `AccountUpdateData`

### PUT /api/accounts/{accountId}
**Descripción**: Actualizar cuenta y cliente (transaccional)  
**Body**: `AccountUpdateData`  
**Response**: `{ message: string }`

## 📋 Reglas de Negocio

### Identificación y Búsqueda
- **RN-001**: El Account ID debe ser exactamente de 11 dígitos numéricos
- **RN-002**: El Account ID no puede ser todo ceros (00000000000)
- **RN-003**: La búsqueda valida existencia en: CardXrefRecord → Account → Customer

### Seguridad y Privacidad
- **RN-006**: El SSN se muestra enmascarado: `***-**-XXXX` (solo últimos 4 dígitos)
- **RN-007**: El número de tarjeta se enmascara: `****-****-****-XXXX`

### Validaciones Críticas
- **RN-009**: Active Status solo acepta 'Y' (activo) o 'N' (inactivo)
- **RN-012**: FICO Score debe estar en rango 300-850
- **RN-015**: ZIP Code formato: `^\d{5}(-\d{4})?$`

### Transaccionalidad
- **RN-018**: Actualización de Account y Customer es atómica (todo o nada)
- **RN-021**: Se hace "READ FOR UPDATE" (lock pesimista) antes de actualizar

## 🔗 Dependencias

### Módulos Internos
- **Auth Module**: Autenticación y autorización
- **Customer Module**: Datos de clientes (implícito)
- **Card Module**: Relación con tarjetas

### Librerías Externas
- **Material-UI**: TextField, Card, Button, IconButton, Chip, Dialog
- **React**: useState, useCallback, useEffect
- **React Router**: useNavigate

### Backend Dependencies
- Account Entity (JPA)
- Customer Entity (JPA)
- CardXrefRecord Entity (JPA)
- AccountValidationService
- AccountViewService
- AccountUpdateService

## 📊 Patrones de User Stories

### Visualización de Cuentas
**Como** representante de servicio al cliente  
**Quiero** buscar una cuenta por su ID de 11 dígitos  
**Para** visualizar el estado financiero completo y responder consultas del titular

### Actualización de Cuentas
**Como** administrador de cuentas  
**Quiero** actualizar el límite de crédito  
**Para** reflejar la mejora en el puntaje FICO del cliente

### Validación y Seguridad
**Como** oficial de cumplimiento  
**Quiero** que el SSN siempre se muestre enmascarado  
**Para** cumplir con regulaciones PCI-DSS

## 📊 Complejidad de Stories

### Simple (1-2 pts)
- Agregar campo de solo lectura en AccountViewScreen
- Agregar validación regex existente
- Cambiar formato de fecha

### Medio (3-5 pts)
- Implementar nueva validación de negocio
- Agregar campo editable con validación client/server
- Agregar nuevo filtro de búsqueda

### Complejo (5-8 pts)
- Integrar con sistema externo de scoring
- Implementar auditoría completa de cambios
- Agregar búsqueda avanzada multi-criterio

## ⚡ Factores de Aceleración

- **useAccountView Hook**: Reutilizable, evita reimplementar lógica de búsqueda
- **useAccountUpdate Hook**: Detección automática de cambios
- **Material-UI Components**: Reduce tiempo de UI en 60%
- **API RESTful Documentada**: 4 endpoints bien definidos
- **MSW Mocks**: Desarrollo sin dependencia de backend

## ⚡ Performance Budgets

- **Tiempo de Respuesta**: < 500ms (P95) para búsquedas
- **Throughput**: 100 búsquedas concurrentes/segundo
- **Uso de Memoria**: < 50MB por sesión de usuario
- **Índices DB**: Requeridos en accountId, customerId, cardNumber

## 🚨 Riesgos y Mitigaciones

### ⚠️ Performance en Búsquedas
**Riesgo**: Búsqueda secuencial en 3 tablas puede degradarse  
**Mitigación**: Implementar índices; considerar caché Redis

### ⚠️ Falta de i18n
**Riesgo**: Mensajes hardcodeados en inglés  
**Mitigación**: Implementar react-i18next (5 puntos)

### ⚠️ Sin Auditoría de Cambios
**Riesgo**: No hay trazabilidad de modificaciones  
**Mitigación**: Implementar Audit Trail con Spring Data Envers (5 puntos)

## 📈 Métricas de Éxito

### Adopción
- Target: 95% de representantes usan el módulo diariamente
- Engagement: > 50 consultas por usuario/día
- Retención: 100% uso mensual

### Impacto en Negocio
- Reducción de tiempo de consulta: -40% (de 2 min a 1.2 min)
- Precisión de datos: 99.5% sin errores
- Satisfacción de clientes: > 90% NPS

---

**Última actualización**: 2026-01-27  
**Precisión del módulo**: 95%  
**Estado**: ✅ Completado
