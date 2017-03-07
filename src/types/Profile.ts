import Promise = require('bluebird');

import Config = require('../../config');

type Profile = (request: any, config: Config) => Promise<ProfileInstruction>;

export default Profile;
