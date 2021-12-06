import { Graphics, Sprite, Text } from 'pixi.js';

export interface ButtonProps {
  text: string
  fontSize?: number
  color?: number
  bgColor?: number
  width?: number
  height?: number
  borderRadius?: number
}
export function createButton(props: ButtonProps) {
  const {
    text,
    color = 0x666666,
    bgColor = 0xeeeeee,
    fontSize = 40,
    borderRadius = 10,
    width,
    height,
  } = props
  const view = new Sprite()
  const textView = new Text(text, {
    fontSize,
    fill: color,
  })

  const bgWidth = width || textView.width + 40
  const bgHeight = height || textView.height + 20
  const bg = new Graphics()
  bg.beginFill(bgColor)
  bg.drawRoundedRect(0, 0, bgWidth, bgHeight, borderRadius)
  bg.endFill()

  textView.x = (bgWidth - textView.width) / 2
  textView.y = (bgHeight - textView.height) / 2

  view.addChild(bg)
  view.addChild(textView)

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
