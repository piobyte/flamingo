import videoPreprocessor = require('../preprocessor/video/index');
import Route = require('../model/route');
import Constructor from '../model/Constructor';

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
