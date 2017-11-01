export interface ProcessInstruction<T> {
  processor: 'sharp' | 'gm' | string;
  pipe: (pipe: T) => T;
}

export interface ProfileInstruction {
  name?: string;
  response: { [responseField: string]: any };
  process: Array<ProcessInstruction<any>>;
}
