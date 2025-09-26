---
title: Financiera Backend API v1.0.0
language_tabs: []
toc_footers: []
includes: []
search: true
highlight_theme: darkula
---

# Financiera Backend API v1.0.0

> Scroll down for example requests and responses.

API for vehicle sales platform. Provides endpoints for user authentication, vehicle references management, user administration, credit application management, and fingerprint/attendance processing.

Base URLs:

* <a href="http://localhost:3000">http://localhost:3000</a>





# Authentication





# Auth

Endpoints for user authentication and session management.

## POST /api/auth/login

> Code samples

*Iniciar sesión con email y contraseña*

Autentica a un usuario y devuelve un token de acceso y un token de refresco. Límite de 5 intentos por hora.

> Body parameter

```json
{
  "email": "user@example.com",
  "password": "pa$$word"
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» email|body|string(email)|true|Correo electrónico del usuario
» password|body|string(password)|true|Contraseña del usuario (mínimo 8 caracteres)


> Example responses

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {}
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Login exitoso|[AuthResponse](#schemaauthresponse)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validación fallida|[ErrorResponse](#schemaerrorresponse)
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Credenciales inválidas|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiados intentos de login|[ErrorResponse](#schemaerrorresponse)

<aside class="success">
This operation does not require authentication
</aside>

## GET /api/auth/google

> Code samples

*Iniciar autenticación con Google*

Redirige al usuario a la página de autenticación de Google para OAuth 2.0.

### Responses

Status|Meaning|Description|Schema
---|---|---|---|
302|[Found](https://tools.ietf.org/html/rfc7231#section-6.4.3)|Redirige a Google|None

### Response Headers

Status|Header|Type|Format|Description
---|---|---|---|---|
302|Location|string|uri|URL de redirección a Google

<aside class="success">
This operation does not require authentication
</aside>

## GET /api/auth/google/callback

> Code samples

*Callback de Google OAuth para web*

Maneja la respuesta de Google tras la autenticación web y devuelve tokens y datos del usuario.

> Example responses

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {}
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Login exitoso|[AuthResponse](#schemaauthresponse)
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Autenticación fallida|[ErrorResponse](#schemaerrorresponse)

<aside class="success">
This operation does not require authentication
</aside>

## POST /api/auth/google/callback

> Code samples

*Callback de Google OAuth para móviles*

Procesa el código de autorización de Google enviado desde la app móvil y devuelve tokens y datos del usuario. Límite de 5 intentos por hora.

> Body parameter

```json
{
  "code": "string"
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» code|body|string|true|Código de autorización de Google


> Example responses

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {}
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Login exitoso|[AuthResponse](#schemaauthresponse)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validación fallida|[ErrorResponse](#schemaerrorresponse)
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Autenticación fallida|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiados intentos de login|[ErrorResponse](#schemaerrorresponse)

<aside class="success">
This operation does not require authentication
</aside>

## POST /api/auth/refresh

> Code samples

*Refrescar token de acceso*

Genera un nuevo token de acceso usando un token de refresco válido. Límite de 5 intentos por hora.

> Body parameter

```json
{
  "refreshToken": "string"
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» refreshToken|body|string|true|Token de refresco JWT


> Example responses

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {}
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Nuevo token de acceso generado|[AuthResponse](#schemaauthresponse)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validación fallida|[ErrorResponse](#schemaerrorresponse)
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token inválido o expirado|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiados intentos de refresco|[ErrorResponse](#schemaerrorresponse)

<aside class="success">
This operation does not require authentication
</aside>

# Catálogo

## GET /api/catalogo

> Code samples

*Obtener todos los vehículos disponibles con imágenes*

Devuelve una lista de vehículos disponibles en el catálogo, incluyendo sus imágenes.

### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lista de vehículos disponibles|None
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|None

<aside class="success">
This operation does not require authentication
</aside>

## POST /api/catalogo

> Code samples

*Crear un vehículo con imágenes*

Crea un nuevo vehículo en el catálogo con sus imágenes. Requiere autenticación.

> Body parameter

```yaml
idVendedor: 0
idMarca: 0
modelo: string
version: string
ano: 0
kilometraje: 0
precio: 0
caracteristicas: string
descripcion: string
estado: disponible
tipoCombustible: gasolina
transmision: manual
imagenes:
  - string

```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» idVendedor|body|integer|true|No description
» idMarca|body|integer|true|No description
» modelo|body|string|true|No description
» version|body|string|true|No description
» ano|body|integer|true|No description
» kilometraje|body|number|true|No description
» precio|body|number(float)|true|No description
» caracteristicas|body|string|true|No description
» descripcion|body|string|true|No description
» estado|body|string|true|Estado actual del vehículo
» tipoCombustible|body|string|true|Tipo de combustible
» transmision|body|string|true|Tipo de transmisión
» imagenes|body|[string(binary)]|false|No description


#### Enumerated Values

|Parameter|Value|
|---|---|
» estado|disponible|
» estado|no_disponible|
» estado|vendido|
» estado|reservado|
» tipoCombustible|gasolina|
» tipoCombustible|diésel|
» tipoCombustible|híbrido|
» tipoCombustible|otro|
» transmision|manual|
» transmision|automática|
» transmision|CVT|
» transmision|otro|

### Responses

Status|Meaning|Description|Schema
---|---|---|---|
201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Vehículo creado exitosamente|None
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autenticado|None
413|[Payload Too Large](https://tools.ietf.org/html/rfc7231#section-6.5.11)|Archivo muy grande|None
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|None

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## GET /api/catalogo/admin

> Code samples

*Obtener todos los vehículos (solo para administradores)*

Devuelve todos los vehículos del catálogo sin filtro de estado. Requiere autenticación.

### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lista completa de vehículos|None
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autenticado|None
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|None

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## GET /api/catalogo/{idVehiculo}

> Code samples

*Obtener un vehículo por ID*

Devuelve los detalles de un vehículo específico, incluyendo sus imágenes, basado en su ID.

### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
idVehiculo|path|integer|true|ID del vehículo


### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Vehículo encontrado|None
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Vehículo no encontrado|None
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|None

<aside class="success">
This operation does not require authentication
</aside>

## PUT /api/catalogo/{idVehiculo}

> Code samples

*Actualizar vehículo y reemplazar imágenes*

Actualiza un vehículo existente. Todos los campos son opcionales y solo se actualizarán los que se envíen. Requiere autenticación.

> Body parameter

```yaml
idVendedor: 0
idMarca: 0
modelo: string
version: string
ano: 0
kilometraje: 0
precio: 0
caracteristicas: string
descripcion: string
estado: disponible
tipoCombustible: gasolina
transmision: manual
imagenes:
  - string

```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
idVehiculo|path|integer|true|ID del vehículo a actualizar
body|body|object|false|No description
» idVendedor|body|integer|false|No description
» idMarca|body|integer|false|No description
» modelo|body|string|false|No description
» version|body|string|false|No description
» ano|body|integer|false|No description
» kilometraje|body|number|false|No description
» precio|body|number(float)|false|No description
» caracteristicas|body|string|false|No description
» descripcion|body|string|false|No description
» estado|body|string|false|Estado actual del vehículo
» tipoCombustible|body|string|false|Tipo de combustible (elige entre gasolina, diésel, híbrido u otro)
» transmision|body|string|false|Tipo de transmisión (manual, automática, CVT u otro)
» imagenes|body|[string(binary)]|false|No description


#### Enumerated Values

|Parameter|Value|
|---|---|
» estado|disponible|
» estado|no_disponible|
» estado|vendido|
» estado|reservado|
» tipoCombustible|gasolina|
» tipoCombustible|diésel|
» tipoCombustible|híbrido|
» tipoCombustible|otro|
» transmision|manual|
» transmision|automática|
» transmision|CVT|
» transmision|otro|

### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Vehículo actualizado exitosamente|None
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autenticado|None
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Vehículo no encontrado|None
413|[Payload Too Large](https://tools.ietf.org/html/rfc7231#section-6.5.11)|Archivo muy grande|None
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|None

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## DELETE /api/catalogo/{idVehiculo}

> Code samples

*Eliminar un vehículo por ID*

Elimina un vehículo específico del catálogo. Requiere autenticación.

### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
idVehiculo|path|integer|true|ID del vehículo


### Responses

Status|Meaning|Description|Schema
---|---|---|---|
204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Vehículo eliminado exitosamente|None
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autenticado|None
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Vehículo no encontrado|None
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|None

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## POST /api/catalogo/{idVehiculo}/imagenes

> Code samples

*Agregar más imágenes a un vehículo*

Agrega imágenes adicionales a un vehículo existente. Requiere autenticación.

> Body parameter

```yaml
imagenes:
  - string

```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
idVehiculo|path|integer|true|ID del vehículo
body|body|object|true|No description
» imagenes|body|[string(binary)]|false|No description


### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Imágenes agregadas exitosamente|None
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autenticado|None
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Vehículo no encontrado|None
413|[Payload Too Large](https://tools.ietf.org/html/rfc7231#section-6.5.11)|Archivo muy grande|None
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|None

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

# Cotizaciones

## GET /api/cotizaciones

> Code samples

*Listar todas las cotizaciones*

### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lista de cotizaciones|None

<aside class="success">
This operation does not require authentication
</aside>

## POST /api/cotizaciones

> Code samples

*Crear o actualizar una cotización*

> Body parameter

```json
{
  "idCliente": 0,
  "idVehiculo": 0,
  "idVendedor": 0,
  "enganche": 0,
  "plazos": 0,
  "whatsapp": "string",
  "estatus": "string",
  "precioNeto": 0
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» idCliente|body|integer|true|No description
» idVehiculo|body|integer|true|No description
» idVendedor|body|integer|true|No description
» enganche|body|number|true|No description
» plazos|body|integer|true|No description
» whatsapp|body|string|false|No description
» estatus|body|string|false|No description
» precioNeto|body|number|true|No description


### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Cotización actualizada|None
201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Cotización creada|None
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validación fallida|None
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|None

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## GET /api/cotizaciones/asesores

> Code samples

*Obtener cotizaciones de un asesor*

### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
idVendedor|query|integer|true|ID del vendedor (asesor)


### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lista de cotizaciones|None
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Parámetros inválidos|None
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|None
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Asesor no encontrado|None

<aside class="success">
This operation does not require authentication
</aside>

## DELETE /api/cotizaciones/{idCotizacion}

> Code samples

*Eliminar una cotización por ID*

### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
idCotizacion|path|integer|true|ID de la cotización


### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Cotización eliminada|None
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Parámetro inválido|None
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|None
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Cotización no encontrada|None

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

# Asistencia

Endpoints for processing and retrieving attendance data.

## POST /api/fingerprint/pase-lista

> Code samples

*Registra una asistencia desde el IoT*

Registra una asistencia para una huella verificada, resolviendo el idUsuario y nombre a partir del idHuella. Usado por dispositivos IoT, no requiere autenticación.

> Body parameter

```json
{
  "idHuella": 0
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» idHuella|body|integer|true|ID de la huella registrada (1–300)


> Example responses

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Asistencia registrada con éxito|[SuccessResponse](#schemasuccessresponse)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validación fallida|[ErrorResponse](#schemaerrorresponse)

<aside class="success">
This operation does not require authentication
</aside>

## POST /api/fingerprint/asistencias

> Code samples

*Obtiene asistencias consolidadas o detalladas con información de usuario*

Retorna asistencias con información completa del usuario:
- Modo consolidado (detailed=false): Datos agrupados por usuario y fecha (idUsuario, nombre, conteo, primer_registro, ultimo_registro)
- Modo detallado (detailed=true): Registros individuales (idAsistencia, idUsuario, nombre, timestamp)
Si idUsuario no se proporciona, retorna para todos los usuarios. Requiere autenticación JWT y rol de administrador.

> Body parameter

```json
{
  "idUsuario": 0,
  "startDate": "2025-08-14T12:30:31Z",
  "endDate": "2025-08-14T12:30:31Z"
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
detailed|query|boolean|false|Tipo de respuesta:
body|body|object|false|No description
» idUsuario|body|integer|false|ID del usuario para filtrar (opcional)
» startDate|body|string(date-time)|false|Fecha de inicio del rango (opcional, formato ISO 8601)
» endDate|body|string(date-time)|false|Fecha de fin del rango (opcional, formato ISO 8601)


##### detailed
Tipo de respuesta:
- false (default): Datos consolidados por usuario
- true: Registros detallados individuales

> Example responses

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Asistencias obtenidas con éxito|[SuccessResponse](#schemasuccessresponse)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Error de validación|[ErrorResponse](#schemaerrorresponse)
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autorizado|[ErrorResponse](#schemaerrorresponse)
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|[ErrorResponse](#schemaerrorresponse)
500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Error interno del servidor|[ErrorResponse](#schemaerrorresponse)

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

# Huellas

Endpoints for managing fingerprint registration and verification.

## GET /api/fingerprint/get

> Code samples

*Obtiene registros de huellas*

Retorna la lista de huellas registradas para sincronización con dispositivos IoT. No requiere autenticación.

> Example responses

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Huellas obtenidas con éxito|[SuccessResponse](#schemasuccessresponse)
500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Error inesperado en el servidor|[ErrorResponse](#schemaerrorresponse)

<aside class="success">
This operation does not require authentication
</aside>

## POST /api/fingerprint/request

> Code samples

*Solicita registro de huella*

Inicia el registro de una huella para un administrador o vendedor, asignando un idHuella entre 1 y 300. Elimina cualquier huella en espera existente. Requiere autenticación JWT y rol de administrador.

> Body parameter

```json
{
  "idUsuario": 0
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» idUsuario|body|integer|true|ID del usuario (administrador o vendedor) para registrar la huella


> Example responses

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Huella en espera para registro|[SuccessResponse](#schemasuccessresponse)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validación fallida o no hay espacios disponibles|[ErrorResponse](#schemaerrorresponse)
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autorizado|[ErrorResponse](#schemaerrorresponse)
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|[ErrorResponse](#schemaerrorresponse)

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## POST /api/fingerprint/confirm

> Code samples

*Confirma huella en espera o consulta huella pendiente*

Confirma el registro de una huella si se proporciona idHuella, o retorna la huella en espera si no se proporciona. Usado por dispositivos IoT, no requiere autenticación.

> Body parameter

```json
{
  "idHuella": 0
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|false|No description
» idHuella|body|integer|false|ID de la huella a confirmar (1–300). Si no se proporciona, retorna la huella en espera.


> Example responses

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Resultado de la confirmación o consulta|[SuccessResponse](#schemasuccessresponse)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validación fallida|[ErrorResponse](#schemaerrorresponse)

<aside class="success">
This operation does not require authentication
</aside>

## POST /api/fingerprint/status

> Code samples

*Verifica estado de huella*

Consulta el estado de una huella. Requiere autenticación JWT y rol de administrador. Usado por el frontend web.

> Body parameter

```json
{
  "idUsuario": 0
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» idUsuario|body|integer|true|ID del usuario cuya huella se consulta


> Example responses

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Estado de huella obtenido con éxito|[SuccessResponse](#schemasuccessresponse)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validación fallida|[ErrorResponse](#schemaerrorresponse)
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autorizado|[ErrorResponse](#schemaerrorresponse)
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|[ErrorResponse](#schemaerrorresponse)

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## POST /api/fingerprint/cancel

> Code samples

*Cancela registro de huella*

Cancela registros de huella en espera. Requiere autenticación JWT y rol de administrador. Usado por el frontend web.

> Example responses

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Registro de huella cancelado con éxito|[SuccessResponse](#schemasuccessresponse)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validación fallida|[ErrorResponse](#schemaerrorresponse)
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autorizado|[ErrorResponse](#schemaerrorresponse)
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|[ErrorResponse](#schemaerrorresponse)

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## POST /api/fingerprint/delete

> Code samples

*Elimina huella de usuario*

Elimina la huella de un usuario. Requiere autenticación JWT y rol de administrador. Usado por el frontend web.

> Body parameter

```json
{
  "idUsuario": 0
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» idUsuario|body|integer|true|ID del usuario cuya huella se eliminará


> Example responses

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Huella eliminada con éxito|[SuccessResponse](#schemasuccessresponse)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validación fallida|[ErrorResponse](#schemaerrorresponse)
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autorizado|[ErrorResponse](#schemaerrorresponse)
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|[ErrorResponse](#schemaerrorresponse)

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

# Marcas

## GET /api/marcas

> Code samples

*Obtener todas las marcas*

### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lista de marcas|None

<aside class="success">
This operation does not require authentication
</aside>

## POST /api/marcas

> Code samples

*Crear nueva marca*

> Body parameter

```yaml
nombre_marca: string
enlace_imagen: string

```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|false|No description
» nombre_marca|body|string|false|No description
» enlace_imagen|body|string(binary)|false|No description


### Responses

Status|Meaning|Description|Schema
---|---|---|---|
201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Marca creada|None
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validación fallida|None
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|None

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## GET /api/marcas/{idMarca}

> Code samples

*Obtener una marca por ID*

### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
idMarca|path|integer|true|No description


### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Marca encontrada|None
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|No encontrada|None

<aside class="success">
This operation does not require authentication
</aside>

## PUT /api/marcas/{idMarca}

> Code samples

*Actualizar una marca*

> Body parameter

```yaml
nombre_marca: string
enlace_imagen: string

```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
idMarca|path|integer|true|No description
body|body|object|false|No description
» nombre_marca|body|string|false|No description
» enlace_imagen|body|string(binary)|false|No description


### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Marca actualizada|None
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Validación fallida|None
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|None
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Marca no encontrada|None

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## DELETE /api/marcas/{idMarca}

> Code samples

*Eliminar marca*

### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
idMarca|path|integer|true|No description


### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Marca eliminada|None
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|None
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|No encontrada|None

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## GET /api/marcas/{idMarca}/vehiculos

> Code samples

*Obtener vehículos por marca*

### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
idMarca|path|integer|true|No description


### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lista de vehículos|None
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|ID de marca inválido|None

<aside class="success">
This operation does not require authentication
</aside>

# Referencias

Endpoints for managing vehicle references and media.

## GET /api/referencias

> Code samples

*Listar todas las referencias*

Devuelve una lista de todas las referencias de vehículos disponibles.

> Example responses

```json
[
  {}
]
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lista de referencias|Inline
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|[ErrorResponse](#schemaerrorresponse)

### Response Schema

Status Code **200**

Name|Type|Required|Description
---|---|---|---|---|
anonymous|[[Referencia](#schemareferencia)]|false|No description



<aside class="success">
This operation does not require authentication
</aside>

## POST /api/referencias

> Code samples

*Crear una nueva referencia (solo administradores)*

Crea una nueva referencia de vehículo con descripción y archivos multimedia (imágenes o videos). 
Requiere autenticación de administrador y soporta hasta 2 archivos de 2MB cada uno.
Ejemplo de uso con cURL:
```bash
curl -X POST "https://financiera-backend.vercel.app/api/referencias" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "idVehiculo=123" \
  -F "descripcion=Vehículo en excelente estado" \
  -F "files=@/path/to/image.jpg" \
  -F "files=@/path/to/video.mp4"
```

> Body parameter

```yaml
idVehiculo: 0
descripcion: string
files:
  - string

```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» idVehiculo|body|integer|false|ID del vehículo (opcional)
» descripcion|body|string|true|Descripción de la referencia (mínimo 3, máximo 500 caracteres)
» files|body|[string(binary)]|false|No description


> Example responses

```json
{
  "idPublicacion": 0,
  "idVehiculo": 0,
  "descripcion": "string",
  "fecha": "2025-08-14T12:30:31Z",
  "modelo": "string",
  "ano": 0,
  "marca": "string",
  "medios": [
    {
      "idMedio": 0,
      "urlMedio": "http://example.com",
      "tipo": "image",
      "publicId": "string"
    }
  ]
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Referencia creada exitosamente|[Referencia](#schemareferencia)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Error de validación|[ErrorResponse](#schemaerrorresponse)
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado (no administrador)|[ErrorResponse](#schemaerrorresponse)
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Vehículo no encontrado|[ErrorResponse](#schemaerrorresponse)
413|[Payload Too Large](https://tools.ietf.org/html/rfc7231#section-6.5.11)|Archivos demasiado grandes|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|[ErrorResponse](#schemaerrorresponse)

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## GET /api/referencias/{id}

> Code samples

*Obtener una referencia por ID*

Devuelve los detalles de una referencia específica basada en su ID.

### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
id|path|integer|true|ID de la referencia


> Example responses

```json
{
  "idPublicacion": 0,
  "idVehiculo": 0,
  "descripcion": "string",
  "fecha": "2025-08-14T12:30:31Z",
  "modelo": "string",
  "ano": 0,
  "marca": "string",
  "medios": [
    {
      "idMedio": 0,
      "urlMedio": "http://example.com",
      "tipo": "image",
      "publicId": "string"
    }
  ]
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Detalles de la referencia|[Referencia](#schemareferencia)
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Referencia no encontrada|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|[ErrorResponse](#schemaerrorresponse)

<aside class="success">
This operation does not require authentication
</aside>

## PUT /api/referencias/{id}

> Code samples

*Actualizar una referencia (solo administradores)*

Actualiza una referencia existente, permitiendo modificar la descripción, vehículo asociado y archivos multimedia. 
Requiere autenticación de administrador. Los medios existentes se mantienen si se especifican en `retainedMediaIds`.
Ejemplo de uso con cURL:
```bash
curl -X PUT "https://financiera-backend.vercel.app/api/referencias/1" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "idVehiculo=123" \
  -F "descripcion=Actualización de descripción" \
  -F "retainedMediaIds=[1,2]" \
  -F "files=@/path/to/new-image.jpg"
```

> Body parameter

```yaml
idVehiculo: 0
descripcion: string
retainedMediaIds: string
files:
  - string

```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
id|path|integer|true|ID de la referencia
body|body|object|true|No description
» idVehiculo|body|integer|false|ID del vehículo (opcional)
» descripcion|body|string|true|Descripción de la referencia (mínimo 3, máximo 500 caracteres)
» retainedMediaIds|body|string|false|JSON array de IDs de medios a conservar (e.g., "[1,2]")
» files|body|[string(binary)]|false|No description


> Example responses

```json
{
  "idPublicacion": 0,
  "idVehiculo": 0,
  "descripcion": "string",
  "fecha": "2025-08-14T12:30:31Z",
  "modelo": "string",
  "ano": 0,
  "marca": "string",
  "medios": [
    {
      "idMedio": 0,
      "urlMedio": "http://example.com",
      "tipo": "image",
      "publicId": "string"
    }
  ]
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Referencia actualizada exitosamente|[Referencia](#schemareferencia)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Error de validación|[ErrorResponse](#schemaerrorresponse)
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado (no administrador)|[ErrorResponse](#schemaerrorresponse)
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Referencia o vehículo no encontrado|[ErrorResponse](#schemaerrorresponse)
413|[Payload Too Large](https://tools.ietf.org/html/rfc7231#section-6.5.11)|Archivos demasiado grandes|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|[ErrorResponse](#schemaerrorresponse)

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## DELETE /api/referencias/{id}

> Code samples

*Eliminar una referencia (solo administradores)*

Elimina una referencia específica (soft delete). Requiere autenticación de administrador.

### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
id|path|integer|true|ID de la referencia


> Example responses

```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Referencia eliminada exitosamente|None
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado (no administrador)|[ErrorResponse](#schemaerrorresponse)
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Referencia no encontrada|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|[ErrorResponse](#schemaerrorresponse)

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

# Solicitudes

Endpoints for managing credit applications.

## POST /api/solicitudes

> Code samples

*Crear una nueva solicitud de crédito*

> Body parameter

```json
{
  "idVendedor": 0,
  "idVehiculo": 0,
  "idCotizacion": 0,
  "nombre_completo": "string",
  "telefono": "string",
  "direccion": "string",
  "curp": "string",
  "fecha_nacimiento": "2025-08-14",
  "estado_civil": "soltero",
  "cantidad_dependientes": 0,
  "tipo_vivienda": "propia",
  "ingreso_familiar": 0,
  "direccion_trabajo": "string",
  "empresa": "string",
  "puesto": "string",
  "ingreso_mensual": 0,
  "tiempo_laborando": 0,
  "tipo_credito": "ninguno",
  "enganche_propuesto": 0,
  "plazos_propuestos": 0,
  "comprobante_ingresos": true,
  "descripcion_vehiculo_adicional": "string"
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» idVendedor|body|integer|false|No description
» idVehiculo|body|integer|false|No description
» idCotizacion|body|integer|false|No description
» nombre_completo|body|string|true|No description
» telefono|body|string|false|No description
» direccion|body|string|false|No description
» curp|body|string|true|No description
» fecha_nacimiento|body|string(date)|true|No description
» estado_civil|body|string|true|No description
» cantidad_dependientes|body|integer|true|No description
» tipo_vivienda|body|string|true|No description
» ingreso_familiar|body|number|true|No description
» direccion_trabajo|body|string|false|No description
» empresa|body|string|false|No description
» puesto|body|string|false|No description
» ingreso_mensual|body|number|true|No description
» tiempo_laborando|body|integer|true|No description
» tipo_credito|body|string|true|No description
» enganche_propuesto|body|number|false|No description
» plazos_propuestos|body|integer|false|No description
» comprobante_ingresos|body|boolean|false|No description
» descripcion_vehiculo_adicional|body|string|false|No description


#### Enumerated Values

|Parameter|Value|
|---|---|
» estado_civil|soltero|
» estado_civil|casado|
» estado_civil|divorciado|
» estado_civil|viudo|
» estado_civil|concubinato|
» tipo_vivienda|propia|
» tipo_vivienda|rentada|
» tipo_vivienda|familiar|
» tipo_credito|ninguno|
» tipo_credito|personal|
» tipo_credito|automotriz|
» tipo_credito|bancario|

> Example responses

```json
{
  "idSolicitud": 0,
  "estatus": "string",
  "fecha": "2025-08-14T12:30:31Z"
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Solicitud creada exitosamente|Inline
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Error de validación|None
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|None
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|No encontrado|None
409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Conflicto de datos|None
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|None

### Response Schema

Status Code **201**

Name|Type|Required|Description
---|---|---|---|---|
idSolicitud|integer|false|No description
estatus|string|false|No description
fecha|string(date-time)|false|No description



<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## GET /api/solicitudes

> Code samples

*Listar todas las solicitudes de crédito*

> Example responses

```json
[
  {
    "idSolicitud": 0,
    "nombre_completo": "string",
    "estatus": "string",
    "fecha": "2025-08-14T12:30:31Z"
  }
]
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lista de solicitudes|Inline
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autenticado|None
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|None
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|None

### Response Schema

Status Code **200**

Name|Type|Required|Description
---|---|---|---|---|
anonymous|[object]|false|No description
» idSolicitud|integer|false|No description
» nombre_completo|string|false|No description
» estatus|string|false|No description
» fecha|string(date-time)|false|No description



<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## GET /api/solicitudes/{id}

> Code samples

*Obtener una solicitud de crédito por ID*

### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
id|path|integer|true|ID de la solicitud


> Example responses

```json
{
  "idSolicitud": 0,
  "nombre_completo": "string",
  "estatus": "string",
  "fecha": "2025-08-14T12:30:31Z"
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Solicitud encontrada|Inline
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autenticado|None
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|None
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|No encontrado|None
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|None

### Response Schema

Status Code **200**

Name|Type|Required|Description
---|---|---|---|---|
idSolicitud|integer|false|No description
nombre_completo|string|false|No description
estatus|string|false|No description
fecha|string(date-time)|false|No description



<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## PUT /api/solicitudes/{id}

> Code samples

*Actualizar una solicitud de crédito*

> Body parameter

```json
{
  "estatus": "pendiente",
  "monto_autorizado": 0,
  "idAdministrador": 0
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
id|path|integer|true|ID de la solicitud
body|body|object|true|No description
» estatus|body|string|true|No description
» monto_autorizado|body|number|false|No description
» idAdministrador|body|integer|true|No description


#### Enumerated Values

|Parameter|Value|
|---|---|
» estatus|pendiente|
» estatus|aprobada|
» estatus|rechazada|

> Example responses

```json
{
  "success": true,
  "mensaje": "string"
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Solicitud actualizada exitosamente|Inline
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Error de validación|None
401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|No autenticado|None
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|None
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|No encontrado|None
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|None

### Response Schema

Status Code **200**

Name|Type|Required|Description
---|---|---|---|---|
success|boolean|false|No description
mensaje|string|false|No description



<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

# Usuarios

Endpoints for user management and profile operations.

## GET /api/usuarios

> Code samples

*Listar todos los usuarios*

Devuelve una lista de todos los usuarios registrados. Solo accesible para administradores.

> Example responses

```json
[
  {}
]
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lista de usuarios|Inline
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado (no administrador)|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|[ErrorResponse](#schemaerrorresponse)

### Response Schema

Status Code **200**

Name|Type|Required|Description
---|---|---|---|---|
anonymous|[[Usuario](#schemausuario)]|false|No description



<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## POST /api/usuarios

> Code samples

*Crear un nuevo usuario (solo administradores)*

Crea un nuevo usuario con un rol específico.
Roles disponibles: 2 = Vendedor, 3 = Cliente.
Solo accesible para administradores.

> Body parameter

```json
{
  "nombre": "string",
  "email": "user@example.com",
  "password": "pa$$word",
  "idRol": 2
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» nombre|body|string|true|Nombre completo del usuario
» email|body|string(email)|true|Correo electrónico único
» password|body|string(password)|true|Contraseña (mínimo 8 caracteres)
» idRol|body|integer|true|Rol del usuario (2 = Vendedor, 3 = Cliente)


#### Enumerated Values

|Parameter|Value|
|---|---|
» idRol|2|
» idRol|3|

> Example responses

```json
{
  "idUsuario": 0,
  "nombre": "string",
  "email": "user@example.com",
  "telefono": "string",
  "direccion": "string",
  "idRol": 0,
  "estado": "activo"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Usuario creado exitosamente|[Usuario](#schemausuario)
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado (no administrador)|[ErrorResponse](#schemaerrorresponse)
409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Correo ya registrado|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|[ErrorResponse](#schemaerrorresponse)

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## GET /api/usuarios/{id}

> Code samples

*Obtener un usuario por ID*

Devuelve los detalles de un usuario. Los administradores pueden ver cualquier usuario, los clientes solo su propio perfil.

### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
id|path|integer|true|ID del usuario


> Example responses

```json
{
  "idUsuario": 0,
  "nombre": "string",
  "email": "user@example.com",
  "telefono": "string",
  "direccion": "string",
  "idRol": 0,
  "estado": "activo"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Detalles del usuario|[Usuario](#schemausuario)
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|[ErrorResponse](#schemaerrorresponse)
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Usuario no encontrado|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|[ErrorResponse](#schemaerrorresponse)

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## PUT /api/usuarios/{id}

> Code samples

*Actualizar perfil de usuario*

Actualiza los datos de un usuario.
Los clientes pueden editar su propio perfil (nombre, teléfono, dirección, contraseña).
Los administradores también pueden modificar el rol (1 = Admin, 2 = Vendedor, 3 = Cliente) y el estado.

> Body parameter

```json
{
  "nombre": "string",
  "telefono": "string",
  "direccion": "string",
  "password": "pa$$word",
  "idRol": 1,
  "estado": "activo"
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
id|path|integer|true|ID del usuario
body|body|object|true|No description
» nombre|body|string|false|Nombre completo del usuario
» telefono|body|string|false|Número de teléfono
» direccion|body|string|false|Dirección del usuario
» password|body|string(password)|false|Nueva contraseña (mínimo 8 caracteres)
» idRol|body|integer|false|Rol del usuario (solo administradores, 1 = Admin, 2 = Vendedor, 3 = Cliente)
» estado|body|string|false|Estado del usuario (solo administradores)


#### Enumerated Values

|Parameter|Value|
|---|---|
» idRol|1|
» idRol|2|
» idRol|3|
» estado|activo|
» estado|inactivo|

> Example responses

```json
{
  "idUsuario": 0,
  "nombre": "string",
  "email": "user@example.com",
  "telefono": "string",
  "direccion": "string",
  "idRol": 0,
  "estado": "activo"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Registro actualizado exitosamente|[Usuario](#schemausuario)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Error de validación|[ErrorResponse](#schemaerrorresponse)
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado|[ErrorResponse](#schemaerrorresponse)
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Registro no encontrado|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|[ErrorResponse](#schemaerrorresponse)

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## DELETE /api/usuarios/{id}

> Code samples

*Eliminar un usuario (soft delete)*

Marca un usuario como inactivo (soft delete). Solo accesible para administradores.

### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
id|path|integer|true|ID del usuario


> Example responses

```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Usuario eliminado exitosamente (soft delete)|None
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado (no administrador)|[ErrorResponse](#schemaerrorresponse)
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Usuario no encontrado|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|[ErrorResponse](#schemaerrorresponse)

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

## POST /api/usuarios/register

> Code samples

*Registrar un nuevo usuario*

Registra un nuevo cliente en la plataforma.
No requiere autenticación previa.
El usuario registrado tendrá el rol de cliente (idRol = 3) por defecto.
Límite de 5 registros por hora.

> Body parameter

```json
{
  "nombre": "string",
  "email": "user@example.com",
  "password": "pa$$word"
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» nombre|body|string|true|Nombre completo del usuario
» email|body|string(email)|true|Correo electrónico único
» password|body|string(password)|true|Contraseña (mínimo 8 caracteres, con letras y números)


> Example responses

```json
{
  "idUsuario": 0,
  "nombre": "string",
  "email": "user@example.com",
  "telefono": "string",
  "direccion": "string",
  "idRol": 0,
  "estado": "activo"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Cliente registrado exitosamente|[Usuario](#schemausuario)
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Error de validación|[ErrorResponse](#schemaerrorresponse)
409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Correo ya registrado|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiados intentos de registro|[ErrorResponse](#schemaerrorresponse)

<aside class="success">
This operation does not require authentication
</aside>

## POST /api/usuarios/register-google

> Code samples

*Registrar un nuevo cliente con Google*

Registra un nuevo cliente usando credenciales de Google.
No requiere autenticación previa.
Límite de 5 registros por hora.

> Body parameter

```json
{
  "nombre": "string",
  "email": "user@example.com",
  "googleId": "string"
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
body|body|object|true|No description
» nombre|body|string|true|Nombre completo del usuario
» email|body|string(email)|true|Correo electrónico proporcionado por Google
» googleId|body|string|true|ID único de Google


> Example responses

```json
{
  "idUsuario": 0,
  "nombre": "string",
  "email": "user@example.com",
  "telefono": "string",
  "direccion": "string",
  "idRol": 0,
  "estado": "activo"
}
```
```json
{
  "idUsuario": 0,
  "nombre": "string",
  "email": "user@example.com",
  "telefono": "string",
  "direccion": "string",
  "idRol": 0,
  "estado": "activo"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Usuario ya registrado|[Usuario](#schemausuario)
201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Cliente registrado exitosamente|[Usuario](#schemausuario)
409|[Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)|Correo ya registrado con otro método|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiados intentos de registro|[ErrorResponse](#schemaerrorresponse)

<aside class="success">
This operation does not require authentication
</aside>

## PUT /api/usuarios/{id}/password

> Code samples

*Cambiar contraseña de usuario*

Cambia la contraseña de un usuario.
Los no administradores deben proporcionar la contraseña actual.
Los administradores pueden cambiar la contraseña de cualquier usuario.

> Body parameter

```json
{
  "currentPassword": "pa$$word",
  "newPassword": "pa$$word"
}
```
### Parameters

Parameter|In|Type|Required|Description
---|---|---|---|---|
id|path|integer|true|ID del usuario
body|body|object|true|No description
» currentPassword|body|string(password)|false|Contraseña actual (requerida para no administradores)
» newPassword|body|string(password)|true|Nueva contraseña (mínimo 8 caracteres)


> Example responses

```json
{
  "message": "string"
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
```json
{
  "error": "string",
  "code": 0
}
```
### Responses

Status|Meaning|Description|Schema
---|---|---|---|
200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Contraseña actualizada exitosamente|Inline
400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Error de validación|[ErrorResponse](#schemaerrorresponse)
403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Acceso denegado o contraseña actual incorrecta|[ErrorResponse](#schemaerrorresponse)
404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Registro no encontrado|[ErrorResponse](#schemaerrorresponse)
429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Demasiadas solicitudes|[ErrorResponse](#schemaerrorresponse)

### Response Schema

Status Code **200**

Name|Type|Required|Description
---|---|---|---|---|
message|string|false|Mensaje de éxito



<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
http
</aside>

# Schemas

## SuccessResponse

<a name="schemasuccessresponse"></a>

```json
{
  "success": true,
  "data": {},
  "message": "string"
} 
```

### Properties

Name|Type|Required|Description
---|---|---|---|
success|boolean|true|Indicates if the operation was successful
data|object|false|Response data (null if no data is returned)
message|string|true|Response message



## ErrorResponse

<a name="schemaerrorresponse"></a>

```json
{
  "error": "string",
  "code": 0
} 
```

### Properties

Name|Type|Required|Description
---|---|---|---|
error|string|true|Error message
code|integer|true|HTTP status code



## Referencia

<a name="schemareferencia"></a>

```json
{
  "idPublicacion": 0,
  "idVehiculo": 0,
  "descripcion": "string",
  "fecha": "2025-08-14T12:30:31Z",
  "modelo": "string",
  "ano": 0,
  "marca": "string",
  "medios": [
    {
      "idMedio": 0,
      "urlMedio": "http://example.com",
      "tipo": "image",
      "publicId": "string"
    }
  ]
} 
```

### Properties

Name|Type|Required|Description
---|---|---|---|
idPublicacion|integer|false|ID de la publicación
idVehiculo|integer|false|ID del vehículo
descripcion|string|false|Descripción de la referencia
fecha|string(date-time)|false|Fecha de publicación
modelo|string|false|Modelo del vehículo
ano|integer|false|Año del vehículo
marca|string|false|Marca del vehículo
medios|[object]|false|No description
» idMedio|integer|false|ID del medio
» urlMedio|string(uri)|false|URL del medio
» tipo|string|false|Tipo de medio
» publicId|string|false|ID público en Cloudinary


#### Enumerated Values

|Property|Value|
|---|---|
» tipo|image|
» tipo|video|


## Usuario

<a name="schemausuario"></a>

```json
{
  "idUsuario": 0,
  "nombre": "string",
  "email": "user@example.com",
  "telefono": "string",
  "direccion": "string",
  "idRol": 0,
  "estado": "activo"
} 
```

### Properties

Name|Type|Required|Description
---|---|---|---|
idUsuario|integer|false|Unique user ID
nombre|string|false|Full name of the user
email|string(email)|false|User email address
telefono|string|false|User phone number
direccion|string|false|User address
idRol|integer|false|Role ID (1 = Admin, 2 = Vendedor, 3 = Cliente)
estado|string|false|User status


#### Enumerated Values

|Property|Value|
|---|---|
estado|activo|
estado|inactivo|


## Solicitud

<a name="schemasolicitud"></a>

```json
{
  "idSolicitud": 0,
  "idCliente": 0,
  "idVendedor": 0,
  "idVehiculo": 0,
  "idCotizacion": 0,
  "nombre_completo": "string",
  "telefono": "string",
  "direccion": "string",
  "curp": "string",
  "fecha_nacimiento": "2025-08-14",
  "estado_civil": "soltero",
  "cantidad_dependientes": 0,
  "tipo_vivienda": "propia",
  "ingreso_familiar": 0,
  "direccion_trabajo": "string",
  "empresa": "string",
  "puesto": "string",
  "ingreso_mensual": 0,
  "tiempo_laborando": 0,
  "tipo_credito": "ninguno",
  "enganche_propuesto": 0,
  "plazos_propuestos": 0,
  "comprobante_ingresos": true,
  "estatus": "pendiente",
  "fecha": "2025-08-14T12:30:31Z",
  "descripcion_vehiculo_adicional": "string"
} 
```

### Properties

Name|Type|Required|Description
---|---|---|---|
idSolicitud|integer|false|Unique ID of the credit application
idCliente|integer|false|ID of the client submitting the application
idVendedor|integer|false|ID of the vendor associated with the vehicle or quotation
idVehiculo|integer|false|ID of the vehicle (optional)
idCotizacion|integer|false|ID of the quotation (optional)
nombre_completo|string|false|Full name of the applicant
telefono|string|false|Phone number of the applicant
direccion|string|false|Address of the applicant
curp|string|false|CURP of the applicant (18 characters)
fecha_nacimiento|string(date)|false|Date of birth (YYYY-MM-DD)
estado_civil|string|false|Marital status
cantidad_dependientes|integer|false|Number of dependents
tipo_vivienda|string|false|Type of housing
ingreso_familiar|number|false|Monthly family income
direccion_trabajo|string|false|Work address (optional)
empresa|string|false|Employer name (optional)
puesto|string|false|Job position (optional)
ingreso_mensual|number|false|Monthly personal income
tiempo_laborando|integer|false|Months employed
tipo_credito|string|false|Current credit type
enganche_propuesto|number|false|Proposed down payment (optional if idCotizacion is provided)
plazos_propuestos|integer|false|Proposed payment terms in months (optional if idCotizacion is provided)
comprobante_ingresos|boolean|false|Indicates if proof of income was provided
estatus|string|false|Status of the application
fecha|string(date-time)|false|Submission date
descripcion_vehiculo_adicional|string|false|Additional vehicle description (optional)


#### Enumerated Values

|Property|Value|
|---|---|
estado_civil|soltero|
estado_civil|casado|
estado_civil|divorciado|
estado_civil|viudo|
estado_civil|concubinato|
tipo_vivienda|propia|
tipo_vivienda|rentada|
tipo_vivienda|familiar|
tipo_credito|ninguno|
tipo_credito|personal|
tipo_credito|automotriz|
tipo_credito|bancario|
estatus|pendiente|
estatus|aprobada|
estatus|rechazada|


## AuthResponse

<a name="schemaauthresponse"></a>

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {}
} 
```

### Properties

Name|Type|Required|Description
---|---|---|---|
accessToken|string|false|JWT access token
refreshToken|string|false|JWT refresh token
user|[Usuario](#schemausuario)|false|No description





