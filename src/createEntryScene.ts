import { ease } from 'pixi-ease';
import { Application, LoaderResource, Text, TextStyle, utils } from 'pixi.js';

export function createEntryScene(app: Application) {
  const ratio = window.devicePixelRatio || 1
  const loadAssets = () =>
    new Promise<utils.Dict<LoaderResource>>((resolve) => {
      app.loader.load((_, res) => {
        resolve(res)
      })
    })

  const style = new TextStyle({
    fontSize: 100 * ratio,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#f2f2f2', '#00ff00'],
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: false,
    wordWrapWidth: 440,
    lineJoin: 'round',
  })

  const startButton = new Text('Start Game', style)

  return {
    async enterLoadingView(onStart?: () => void) {
      app.loader.add('logo', 'assets/logo.png')
      app.loader.add('map', 'assets/map.png')
      // tree
      app.loader.add('1-green', 'assets/1-green.png')
      app.loader.add('1-blue', 'assets/1-blue.png')
      app.loader.add('1-yellow', 'assets/1-yellow.png')
      app.loader.add('1-purple', 'assets/1-purple.png')
      app.loader.add('2-red', 'assets/2-red.png')
      app.loader.add('2-black', 'assets/2-black.png')
      // @TODO 设置 Loading 界面
      await loadAssets()
      startButton.x = (app.view.width - startButton.width) / 2
      startButton.y = (app.view.height - startButton.height) / 2
      startButton.interactive = true
      startButton.cursor = 'pointer'
      ease.add(
        startButton,
        { alpha: 0.5, y: startButton.y - 10, x: startButton.x + 5 },
        { repeat: true, duration: 1500, ease: 'easeInOutQuad', reverse: true }
      )
      const next = () => {
        ease.removeEase(startButton)
        app.stage.removeChild(startButton)
        onStart?.()
      }

      startButton.once('pointertap', next)

      app.stage.addChild(startButton)
      next()
    },
  }
}
