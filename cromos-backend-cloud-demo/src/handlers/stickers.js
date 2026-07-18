// src/handlers/stickers.js
const db = require("../utils/db");
const logger = require("../utils/logger");
const response = require("../utils/response");
const { getAuthenticatedUser } = require("../utils/cognito");
const { getMethod, getPath } = require("../utils/http");
const { parseJsonBody } = require("../utils/request");

async function enrichSticker(sticker) {
  if (!sticker) return null;
  const player = await db.getPlayer(sticker.playerId);
  const enrichedPlayer = player ? {
    ...player,
    nombre: player.nombre || player.name,
    posicion: player.posicion || player.position
  } : null;

  return {
    ...sticker,
    player: enrichedPlayer
  };
}

async function enrichStickers(stickersList) {
  const playersList = await db.getPlayers();
  return stickersList.map(st => {
    const player = playersList.find(p => p.id === st.playerId);
    const enrichedPlayer = player ? {
      ...player,
      nombre: player.nombre || player.name,
      posicion: player.posicion || player.position
    } : null;
    return {
      ...st,
      player: enrichedPlayer
    };
  });
}

async function validateStickerPayload(payload) {
  const missingFields = ["number", "playerId", "edition", "rarity"].filter(
    (field) => !payload[field]
  );

  if (missingFields.length > 0) {
    return `Faltan campos obligatorios: ${missingFields.join(", ")}`;
  }

  const player = await db.getPlayer(payload.playerId);

  if (!player) {
    return `El playerId '${payload.playerId}' no existe en el catálogo de jugadores`;
  }

  return null;
}

async function lambdaHandler(event) {
  logger.logRequest(event);

  try {
    const method = getMethod(event);
    const path = getPath(event);
    const user = getAuthenticatedUser(event);
    let result;

    if (method === "OPTIONS") {
      return response.options();
    }

    if (method === "GET" && path === "/stickers") {
      const rarityFilter = event.queryStringParameters?.rarity;
      const allStickers = await db.getStickers();
      let items = await enrichStickers(allStickers);

      if (rarityFilter) {
        items = items.filter((sticker) => sticker.rarity === rarityFilter);
      }

      result = response.ok({
        items,
        count: items.length
      });
    } else if (method === "GET" && event.pathParameters?.id) {
      const sticker = await db.getSticker(event.pathParameters.id);
      result = sticker
        ? response.ok(await enrichSticker(sticker))
        : response.notFound(`No se encontró el cromo con id '${event.pathParameters.id}'`);
    } else if (method === "POST" && path === "/stickers") {
      const payload = parseJsonBody(event.body);

      if (payload === null) {
        result = response.badRequest("El body no contiene JSON válido");
      } else {
        const validationError = await validateStickerPayload(payload);
        if (validationError) {
          result = response.badRequest(validationError);
        } else {
          const createdSticker = {
            id: `sticker-${Date.now()}`,
            number: payload.number,
            playerId: payload.playerId,
            edition: payload.edition,
            marketValue: payload.marketValue ?? 0,
            rarity: payload.rarity,
            collected: payload.collected ?? false
          };
          await db.createSticker(createdSticker);

          result = response.created({
            message: "Cromo creado con éxito",
            requestedBy: user.username,
            item: await enrichSticker(createdSticker)
          });
        }
      }
    } else if (method === "PUT" && event.pathParameters?.id) {
      const sticker = await db.getSticker(event.pathParameters.id);

      if (!sticker) {
        result = response.notFound(`No se encontró el cromo con id '${event.pathParameters.id}'`);
      } else {
        const payload = parseJsonBody(event.body);

        if (payload === null) {
          result = response.badRequest("El body no contiene JSON válido");
        } else {
          const updatedSticker = {
            ...sticker,
            ...payload,
            id: sticker.id
          };

          if (updatedSticker.playerId) {
            const player = await db.getPlayer(updatedSticker.playerId);
            if (player) {
              await db.updateSticker(event.pathParameters.id, updatedSticker);
              result = response.ok({
                message: "Cromo actualizado con éxito",
                requestedBy: user.username,
                item: await enrichSticker(updatedSticker)
              });
            } else {
              result = response.badRequest(
                `No se puede actualizar el cromo: el playerId '${updatedSticker.playerId}' no existe`
              );
            }
          } else {
            await db.updateSticker(event.pathParameters.id, updatedSticker);
            result = response.ok({
              message: "Cromo actualizado con éxito",
              requestedBy: user.username,
              item: await enrichSticker(updatedSticker)
            });
          }
        }
      }
    } else if (method === "DELETE" && event.pathParameters?.id) {
      const success = await db.deleteSticker(event.pathParameters.id);
      if (success) {
        result = response.ok({
          message: `El cromo '${event.pathParameters.id}' fue eliminado con éxito`,
          requestedBy: user.username
        });
      } else {
        result = response.notFound(`No se encontró el cromo con id '${event.pathParameters.id}'`);
      }
    } else {
      result = response.notFound(`No existe la ruta ${method} ${path}`);
    }

    logger.logResult({
      route: path,
      method,
      statusCode: result.statusCode,
      username: user.username
    });
    return result;
  } catch (error) {
    logger.logError(error, event);
    return response.internalServerError();
  }
}

module.exports = {
  lambdaHandler
};
