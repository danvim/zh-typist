import { allOf, ProcessEntityDetails, System, UpdateDetails } from '../lib/System'
import { DropTextComponent } from '../components/DropTextComponent'
import { PixiComponent } from '../components/PixiComponent'
import { appHeight, boundaryRatio, boundaryY, characterHeight, dropInterval, numberOfChars } from '../logic/contants'
import { newDropText } from '../entities/dropText'
import { container, data } from '../../main'
import { dropChar } from '../logic/characters'

export class DropTextSystem extends System {
  coolDown = 0

  override entityMatcher = allOf(DropTextComponent, PixiComponent)

  override onUpdate ({deltaTime, engine}: UpdateDetails) {
    this.coolDown -= deltaTime

    if (this.coolDown < 0 && engine.mapperFor(DropTextComponent).getItems().length < numberOfChars) {
      this.coolDown = dropInterval

      newDropText(engine, container)
    }
  }

  override processEntity ({deltaTime, engine, findComponent, entityId}: ProcessEntityDetails): void {
    const dropText = findComponent(DropTextComponent)
    const textObj = findComponent(PixiComponent)

    if (dropText !== undefined && textObj?.obj !== undefined) {
      dropText.elapsedTime += deltaTime
      dropChar(characterHeight, boundaryY, dropText.elapsedTime, textObj.obj)

      if (!dropText.hasPassedBoundary && textObj.obj.y >= boundaryRatio * appHeight - characterHeight) {
        dropText.hasPassedBoundary = true
        data.lives--
      }

      if (textObj.obj.y > boundaryY + characterHeight) {
        engine.removeEntity(entityId)
      }
    }
  }
}