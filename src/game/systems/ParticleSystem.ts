import { allOf, ProcessEntityDetails, System } from '../lib/System'
import { SplashParticleComponent } from '../components/SplashParticleComponent'
import { PixiComponent } from '../components/PixiComponent'
import { boundaryY } from '../logic/contants'

export class ParticleSystem extends System {
  override entityMatcher = allOf(SplashParticleComponent, PixiComponent)

  override processEntity ({ findComponent, deltaTime, engine, entityId }: ProcessEntityDetails) {
    const particle = findComponent(SplashParticleComponent)
    const pixiObj = findComponent(PixiComponent)

    if (particle !== undefined && pixiObj?.obj !== undefined) {
      const [vx, vy] = particle.v
      pixiObj.obj.x += vx
      pixiObj.obj.y += vy
      pixiObj.obj.alpha = particle.lifetime / 50
      particle.v[1] += deltaTime * 0.5
      particle.lifetime -= deltaTime

      if (particle.lifetime < 0 || pixiObj.obj.y > boundaryY + 5 + 4) {
        pixiObj.parent?.removeChild(pixiObj.obj)
        engine.removeEntity(entityId)
      }
    }
  }
}
