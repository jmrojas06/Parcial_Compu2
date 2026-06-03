// ============================================================
// main.jsx — Punto de entrada de la aplicación React
// ============================================================
// Este es el archivo que se ejecuta primero.
// Su única función es "montar" la app de React en el HTML.
//
// index.html tiene: <div id="root"></div>
// Este archivo toma ese div y pone la app React adentro.
// ============================================================

// StrictMode: envuelve la app para mostrar advertencias en desarrollo.
// No afecta en producción. Ayuda a detectar errores comunes.
import { StrictMode } from "react";
import "./index.css";

// createRoot: la función moderna de React para montar la app.
import { createRoot } from "react-dom/client";

// RouterProvider: conecta el router (las rutas) con React.
// Sin esto, los <Link> y navigate() no funcionan.
import { RouterProvider } from "react-router";

// El router que definimos en Router.jsx
import router from "./routes/Router";

// document.getElementById("root") busca el <div id="root"> en index.html
// createRoot() lo convierte en el contenedor de React
// .render() pone los componentes adentro
createRoot(document.getElementById("root")).render(
    // StrictMode envuelve todo — solo en desarrollo, no afecta producción
    <StrictMode>
        {/* RouterProvider le dice a toda la app cómo manejar las rutas.
            Sin esto, navigate() y <Link> no funcionan en ningún componente.
            router = el objeto que creamos con createBrowserRouter en Router.jsx */}
        <RouterProvider router={router} />
    </StrictMode>
);

// ============================================================
// Si el examen usa React Query (REDSOCIAL), agregar:
//
//   import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//   const queryClient = new QueryClient();
//
//   .render(
//     <StrictMode>
//       <QueryClientProvider client={queryClient}>
//         <RouterProvider router={router} />
//       </QueryClientProvider>
//     </StrictMode>
//   );
// ============================================================
