import { Sprite } from 'pixi.js';

export type TreeType = '1-green' | '1-blue' | '1-purple' | '1-yellow' | '2-red' | '2-black'
export interface Tree {
  startMove: () => void
  endMove: () => void
  moveTo: (x: number, y: number) => void

  readonly view: Sprite
  readonly type: TreeType
  readonly gridX: number
  readonly gridY: number
}
