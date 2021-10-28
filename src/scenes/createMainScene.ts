import { Application, LoaderResource, utils } from 'pixi.js';

export function createEntryScene(app: Application) {
  app.loader.add('logo', 'assets/logo.png')
  const loadAssets = () =>
    new Promise<utils.Dict<LoaderResource>>((resolve) => {
      app.loader.load((_, res) => {
        resolve(res)
      })
    })

  return {
    loadAssets,
  }
}
