export interface Heap<T> {
  // pop: () => T | undefined
  // push: (...items: T[]) => void
  // update: (item: T) => void
  /**
   * 如果一个节点比它的父节点大（最大堆）或者小（最小堆），那么需要将它同父节点交换位置。
   * 这样是这个节点在数组的位置上升。
   * @param pos
   */
  shiftUpOnce: (pos: number) => number
  /**
   * 如果一个节点比它的子节点小（最大堆）或者大（最小堆），那么需要将它向下移动。
   * 这个操作也称作“堆化（heapify）”。
   * @param pos
   */
  shiftDownOnce: (pos: number) => number
}

export type CompareFn<T> = (a: T, b: T) => number

export function createHeap<T>(compareFn: CompareFn<T>, initNodes?: T[]): Heap<T> {
  const nodes: T[] = initNodes || []

  const getParentIndex = (i: number) => Math.floor((i - 1) / 2)
  const getLeftIndex = (i: number) => 2 * i + 1
  const swap = (indexA: number, indexB: number) => {
    const a = nodes[indexA]
    const b = nodes[indexB]
    nodes[indexA] = b
    nodes[indexB] = a
  }

  const instance: Heap<T> = {
    // pop() {
    //   return nodes.pop()
    // },
    // push(...items) {},
    // update(item) {},
    shiftDownOnce(currentIndex) {
      const lastIndex = nodes.length - 1
      // 已经是最后一个节点了
      if (currentIndex === lastIndex) {
        return -1
      }
      let swapType: 'parent -> left' | 'parent -> right' = 'parent -> left'
      const leftIndex = getLeftIndex(currentIndex)
      const rightIndex = leftIndex + 1
      const left = nodes[leftIndex]
      const parent = nodes[currentIndex]
      if (leftIndex === lastIndex) {
        if (compareFn(parent, left) > 0) {
          return -1
        }
        swapType = 'parent -> left'
      } else {
        const right = nodes[rightIndex]
        const resultCompareParentLeft = compareFn(parent, left)
        const resultCompareParentRight = compareFn(parent, right)
        const resultCompareLeftRight = compareFn(left, right)
        if (resultCompareParentLeft >= 0 && resultCompareParentRight >= 0) {
          return -1
        }
        swapType = resultCompareLeftRight ? 'parent -> left' : 'parent -> right'
      }
      if (swapType === 'parent -> left') {
        swap(currentIndex, leftIndex)
        return leftIndex
      }
      swap(currentIndex, rightIndex)
      return rightIndex
    },
    shiftUpOnce(currentIndex) {
      const parentIndex = getParentIndex(currentIndex)
      if (parentIndex < 0) {
        return -1
      }
      const item = nodes[currentIndex]
      const parent = nodes[parentIndex]
      // 结束了
      if (compareFn(parent, item) >= 0) {
        return -1
      }

      swap(currentIndex, parentIndex)
      return parentIndex
    },
  }

  return instance
}
