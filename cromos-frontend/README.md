# Frontend - Catálogo de Cromos Serverless ⚽🏆

Este es el frontend para la aplicación del Álbum de Cromos del Mundial, desarrollado con **React + Vite**. Está diseñado para comunicarse con un backend local y preparado para ser desplegado en la nube de AWS en arquitectura serverless (usando **AWS Lambda**, **API Gateway**, y **Amazon Cognito**).

---

## 🚀 Inicio Rápido (Entorno Local)

### 1. Requisitos Previos
- Node.js (v18 o superior)
- Backend corriendo localmente (por defecto en `http://localhost:3001`)

### 2. Instalación de dependencias
```bash
npm install
```

### 3. Configuración del Entorno
Crea o edita el archivo `.env` en la raíz del proyecto (`cromos-frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
```

### 4. Ejecución en Desarrollo
```bash
npm run dev
```

### 5. Compilación para Producción
```bash
npm run build
```

---

## 🛠️ Conexión con el Backend (API)

El frontend se comunica con el backend a través del servicio unificado `api` en `src/services/api.js`. Este servicio maneja:
1. **Detección de URL**: Usa la variable de entorno `VITE_API_URL` para saber a dónde apuntar.
2. **Inyección de Token**: Añade la cabecera `Authorization: Bearer <token>` de forma automática si existe una sesión activa en `localStorage`.
3. **Mapeos**:
   - `api.getStickers()` -> `GET /stickers` (obtiene cromos)
   - `api.createSticker(payload)` -> `POST /stickers` (crea un cromo)
   - `api.deleteSticker(id)` -> `DELETE /stickers/:id` (elimina cromo)
   - `api.getPlayers()` -> `GET /players` (obtiene jugadores para el selector dinámico)
   - `api.getCountries()` -> `GET /countries` (países registrados)

---

## ☁️ Guía de Despliegue en AWS (Serverless)

Para subir esta arquitectura a la nube de AWS como serverless, sigue estos pasos:

### 1. Despliegue del Backend (API Gateway + Lambda + DynamoDB)
1. **Base de Datos**: Crea las tablas correspondientes en **Amazon DynamoDB** (ej. `stickers`, `players`).
2. **Funciones Lambda**: Sube tu código de backend a AWS Lambda (puedes usar herramientas como Serverless Framework, AWS SAM, o Terraform).
3. **API Gateway**: Configura un API Gateway (HTTP o REST API) para exponer tus Lambdas como endpoints públicos.
   > [!IMPORTANT]
   > Asegúrate de habilitar **CORS** en API Gateway para permitir peticiones desde el dominio de tu frontend.
4. **Cognito**: Configura un User Pool en **Amazon Cognito** si deseas securizar los endpoints de escritura/eliminación.

### 2. Configuración y Despliegue del Frontend (S3 + CloudFront o AWS Amplify)

#### Opción A: AWS Amplify (Recomendada - Más fácil)
1. Conecta tu repositorio de GitHub/GitLab a **AWS Amplify**.
2. En la consola de Amplify, añade las variables de entorno de compilación:
   - `VITE_API_URL` = `<URL_DE_TU_API_GATEWAY>`
3. AWS Amplify detectará la configuración de Vite, compilará la app (`npm run build`) y la desplegará en una CDN global automáticamente en cada commit.

#### Opción B: Amazon S3 + CloudFront (Tradicional)
1. Compila el frontend localmente:
   ```bash
   # Modifica el archivo .env primero con la URL de producción de tu API Gateway:
   VITE_API_URL=https://<api-id>.execute-api.<region>.amazonaws.com/prod
   npm run build
   ```
2. Sube el contenido de la carpeta `dist/` a un bucket de **Amazon S3** configurado para Static Website Hosting.
3. Crea una distribución de **Amazon CloudFront** apuntando al bucket S3 como origen para distribuir el sitio de forma segura mediante HTTPS y caching global.

---

## 🔐 Seguridad y Autenticación con Cognito

El servicio `src/context/AuthContext.jsx` está preparado para manejar la sesión del usuario.
- En producción, reemplaza la sección de autenticación simulada usando la librería oficial `@aws-amplify/auth` o `amazon-cognito-identity-js`.
- Al iniciar sesión con Cognito, guarda el `idToken` devuelto en el localStorage como `id_token` y `api.js` lo enviará de manera transparente en la cabecera `Authorization` de todas las peticiones que requieran autorización en tu API de Lambda.
