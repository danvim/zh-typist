export const colorDistance = (a: number, b: number): number =>
  (((a & 0xFF0000) >> 16) - ((b & 0xFF0000) >> 16))
  + (((a & 0x00FF00) >> 8) - ((b & 0x00FF00) >> 8))
  + ((a & 0x0000FF) - (b & 0x0000FF))