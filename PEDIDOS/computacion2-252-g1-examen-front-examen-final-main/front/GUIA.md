# Guía — Tablero de Pedidos (Examen Frontend)

---

## 1. Estructura de carpetas

```
src/
  api/              ← todo lo que habla con el backend
  components/       ← componentes reutilizables
  pages/            ← páginas completas
  App.jsx           ← rutas
  main.jsx          ← punto de entrada (no se toca)
```

---

## 2. Axios — Conexión con el backend

`api/axiosInstance.js` — Se crea UNA sola instancia de axios con la URL base del backend.
Lo clave son los **dos interceptores**:

- **Request**: antes de cada petición revisa si hay token en `localStorage` y lo adjunta en el header `Authorization: Bearer <token>`. Así no tienes que poner el token manualmente en cada llamada.
- **Response**: extrae `.data` automáticamente de cada respuesta. Así las funciones del API devuelven directo los datos sin necesidad de `response.data`.

```js
const axiosInstance = axios.create({ baseURL: 'http://localhost:8080/api/v1' });

// Adjunta el token en cada petición
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Devuelve directo el body de la respuesta
axiosInstance.interceptors.response.use((response) => response.data);
```

---

## 3. API functions — `api/domiciliosApi.js` y `api/authApi.js`

Gracias al interceptor de response, las funciones quedan de una sola línea:

```js
// authApi.js
export const login = (username, password) =>
  axiosInstance.post('/auth/login', { username, password });

// domiciliosApi.js
export const getDomicilios = () => axiosInstance.get('/domicilios');
export const createDomicilio = (body) => axiosInstance.post('/domicilios', body);
export const updateDomicilio = (id, body) => axiosInstance.put(`/domicilios/${id}`, body);
export const deleteDomicilio = (id) => axiosInstance.delete(`/domicilios/${id}`);
```

---

## 4. Login — Autenticación JWT (20%)

`api/authApi.js` → función `login(username, password)`  
`pages/LoginPage.jsx` → formulario que llama esa función

**Flujo:**
1. Usuario llena el form y hace submit
2. Se llama `POST /auth/login` con `{ username, password }`
3. El backend responde `{ accessToken: "eyJ..." }`
4. Se guarda en `localStorage.setItem('token', data.accessToken)`
5. Se redirige con `navigate('/')`

**Credenciales de prueba:** `usuario1@correo.com` / `123456`

---

## 5. Rutas protegidas

`components/ProtectedRoute.jsx` — Antes de entrar al dashboard revisa si hay token. Si no hay, redirige a `/login`.

`App.jsx` — Define las rutas:
- `/login` → `LoginPage` (pública)
- `/` → `DashboardPage` envuelta en `<ProtectedRoute>` (privada)

```jsx
<Route path="/login" element={<LoginPage />} />
<Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
```

---

## 6. Dashboard — Listar y Crear pedidos (20%)

`pages/DashboardPage.jsx`

- Al montar el componente (`useEffect`) llama `GET /domicilios` → trae los pedidos del usuario autenticado
- Del primer pedido extrae el `userId` (el JWT no lo trae, pero el response sí) y lo guarda en un `useRef`
- El formulario de creación llama `POST /domicilios` con `{ nombreDomiciliario, estado, userId }`
- Después de crear llama `fetchPedidos()` para refrescar la lista

```js
const fetchPedidos = async () => {
  const data = await getDomicilios();
  setPedidos(data);
  if (data.length > 0 && !userIdRef.current) userIdRef.current = data[0].userId;
};

useEffect(() => { fetchPedidos(); }, []);
```

---

## 7. Componente PedidoCard — Actualizar y Eliminar (20% + 20%)

`components/PedidoCard.jsx` — Recibe un `pedido` y una función `onRefresh`

**Cambiar estado (20%):**
1. Usuario cambia el `<Select>`
2. Se llama `PUT /domicilios/:id` con el objeto completo `{ nombreDomiciliario, nuevo estado, userId }`
3. Se llama `onRefresh()` para sincronizar con el backend

**Eliminar (20%):**
1. Usuario hace clic en "Eliminar"
2. Confirmación con `window.confirm()`
3. Se llama `DELETE /domicilios/:id`
4. Se llama `onRefresh()` para quitar el pedido de la vista

---

## 8. El truco del userId

El JWT solo guarda el **email**, no el `userId` numérico. El backend lo necesita para crear pedidos.

**Solución:** cuando se cargan los pedidos con el `GET`, el response incluye `userId` en cada objeto. Se extrae del primero y se guarda en un `useRef` para usarlo al crear.

```js
const userIdRef = useRef(null);
// después del GET:
if (data.length > 0 && !userIdRef.current) userIdRef.current = data[0].userId;
// al crear:
await createDomicilio({ nombreDomiciliario, estado, userId: userIdRef.current });
```

---

## 9. Resumen de endpoints

| Acción           | Método | URL                    | Auth |
|------------------|--------|------------------------|------|
| Login            | POST   | `/auth/login`          | No   |
| Listar pedidos   | GET    | `/domicilios`          | Sí   |
| Crear pedido     | POST   | `/domicilios`          | Sí   |
| Actualizar pedido| PUT    | `/domicilios/:id`      | Sí   |
| Eliminar pedido  | DELETE | `/domicilios/:id`      | Sí   |

---

## 10. Cómo correr el proyecto

```bash
# Terminal 1 — Base de datos
cd back && docker-compose up

# Terminal 2 — Backend Spring Boot
cd back && mvnw.cmd spring-boot:run

# Terminal 3 — Frontend React
cd front && npm install && npm run dev
```

- Backend → `http://localhost:8080`
- Frontend → `http://localhost:5173`
