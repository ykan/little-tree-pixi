import type { Tree } from './types'

export type BaseTree = Pick<Tree, 'gridX' | 'gridY' | 'type'>
export type CheckMap = Record<string, [number, number][][]>
export function getPositions(gridX: number, gridY: number, gridSize: number) {
  // 4个方向
  // x 轴平行
  // [0, gridY], [1, gridY],
  const row1: [number, number][] = []
  for (let i = 0; i < gridSize; i++) {
    row1.push([i, gridY])
  }
  // y 轴平行
  const row2: [number, number][] = []
  for (let i = 0; i < gridSize; i++) {
    row2.push([gridX, i])
  }
  // y = x + c
  const row3: [number, number][] = []
  const c = gridY - gridX
  for (let i = 0; i < gridSize; i++) {
    const y = i + c
    if (y >= 0 && y < gridSize) {
      row3.push([i, y])
    }
  }
  // y = -x + d
  const row4: [number, number][] = []
  const d = gridY + gridX
  for (let i = 0; i < gridSize; i++) {
    const y = d - i
    if (y >= 0 && y < gridSize) {
      row4.push([i, y])
    }
  }
  return [row1, row2, row3, row4]
}

export function pointInclude(point: [number, number], points: [number, number][]) {
  for (const p of points) {
    if (p[0] === point[0] && p[1] === point[1]) {
      return true
    }
  }
  return false
}
export function hasTree<T extends BaseTree = BaseTree>(point: [number, number], trees: T[]) {
  for (const tree of trees) {
    if (tree.gridX === point[0] && tree.gridY === point[1]) {
      return true
    }
  }
  return false
}
export function getSameLineTree<T extends BaseTree = BaseTree>(
  row: [number, number][],
  trees: T[]
) {
  let maxSizeLine: [number, number][] = []
  let currentSizeLine: [number, number][] = []
  row.forEach((p) => {
    if (hasTree(p, trees)) {
      currentSizeLine.push(p)
    } else if (currentSizeLine.length > maxSizeLine.length) {
      maxSizeLine = currentSizeLine
      currentSizeLine = []
    }
  })
  if (currentSizeLine.length > maxSizeLine.length) {
    maxSizeLine = currentSizeLine
  }
  return maxSizeLine
}

export function createTreeMap<T extends BaseTree = BaseTree>(treeLimitNum = 4, rowNum = 8) {
  const innerTreeMap: Record<string, T[]> = {}
  const instance = {
    push(tree: T) {
      if (!innerTreeMap[tree.type]) {
        innerTreeMap[tree.type] = [tree]
      } else {
        innerTreeMap[tree.type].push(tree)
      }
    },
    getCheckMap(trees: T[]) {
      const checkMap: CheckMap = {}
      // 根据要检查的 Tree ，来获取要检查的行列和45度方向
      trees.forEach((tree) => {
        const firstItems: [number, number][] = []
        if (!checkMap[tree.type]) {
          checkMap[tree.type] = []
        } else {
          checkMap[tree.type].forEach((row) => {
            firstItems.push(row[0])
          })
        }
        const checkRows = getPositions(tree.gridX, tree.gridY, rowNum)
        checkRows.forEach((checkRow) => {
          if (checkRow.length < treeLimitNum) {
            return
          }
          if (pointInclude(checkRow[0], firstItems)) {
            return
          }
          checkMap[tree.type].push(checkRow)
        })
      })
      return checkMap
    },
    check(checkMap: CheckMap) {
      const types = Object.keys(checkMap)
      const removeMap: Record<string, T[]> = {}
      types.forEach((treeType) => {
        const result: [number, number][] = []
        const rows = checkMap[treeType]
        const trees = innerTreeMap[treeType]
        if (trees.length < treeLimitNum) {
          return
        }
        rows.forEach((row) => {
          const maxLine = getSameLineTree(row, trees)
          console.log(treeType, maxLine)
          if (maxLine.length >= treeLimitNum) {
            result.push(...maxLine)
          }
        })
        const newTrees: T[] = []
        const removeTrees: T[] = []
        trees.forEach((tree) => {
          const treePoint: [number, number] = [tree.gridX, tree.gridY]
          if (pointInclude(treePoint, result)) {
            removeTrees.push(tree)
          } else {
            newTrees.push(tree)
          }
        })
        innerTreeMap[treeType] = newTrees
        removeMap[treeType] = removeTrees
      })
      return removeMap
    },
  }

  return instance
}
