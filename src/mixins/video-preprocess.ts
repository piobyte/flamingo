import videoPreprocessor = require('../preprocessor/video/index');
import Route = require('../model/route');
import Constructor from '../model/Constructor';
import Config = require('../../config');
import FlamingoOperation = require('../model/flamingo-operation');
import Server = require('../model/server');
import Hapi = require('hapi');

export = function<T extends Constructor<Route>>(Base: T) {
  /**
   * Mixin that adds a video preprocessor which creates an image from a given video
   * @mixin
   */
  return class VideoPreprocess extends Base {
    /**
     * Adds video preprocessor
     * @param operation
     * @see module:flamingo/src/preprocessor/video
     */
    preprocess(operation) {
      return videoPreprocessor(operation);
    }
  };
};
