// flow-typed signature: 269f3af302da02d04fc359d6dd55ef74
// flow-typed version: 94e9f7e0a4/file-type_v3.x.x/flow_>=v0.28.x

declare module 'file-type' {
  declare module.exports: (buffer: Buffer | Uint8Array) => ?{ ext: string, mime: string };
}
