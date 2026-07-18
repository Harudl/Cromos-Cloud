// src/handlers/teams.js
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

    if (method === "GET" && path === "/teams") {
      const items = await db.getTeams();
      result = response.ok({
        items,
        count: items.length
      });
    } else if (method === "GET" && event.pathParameters?.id) {
      const team = await db.getTeam(event.pathParameters.id);
      result = team
        ? response.ok(team)
        : response.notFound(`No se encontró el equipo con id '${event.pathParameters.id}'`);
    } else if (method === "POST" && path === "/teams") {
      const { parseJsonBody } = require("../utils/request");
      const payload = parseJsonBody(event.body);
      if (!payload || !payload.id || !payload.nombre) {
        result = response.badRequest("Faltan campos obligatorios: id, nombre");
      } else {
        const createdTeam = {
          id: payload.id,
          nombre: payload.nombre,
          codigoCorto: payload.codigoCorto || "",
          grupo: payload.grupo || "Grupo A"
        };
        await db.createTeam(createdTeam);
        result = response.created(createdTeam);
      }
    } else if (method === "PUT" && event.pathParameters?.id) {
      const team = await db.getTeam(event.pathParameters.id);
      if (!team) {
        result = response.notFound(`No se encontró el equipo con id '${event.pathParameters.id}'`);
      } else {
        const { parseJsonBody } = require("../utils/request");
        const payload = parseJsonBody(event.body);
        const updatedTeam = {
          ...team,
          nombre: payload.nombre || team.nombre,
          codigoCorto: payload.codigoCorto !== undefined ? payload.codigoCorto : team.codigoCorto,
          grupo: payload.grupo || team.grupo
        };
        await db.updateTeam(event.pathParameters.id, updatedTeam);
        result = response.ok(updatedTeam);
      }
    } else if (method === "DELETE" && event.pathParameters?.id) {
      const success = await db.deleteTeam(event.pathParameters.id);
      if (success) {
        result = response.ok({ message: `Equipo '${event.pathParameters.id}' eliminado con éxito` });
      } else {
        result = response.notFound(`No se encontró el equipo con id '${event.pathParameters.id}'`);
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
