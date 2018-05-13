import FlamingoOperation = require('../model/flamingo-operation');
import { ReaderResult } from './ReaderResult';

type Reader = (operation: FlamingoOperation) => Promise<ReaderResult> | void;

export = Reader;
