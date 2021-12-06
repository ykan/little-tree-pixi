import { Graphics, Sprite, Text } from 'pixi.js';

export interface ButtonProps {
  text: string
}
export function createButton(props: ButtonProps) {
  const view = new Sprite()
  const text = new Text(props.text, {
    fontSize: 40,
    fill: 0x666666,
  })
  const bg = new Graphics()
  bg.beginFill(0xeeeeee)
  bg.drawRoundedRect(0, 0, text.width + 40, text.height + 20, 10)
  bg.endFill()

  text.x = 20
  text.y = 10

  view.addChild(bg)
  view.addChild(text)

  view.interactive = true
  view.cursor = 'pointer'

  view.on('pointerover', () => {
    bg.alpha = 0.5
  })
  view.on('pointerout', () => {
    bg.alpha = 1
  })
  return {
    view,
  }
}
