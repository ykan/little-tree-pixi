import { ease } from 'pixi-ease';
import { Application, LoaderResource, Text, TextStyle, utils } from 'pixi.js';

export function createEntryScene(app: Application) {
  const loadAssets = () =>
    new Promise<utils.Dict<LoaderResource>>((resolve) => {
      app.loader.load((_, res) => {
        resolve(res)
      })
    })

  const style = new TextStyle({
    fontSize: 100,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'], // gradient
    stroke: '#4a1850',
    strokeThickness: 5,
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
    async enterLoadingView() {
      app.loader.add('logo', 'assets/logo.png')
      // @TODO 设置 Loading 界面
      await loadAssets()
      startButton.x = (app.view.width - startButton.width) / 2
      startButton.y = (app.view.height - startButton.height) / 2
      startButton.interactive = true
      ease.add(
        startButton,
        { alpha: 0.5, y: startButton.y - 10, x: startButton.x + 5 },
        { repeat: true, duration: 1500, ease: 'easeInOutQuad', reverse: true }
      )

      startButton.once('pointertap', () => {
        app.stage.removeChild(startButton)
      })

      app.stage.addChild(startButton)
    },
  }
}
