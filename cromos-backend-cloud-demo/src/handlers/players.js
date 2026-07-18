// src/handlers/players.js
const db = require("../utils/db");
const logger = require("../utils/logger");
const response = require("../utils/response");
const { getMethod, getPath } = require("../utils/http");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

async function enrichPlayer(player) {
  if (!player) return null;
  const [countriesList, teamsList] = await Promise.all([
    db.getCountries(),
    db.getTeams()
  ]);
  const team = teamsList.find((item) => item.id === player.teamId);
  const country = countriesList.find((item) => item.id === team?.countryId || item.id === player.paisId);

  return {
    ...player,
    team,
    country
  };
}

async function uploadPhotoToS3(playerId, base64Data) {
  // Si no hay bucket configurado, o no es una cadena Base64, devolvemos tal cual
  if (!process.env.PHOTOS_BUCKET || !base64Data || !base64Data.startsWith("data:image/")) {
    return base64Data;
  }

  try {
    const s3Client = new S3Client({});
    
    // Parsear data URL (ej: data:image/png;base64,iVBORw0KGgo...)
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Data;
    }

    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const fileExtension = contentType.split("/")[1] || "png";
    const key = `players/${playerId}.${fileExtension}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.PHOTOS_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType
    }));

    // Retornar la URL pública del objeto en S3
    return `https://${process.env.PHOTOS_BUCKET}.s3.amazonaws.com/${key}`;
  } catch (err) {
    console.error("Error al subir foto a S3:", err);
    return base64Data; // Fallback a Base64 en caso de fallo
  }
}

async function lambdaHandler(event) {
  logger.logRequest(event);

  try {
    const method = getMethod(event);
    const path = getPath(event);

    if (method === "OPTIONS") {
      return response.options();
    }

    let result;

    if (method === "GET" && path === "/players") {
      const countryFilter = event.queryStringParameters?.country;
      const allPlayers = await db.getPlayers();
      let items = await Promise.all(allPlayers.map(enrichPlayer));

      if (countryFilter) {
        items = items.filter((player) => player.country?.id === countryFilter);
      }

      result = response.ok({
        items,
        count: items.length
      });
    } else if (method === "GET" && event.pathParameters?.id) {
      const player = await db.getPlayer(event.pathParameters.id);
      result = player
        ? response.ok(await enrichPlayer(player))
        : response.notFound(`No se encontró el jugador con id '${event.pathParameters.id}'`);
    } else if (method === "POST" && path === "/players") {
      const { parseJsonBody } = require("../utils/request");
      const payload = parseJsonBody(event.body);
      if (!payload || !payload.id || !payload.nombre) {
        result = response.badRequest("Faltan campos obligatorios: id, nombre");
      } else {
        // Subir foto a S3 si es necesario
        const finalImageUrl = await uploadPhotoToS3(payload.id, payload.imageUrl);

        const createdPlayer = {
          id: payload.id,
          name: payload.nombre,
          teamId: payload.teamId || null,
          position: payload.posicion || "Delantero",
          paisId: payload.paisId || null,
          imageUrl: finalImageUrl || null
        };
        await db.createPlayer(createdPlayer);
        result = response.created(await enrichPlayer(createdPlayer));
      }
    } else if (method === "PUT" && event.pathParameters?.id) {
      const player = await db.getPlayer(event.pathParameters.id);
      if (!player) {
        result = response.notFound(`No se encontró el jugador con id '${event.pathParameters.id}'`);
      } else {
        const { parseJsonBody } = require("../utils/request");
        const payload = parseJsonBody(event.body);

        // Subir foto a S3 si es una foto nueva en Base64
        const finalImageUrl = payload.imageUrl ? await uploadPhotoToS3(event.pathParameters.id, payload.imageUrl) : player.imageUrl;

        const updatedPlayer = {
          ...player,
          name: payload.nombre || player.name,
          teamId: payload.teamId !== undefined ? payload.teamId : player.teamId,
          position: payload.posicion || player.position,
          paisId: payload.paisId !== undefined ? payload.paisId : player.paisId,
          imageUrl: finalImageUrl || null
        };
        await db.updatePlayer(event.pathParameters.id, updatedPlayer);
        result = response.ok(await enrichPlayer(updatedPlayer));
      }
    } else if (method === "DELETE" && event.pathParameters?.id) {
      const success = await db.deletePlayer(event.pathParameters.id);
      if (success) {
        result = response.ok({ message: `Jugador '${event.pathParameters.id}' eliminado con éxito` });
      } else {
        result = response.notFound(`No se encontró el jugador con id '${event.pathParameters.id}'`);
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
