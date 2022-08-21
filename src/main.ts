import './style.css'
import * as PIXI from 'pixi.js'
import { Matrix, Renderer } from 'pixi.js'
import { dropTextStyle2, hudTextStyle } from './game/styles/textStyle'
import { ReflectionFilter } from '@pixi/filter-reflection'
import { colorDistance } from './game/styles/color'
import {
  appHeight,
  appWidth,
  backgroundColor,
  boundaryRatio,
  boundaryY,
  numberOfParticles,
  totalLives
} from './game/logic/contants'
import { Engine } from './game/lib/Engine'
import { ParticleSystem } from './game/systems/ParticleSystem'
import { SplashParticleComponent } from './game/components/SplashParticleComponent'
import { newSplashParticle } from './game/entities/splashParticle'
import { DropTextSystem } from './game/systems/DropTextSystem'
import { DropTextComponent } from './game/components/DropTextComponent'
import { findComponentIn } from './game/lib/Component'

const stageElem = document.getElementById('stage') as HTMLCanvasElement
const inputElem = document.getElementById('input') as HTMLInputElement

export const data = {
  score: 0,
  lives: 3,
}

const app = new PIXI.Application({
  view: stageElem,
  width: appWidth,
  height: appHeight,
  backgroundColor
})

const engine = new Engine()
engine.registerSystem(DropTextSystem)
engine.registerSystem(ParticleSystem)

export const container = new PIXI.Container()
container.width = app.screen.width
container.height = app.screen.height

const particleContainer = new PIXI.Container()
particleContainer.width = app.screen.width
particleContainer.height = app.screen.height

const bg = new PIXI.Graphics()
bg.beginFill(backgroundColor)
bg.drawRect(0, 0, app.screen.width, app.screen.height)
bg.endFill()
container.addChild(bg)

const line = new PIXI.Graphics()
line.beginFill(0xFFFFFF)
line.fill.alpha = 0.5
line.drawRect(0, app.screen.height * boundaryRatio - 1, app.screen.width, 2)
line.endFill()
container.addChild(line)

const scoreText = new PIXI.Text('Score: 0')
scoreText.x = appWidth
scoreText.y = 10
scoreText.anchor.set(1, 0)
scoreText.style = hudTextStyle

const livesText = new PIXI.Text('Lives: ♥♥♡')
livesText.x = 0
livesText.y = 10
livesText.style = hudTextStyle

const gameOverText = new PIXI.Text('遊戲結束')
gameOverText.x = appWidth / 2
gameOverText.y = 200
gameOverText.style = dropTextStyle2.clone()
gameOverText.alpha = 0
gameOverText.anchor.set(0.5, 0.5)
gameOverText.style.align = 'center'

app.stage.addChild(container)
app.stage.addChild(particleContainer)
app.stage.addChild(scoreText)
app.stage.addChild(livesText)
app.stage.addChild(gameOverText)

const brt = new PIXI.BaseRenderTexture({
  width: app.screen.width,
  height: 1
})

const renderTexture = new PIXI.RenderTexture(brt)
const sprite = new PIXI.Sprite(renderTexture)
sprite.x = 300
sprite.y = 10
sprite.tint = 0xff0000
sprite.height = 50
// app.stage.addChild(sprite)

const reflectionFilter = new ReflectionFilter({
  mirror: true,
  boundary: boundaryRatio,
  amplitude: [1, 5],
  waveLength: [80, 300],
  alpha: [0.5, 0],
  time: 5
})

app.stage.filters = [reflectionFilter]

let lastGenParticle = 0

app.ticker.add((delta) => {
  const now = Date.now()

  engine.tick(delta)

  // Splash gen
  if (lastGenParticle + 10 < now) {
    app.renderer.render(container, {
      renderTexture,
      transform: new Matrix(1, 0, 0, 1, 0, -boundaryY + 2),
    })

    const gl = (app.renderer as Renderer).gl

    const pixels = new Uint8Array(app.screen.width * 4)

    gl.readPixels(0, 0, app.screen.width, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    const boundaryRow = []
    for (let i = 0; i < app.screen.width; i++) {
      boundaryRow[i] = (pixels[i * 4] << 16)
        + (pixels[i * 4 + 1] << 8)
        + pixels[i * 4 + 2]
    }

    const particles = engine.mapperFor(SplashParticleComponent).getItems()
    const numberOfParticlesToCreate = numberOfParticles - particles.length

    let numberOfCreatedParticles = 0
    for (let i = 0; i < app.screen.width; i += 3) {
      const color = boundaryRow[i]
      if (colorDistance(color, backgroundColor) > 400 && numberOfCreatedParticles < numberOfParticlesToCreate) {
        newSplashParticle(engine, particleContainer, color, i, boundaryY)
        numberOfCreatedParticles++
      }
    }
    lastGenParticle = now
  }

  // HUD
  scoreText.text = data.score.toString().padStart(6, '0')
  livesText.text = Array.from(Array(totalLives).keys()).map(i => i < data.lives ? '♥' : '♡').join('')

  // Game over
  if (data.lives === 0) {
    gameOverText.alpha = 1
  }
});

inputElem.addEventListener('input', () => {
  if (data.lives > 0) {
    const inputChars = inputElem.value.split('')
    const entityEntries = engine.entities.entries()

    let hasMatched = false
    for (let [entityId, components] of entityEntries) {
      const dropText = findComponentIn(components)(DropTextComponent)
      if (dropText !== undefined && inputChars.includes(dropText.text) && !dropText.hasPassedBoundary) {
        engine.removeEntity(entityId)
        data.score += 100
        hasMatched = true
      }
    }
    if (hasMatched) {
      inputElem.value = ''
    }
  }
})

inputElem.focus()

inputElem.addEventListener('focusout', () => {
  setTimeout(() => {
    inputElem.focus()
  })
})
