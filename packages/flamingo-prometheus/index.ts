import addon = require("flamingo/src/addon");
import { HOOK, HOOKS } from "flamingo/src/addon";
import prompsterHapi = require("@promster/hapi");

const { createPlugin, getSummary, getContentType, signalIsUp, signalIsNotUp } =
  prompsterHapi;

/**
 * Returns prometheus config mappings
 * @name ENV
 * @function
 * @return {Array} environment mappings
 */
exports[addon.HOOKS.ENV] = function () {
  return [
    ["PROMETHEUS_LABELS", "PROMETHEUS.LABELS", JSON.parse],
    ["PROMETHEUS_URL", "PROMETHEUS.URL"],
  ];
} as HOOK[HOOKS.ENV];

/**
 * Returns default addon conf
 * @name CONF
 * @function
 */
exports[addon.HOOKS.CONF] = function () {
  return {
    PROMETHEUS: {
      URL: "/metrics",
      LABELS: [
        "httpRequestsTotal",
        "httpRequestsSummary",
        "httpRequestsHistogram",
      ],
    },
  };
} as HOOK[HOOKS.CONF];

/**
 * Returns some hapi prometheus plugins
 */
exports[addon.HOOKS.HAPI_PLUGINS] = function (server) {
  return [
    {
      name: "flamingo-hapi-prometheus-metrics",
      version: "0.1.0",
      register: async function (hapi) {
        hapi.route({
          method: "GET",
          path: server.config.PROMETHEUS.URL,
          async handler(request, h) {
            return h
              .response(await getSummary())
              .type(getContentType())
              .code(200);
          },
        });
      },
    },
    createPlugin({
      options: {
        metricTypes: server.config.PROMETHEUS.LABELS,
      },
    }),
  ];
} as HOOK[HOOKS.HAPI_PLUGINS];

exports[addon.HOOKS.START] = function () {
  signalIsUp();
} as HOOK[HOOKS.START];

exports[addon.HOOKS.STOP] = function () {
  signalIsNotUp();
} as HOOK[HOOKS.STOP];
