import { Engine, EntityHandle } from '../lib/Engine'
import { SplashParticleComponent } from '../components/SplashParticleComponent'
import { PixiComponent } from '../components/PixiComponent'
import * as PIXI from 'pixi.js'

export const newSplashParticle = (engine: Engine, parent: PIXI.Container, color: number, x: number, y: number): EntityHandle => {
  return engine.newEntity()
    .addComponent(SplashParticleComponent, component => {
      component.lifetime = 50
      component.v = [Math.random() * 5 - 2.5, Math.random() * 8 - 10]
    })
    .addComponent(PixiComponent, component => {
      const graphic = new PIXI.Graphics()
      const isStroke = Math.floor(Math.random() * 3) === 0
      graphic.beginFill(0xffffff)
      if (isStroke) {
        graphic.line.color = 0xffffff
        graphic.line.width = 2
        graphic.line.visible = true
        graphic.fill.visible = false
      }
      graphic.drawCircle(0, 0, 5)
      graphic.endFill()

      graphic.tint = color
      graphic.x = x
      graphic.y = y
      graphic.alpha = 1

      component.parent = parent
      component.obj = graphic
    }
  )
}