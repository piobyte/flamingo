/*::

declare class Config extends Object{
  VERSION: string;
  DEBUG: boolean;
  DEFAULT_MIME: string;
  NATIVE_AUTO_ORIENT: boolean;
  ALLOW_READ_REDIRECT: boolean;
  ROUTES: RouteConfig;
  SUPPORTED: SupportedConfig;
  READER: ReaderConfig;
  PORT: number;
  PREPROCESSOR: PreprocessorConfig;
  ACCESS: AccessConfig;
  CRYPTO: CryptoConfig;
  ENCODE_PAYLOAD: (plaintext: string) => Promise<string>;
  DECODE_PAYLOAD: (ciphertext: string) => Promise<string>;
}

declare class RouteConfig {
  INDEX: boolean;
  PROFILE_CONVERT_IMAGE: boolean;
  PROFILE_CONVERT_VIDEO: boolean;
}

declare class SupportedConfig {
  FFMPEG?: boolean;
  GM: { WEBP: boolean };
}

declare class ReaderConfig {
  REQUEST: { TIMEOUT: number }
}

declare class PreprocessorConfig {
  VIDEO: { KILL_TIMEOUT: number };
}

declare class AccessConfig {
  FILE: { READ: Array<string>, WRITE: Array<string> };
  HTTPS: { ENABLED: boolean, READ: Array<UrlParse>, WRITE: Array<UrlParse>};
}

declare class CryptoConfig {
  ENABLED: boolean;
  KEY: Buffer;
  IV: Buffer;
  CIPHER: string;
}

*/
