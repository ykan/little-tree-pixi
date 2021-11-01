import { Application, Point, Sprite, TilingSprite } from 'pixi.js';

import { createGrid } from './createGrid';
import { createTreeMap } from './createTreeMap';
import { waitTime } from './utils';

import type { TreeType, Tree } from './types'
type GameStatus = 'play' | 'moving'

export function createMainScene(app: Application) {
  // 一些常量
  const mapX = 20
  const mapY = 300
  const mapSize = app.view.width - mapX * 2
  const rowNum = 8
  const blockSize = (mapSize / rowNum) >> 0

  // 全局地图
  const map = new Sprite()
  map.x = mapX
  map.y = mapY

  // 全局网格
  const grid = createGrid(rowNum, rowNum)
  const treeMap = createTreeMap()
  let gameStatus: GameStatus = 'play'
  let startX = -1
  let startY = -1
  let endX = -1
  let endY = -1
  let lastTree: Tree | undefined

  function createTree(type: TreeType) {
    const view = new Sprite(app.loader.resources[type].texture)
    view.scale.set(blockSize / 90)
    view.interactive = true
    view.anchor.set(0.5)
    const xDelta = blockSize / 2
    const yDelta = blockSize / 2

    let gridX = -1
    let gridY = -1

    const instance: Tree = {
      startMove() {
        view.rotation = Math.PI / 12
      },
      endMove() {
        view.rotation = 0
      },
      moveTo(x: number, y: number) {
        if (gridX > -1) {
          grid.setWalkable(gridX, gridY)
        }
        gridX = x
        gridY = y
        view.x = x * blockSize + xDelta
        view.y = y * blockSize + yDelta
        grid.setWalkable(x, y, false)
      },
      get type() {
        return type
      },
      get view() {
        return view
      },
      get gridX() {
        return gridX
      },
      get gridY() {
        return gridY
      },
    }
    treeMap.push(instance)
    view.on('pointertap', () => {
      if (gameStatus !== 'play') {
        return
      }
      if (lastTree) {
        lastTree.endMove()
      }
      if (lastTree === instance) {
        lastTree = undefined
        return
      }
      instance.startMove()
      startX = instance.gridX
      startY = instance.gridY
      lastTree = instance
    })
    return instance
  }

  // 分阶段产生不同类型的 tree
  const level1RandomTreeTypes: TreeType[] = ['1-green', '1-blue', '1-purple', '1-yellow']
  const level2RandomTreeTypes: TreeType[] = [
    '1-green',
    '1-blue',
    '1-purple',
    '1-yellow',
    '2-red',
    '2-black',
  ]
  function randomAddTrees(level: 1 | 2) {
    const treeTypes = level === 1 ? level1RandomTreeTypes : level2RandomTreeTypes
    let walkableNodes = grid.getWalkableNodes()
    if (walkableNodes.length === 0) {
      return
    }
    const randomPop = () => {
      const i = (Math.random() * walkableNodes.length) >> 0
      const result = walkableNodes[i]
      walkableNodes = walkableNodes.filter((n) => n !== result)
      return result
    }
    let i = walkableNodes.length > 4 ? 4 : walkableNodes.length
    while (i > 0) {
      const [x, y] = randomPop()
      const treeType = treeTypes[(Math.random() * treeTypes.length) >> 0]
      const tree = createTree(treeType)
      tree.moveTo(x, y)
      map.addChild(tree.view)
      i--
    }
  }

  function startGame() {
    const mapBgTexture = app.loader.resources['map']?.texture
    const mapBg = new TilingSprite(mapBgTexture!, rowNum * 52, rowNum * 52)
    mapBg.scale.set(blockSize / 52, blockSize / 52)
    mapBg.interactive = true
    map.addChild(mapBg)
    app.stage.addChild(map)

    mapBg.on('pointertap', async (e) => {
      if (gameStatus !== 'play' || !lastTree) {
        return
      }
      const mousePointer = e.data.global as Point
      endX = ((mousePointer.x - mapX) / blockSize) >> 0
      endY = ((mousePointer.y - mapY) / blockSize) >> 0
      console.log('start search path')
      const steps = grid.findPath({
        startX,
        startY,
        endX,
        endY,
      })
      if (steps.length === 0) {
        console.log('没有路径')
        return
      }
      gameStatus = 'moving'
      for (const step of steps) {
        const [x, y] = step
        lastTree.moveTo(x, y)
        await waitTime(300)
      }
      lastTree.endMove()
      lastTree = undefined

      randomAddTrees(1)
      gameStatus = 'play'
      // console.log('steps', steps)
    })

    randomAddTrees(1)
  }
  return {
    startGame,
  }
}
