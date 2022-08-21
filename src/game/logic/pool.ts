export interface Pool<T> {
  items: T[],
  itemsRemoved: T[],
  remove: (item: T) => void,
  reset: (prepare: (item: T) => void) => void,
  forEachRight: (consumer: (item: T, remove: () => void) => void) => void
}

export const createPool = <T>(factory: () => T, length: number): Pool<T> => {
  const items: T[] = []
  const itemsRemoved: T[] = [...new Array(length)].map(factory)

  const remove = (item: T, i?: number) => {
    itemsRemoved.push(item)
    items.splice(i ?? items.indexOf(item), 1)
  }

  const initialize = (prepare: (item: T) => void) => {
    const item = itemsRemoved.pop()
    if (item !== undefined) {
      items.push(item)
      prepare(item)
    }
  }

  const forEachRight = (consumer: (item: T, remove: () => void) => void): void => {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]
      consumer(item, () => remove(item, i))
    }
  }

  return {
    items,
    itemsRemoved,
    remove,
    reset: initialize,
    forEachRight,
  }
}
