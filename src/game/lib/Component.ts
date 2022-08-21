export type ComponentConstructor<T extends Component> = new() => T

export abstract class Component {
  onReset() {}
  onRemove() {}
  onCreate() {}
}

export const findComponentIn = (components: Component[]) => <T extends Component>(Component: ComponentConstructor<T>): T | undefined =>
  components.find((component): component is T => component instanceof Component)

export const accessComponentIn = (components: Component[]) => <T extends Component>(Component: ComponentConstructor<T>, callback: (component: T) => void): void => {
  const component = findComponentIn(components)(Component)
  if (component !== undefined) {
    callback(component)
  }
}
