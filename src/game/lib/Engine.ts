import { Component, ComponentConstructor, findComponentIn } from './Component'
import { v4 as uuid } from 'uuid'
import { EntityId } from './types'
import { createPool, Pool2 } from './pool2'
import { System, UpdateDetails } from './System'

const defaultPoolSize = 20
const defaultPoolAllocationSize = 20

export class Engine {
  entities: Map<EntityId, Component[]> = new Map()

  private componentPoolsByType: Map<ComponentConstructor<any>, Pool2<any>> = new Map()
  private systems: Set<System> = new Set()

  newEntity (): EntityHandle {
    const entityId = uuid()
    const components: Component[] = []
    this.entities.set(entityId, components)
    return new EntityHandle(this, entityId)
  }

  removeEntity (entityId: EntityId): void {
    const components = this.entities.get(entityId)

    if (components !== undefined) {
      for (const component of components) {
        const pool = this.mapperFor(component.constructor as ComponentConstructor<any>)
        component.onRemove()
        pool.remove(component)
      }
      this.entities.delete(entityId)
    } else {
      console.log('Entity does not exist.')
    }
  }

  mapperFor<T extends Component> (Component: ComponentConstructor<T>): Pool2<T> {
    const componentFactory: () => T = () => new Component()

    let pool: Pool2<T>

    if (!this.componentPoolsByType.has(Component)) {
      pool = createPool(componentFactory, defaultPoolSize, defaultPoolAllocationSize)
      this.componentPoolsByType.set(Component, pool)
    } else {
      pool = this.componentPoolsByType.get(Component) as Pool2<T>
    }

    return pool
  }

  registerSystem (System: new(engine: Engine) => System) {
    const system = new System(this)
    this.systems.add(system)
    system.onRegister(this)
  }

  tick (deltaTime: number) {
    for (const system of this.systems) {
      const updateDetails: UpdateDetails = {
        engine: this,
        deltaTime
      }
      system.onUpdate(updateDetails)

      for (let [entityId, components] of this.entities.entries()) {
        if (system.entityMatcher(components)) {
          system.processEntity({
            ...updateDetails,
            entityId,
            components,
            findComponent: findComponentIn(components)
          })
        }
      }
    }
  }
}

export class EntityHandle {
  private readonly engine: Engine
  private readonly entityId: EntityId

  constructor (engine: Engine, entityId: EntityId) {
    this.engine = engine
    this.entityId = entityId
  }

  addComponent<T extends Component>(Component: ComponentConstructor<T>, setter?: (component: T) => void): this {
    const pool = this.engine.mapperFor(Component)

    this.engine.entities.get(this.entityId)?.push(pool.add(component => {
      component.onReset()
      setter?.(component)
      component.onCreate()
    }))

    return this
  }

  findComponent<T extends Component>(Component: ComponentConstructor<T>): T | undefined {
    return findComponentIn(this.engine.entities.get(this.entityId) ?? [])(Component)
  }
}