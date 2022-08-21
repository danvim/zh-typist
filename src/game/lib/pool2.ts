export interface Pool2<T> {
  add: (prepare: (item: T) => void) => T
  remove: (item: T) => void
  forEach: (consumer: (item: T, remove: () => void) => void) => void
  allocateMore: (length: number) => void
  getItems: () => T[]
}

export const createPool = <T>(factory: () => T, length: number, allocationBlock: number): Pool2<T> => {
  const items: T[] = Array.from(Array(length)).map(factory)
  const removedIndexes = new Set<number>(items.keys())

  const allocateMore: Pool2<T>['allocateMore'] = (length) => {
    const newItems = Array.from(Array(length)).map(factory)
    const itemsLength = items.length
    items.push(...newItems)
    newItems.forEach((_, i) => removedIndexes.add(i + itemsLength))
  }

  const remove: Pool2<T>['remove'] = (item) => {
    removedIndexes.add(items.indexOf(item))
  }

  const forEach: Pool2<T>['forEach'] = (consumer) => {
    for (let i = items.length - 1; i >= 0; i--) {
      if (!removedIndexes.has(i)) {
        const item = items[i]
        consumer(item, () => remove(item))
      }
    }
  }

  const add: Pool2<T>['add'] = (prepare) => {
    const {done, value: i} = removedIndexes.keys().next()
    if (done) {
      allocateMore(allocationBlock)
      return add(prepare)
    }
    removedIndexes.delete(i)
    const item = items[i]
    prepare(item)
    return item
  }

  const getItems: Pool2<T>['getItems'] = () => items.filter((_, i) => !removedIndexes.has(i))

  return {
    add,
    remove,
    forEach,
    allocateMore,
    getItems
  }
}
