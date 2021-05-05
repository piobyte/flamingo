import { AvailableFormatInfo, FormatEnum } from "sharp";

export interface Mime {
  mime: string;
  type: string;
}

export type SharpType = keyof FormatEnum | AvailableFormatInfo;
