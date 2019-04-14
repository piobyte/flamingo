import FlamingoOperation = require('../model/flamingo-operation');
import { ReaderResult } from './ReaderResult';

interface Reader {
  (operation: FlamingoOperation): Promise<ReaderResult> | void;
}

export = Reader;
