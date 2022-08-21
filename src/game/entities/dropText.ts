import { Engine } from '../lib/Engine'
import { DropTextComponent } from '../components/DropTextComponent'
import { PixiComponent } from '../components/PixiComponent'
import * as PIXI from 'pixi.js'
import { commonEasyChars, getRandomItemFrom } from '../logic/characters'
import { dropTextStyle, dropTextStyle2 } from '../styles/textStyle'
import { appWidth, characterHeight } from '../logic/contants'

export const newDropText = (engine: Engine, parent: PIXI.Container) => {
  const char = getRandomItemFrom(commonEasyChars)
  engine.newEntity()
    .addComponent(DropTextComponent, component => {
      component.text = char
    })
    .addComponent(PixiComponent, component => {
      const text = new PIXI.Text(char)
      text.style = getRandomItemFrom([dropTextStyle, dropTextStyle2])
      text.x = Math.random() * (appWidth - characterHeight)
      text.y = -characterHeight

      component.obj = text
      component.parent = parent
    })
}