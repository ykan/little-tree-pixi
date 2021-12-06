import { ease } from 'pixi-ease';
import { Application, Graphics, Point, Sprite, Text, TilingSprite } from 'pixi.js';

import { createButton } from './createButton';
import { createGrid } from './createGrid';
import { createTreeMap } from './createTreeMap';
import { waitTime } from './utils';

import type { TreeType, Tree } from './types'
type GameStatus = 'play' | 'moving'

export function createMainScene(app: Application) {
  // 一些常量
  const ratio = window.devicePixelRatio || 1
  const mapX = 20 * ratio
  const mapY = 300 * ratio
  const mapSize = app.view.width - mapX * 2
  const rowNum = 8
  const blockSize = (mapSize / rowNum) >> 0

  // 全局地图
  const map = new Sprite()
  map.x = mapX
  map.y = mapY

  const scoreView = new Text('Score:0', {
    fontSize: 60 * ratio,
    fill: 0x333333,
  })
  let totalScore = 0
  scoreView.x = mapX
  scoreView.y = mapY - 120 * ratio

  // 全局网格
  let grid = createGrid(rowNum, rowNum)
  const treeMap = createTreeMap<Tree>()
  let gameStatus: GameStatus = 'play'
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
      destroy() {
        map.removeChild(view)
        view.removeAllListeners()
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
        if (tree.type === '2-black' || tree.type === '2-red') {
          totalScore += 2
        } else {
          totalScore += 1
        }
      }
    }
    scoreView.text = `Score:${totalScore * 10}`
  }

  function createModal() {
    const modal = new Sprite()
    const modalBg = new Graphics()
    modalBg.beginFill(0x000000, 0.7)
    modalBg.drawRect(0, 0, app.view.width, app.view.height)
    modal.addChild(modalBg)

    const resultTitle = new Text('Game Over!', {
      fontSize: 100 * ratio,
      fill: 0xf1d619,
      fontStyle: 'italic',
      fontWeight: 'bold',
    })

    resultTitle.y = app.view.height / 2.5
    resultTitle.x = (app.view.width - resultTitle.width) / 2

    modal.addChild(resultTitle)

    const restartBtn = createButton({
      text: 'Restart',
      fontSize: 60 * ratio,
      width: 300 * ratio,
      height: 100 * ratio,
      borderRadius: 20 * ratio,
    })

    restartBtn.view.x = (app.view.width - 300 * ratio) / 2
    restartBtn.view.y = resultTitle.y + 200 * ratio

    modal.addChild(restartBtn.view)
    return {
      modal,
      restartBtn,
    }
  }
  const modal = createModal()

  async function gameOver() {
    app.stage.addChild(modal.modal)
    modal.restartBtn.view.on('pointertap', () => {
      modal.restartBtn.view.removeAllListeners()
      app.stage.removeChild(modal.modal)
      restart()
    })
  }
  async function restart() {
    const trees = treeMap.trees
    trees.forEach((tree) => tree.destroy())

    treeMap.reset()
    grid = createGrid(rowNum, rowNum)
    gameStatus = 'play'
    totalScore = 0
    scoreView.text = `Score:${totalScore * 10}`
    randomAddTrees(1, 4)
  }

  async function moveLastTreeTo(endX: number, endY: number) {
    if (gameStatus !== 'play' || !lastTree) {
      return
    }
    const startX = lastTree.gridX
    const startY = lastTree.gridY
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
    // nextGenerateNum = 20
    const newTrees = randomAddTrees(nextLevel, nextGenerateNum)
    await waitTime(600)
    if (newTrees?.length) {
      await checkTrees(newTrees)
    }
    const walkableNodes = grid.getWalkableNodes()
    if (walkableNodes.length === 0) {
      // game over
      gameOver()
      return
    }
    gameStatus = 'play'
  }

  function startGame() {
    const mapBgTexture = app.loader.resources['map']?.texture
    const mapBg = new TilingSprite(mapBgTexture!, rowNum * 52, rowNum * 52)
    const btn = createButton({
      text: 'Restart',
      fontSize: 60 * ratio,
      width: 300 * ratio,
      height: 100 * ratio,
      borderRadius: 20 * ratio,
    })
    btn.view.x = app.view.width / 2 - 150 * ratio
    btn.view.y = mapY + mapSize + 20 * ratio

    mapBg.scale.set(blockSize / 52, blockSize / 52)
    mapBg.interactive = true
    map.addChild(mapBg)

    app.stage.addChild(btn.view)
    app.stage.addChild(map)
    app.stage.addChild(scoreView)

    btn.view.on('pointertap', restart)

    mapBg.on('pointertap', (e) => {
      const mousePointer = e.data.global as Point
      const endX = ((mousePointer.x - mapX) / blockSize) >> 0
      const endY = ((mousePointer.y - mapY) / blockSize) >> 0
      moveLastTreeTo(endX, endY)
      // console.log('steps', steps)
    })

    randomAddTrees(1, 4)
  }
  return {
    startGame,
  }
}
