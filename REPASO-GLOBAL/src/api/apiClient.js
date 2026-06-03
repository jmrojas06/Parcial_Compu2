// ============================================================
// apiClient.js — La "conexión base" con el backend
// ============================================================
// Este archivo crea UNA SOLA instancia de axios configurada.
// Todos los demás archivos de API importan ESTE cliente,
// así no repetimos la URL base ni el token en cada llamada.
// ============================================================

// "import" trae código de otra librería o archivo.
// axios es la librería que usamos para hacer llamadas HTTP (GET, POST, PUT, DELETE).
import axios from "axios";

// axios.create() crea una instancia personalizada de axios.
// Le pasamos un objeto de configuración con llaves { }.
const apiClient = axios.create({
    // baseURL: la dirección raíz del backend.
    // Todas las rutas que usemos después se agregan aquí.
    // Ejemplo: si llamamos a "/auth/login", la URL real será:
    //   http://localhost:8080/api/v1/auth/login
    //
    // CAMBIAR SEGÚN EL EXAMEN:
    //   PEDIDOS/VUELOS → "http://localhost:8080/api/v1"
    //   REDSOCIAL      → "http://x104m04:8080/post-manager"
    // La URL viene del archivo .env (VITE_API_URL=...)
    // En el examen: solo cambiar el .env, no tocar este archivo
    baseURL: import.meta.env.VITE_API_URL,
});

// interceptors.request.use() = "antes de CADA petición, haz esto".
// Es como un guardia que revisa cada request antes de enviarlo.
// Recibe la configuración del request (config) y la devuelve modificada.
apiClient.interceptors.request.use((config) => {

    // localStorage es el almacenamiento del navegador (como una cookie).
    // Aquí leemos el token JWT que guardamos al hacer login.
    // Si no hay token, getItem devuelve null.
    const token = localStorage.getItem("token");

    // Si existe el token (no es null ni undefined)...
    if (token) {
        // ...lo agregamos al header "Authorization" del request.
        // El backend lo recibe y sabe que el usuario está autenticado.
        // El formato "Bearer <token>" es el estándar para JWT.
        // Ejemplo: Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9..."
        config.headers.Authorization = `Bearer ${token}`;
        // Las backticks ` ` permiten "interpolar" variables con ${variable}
    }

    // Devolvemos config (modificado o no) para que axios siga con el request.
    return config;
});

// Exportamos el cliente para que otros archivos lo puedan importar.
// "default" significa que al importarlo no necesitamos llaves: import apiClient from "..."
export default apiClient;
