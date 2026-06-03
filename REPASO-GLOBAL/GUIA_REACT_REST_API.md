# Guía de Estudio: React + REST API con JWT

---

## PASOS PARA EL EXAMEN (en orden)

### Paso 1 — Copiar y pegar la carpeta

Copia la carpeta `REPASO-GLOBAL/` completa y pégala en el examen.
Renómbrala como `front/` o como pida el profesor.

### Paso 2 — Instalar dependencias

```bash
npm install
```

### Paso 3 — Cambiar la URL del back en `.env`

```env
# PEDIDOS / VUELOS
VITE_API_URL=http://localhost:8080/api/v1

# REDSOCIAL (context-path distinto)
VITE_API_URL=http://localhost:8080/post-manager
```

### Paso 4 — Cambiar los 4 valores en `ItemCard.jsx` y `ItemForm.jsx`

```js
// ItemCard.jsx y ItemForm.jsx — las mismas 4 constantes:

const CAMPO_NOMBRE = "numeroVuelo";         // ← nombre del campo en el JSON del back
const LABEL_NOMBRE = "Vuelo";               // ← texto visual (no afecta lógica)
const ESTADOS = ["PROGRAMADO", "EN_VUELO", "ATERRIZADO"];  // ← enum del back
const ESTADO_COLOR = {
    PROGRAMADO: "info",
    EN_VUELO:   "warning",
    ATERRIZADO: "success",
};
```

**Valores por examen:**

| Examen    | CAMPO_NOMBRE          | ESTADOS                                  |
|-----------|-----------------------|------------------------------------------|
| VUELOS    | `numeroVuelo`         | `PROGRAMADO`, `EN_VUELO`, `ATERRIZADO`   |
| PEDIDOS   | `nombreDomiciliario`  | `EN_CAMINO`, `EN_REPARTO`, `ENTREGADO`   |
| REDSOCIAL | `content`             | (no tiene estados — usa otro componente) |

### Paso 5 — Cambiar el endpoint en `genericApi.js`

```js
const RUTA = "/vuelos";       // VUELOS
const RUTA = "/domicilios";   // PEDIDOS
const RUTA = "/posts";        // REDSOCIAL
```

### Paso 6 — Levantar la app

```bash
npm run dev
```

---

## Estructura del proyecto (completa)

```
REPASO-GLOBAL/
  .env                    ← URL del back (CAMBIAR)
  index.html              ← no tocar
  vite.config.js          ← no tocar
  package.json            ← no tocar
  src/
    index.css             ← no tocar
    main.jsx              ← no tocar (ver nota abajo para React Query)
    api/
      apiClient.js        ← interceptor JWT — no tocar
      genericApi.js       ← CAMBIAR: RUTA y login si cambia el endpoint
    store/
      authStore.js        ← no tocar
    routes/
      Router.jsx          ← CAMBIAR: rutas si hay más páginas
    pages/
      LoginPage.jsx       ← CAMBIAR: navigate a la ruta correcta
      DashboardPage.jsx   ← CAMBIAR: título, imports de api y componentes
    components/
      ItemCard.jsx        ← CAMBIAR: las 4 constantes de arriba
      ItemForm.jsx        ← CAMBIAR: las 4 constantes de arriba
```

---

## Archivos explicados

### apiClient.js — La "conexión base" con el backend

```js
import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,  // lee del .env
});

// Antes de CADA petición, pone el token en el header
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default apiClient;
```

---

### genericApi.js — Llamadas al backend

```js
import apiClient from "./apiClient";

const RUTA = "/ENTIDAD";   // ← CAMBIAR: "/vuelos", "/domicilios", "/posts"

export const login = (username, password) =>
    apiClient.post("/auth/login", { username, password });

export const getAll  = ()         => apiClient.get(RUTA);
export const create  = (data)     => apiClient.post(RUTA, data);
export const update  = (id, data) => apiClient.put(`${RUTA}/${id}`, data);
export const remove  = (id)       => apiClient.delete(`${RUTA}/${id}`);

// Solo REDSOCIAL:
export const getById    = (id)            => apiClient.get(`${RUTA}/${id}`);
export const getComments = (postId)       => apiClient.get(`${RUTA}/${postId}/comments`);
export const addComment  = (postId, text) => apiClient.post(`${RUTA}/${postId}/comments`, { content: text });
export const getMe       = ()             => apiClient.get("/users/me");
```

