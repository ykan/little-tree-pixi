import { Application, Sprite, TilingSprite } from 'pixi.js';

import { createGrid } from './createGrid';

type TreeType = '1-green' | '1-blue' | '1-purple' | '1-yellow' | '2-red' | '2-black'

export function createMainScene(app: Application) {
  // 一些常量
  const mapMargin = 20
  const mapSize = app.view.width - mapMargin * 2
  const rowNum = 8
  const blockSize = (mapSize / rowNum) >> 0

  // 全局地图
  const map = new Sprite()
  map.x = mapMargin
  map.y = 300

  function createTree(type: TreeType) {
    const view = new Sprite(app.loader.resources[type].texture)
    view.scale.set(blockSize / 90)
    const xDelta = (blockSize - view.width) / 2
    const yDelta = (blockSize - view.height) / 2

    let gridX = 0
    let gridY = 0

    return {
      view,
      moveTo(x: number, y: number) {
        gridX = x
        gridY = y
        view.x = x * blockSize + xDelta
        view.y = y * blockSize + yDelta
      },
      get gridX() {
        return gridX
      },
      get gridY() {
        return gridY
      },
    }
  }

  function startGame() {
    const mapBgTexture = app.loader.resources['map']?.texture
    const mapBg = new TilingSprite(mapBgTexture!, rowNum * 52, rowNum * 52)
    mapBg.scale.set(blockSize / 52, blockSize / 52)
    map.addChild(mapBg)
    app.stage.addChild(map)

    const tree = createTree('1-green')
    tree.moveTo(0, 0)
    map.addChild(tree.view)

    // const grid = createGrid(rowNum, rowNum)
  }
  return {
    startGame,
  }
}
