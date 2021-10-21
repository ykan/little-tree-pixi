import 'normalize.css';
import './main.css';

import * as PIXI from 'pixi.js';

async function main() {
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x00ff00,
  })

  document.body.appendChild(app.view)

  app.ticker.add(() => {})

  app.loader.add('logo', 'assets/logo.png')
  app.loader.load((_, resources) => {
    // const bg = new PIXI.TilingSprite(resources.bg.texture!, app.view.width, app.view.height)
    // app.stage.addChild(bg)
  })
}

main()

// // load the texture we need
// app.loader.add('logo', 'assets/logo.png').load((loader, resources) => {
//   // This creates a texture from a 'bunny.png' image
//   const bunny = new Sprite(resources.logo.texture)

//   // Setup the position of the bunny
//   bunny.x = 100
//   bunny.y = 100

//   // Rotate around the center
//   bunny.anchor.x = 0.5
//   bunny.anchor.y = 0.5

//   // Add the bunny to the scene we are building
//   app.stage.addChild(bunny)

//   // Listen for frame updates
//   app.ticker.add(() => {
//     // each frame we spin the bunny around a bit
//     bunny.rotation += 0.01
//   })
// })
