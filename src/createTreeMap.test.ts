import { createTreeMap, getPositions, getSameLineTree } from './createTreeMap';

describe('getPositinos', () => {
  test('8x8', () => {
    const result = getPositions(0, 0, 8)
    // console.log(result)
  })
})

describe('getSameLineTree', () => {
  test('8x8', () => {
    const result = getSameLineTree(
      [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 5],
        [6, 6],
        [7, 7],
      ],
      [
        { gridX: 1, gridY: 1, type: '1-blue' },
        { gridX: 2, gridY: 2, type: '1-blue' },
        { gridX: 4, gridY: 4, type: '1-blue' },
        { gridX: 5, gridY: 5, type: '1-blue' },
        { gridX: 6, gridY: 6, type: '1-blue' },
        { gridX: 7, gridY: 7, type: '1-blue' },
      ]
    )
    console.log(result)
  })
})

describe('createTreeMap', () => {
  const treeMap = createTreeMap()
  test('getCheckMap 有两个节点在同一直线上', () => {
    const result1 = treeMap.getCheckMap([
      { gridX: 3, gridY: 4, type: '1-blue' },
      { gridX: 3, gridY: 4, type: '1-blue' },
    ])
    const result2 = treeMap.getCheckMap([{ gridX: 3, gridY: 4, type: '1-blue' }])
    expect(result1['1-blue'].length === result2['1-blue'].length).toBe(true)
  })
  test('getCheckMap 当一行少于4个的时候不检查', () => {
    const result1 = treeMap.getCheckMap([{ gridX: 0, gridY: 0, type: '1-blue' }])
    expect(result1['1-blue'].length === 3).toBe(true)
  })
})
