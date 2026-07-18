// src/features/auth/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await login(username, password);
      // login sets local storage and updates state, which triggers rerender in App
    } catch (err) {
      setError("Credenciales inválidas o error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.trophy}>🏆</span> album<strong style={{ color: '#ffb300' }}>Mundial</strong>
        </div>
        <h2 style={styles.title}>INGRESAR AL ÁLBUM DIGITAL</h2>
        <p style={styles.subtitle}>Gestiona tus cromos y escuadras en la nube Serverless</p>
        
        {error && <div style={styles.errorAlert}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Usuario o Email</label>
            <input 
              type="text" 
              placeholder="Ej: admin"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.btnSubmit}>
            {loading ? "Iniciando Sesión..." : "⚽ Iniciar Sesión"}
          </button>
        </form>
        <div style={styles.footerText}>
          Desplegado en AWS Cloud (Lambda + DynamoDB)
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#0d1626",
    color: "#ffffff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "20px",
    background: "radial-gradient(circle, #152238 0%, #0b111e 100%)",
  },
  card: {
    background: "#111b2d",
    border: "1px solid #1e3250",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    padding: "40px 30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    textAlign: "center",
  },
  logo: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "20px",
  },
  trophy: {
    fontSize: "2rem",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    letterSpacing: "1px",
    color: "#ffffff",
    margin: "10px 0 5px 0",
  },
  subtitle: {
    color: "#90a4ae",
    fontSize: "0.9rem",
    marginBottom: "30px",
  },
  errorAlert: {
    backgroundColor: "rgba(255, 82, 82, 0.15)",
    border: "1px solid #ff5252",
    color: "#ff5252",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "0.85rem",
    marginBottom: "20px",
    textAlign: "left",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    textAlign: "left",
  },
  label: {
    fontSize: "0.85rem",
    color: "#b0bec5",
    fontWeight: "bold",
  },
  input: {
    background: "#1a2a46",
    border: "1px solid #23395b",
    padding: "12px",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
  },
  btnSubmit: {
    background: "linear-gradient(90deg, #ffb300, #ff8f00)",
    color: "#0d1626",
    border: "none",
    padding: "14px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "1rem",
    marginTop: "10px",
    transition: "transform 0.1s, opacity 0.2s",
  },
  footerText: {
    marginTop: "30px",
    fontSize: "0.75rem",
    color: "#546e7a",
  }
};
export default Login;