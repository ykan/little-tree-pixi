import Heap from 'heap';

interface Node {
  x: number
  y: number
  walkable: boolean
  closed?: boolean
  opened?: boolean
  selected?: boolean
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
  parent?: Node
}

function manhattan(dx: number, dy: number) {
  return dx + dy
}

/**
 * Backtrace according to the parent records and return the path.
 * (including both start and end nodes)
 * @param {Node} node End node
 * @return {Array<Array<number>>} the path
 */
function backtrace(node: Node) {
  const path = [[node.x, node.y]]
  let n = node
  while (n.parent) {
    n = n.parent
    path.push([n.x, n.y])
  }
  return path.reverse()
}

export function createGrid(colNum: number, rowNum: number) {
  const nodes: Node[][] = []
  const buildNodes = () => {
    for (let i = 0; i < colNum; i++) {
      if (!nodes[i]) {
        nodes[i] = []
      }
      for (let j = 0; j < rowNum; j++) {
        const node: Node = {
          x: i,
          y: j,
          f: 0,
          g: 0,
          h: 0,
          walkable: true,
        }
        nodes[i][j] = node
      }
    }
  }

  const instance = {
    reset() {
      buildNodes()
    },
    setWalkable(x: number, y: number, val = true) {
      const node = instance.getNodeAt(x, y)
      if (node) {
        node.walkable = val
      }
    },
    getNodeAt(x: number, y: number): Node | undefined {
      return nodes[x]?.[y]
    },
    getWalkableNodeAt(x: number, y: number) {
      const node = instance.getNodeAt(x, y)
      if (node?.walkable) {
        return node
      }
    },
    // 这里先只实现 4 方向
    getNeighbors(node: Node) {
      const neighbors = [
        instance.getWalkableNodeAt(node.x - 1, node.y),
        instance.getWalkableNodeAt(node.x + 1, node.y),

        instance.getWalkableNodeAt(node.x, node.y - 1),
        instance.getWalkableNodeAt(node.x, node.y + 1),
      ]
      return neighbors.filter((n) => !!n) as Node[]
    },
    toString() {
      const rows = nodes.map((row) => {
        const nums = row.map((item) => {
          if (item.selected) {
            return 2
          }
          if (item.walkable) {
            return 0
          }
          return 1
        })
        return nums.join(' ')
      })
      return rows.join('\n')
    },
  }
  instance.reset()

  return instance
}

export type Grid = ReturnType<typeof createGrid>

interface AStarFinderOptions {
  weight?: number
  heuristic?: (dx: number, dy: number) => number
}

export function createAStarFinder(opts: AStarFinderOptions = {}) {
  const innerWeight = opts.weight || 1
  const heuristic = opts.heuristic || manhattan
  return {
    findPath(startNode: Node, endNode: Node, grid: Grid) {
      const openList = new Heap<Node>((nodeA, nodeB) => {
        return nodeA.f - nodeB.f
      })

      // set the `g` and `f` value of the start node to be 0
      startNode.g = 0
      startNode.f = 0

      // push the start node into the open list
      openList.push(startNode)
      startNode.opened = true

      // while the open list is not empty
      while (!openList.empty()) {
        // pop the position of node which has the minimum `f` value.
        const node = openList.pop()
        node.closed = true

        // if reached the end position, construct the path and return it
        if (node === endNode) {
          return backtrace(endNode)
        }

        // get neigbours of the current node
        const neighbors = grid.getNeighbors(node)
        for (let i = 0, l = neighbors.length; i < l; i++) {
          const neighbor = neighbors[i]

          if (neighbor.closed) {
            continue
          }

          // get the distance between current node and the neighbor
          // and calculate the next g score
          const ng =
            node.g + (neighbor.x - node.x === 0 || neighbor.y - node.y === 0 ? 1 : Math.SQRT2)

          // check if the neighbor has not been inspected yet, or
          // can be reached with smaller cost from the current node
          if (!neighbor.opened || ng < neighbor.g) {
            neighbor.g = ng
            neighbor.h =
              neighbor.h ||
              innerWeight *
                heuristic(Math.abs(neighbor.x - endNode.x), Math.abs(neighbor.y - endNode.y))
            neighbor.f = neighbor.g + neighbor.h
            neighbor.parent = node

            if (!neighbor.opened) {
              openList.push(neighbor)
              neighbor.opened = true
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
}
