import 'normalize.css';
import './main.css';

import { Application, Graphics, LoaderResource, Sprite, utils } from 'pixi.js';

interface MapBlock {
  status: 'normal' | 'active' | 'disabled'
  block: Sprite
}
function createMapBlock(blockSize: number): MapBlock {
  const block = new Sprite()
  const normalGraphics = new Graphics()
  normalGraphics.lineStyle(2, 0xffffff, 1)
  normalGraphics.beginFill(0xf2f2f2)
  normalGraphics.drawRect(0, 0, blockSize, blockSize)
  normalGraphics.endFill()
  const activeGraphics = new Graphics()
  activeGraphics.beginFill(0x1a7af8, 0.5)
  activeGraphics.drawRect(0, 0, blockSize, blockSize)
  activeGraphics.endFill()
  activeGraphics.visible = false
  const disabledGraphics = new Graphics()
  disabledGraphics.lineStyle(2, 0xffffff, 1, 0.5)
  disabledGraphics.beginFill(0x999999)
  disabledGraphics.drawRect(0, 0, blockSize, blockSize)
  disabledGraphics.endFill()
  disabledGraphics.visible = false

  block.addChild(normalGraphics)
  block.addChild(disabledGraphics)
  block.addChild(activeGraphics)

  block.interactive = true

  block.on('pointertap', () => {
    if (activeGraphics.visible) {
      activeGraphics.visible = false
    } else {
      activeGraphics.visible = true
    }
  })

  return {
    status: 'normal',
    block,
  }
}

async function main() {
  const app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x00ff00,
    backgroundAlpha: 0.7,
  })

  document.body.appendChild(app.view)
  app.loader.add('logo', 'assets/logo.png')

  const loadAssets = () =>
    new Promise<utils.Dict<LoaderResource>>((resolve) => {
      app.loader.load((_, res) => {
        resolve(res)
      })
    })

  const resources = await loadAssets()
  const mainMap = new Sprite()
  const mapSize = app.view.width - 20
  const blockN = 10
  const blockSize = mapSize / blockN
  for (let i = 0; i < blockN; i++) {
    for (let j = 0; j < blockN; j++) {
      const item = createMapBlock(blockSize)
      item.block.x = i * blockSize
      item.block.y = j * blockSize
      mainMap.addChild(item.block)
    }
  }
  mainMap.x = 10
  mainMap.y = 200

  app.stage.addChild(mainMap)
}

main()
