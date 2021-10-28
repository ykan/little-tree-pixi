/**
 * 用于查找的节点
 */
export interface Node {
  x: number
  y: number
  walkable: boolean

  // 下面的属性重新查找的时候要重置
  /** 堆内已经遍历过了，不需要再遍历了 */
  closed: boolean

  /** 是否检查过当前节点 */
  checked: boolean
  /**
   * G = 从起点A，沿着产生的路径，移动到网格上指定方格的移动耗费。
   */
  g: number
  /**
   * H = 从网格上那个方格移动到终点B的预估移动耗费。
   */
  h: number
  /**
   * F = G + H
   */
  f: number
  /**
   * 用于最后输出路径节点的数组，单向链表
   */
  prev?: Node
}

export interface Grid {
  setWalkable: (x: number, y: number, val?: boolean) => void
  findPath: (startNode: Node, endNode: Node) => Node[]
}
