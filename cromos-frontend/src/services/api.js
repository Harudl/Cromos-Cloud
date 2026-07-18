// src/services/api.js

//const BASE_URL = "https://tu-api-id.execute-api.us-east-1.amazonaws.com/prod"; // Cambia por tu URL local o de AWS
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
// Función auxiliar para obtener el token de Cognito (de donde lo guardes: localStorage, cookies, etc.)
const getAuthToken = () => {
  return localStorage.getItem("id_token"); 
};

// Manejador genérico de peticiones HTTP
async function apiRequest(endpoint, method = "GET", body = null, params = {}) {
  // 1. Construir Query String si hay parámetros (ej: ?country=AR o ?rarity=Legendary)
  let url = `${BASE_URL}${endpoint}`;
  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  // 2. Configurar cabeceras predeterminadas
  const headers = {
    "Content-Type": "application/json",
  };

  // 3. Inyectar el Token si el usuario está logueado (necesario para /stickers)
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    
    // Si la respuesta es vacía o es un 204
    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error del servidor: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`Error en API ${method} ${endpoint}:`, error.message);
    throw error;
  }
}

// 4. Mapeo directo a los métodos de tus Handlers del Backend
export const StickerService = {
  getAll: (rarity) => apiRequest("/stickers", "GET", null, rarity ? { rarity } : {}),
  getById: (id) => apiRequest(`/stickers/${id}`, "GET"),
  create: (payload) => apiRequest("/stickers", "POST", payload),
  update: (id, payload) => apiRequest(`/stickers/${id}`, "PUT", payload),
  delete: (id) => apiRequest(`/stickers/${id}`, "DELETE"),
};

export const PlayerService = {
  getAll: (countryId) => apiRequest("/players", "GET", null, countryId ? { country: countryId } : {}),
  getById: (id) => apiRequest(`/players/${id}`, "GET"),
  create: (payload) => apiRequest("/players", "POST", payload),
  update: (id, payload) => apiRequest(`/players/${id}`, "PUT", payload),
  delete: (id) => apiRequest(`/players/${id}`, "DELETE"),
};

export const TeamService = {
  getAll: () => apiRequest("/teams", "GET"),
  getById: (id) => apiRequest(`/teams/${id}`, "GET"),
  create: (payload) => apiRequest("/teams", "POST", payload),
  update: (id, payload) => apiRequest(`/teams/${id}`, "PUT", payload),
  delete: (id) => apiRequest(`/teams/${id}`, "DELETE"),
};

export const CountryService = {
  getAll: () => apiRequest("/countries", "GET"),
  getById: (id) => apiRequest(`/countries/${id}`, "GET"),
  create: (payload) => apiRequest("/countries", "POST", payload),
  update: (id, payload) => apiRequest(`/countries/${id}`, "PUT", payload),
  delete: (id) => apiRequest(`/countries/${id}`, "DELETE"),
};

export const HealthService = {
  check: () => apiRequest("/health", "GET"),
  root: () => apiRequest("/", "GET"),
};

export const api = {
  getStickers: (rarity) => StickerService.getAll(rarity),
  getStickerById: (id) => StickerService.getById(id),
  createSticker: (payload) => StickerService.create(payload),
  updateSticker: (id, payload) => StickerService.update(id, payload),
  deleteSticker: (id) => StickerService.delete(id),
  
  getPlayers: (countryId) => PlayerService.getAll(countryId),
  getPlayerById: (id) => PlayerService.getById(id),
  createPlayer: (payload) => PlayerService.create(payload),
  updatePlayer: (id, payload) => PlayerService.update(id, payload),
  deletePlayer: (id) => PlayerService.delete(id),
  
  getTeams: () => TeamService.getAll(),
  getTeamById: (id) => TeamService.getById(id),
  createTeam: (payload) => TeamService.create(payload),
  updateTeam: (id, payload) => TeamService.update(id, payload),
  deleteTeam: (id) => TeamService.delete(id),
  
  getCountries: () => CountryService.getAll(),
  getCountryById: (id) => CountryService.getById(id),
  createCountry: (payload) => CountryService.create(payload),
  updateCountry: (id, payload) => CountryService.update(id, payload),
  deleteCountry: (id) => CountryService.delete(id),
  
  checkHealth: () => HealthService.check(),
  root: () => HealthService.root()
};