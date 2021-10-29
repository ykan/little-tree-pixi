import './main.css';

import { Application } from 'pixi.js';

import { createEntryScene } from './createEntryScene';
import { createMainScene } from './createMainScene';

async function main() {
  const app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x00ff00,
    backgroundAlpha: 0.5,
  })
  document.body.appendChild(app.view)
  const entryScene = createEntryScene(app)
  const mainScene = createMainScene(app)
  entryScene.enterLoadingView(() => {
    mainScene.startGame()
  })
}

main()
