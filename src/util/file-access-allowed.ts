/**
 * File access allowed module
 * @module
 */
/**
 * Function to ensure that a given file path is whitelisted
 */
export = function(filePath: string, allowedPaths: Array<string> = []): boolean {
  return allowedPaths.some(allowedPath => filePath.indexOf(allowedPath) === 0);
};
