import Logger = require("./src/logger");
import Server = require("./src/model/server");
import Config = require("./config");
import AddonLoader = require("./src/addon/loader");
import IndexRoute = require("./src/routes/index");
import ImageRoute = require("./src/routes/image");
import VideoRoute = require("./src/routes/video");
import DebugRoute = require("./src/routes/debug");
import Route = require("./src/model/route");
import pkg = require("./package.json");

const { build } = Logger;
const indexLogger = build("index");

process.on("uncaughtException", err => indexLogger.error(err));

function buildRoutes(config: Config) {
  const routes: Route[] = [];

  if (config.ROUTES && config.ROUTES.INDEX) routes.push(new IndexRoute(config));
  if (config.ROUTES && config.ROUTES.PROFILE_CONVERT_IMAGE)
    routes.push(new ImageRoute(config));
  if (config.ROUTES && config.ROUTES.PROFILE_CONVERT_VIDEO)
    routes.push(new VideoRoute(config));
  if (config.DEBUG) routes.push(new DebugRoute(config));

  return routes;
}

function buildProfiles(config: Config) {
  return [
    require("./src/profiles/examples"),
    config.DEBUG && require("./src/profiles/debug")
  ].filter(Boolean);
}

Config.fromEnv()
  .then(config =>
    new Server(config, new AddonLoader(__dirname, pkg).load())
      .withProfiles(buildProfiles(config))
      .withRoutes(buildRoutes(config))
      .start()
  )
  .then(server =>
    indexLogger.info(`server running at ${server.hapi.info!.uri}`)
  )
  .catch(error => indexLogger.error(error));
