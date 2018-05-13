import Config = require('../../config');
import { ProfileInstruction } from './Instruction';

type Profile = (request: any, config: Config) => Promise<ProfileInstruction>;

export default Profile;