---

### authStore.js — Estado global del token

```js
import { Store } from "@tanstack/react-store";

export const authStore = new Store({
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
});

export const setToken = (token) => {
    localStorage.setItem("token", token);
    authStore.setState(() => ({ token, isAuthenticated: true }));
};

export const clearToken = () => {
    localStorage.removeItem("token");
    authStore.setState(() => ({ token: null, isAuthenticated: false }));
};
```

---

### Router.jsx — Rutas y rutas protegidas

```jsx
import { createBrowserRouter, Navigate } from "react-router";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";

// Si el examen tiene más páginas, agregarlas aquí:
// import FeedPage from "../pages/FeedPage";
// import PostDetailPage from "../pages/PostDetailPage";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/" replace />;
    return children;
}

const router = createBrowserRouter([
    { path: "/", element: <LoginPage /> },
    {
        path: "/dashboard",
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
    },
    // REDSOCIAL — descomenta si hace falta:
    // { path: "/feed",       element: <ProtectedRoute><FeedPage /></ProtectedRoute> },
    // { path: "/posts/:id",  element: <ProtectedRoute><PostDetailPage /></ProtectedRoute> },
]);

export default router;
```

---

### LoginPage.jsx — Flujo de login

```jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { Box, Button, Container, Paper, TextField, Typography, Alert } from "@mui/material";
import { login } from "../api/genericApi";
import { setToken } from "../store/authStore";

function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await login(username, password);
            setToken(res.data.token);
            navigate("/dashboard");   // ← CAMBIAR si la ruta principal es otra
        } catch {
            setError("Credenciales incorrectas. Intenta de nuevo.");
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 10 }}>
                <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
                    <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
                        Iniciar sesión   {/* ← CAMBIAR el título */}
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <TextField label="Usuario" fullWidth margin="normal"
                            value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <TextField label="Contraseña" type="password" fullWidth margin="normal"
                            value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                            Iniciar sesión
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
}

export default LoginPage;
```

---

### DashboardPage.jsx — CRUD principal

```jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Box, Button, Container, Typography, Alert } from "@mui/material";
import { getAll, create, update, remove } from "../api/genericApi";
import { clearToken } from "../store/authStore";
import ItemForm from "../components/ItemForm";
import ItemCard from "../components/ItemCard";

function DashboardPage() {
    const navigate = useNavigate();
    const [items, setItems]   = useState([]);
    const [error, setError]   = useState("");

    const fetchItems = async () => {
        try {
            const res = await getAll();
            setItems(res.data);
        } catch { setError("Error al cargar."); }
    };

    useEffect(() => { fetchItems(); }, []);

    const handleCreate = async (data) => {
        try { await create(data); await fetchItems(); }
        catch { setError("Error al crear."); }
    };

    const handleUpdate = async (id, data) => {
        try { await update(id, data); await fetchItems(); }
        catch { setError("Error al actualizar."); }
    };

    const handleDelete = async (id) => {
        try {
            await remove(id);
            setItems((prev) => prev.filter((item) => item.id !== id));
        } catch { setError("Error al eliminar."); }
    };

    const handleLogout = () => { clearToken(); navigate("/"); };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Tablero</Typography>
                <Button variant="outlined" color="error" onClick={handleLogout}>Cerrar sesión</Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

            <ItemForm onCreated={handleCreate} />

            <Typography variant="h6" mb={2}>Lista</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {items.length === 0
                    ? <Typography color="text.secondary">No hay elementos.</Typography>
                    : items.map((item) => (
                        <ItemCard key={item.id} item={item}
                            onUpdate={handleUpdate} onDelete={handleDelete} />
                    ))
                }
            </Box>
        </Container>
    );
}

export default DashboardPage;
```

---

### ItemCard.jsx — Tarjeta de un elemento (solo cambiar las 4 constantes)

