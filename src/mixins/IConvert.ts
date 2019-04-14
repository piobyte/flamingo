import FlamingoOperation = require('../model/flamingo-operation');
import { ReaderResult } from '../types/ReaderResult';
import nodeStream = require('stream');
import { ProfileInstruction } from '../types/Instruction';
import Reader = require('../types/Reader');
import { Reply, Request } from '../types/HTTP';

type ReadableStream = nodeStream.Readable;

export default interface IConvert {
  validOperation(operation: FlamingoOperation): Promise<FlamingoOperation>;

  read(
    operation: FlamingoOperation
  ): (operation: FlamingoOperation) => Promise<ReaderResult> | void;

  preprocess(
    operation: FlamingoOperation
  ): (result: ReaderResult) => Promise<ReadableStream>;

  validStream(
    operation: FlamingoOperation
  ): (stream: ReadableStream) => Promise<ReadableStream>;

  process(
    operation: FlamingoOperation
  ): (stream: ReadableStream) => ReadableStream;

  write(
    operation: FlamingoOperation
  ): (stream: ReadableStream) => Promise<any> | void;

  extractProcess(operation: FlamingoOperation): Promise<ProfileInstruction>;

  extractInput(operation: FlamingoOperation): Promise<any>;

  extractReader<T>(input: T): Promise<Reader | undefined>;

  buildOperation(request: Request, reply: Reply): Promise<FlamingoOperation>;
}
