import { useState } from "react";
import { useNavigate } from "react-router";
import { Box, Button, Container, Paper, TextField, Typography, Alert } from "@mui/material";
import { login } from "../api/pedidosApi";
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
            setToken(res.data.accessToken);
            navigate("/dashboard");
        } catch {
            setError("Credenciales incorrectas. Intenta de nuevo.");
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 10 }}>
                <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
                    <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
                        Tablero de Pedidos
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Usuario"
                            fullWidth
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <TextField
                            label="Contraseña"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
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