```jsx
import { useState } from "react";
import { Box, Button, Chip, MenuItem, Paper, Select, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

// ↓↓↓ CAMBIAR ESTAS 4 CONSTANTES ↓↓↓
const CAMPO_NOMBRE = "nombreCampo";
const LABEL_NOMBRE = "Elemento";
const ESTADOS      = ["ESTADO_1", "ESTADO_2", "ESTADO_3"];
const ESTADO_COLOR = { ESTADO_1: "info", ESTADO_2: "warning", ESTADO_3: "success" };
// ↑↑↑ FIN DE LO QUE SE CAMBIA ↑↑↑

function ItemCard({ item, onUpdate, onDelete }) {
    const [estado,  setEstado]  = useState(item.estado);
    const [editing, setEditing] = useState(false);
    const [nombre,  setNombre]  = useState(item[CAMPO_NOMBRE]);

    const handleEstadoChange = (e) => {
        const nuevoEstado = e.target.value;
        setEstado(nuevoEstado);
        onUpdate(item.id, { [CAMPO_NOMBRE]: nombre, estado: nuevoEstado });
    };

    const handleSaveName = () => {
        onUpdate(item.id, { [CAMPO_NOMBRE]: nombre, estado });
        setEditing(false);
    };

    return (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1 }}>
                {editing ? (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <input value={nombre} onChange={(e) => setNombre(e.target.value)}
                            style={{ fontSize: 16, padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc" }} />
                        <Button size="small" variant="contained" onClick={handleSaveName}>Guardar</Button>
                        <Button size="small" onClick={() => { setEditing(false); setNombre(item[CAMPO_NOMBRE]); }}>Cancelar</Button>
                    </Box>
                ) : (
                    <Typography variant="subtitle1" fontWeight="bold"
                        sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                        onClick={() => setEditing(true)}>
                        {nombre}
                    </Typography>
                )}
                <Typography variant="caption" color="text.secondary">{LABEL_NOMBRE} #{item.id}</Typography>
            </Box>

            <Select value={estado} onChange={handleEstadoChange} size="small" sx={{ minWidth: 150 }}>
                {ESTADOS.map((e) => (
                    <MenuItem key={e} value={e}>
                        <Chip label={e} color={ESTADO_COLOR[e]} size="small" />
                    </MenuItem>
                ))}
            </Select>

            <Button variant="outlined" color="error" size="small"
                startIcon={<DeleteIcon />} onClick={() => onDelete(item.id)}>
                Eliminar
            </Button>
        </Paper>
    );
}

export default ItemCard;
```

---

### ItemForm.jsx — Formulario de creación (solo cambiar las 4 constantes)

```jsx
import { useState } from "react";
import { Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";

// ↓↓↓ CAMBIAR ESTAS 4 CONSTANTES ↓↓↓
const CAMPO_TEXTO    = "nombreCampo";
const LABEL_TEXTO    = "Nombre del elemento";
const ESTADOS        = ["ESTADO_1", "ESTADO_2", "ESTADO_3"];
const ESTADO_INICIAL = "ESTADO_1";
// ↑↑↑ FIN DE LO QUE SE CAMBIA ↑↑↑

function ItemForm({ onCreated }) {
    const [valor,  setValor]  = useState("");
    const [estado, setEstado] = useState(ESTADO_INICIAL);

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreated({ [CAMPO_TEXTO]: valor, estado });
        setValor("");
        setEstado(ESTADO_INICIAL);
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, mb: 3 }}>
            <Typography variant="h6" mb={2}>Registrar nuevo elemento</Typography>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <TextField label={LABEL_TEXTO} value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        required sx={{ flex: 1, minWidth: 200 }} />
                    <TextField select label="Estado" value={estado}
                        onChange={(e) => setEstado(e.target.value)} sx={{ minWidth: 160 }}>
                        {ESTADOS.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                    </TextField>
                    <Button type="submit" variant="contained" sx={{ alignSelf: "center" }}>Crear</Button>
                </Box>
            </form>
        </Paper>
    );
}

export default ItemForm;
```

---

### main.jsx — Punto de entrada

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./index.css";
import router from "./routes/Router";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);

