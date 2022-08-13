import * as PIXI from 'pixi.js'

export interface SplashParticle {
  v: [number, number]
  lifetime: number
  graphic: PIXI.Graphics
}