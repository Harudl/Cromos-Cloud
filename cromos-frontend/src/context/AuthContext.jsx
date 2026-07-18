// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, verificar si ya había una sesión guardada
  useEffect(() => {
    const savedToken = localStorage.getItem("id_token");
    const savedUser = localStorage.getItem("user_info");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = async (username, password) => {
    try {
      // EJEMPLO CON FETCH (Si tu backend tuviera un endpoint /login)
      // O aquí integras Amplify: const res = await Auth.signIn(username, password);
      
      // Simulemos la respuesta exitosa de Cognito que te devuelve los tokens:
      const mockSession = {
        idToken: "jwt-token-simulado-de-cognito-xyz",
        username: username,
        email: `${username}@mundial.com`
      };

      // Guardar en el estado y en localStorage para persistencia
      setToken(mockSession.idToken);
      setUser({ username: mockSession.username, email: mockSession.email });
      
      localStorage.setItem("id_token", mockSession.idToken);
      localStorage.setItem("user_info", JSON.stringify({ username: mockSession.username }));

      return { success: true };
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("id_token");
    localStorage.removeItem("user_info");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);
