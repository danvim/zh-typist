import { EntityId } from './types'
import { Engine } from './Engine'
import { Component, ComponentConstructor } from './Component'

export interface UpdateDetails {
  engine: Engine
  deltaTime: number
}

export interface ProcessEntityDetails extends UpdateDetails {
  entityId: EntityId
  components: Component[]
  findComponent: <U extends Component>(Component: ComponentConstructor<U>) => U | undefined
}

export abstract class System {
  protected engine: Engine

  constructor (engine: Engine) {
    this.engine = engine
  }

  abstract entityMatcher(components: Component[]): boolean
  abstract processEntity(details: ProcessEntityDetails): void
  onUpdate(_: UpdateDetails): void {}
  onRegister(_: Engine): void {}
}

export const anyOf = <C extends [ComponentConstructor<any>, ...ComponentConstructor<any>[]]> (...Components: C) => (value: Component[]): boolean =>
  Components.some(Component => value.find(item => item instanceof Component))

export const allOf = <C extends [ComponentConstructor<any>, ...ComponentConstructor<any>[]]> (...Components: C) => (value: Component[]): boolean =>
  Components.every(Component => value.find(item => item instanceof Component))