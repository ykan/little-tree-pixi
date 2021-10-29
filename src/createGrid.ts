import Heap from 'heap';

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

function manhattan(a: Node, b: Node) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

export function createGrid(colNum: number, rowNum: number) {
  const nodes: Node[][] = []
  function buildNodes() {
    for (let i = 0; i < colNum; i++) {
      if (!nodes[i]) {
        nodes[i] = []
      }
      for (let j = 0; j < rowNum; j++) {
        const node: Node = {
          x: i,
          y: j,
          walkable: true,
          f: 0,
          g: 0,
          h: 0,
          closed: false,
          checked: false,
        }
        nodes[i][j] = node
      }
    }
  }

  function resetNodesForSearch() {
    for (let i = 0; i < colNum; i++) {
      for (let j = 0; j < rowNum; j++) {
        const node: Node = nodes[i][j]
        node.f = 0
        node.g = 0
        node.h = 0
        node.closed = false
        node.checked = false
        node.prev = undefined
      }
    }
  }
  function getNodeAt(x: number, y: number): Node | undefined {
    return nodes[x]?.[y]
  }

  function getWalkableNodeAt(x: number, y: number) {
    const node = getNodeAt(x, y)
    if (node?.walkable) {
      return node
    }
  }

  function getNeighbors(node: Node) {
    const neighbors = [
      getWalkableNodeAt(node.x - 1, node.y),
      getWalkableNodeAt(node.x + 1, node.y),

      getWalkableNodeAt(node.x, node.y - 1),
      getWalkableNodeAt(node.x, node.y + 1),
    ]
    return neighbors.filter((n) => !!n) as Node[]
  }

  const instance = {
    getNodeAt,
    setWalkable(x: number, y: number, val = true) {
      const node = getNodeAt(x, y)
      if (node) {
        node.walkable = val
      }
    },
    getWalkableNodes() {
      const walkableNodes: [number, number][] = []
      for (let i = 0; i < colNum; i++) {
        for (let j = 0; j < rowNum; j++) {
          const node = getNodeAt(i, j)
          if (node?.walkable) {
            walkableNodes.push([node.x, node.y])
          }
        }
      }
      return walkableNodes
    },
    findPath({
      startX,
      startY,
      endX,
      endY,
    }: {
      startX: number
      startY: number
      endX: number
      endY: number
    }): [number, number][] {
      resetNodesForSearch()
      const openList = new Heap<Node>((nodeA, nodeB) => {
        return nodeA.f - nodeB.f
      })
      const startNode = getNodeAt(startX, startY)!
      const endNode = getNodeAt(endX, endY)!

      // push the start node into the open list
      openList.push(startNode)
      startNode.checked = true

      // while the open list is not empty
      while (!openList.empty()) {
        // pop the position of node which has the minimum `f` value.
        const node = openList.pop()
        node.closed = true

        // if reached the end position, construct the path and return it
        if (node === endNode) {
          let n = node
          const resultPath: [number, number][] = [[n.x, n.y]]
          while (n.prev) {
            n = n.prev
            resultPath.unshift([n.x, n.y])
          }
          return resultPath
        }

        // get neigbours of the current node
        const neighbors = getNeighbors(node)
        for (let i = 0, l = neighbors.length; i < l; i++) {
          const neighbor = neighbors[i]

          if (neighbor.closed) {
            continue
          }

          // get the distance between current node and the neighbor
          // and calculate the next g score
          const new_g = node.g + 1

          // check if the neighbor has not been inspected yet, or
          // can be reached with smaller cost from the current node
          if (!neighbor.checked || new_g < neighbor.g) {
            neighbor.g = new_g
            neighbor.h = neighbor.h || manhattan(node, neighbor)
            neighbor.f = neighbor.g + neighbor.h
            neighbor.prev = node

            if (!neighbor.checked) {
              openList.push(neighbor)
              neighbor.checked = true
            } else {
              // the neighbor can be reached with smaller cost.
              // Since its f value has been updated, we have to
              // update its position in the open list
              openList.updateItem(neighbor)
            }
          }
        } // end for each neighbor
      } // end while not open list empty

      // fail to find the path
      return []
    },
  }

  buildNodes()

  return instance
}
