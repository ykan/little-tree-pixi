import { createAStarFinder, createGrid } from './createAStarFinder';

describe('测试创建网格', () => {
  test('create grid', () => {
    const grid = createGrid(4, 8)
    grid.setWalkable(0, 1, false)
  })
})

describe('测试 A* ', () => {
  test('find path', () => {
    const grid = createGrid(5, 5)
    grid.setWalkable(3, 1, false)
    grid.setWalkable(3, 2, false)
    grid.setWalkable(3, 3, false)
    const finder = createAStarFinder()
    const startNode = grid.getNodeAt(1, 2)
    const endNode = grid.getNodeAt(4, 3)
    const result = finder.findPath(startNode!, endNode!, grid)
    console.log(result)
    result.forEach((r) => {
      const node = grid.getNodeAt(r[0], r[1])
      if (node) {
        node.selected = true
      }
    })
    console.log(grid.toString())
  })
})
