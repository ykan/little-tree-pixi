import { ease } from 'pixi-ease';
import { Application, Point, Sprite, Text, TilingSprite } from 'pixi.js';

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
  const ratio = window.devicePixelRatio || 1

  // 全局地图
  const map = new Sprite()
  map.x = mapX
  map.y = mapY

  const scoreView = new Text('Score:0', {
    fontSize: 60 * ratio,
    fill: ['#ffffff', '#00ff00'],
  })
  let totalScore = 0
  scoreView.x = mapX
  scoreView.y = 100

  // 全局网格
  const grid = createGrid(rowNum, rowNum)
  const treeMap = createTreeMap<Tree>()
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
      async remove() {
        grid.setWalkable(gridX, gridY)
        map.removeChild(view)
      },
      async shake() {
        ease.add(
          view,
          { rotation: -Math.PI / 12 },
          { repeat: true, duration: 50, ease: 'easeInOutQuad', reverse: true }
        )
        await waitTime(500)
        ease.removeEase(view)
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
  function randomAddTrees(level: 1 | 2, num?: number) {
    const treeTypes = level === 1 ? level1RandomTreeTypes : level2RandomTreeTypes
    const defaultGenerateNum = level === 1 ? 2 : 3
    const generateNum = num || defaultGenerateNum
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
    let i = walkableNodes.length > generateNum ? generateNum : walkableNodes.length
    const trees: Tree[] = []
    while (i > 0) {
      const [x, y] = randomPop()
      const treeType = treeTypes[(Math.random() * treeTypes.length) >> 0]
      const tree = createTree(treeType)
      tree.moveTo(x, y)
      map.addChild(tree.view)
      trees.push(tree)
      i--
    }
    return trees
  }

  async function checkTrees(trees: Tree[]) {
    const checkMap = treeMap.getCheckMap(trees)
    const removeMap = treeMap.check(checkMap)
    const removeTypes = Object.keys(removeMap)
    // console.log(`check trees`, trees.length)
    // console.log(`result`, removeMap)
    for (const removeType of removeTypes) {
      const removeTrees = removeMap[removeType]
      // console.log('removeTrees.length', removeTrees.length)
      for (const tree of removeTrees) {
        await tree.remove()
      }
      totalScore += removeTrees.length
    }
    scoreView.text = `Score:${totalScore * 10}`
  }

  function startGame() {
    const mapBgTexture = app.loader.resources['map']?.texture
    const mapBg = new TilingSprite(mapBgTexture!, rowNum * 52, rowNum * 52)
    mapBg.scale.set(blockSize / 52, blockSize / 52)
    mapBg.interactive = true
    map.addChild(mapBg)
    app.stage.addChild(map)
    app.stage.addChild(scoreView)

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

      gameStatus = 'moving'
      if (steps.length === 0) {
        await lastTree.shake()
        lastTree.endMove()
        lastTree = undefined
        gameStatus = 'play'
        return
      }
      const moveSpeed = Math.min(2400 / steps.length, 300)
      for (const step of steps) {
        const [x, y] = step
        lastTree.moveTo(x, y)
        await waitTime(moveSpeed)
      }
      lastTree.endMove()
      const trees = [lastTree]
      lastTree = undefined
      await checkTrees(trees)
      await waitTime(300)

      let nextLevel: 1 | 2 = 1
      let nextGenerateNum = 2
      if (totalScore > 40) {
        nextGenerateNum = 3
      }
      if (totalScore > 70) {
        nextLevel = 2
      }
      const newTrees = randomAddTrees(nextLevel, nextGenerateNum)
      await waitTime(600)
      if (newTrees?.length) {
        await checkTrees(newTrees)
      }
      gameStatus = 'play'
      // console.log('steps', steps)
    })

    randomAddTrees(1, 4)
  }
  return {
    startGame,
  }
}
