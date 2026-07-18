// src/utils/db.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

// Detectar si estamos en AWS o si forzamos DynamoDB por entorno
const isAws = !!process.env.AWS_EXECUTION_ENV || !!process.env.USE_DYNAMODB;
let ddbDocClient = null;

if (isAws) {
  try {
    const client = new DynamoDBClient({});
    ddbDocClient = DynamoDBDocumentClient.from(client);
  } catch (err) {
    console.error("Error al instanciar DynamoDBClient:", err);
  }
}

// Data mock local para fallback en memoria
const localStickers = require("../data/stickers");
const localPlayers = require("../data/players");
const localTeams = require("../data/teams");
const localCountries = require("../data/countries");

const STICKERS_TABLE = process.env.STICKERS_TABLE;
const PLAYERS_TABLE = process.env.PLAYERS_TABLE;
const TEAMS_TABLE = process.env.TEAMS_TABLE;
const COUNTRIES_TABLE = process.env.COUNTRIES_TABLE;

const db = {
  // === STICKERS ===
  getStickers: async () => {
    if (ddbDocClient && STICKERS_TABLE) {
      const result = await ddbDocClient.send(new ScanCommand({ TableName: STICKERS_TABLE }));
      return result.Items || [];
    }
    return localStickers;
  },
  getSticker: async (id) => {
    if (ddbDocClient && STICKERS_TABLE) {
      const result = await ddbDocClient.send(new GetCommand({ TableName: STICKERS_TABLE, Key: { id } }));
      return result.Item || null;
    }
    return localStickers.find(item => item.id === id) || null;
  },
  createSticker: async (item) => {
    if (ddbDocClient && STICKERS_TABLE) {
      await ddbDocClient.send(new PutCommand({ TableName: STICKERS_TABLE, Item: item }));
      return item;
    }
    localStickers.push(item);
    return item;
  },
  updateSticker: async (id, item) => {
    if (ddbDocClient && STICKERS_TABLE) {
      await ddbDocClient.send(new PutCommand({ TableName: STICKERS_TABLE, Item: { ...item, id } }));
      return { ...item, id };
    }
    const index = localStickers.findIndex(st => st.id === id);
    if (index !== -1) {
      localStickers[index] = { ...localStickers[index], ...item, id };
      return localStickers[index];
    }
    throw new Error("No se encontró el cromo a actualizar");
  },
  deleteSticker: async (id) => {
    if (ddbDocClient && STICKERS_TABLE) {
      await ddbDocClient.send(new DeleteCommand({ TableName: STICKERS_TABLE, Key: { id } }));
      return true;
    }
    const index = localStickers.findIndex(st => st.id === id);
    if (index !== -1) {
      localStickers.splice(index, 1);
      return true;
    }
    return false;
  },

  // === PLAYERS ===
  getPlayers: async () => {
    if (ddbDocClient && PLAYERS_TABLE) {
      const result = await ddbDocClient.send(new ScanCommand({ TableName: PLAYERS_TABLE }));
      return result.Items || [];
    }
    return localPlayers;
  },
  getPlayer: async (id) => {
    if (ddbDocClient && PLAYERS_TABLE) {
      const result = await ddbDocClient.send(new GetCommand({ TableName: PLAYERS_TABLE, Key: { id } }));
      return result.Item || null;
    }
    return localPlayers.find(item => item.id === id) || null;
  },
  createPlayer: async (item) => {
    if (ddbDocClient && PLAYERS_TABLE) {
      await ddbDocClient.send(new PutCommand({ TableName: PLAYERS_TABLE, Item: item }));
      return item;
    }
    localPlayers.push(item);
    return item;
  },
  updatePlayer: async (id, item) => {
    if (ddbDocClient && PLAYERS_TABLE) {
      await ddbDocClient.send(new PutCommand({ TableName: PLAYERS_TABLE, Item: { ...item, id } }));
      return { ...item, id };
    }
    const index = localPlayers.findIndex(p => p.id === id);
    if (index !== -1) {
      localPlayers[index] = { ...localPlayers[index], ...item, id };
      return localPlayers[index];
    }
    throw new Error("No se encontró el jugador a actualizar");
  },
  deletePlayer: async (id) => {
    if (ddbDocClient && PLAYERS_TABLE) {
      await ddbDocClient.send(new DeleteCommand({ TableName: PLAYERS_TABLE, Key: { id } }));
      return true;
    }
    const index = localPlayers.findIndex(p => p.id === id);
    if (index !== -1) {
      localPlayers.splice(index, 1);
      return true;
    }
    return false;
  },

  // === TEAMS ===
  getTeams: async () => {
    if (ddbDocClient && TEAMS_TABLE) {
      const result = await ddbDocClient.send(new ScanCommand({ TableName: TEAMS_TABLE }));
      return result.Items || [];
    }
    return localTeams;
  },
  getTeam: async (id) => {
    if (ddbDocClient && TEAMS_TABLE) {
      const result = await ddbDocClient.send(new GetCommand({ TableName: TEAMS_TABLE, Key: { id } }));
      return result.Item || null;
    }
    return localTeams.find(item => item.id === id) || null;
  },
  createTeam: async (item) => {
    if (ddbDocClient && TEAMS_TABLE) {
      await ddbDocClient.send(new PutCommand({ TableName: TEAMS_TABLE, Item: item }));
      return item;
    }
    localTeams.push(item);
    return item;
  },
  updateTeam: async (id, item) => {
    if (ddbDocClient && TEAMS_TABLE) {
      await ddbDocClient.send(new PutCommand({ TableName: TEAMS_TABLE, Item: { ...item, id } }));
      return { ...item, id };
    }
    const index = localTeams.findIndex(t => t.id === id);
    if (index !== -1) {
      localTeams[index] = { ...localTeams[index], ...item, id };
      return localTeams[index];
    }
    throw new Error("No se encontró el equipo a actualizar");
  },
  deleteTeam: async (id) => {
    if (ddbDocClient && TEAMS_TABLE) {
      await ddbDocClient.send(new DeleteCommand({ TableName: TEAMS_TABLE, Key: { id } }));
      return true;
    }
    const index = localTeams.findIndex(t => t.id === id);
    if (index !== -1) {
      localTeams.splice(index, 1);
      return true;
    }
    return false;
  },

  // === COUNTRIES ===
  getCountries: async () => {
    if (ddbDocClient && COUNTRIES_TABLE) {
      const result = await ddbDocClient.send(new ScanCommand({ TableName: COUNTRIES_TABLE }));
      return result.Items || [];
    }
    return localCountries;
  },
  getCountry: async (id) => {
    if (ddbDocClient && COUNTRIES_TABLE) {
      const result = await ddbDocClient.send(new GetCommand({ TableName: COUNTRIES_TABLE, Key: { id } }));
      return result.Item || null;
    }
    return localCountries.find(item => item.id === id) || null;
  },
  createCountry: async (item) => {
    if (ddbDocClient && COUNTRIES_TABLE) {
      await ddbDocClient.send(new PutCommand({ TableName: COUNTRIES_TABLE, Item: item }));
      return item;
    }
    localCountries.push(item);
    return item;
  },
  updateCountry: async (id, item) => {
    if (ddbDocClient && COUNTRIES_TABLE) {
      await ddbDocClient.send(new PutCommand({ TableName: COUNTRIES_TABLE, Item: { ...item, id } }));
      return { ...item, id };
    }
    const index = localCountries.findIndex(c => c.id === id);
    if (index !== -1) {
      localCountries[index] = { ...localCountries[index], ...item, id };
      return localCountries[index];
    }
    throw new Error("No se encontró el país a actualizar");
  },
  deleteCountry: async (id) => {
    if (ddbDocClient && COUNTRIES_TABLE) {
      await ddbDocClient.send(new DeleteCommand({ TableName: COUNTRIES_TABLE, Key: { id } }));
      return true;
    }
    const index = localCountries.findIndex(c => c.id === id);
    if (index !== -1) {
      localCountries.splice(index, 1);
      return true;
    }
    return false;
  }
};

module.exports = db;
