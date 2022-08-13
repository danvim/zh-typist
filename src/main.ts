import './style.css'
import * as PIXI from 'pixi.js'
import { Matrix, Renderer } from 'pixi.js'
import { dropTextStyle, dropTextStyle2, hudTextStyle } from './game/styles/textStyle'
import { ReflectionFilter } from '@pixi/filter-reflection'
import { commonEasyChars, dropChar, DropText, getRandomItemFrom } from './game/logic/characters'
import { colorDistance } from './game/styles/color'
import {
  backgroundColor,
  boundary,
  characterHeight,
  hByW,
  numberOfChars,
  numberOfParticles, totalLives
} from './game/logic/contants'
import { createPool } from './game/logic/pool'
import { SplashParticle } from './game/logic/particles'

const stageElem = document.getElementById('stage') as HTMLCanvasElement
const inputElem = document.getElementById('input') as HTMLInputElement

const width = Math.min(800, window.innerWidth);

const data = {
  score: 0,
  lives: 3,
}

const app = new PIXI.Application({
  view: stageElem,
  width,
  height: width * hByW,
  backgroundColor
})

const container = new PIXI.Container()
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
line.drawRect(0, app.screen.height * boundary - 1, app.screen.width, 2)
line.endFill()
container.addChild(line)

const scoreText = new PIXI.Text('Score: 0')
scoreText.x = width
scoreText.y = 10
scoreText.anchor.set(1, 0)
scoreText.style = hudTextStyle

const livesText = new PIXI.Text('Lives: ♥♥♡')
livesText.x = 0
livesText.y = 10
livesText.style = hudTextStyle

const gameOverText = new PIXI.Text('遊戲結束')
gameOverText.x = width / 2
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
  boundary: boundary,
  amplitude: [1, 5],
  waveLength: [80, 300],
  alpha: [0.5, 0],
  time: 5
})

app.stage.filters = [reflectionFilter]

const dropTextsPool = createPool((): DropText => ({
  elapsedTime: 0,
  text: new PIXI.Text(''),
  hasPassedBoundary: false
}), numberOfChars)

const resetText = (text: DropText): void => {
  text.text.text = getRandomItemFrom(commonEasyChars)
  text.text.style = getRandomItemFrom([dropTextStyle, dropTextStyle2])
  text.text.x = Math.random() * (app.screen.width - characterHeight)
  text.text.y = -characterHeight
  text.elapsedTime = 0
}

const particlesPool = createPool((): SplashParticle => {
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
  return {
    v: [0, 0],
    lifetime: 0,
    graphic
  }
}, numberOfParticles)

let lastAdded = 0
let lastGenParticle = 0

const removeCharText = (dropText: DropText) => {
  dropTextsPool.remove(dropText)
  container.removeChild(dropText.text)
  data.score += 100
}

app.ticker.add((delta) => {
  const boundaryY = app.screen.height * boundary
  const now = Date.now()

  if (dropTextsPool.items.length < numberOfChars && now - 3000 > lastAdded) {
    lastAdded = now
    dropTextsPool.initialize(text => {
      resetText(text)
      text.hasPassedBoundary = false
      container.addChild(text.text)
    })
  }

  dropTextsPool.items.forEach(text => {
    // text.y += 0.005 * ((text.y + 250)) * delta
    text.elapsedTime += delta
    dropChar(characterHeight, boundaryY, text)

    if (!text.hasPassedBoundary && text.text.y >= boundary * app.screen.height - characterHeight) {
      text.hasPassedBoundary = true
      data.lives--
    }

    if (text.text.y > boundaryY + characterHeight) {
      removeCharText(text)
    }
  })

  // Splash update
  particlesPool.forEachRight((particle, remove) => {
    const [vx, vy] = particle.v
    particle.graphic.x += vx
    particle.graphic.y += vy
    particle.graphic.alpha = particle.lifetime / 50
    particle.v[1] += delta * 0.5
    particle.lifetime -= delta

    if (particle.lifetime < 0 || particle.graphic.y > boundaryY + 5 + 4) {
      particleContainer.removeChild(particle.graphic)
      remove()
    }
  })

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

    for (let i = 0; i < app.screen.width; i += 3) {
      const color = boundaryRow[i]
      if (colorDistance(color, backgroundColor) > 400) {
        particlesPool.initialize(particle => {
          particle.graphic.tint = color
          particle.graphic.x = i
          particle.graphic.y = boundaryY
          const randomScale = Math.random() + 0.1
          particle.graphic.scale.x = randomScale
          particle.graphic.scale.y = randomScale
          particle.graphic.alpha = 1
          particle.lifetime = 50
          particle.v = [Math.random() * 5 - 2.5, Math.random() * 8 - 10]
          particleContainer.addChild(particle.graphic)
        })
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
    const targetTexts = dropTextsPool.items.filter(dropText =>
      inputChars.includes(dropText.text.text) && !dropText.hasPassedBoundary
    )
    if (targetTexts.length > 0) {
      targetTexts.forEach(dropText => {
        removeCharText(dropText)
      })

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