// Si el examen usa React Query, envolver con:
//   import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//   const queryClient = new QueryClient();
//   <QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider>
```

---

## Endpoints típicos del examen

| Acción      | Método   | URL                            | Body                        |
|-------------|----------|--------------------------------|-----------------------------|
| Login       | POST     | `/auth/login`                  | `{ username, password }`    |
| Listar      | GET      | `/entidades`                   | —                           |
| Crear       | POST     | `/entidades`                   | `{ campo, estado }`         |
| Actualizar  | PUT      | `/entidades/{id}`              | `{ campo, estado }`         |
| Eliminar    | DELETE   | `/entidades/{id}`              | —                           |
| Comentarios | GET      | `/posts/{id}/comments`         | —                           |
| Comentar    | POST     | `/posts/{id}/comments`         | `{ content }`               |
| Mi usuario  | GET      | `/users/me`                    | —                           |

---

## Datos por examen

| Examen    | Entidad       | RUTA           | CAMPO_NOMBRE          | ESTADOS                                |
|-----------|---------------|----------------|-----------------------|----------------------------------------|
| VUELOS    | Vuelo         | `/vuelos`      | `numeroVuelo`         | `PROGRAMADO`, `EN_VUELO`, `ATERRIZADO` |
| PEDIDOS   | Domicilio     | `/domicilios`  | `nombreDomiciliario`  | `EN_CAMINO`, `EN_REPARTO`, `ENTREGADO` |
| REDSOCIAL | Post          | `/posts`       | `content`             | (sin estados)                          |
| REDSOCIAL | Comment       | ver endpoint   | `content`             | (sin estados)                          |

---

---

## Errores frecuentes y cómo resolverlos

### "JWT strings must contain exactly 2 period characters. Found: 0"

**Causa:** el front está mandando `Authorization: Bearer undefined` porque guardó `undefined` como token.

**Por qué pasa:** el campo del token en la respuesta del back no se llama `token`.

**Diagnóstico — agregar temporalmente en LoginPage.jsx:**
```js
const res = await login(username, password);
console.log("Respuesta del back:", res.data); // ver qué campos tiene
```

**Fix:** cambiar el campo según lo que muestre el console.log:
```js
// Según el back, puede ser cualquiera de estos:
setToken(res.data.token);        // el más común
setToken(res.data.accessToken);  // también frecuente
setToken(res.data.jwt);
setToken(res.data.jwtToken);
setToken(res.data);              // si el back devuelve el token directamente como string
```

**Fix en el back (si el filtro explota con 500):**

Buscar el filtro JWT (`TokenValidationFilter` o similar) y agregar validación antes de parsear:
```java
String authHeader = request.getHeader("Authorization");
if (authHeader == null || !authHeader.startsWith("Bearer ")) {
    filterChain.doFilter(request, response);
    return;
}
String token = authHeader.substring(7);
if (token.isBlank() || token.equals("undefined") || token.equals("null")) {
    filterChain.doFilter(request, response);
    return;
}
// aquí sí parsear...
```

---

### 404 en el front al abrir `http://localhost:5173/algo`

**Causa:** `vite.config.js` tiene `base: '/algo'` pero el router no tiene ese basename.

**Fix:** cambiar `base: '/algo'` a `base: '/'` en `vite.config.js`.

---

### BCryptPasswordEncoder bean not found

**Causa:** la clase `AppConfig` (o similar) no tiene `@Configuration` y/o el método no tiene `@Bean`.

**Fix:**
```java
@Configuration          // ← agregar esto a la clase
public class AppConfig {

    @Bean               // ← agregar esto al método
    BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean               // ← agregar esto también
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // ...
    }
}
```

---

## Checklist del examen

1. [ ] Copiar carpeta `REPASO-GLOBAL/` → renombrar → `npm install`
2. [ ] Cambiar `VITE_API_URL` en `.env`
3. [ ] Cambiar `const RUTA` en `genericApi.js`
4. [ ] Cambiar las 4 constantes en `ItemCard.jsx`
5. [ ] Cambiar las 4 constantes en `ItemForm.jsx`
6. [ ] Cambiar el `navigate("/dashboard")` en `LoginPage.jsx` si la ruta es diferente
7. [ ] Cambiar el título en `DashboardPage.jsx`
8. [ ] Agregar rutas extra en `Router.jsx` si el examen las pide
9. [ ] `npm run dev` y probar login
