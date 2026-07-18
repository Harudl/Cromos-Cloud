// src/handlers/countries.js
const db = require("../utils/db");
const logger = require("../utils/logger");
const response = require("../utils/response");
const { getMethod, getPath } = require("../utils/http");

async function lambdaHandler(event) {
  logger.logRequest(event);

  try {
    const method = getMethod(event);
    const path = getPath(event);

    if (method === "OPTIONS") {
      return response.options();
    }

    let result;

    if (method === "GET" && path === "/countries") {
      const items = await db.getCountries();
      result = response.ok({
        items,
        count: items.length
      });
    } else if (method === "GET" && event.pathParameters?.id) {
      const country = await db.getCountry(event.pathParameters.id);
      result = country
        ? response.ok(country)
        : response.notFound(`No se encontró el país con id '${event.pathParameters.id}'`);
    } else if (method === "POST" && path === "/countries") {
      const { parseJsonBody } = require("../utils/request");
      const payload = parseJsonBody(event.body);
      if (!payload || !payload.id || !payload.nombre) {
        result = response.badRequest("Faltan campos obligatorios: id, nombre");
      } else {
        const createdCountry = {
          id: payload.id,
          nombre: payload.nombre,
          banderaEmoji: payload.banderaEmoji || "🏳️",
          continente: payload.continente || "Sudamérica"
        };
        await db.createCountry(createdCountry);
        result = response.created(createdCountry);
      }
    } else if (method === "PUT" && event.pathParameters?.id) {
      const country = await db.getCountry(event.pathParameters.id);
      if (!country) {
        result = response.notFound(`No se encontró el país con id '${event.pathParameters.id}'`);
      } else {
        const { parseJsonBody } = require("../utils/request");
        const payload = parseJsonBody(event.body);
        const updatedCountry = {
          ...country,
          nombre: payload.nombre || country.nombre,
          banderaEmoji: payload.banderaEmoji !== undefined ? payload.banderaEmoji : country.banderaEmoji,
          continente: payload.continente || country.continente
        };
        await db.updateCountry(event.pathParameters.id, updatedCountry);
        result = response.ok(updatedCountry);
      }
    } else if (method === "DELETE" && event.pathParameters?.id) {
      const success = await db.deleteCountry(event.pathParameters.id);
      if (success) {
        result = response.ok({ message: `País '${event.pathParameters.id}' eliminado con éxito` });
      } else {
        result = response.notFound(`No se encontró el país con id '${event.pathParameters.id}'`);
      }
    } else {
      result = response.notFound(`No existe la ruta ${method} ${path}`);
    }

    logger.logResult({ route: path, method, statusCode: result.statusCode });
    return result;
  } catch (error) {
    logger.logError(error, event);
    return response.internalServerError();
  }
}

module.exports = {
  lambdaHandler
};
