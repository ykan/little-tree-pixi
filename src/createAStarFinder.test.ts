import { createGrid } from './createAStarFinder';

describe('测试创建网格', () => {
  test('create grid', () => {
    const grid = createGrid(4, 8)
    grid.setWalkable(0, 1, false)
    console.log(grid.toString())
  })
})
