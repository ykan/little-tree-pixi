import './main.css';

import { Application } from 'pixi.js';

import { createEntryScene } from './createEntryScene';
import { createMainScene } from './createMainScene';

async function main() {
  const ratio = window.devicePixelRatio || 1
  const app = new Application({
    width: window.innerWidth * ratio,
    height: window.innerHeight * ratio,
    backgroundColor: 0x80b70b,
  })
  document.body.appendChild(app.view)
  const entryScene = createEntryScene(app)
  const mainScene = createMainScene(app)
  entryScene.enterLoadingView(() => {
    mainScene.startGame()
  })
}

main()
