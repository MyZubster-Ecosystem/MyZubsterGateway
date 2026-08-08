> **Parte del [ecosistema MyZubster](https://github.com/MyZubster-Ecosystem)**

# 🌐 MyZubster Gateway

**API backend para MyZubster: Gateway de pagos Monero y registro de animales**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Monero](https://img.shields.io/badge/Powered%20by-Monero-orange)](https://www.getmonero.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-brightgreen)](https://mongodb.com/)

---

## 📌 ¿Qué es MyZubster Gateway?

MyZubster Gateway es un **procesador de pagos ligero que prioriza la privacidad**, creado para la red Monero (XMR). Permite transacciones descentralizadas con comisiones bajas e incluye compatibilidad con webhooks, gestión de pedidos y paneles para comerciantes.

**Ideal para:**

- 🛒 Plataformas de comercio electrónico
- 🎫 Sistemas de venta de entradas y eventos
- 🖥️ Suscripciones SaaS
- 🌿 Proyectos ambientales y de conservación
- 🐾 Registros de animales y plantas

---

## ⚠️ IMPORTANTE: Política de pagos

**Este Gateway acepta ÚNICAMENTE MONERO (XMR).**

| Aceptado                      | Rechazado                           |
| ----------------------------- | ----------------------------------- |
| ✅ Monero (XMR)               | ❌ USDC, USDT, ETH, BTC             |
| ✅ Privacidad y anonimato     | ❌ PayPal, transferencias bancarias |
| ✅ Microtransacciones (€0.10) | ❌ Monedas fiduciarias              |

### ¿Por qué Monero?

| Característica      | Monero (XMR)                                                    |
| ------------------- | --------------------------------------------------------------- |
| 🔒 Privacidad       | No se requiere KYC                                              |
| 💰 Comisiones bajas | Permite microtransacciones (€0.10)                              |
| 🌍 Global           | Cualquier persona puede participar desde cualquier lugar        |
| 🌿 Sostenible       | El 5 % de las comisiones se destina a proyectos de conservación |

---

## 📊 Estructura de comisiones

**El registro es GRATUITO.**

MyZubster es un proyecto de código abierto impulsado por la comunidad. Todos los registros (animales, plantas) son gratuitos.

### Cómo se financia la plataforma

La plataforma se sostiene mediante:

- 💰 **Donaciones** – Contribuciones voluntarias de la comunidad
- 🚀 **Servicios premium** – Funciones de pago opcionales (certificados, analítica)
- 🤝 **Patrocinadores y subvenciones** – Patrocinios corporativos y subvenciones para proyectos de código abierto

### Distribución de fondos

| Destino         | Porcentaje |
| --------------- | ---------- |
| Recompensas     | 90 %       |
| Infraestructura | 5 %        |
| Conservación    | 5 %        |

### Dona para apoyar a MyZubster

Si crees en este proyecto, puedes apoyarnos con una donación en Monero (XMR):

**Wallet:** `45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe`

---

## 🚀 Inicio rápido

### Requisitos previos

- **Node.js** 18+
- **MongoDB** 6+
- **Nodo Monero** (local o remoto)

### Instalación

```bash
# 1. Clona el repositorio
git clone git@github.com:MyZubster-Ecosystem/MyZubsterGateway.git
cd MyZubsterGateway

# 2. Instala las dependencias
npm install

# 3. Configura el entorno
cp .env.example .env
# Edita .env con tu configuración

# 4. Inicia el servidor
npm start
```

Crea un archivo .env con:

```bash
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/myzubster

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Monero
MONERO_RPC_URL=http://localhost:18081
MONERO_WALLET_RPC_URL=http://localhost:18082
```

## 📡 Endpoints de la API

### Endpoints públicos

| Método | Endpoint             | Descripción                 |
| ------ | -------------------- | --------------------------- |
| GET    | `/api/health`        | Comprobación de estado      |
| POST   | `/api/auth/register` | Registro de usuario         |
| POST   | `/api/auth/login`    | Inicio de sesión de usuario |
| POST   | `/api/auth/refresh`  | Renovar token JWT           |

### Endpoints protegidos (requieren JWT)

| Método | Endpoint             | Descripción                      |
| ------ | -------------------- | -------------------------------- |
| GET    | `/api/users/profile` | Obtener el perfil del usuario    |
| PUT    | `/api/users/profile` | Actualizar el perfil del usuario |

### Pedidos

| Método | Endpoint                 | Descripción                     |
| ------ | ------------------------ | ------------------------------- |
| POST   | `/api/orders`            | Crear un pedido                 |
| GET    | `/api/orders`            | Listar pedidos                  |
| GET    | `/api/orders/:id`        | Obtener los detalles del pedido |
| PUT    | `/api/orders/:id/status` | Actualizar el estado del pedido |

### Pagos

| Método | Endpoint                   | Descripción                  |
| ------ | -------------------------- | ---------------------------- |
| POST   | `/api/payments/process`    | Procesar el pago             |
| GET    | `/api/payments/status/:id` | Comprobar el estado del pago |

### Webhooks

| Método | Endpoint            | Descripción           |
| ------ | ------------------- | --------------------- |
| POST   | `/api/webhooks`     | Registrar un webhook  |
| GET    | `/api/webhooks`     | Listar webhooks       |
| PUT    | `/api/webhooks/:id` | Actualizar el webhook |
| DELETE | `/api/webhooks/:id` | Eliminar el webhook   |

### Animales y plantas

| Método | Endpoint                  | Descripción                       |
| ------ | ------------------------- | --------------------------------- |
| POST   | `/api/animals/register`   | Registrar un animal               |
| GET    | `/api/animals`            | Listar animales                   |
| GET    | `/api/animals/:id`        | Obtener los detalles del animal   |
| POST   | `/api/animals/:id/verify` | Verificar un animal               |
| POST   | `/api/plants/register`    | Registrar una planta              |
| GET    | `/api/plants`             | Listar plantas                    |
| GET    | `/api/plants/:id`         | Obtener los detalles de la planta |
| POST   | `/api/plants/:id/verify`  | Verificar una planta              |

## 🔐 Seguridad

### Autenticación

- Autenticación basada en JWT con rotación de tokens de actualización.
- Control de acceso basado en roles (RBAC) para endpoints de administrador.
- Protección contra ataques de fuerza bruta mediante el módulo BruteForceAI.
- Limitación de solicitudes en todos los endpoints de la API (100 solicitudes por minuto por IP).

### Protección de datos

- Cifrado PGP para datos confidenciales de pedidos.
- Se requiere HTTPS/TLS 1.3 en producción.
- No se almacenan datos PII ni KYC (diseño centrado en la privacidad).
- Variables de entorno para todos los secretos (sin credenciales escritas directamente en el código).

### Integración con blockchain

- Monero RPC con autenticación segura.
- Verificación de transacciones con protección contra doble gasto.
- Validación de direcciones de wallet (solo direcciones Monero que comienzan por 4 u 8).

### Webhooks e infraestructura

- Firmas HMAC-SHA256 para las cargas útiles de los webhooks y reintentos con retroceso exponencial.
- Lista de IP permitidas para endpoints de webhooks (opcional).
- Contenedores Docker con una superficie de ataque mínima, encabezados de seguridad Nginx y actualizaciones automáticas mediante Dependabot.
- Servicio onion de Tor para acceso con protección de la privacidad (opcional).

## 🛠️ Stack tecnológico

| Capa          | Tecnología                              |
| ------------- | --------------------------------------- |
| Backend       | Node.js + Express                       |
| Base de datos | MongoDB + Mongoose                      |
| Blockchain    | Monero (XMR) RPC                        |
| Autenticación | JWT + bcrypt                            |
| Seguridad     | Helmet, CORS, limitación de solicitudes |
| Pruebas       | Jest + Supertest                        |
| Despliegue    | Docker + Vercel                         |

## 📂 Estructura del repositorio

```text
MyZubsterGateway/
├── src/
│   ├── api/           # Rutas de la API
│   ├── controllers/   # Lógica de negocio
│   ├── models/        # Modelos de la base de datos
│   ├── services/      # Servicios externos
│   └── utils/         # Utilidades
├── tests/             # Pruebas unitarias y de integración
├── docs/              # Documentación
├── security/          # Herramientas de seguridad
├── .env.example       # Plantilla de variables de entorno
├── server.js          # Punto de entrada
└── package.json       # Dependencias
```

## 🔗 Proyectos relacionados

| Proyecto             | Descripción                                   | Enlace |
| -------------------- | --------------------------------------------- | ------ |
| Registro de animales | Documentación para el registro de animales    | GitHub |
| Mapa de plantas      | Mapa global para el registro de plantas       | GitHub |
| Mapa de animales     | Mapa interactivo para el registro de animales | GitHub |

## 📚 Documentación

- Referencia de la API: documentación completa de la API.
- Política de seguridad: directrices de seguridad.
- Guía de contribución: cómo contribuir.
- Transparencia de fondos: todas las transacciones son públicas.

## 🤝 Cómo contribuir

¡Agradecemos las contribuciones! Hay issues abiertos con recompensas 💰.

### Programa de recompensas

| Nivel        | XMR    | Tareas                                            |
| ------------ | ------ | ------------------------------------------------- |
| Spicciolo    | 0.0005 | Corrección de errores tipográficos, documentación |
| Spiccioletto | 0.001  | Correcciones pequeñas                             |
| Spicciona    | 0.003  | Pruebas unitarias                                 |
| SuperSpiccio | 0.01   | Funciones                                         |
| Premium      | 0.06   | Funciones complejas                               |

### Cómo reclamar una recompensa

1. Explora los issues con la etiqueta 💰.
2. Comenta "I'll take this!".
3. Abre un PR con tu dirección de Monero.
4. Recibe el pago en XMR.

## 📄 Licencia

MIT – Uso y modificación libres para todo el mundo.

---

💚 Creado con ❤️ para los animales y las plantas por MyZubster-Ecosystem

🌐 GitHub: @MyZubster-Ecosystem
🌟 ¡Construyamos juntos un ecosistema descentralizado!

Cada contribución cuenta. Únete a nosotros para crear una plataforma transparente y centrada en la privacidad para todo el mundo.

## 🌐 Centro del ecosistema

**Ecosistema MyZubster**: https://github.com/MyZubster-Ecosystem

## 💬 Comunidad

- **Telegram**: [@MyZubster_bot](https://t.me/MyZubster_bot) – para actualizaciones, soporte y conversaciones.

## 🌐 Conecta con nosotros

- **Telegram**: [@MyZubster_bot](https://t.me/MyZubster_bot) – actualizaciones, soporte y conversaciones
- **Twitter / X**: [@DanielIoni](https://twitter.com/DanielIoni) – anuncios y reflexiones sobre el proyecto
- **TikTok**: [@danielioni](https://tiktok.com/@danielioni) – contenido entre bastidores y actualizaciones del proyecto
- **Instagram**: [@danielioni](https://instagram.com/danielioni) – contenido visual e historias de la comunidad
- **dev.to**: [Daniel Ioni](https://dev.to/danielioni) – artículos técnicos y actualizaciones del proyecto

- **Canal de Telegram**: [@myzubster](https://t.me/myzubster) – síguelo para recibir actualizaciones, noticias y participar en conversaciones sobre el ecosistema MyZubster.
