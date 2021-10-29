import Heap from 'heap';

import { Grid, Node } from './types';

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
      }
    }
  }

  function getWalkableNodeAt(x: number, y: number) {
    const node = nodes[x]?.[y]
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

  const instance: Grid = {
    setWalkable(x: number, y: number, val = true) {
      const node = nodes[x]?.[y]
      if (node) {
        node.walkable = val
      }
    },
    findPath(startNode, endNode) {
      resetNodesForSearch()
      const openList = new Heap<Node>((nodeA, nodeB) => {
        return nodeA.f - nodeB.f
      })

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
          const resultPath: Node[] = [n]
          while (n.prev) {
            n = n.prev
            resultPath.unshift(n)
          }
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
