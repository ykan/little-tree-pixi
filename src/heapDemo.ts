import './heapDemo.css';

import { ease } from 'pixi-ease';
import { Application, Graphics, Sprite, Text } from 'pixi.js';

import { createButton } from './createButton';

interface NodeOption {
  level: number
  levelIndex: number
  value?: number
}
async function main() {
  const ratio = window.devicePixelRatio || 1
  const app = new Application({
    width: window.innerWidth * ratio,
    height: window.innerHeight * ratio,
    backgroundColor: 0xffffff,
  })
  document.body.appendChild(app.view)

  function createNode({ value, level, levelIndex }: NodeOption) {
    const view = new Sprite()
    const g = new Graphics()
    const text = new Text('', {
      fill: 0x666666,
      fontSize: 30,
    })
    const innerValue = value ? value : Math.floor(Math.random() * 100)

    function renderBg(color = 0xf2f2f2) {
      g.clear()
      g.beginFill(color)
      g.drawCircle(0, 0, 30)
      g.endFill()
    }
    renderBg()

    view.addChild(g)
    text.text = innerValue.toString()
    text.x = -text.width / 2
    text.y = -text.height / 2
    view.addChild(text)

    const levelNum = 1 << level
    const padding = (app.view.width - 100) / (levelNum + 1)

    view.x = 50 + (levelIndex + 1) * padding
    view.y = 100 + level * 120

    const instance = {
      get value() {
        return innerValue
      },
      get view() {
        return view
      },
      moveTo(x: number, y: number) {
        return new Promise<void>((resolve) => {
          renderBg(0xdddddd)
          const animation = ease.add(
            view,
            {
              x,
              y,
            },
            {
              duration: 1000,
            }
          )
          animation.once('complete', () => {
            ease.removeEase(view)
            renderBg()
            resolve()
          })
        })
      },
    }

    return instance
  }

  type Node = ReturnType<typeof createNode>

  function createNodes(num: number) {
    let i = 0
    let level = 0
    let levelCount = 0
    let maxNum = 1 << level
    const nodes: Node[] = []
    while (i < num) {
      if (levelCount >= maxNum) {
        level++
        levelCount = 0
        maxNum = 1 << level
      }
      const node = createNode({ level, levelIndex: levelCount })
      app.stage.addChild(node.view)
      nodes.push(node)
      levelCount++
      i++
    }
    return nodes
  }
  const nodeLength = 27
  const nodes = createNodes(nodeLength)

  const getParentIndex = (i: number) => Math.floor((i - 1) / 2)
  const getLeftIndex = (i: number) => 2 * i + 1

  function compareFn(a: Node, b: Node) {
    return a.value - b.value
  }

  async function swap(aIndex: number, bIndex: number) {
    const aNode = nodes[aIndex]
    const bNode = nodes[bIndex]
    const aX = aNode.view.x
    const aY = aNode.view.y
    const bX = bNode.view.x
    const bY = bNode.view.y
    await Promise.all([aNode.moveTo(bX, bY), bNode.moveTo(aX, aY)])
    console.log('swap', aIndex, bIndex)
    console.log('swap-v', aNode.value, bNode.value)
    nodes[aIndex] = bNode
    nodes[bIndex] = aNode
  }

  async function shiftDown(currentIndex: number) {
    // console.log('shiftDown', currentIndex)
    const lastIndex = nodes.length - 1
    // 已经是最后一个节点了
    if (currentIndex === lastIndex) {
      return -1
    }
    let swapType: 'parent -> left' | 'parent -> right' = 'parent -> left'
    const leftIndex = getLeftIndex(currentIndex)
    const rightIndex = leftIndex + 1
    const left = nodes[leftIndex]
    const parent = nodes[currentIndex]
    if (leftIndex > lastIndex) {
      return -1
    } else if (leftIndex === lastIndex) {
      if (compareFn(parent, left) > 0) {
        return -1
      }
      swapType = 'parent -> left'
    } else {
      const right = nodes[rightIndex]
      const resultCompareParentLeft = compareFn(parent, left)
      const resultCompareParentRight = compareFn(parent, right)
      const resultCompareLeftRight = compareFn(left, right)
      if (resultCompareParentLeft >= 0 && resultCompareParentRight >= 0) {
        return -1
      }
      swapType = resultCompareLeftRight >= 0 ? 'parent -> left' : 'parent -> right'
    }
    if (swapType === 'parent -> left') {
      await swap(currentIndex, leftIndex)
      await shiftDown(leftIndex)
      return
    }
    await swap(currentIndex, rightIndex)
    await shiftDown(rightIndex)
  }
  async function shiftUp(currentIndex: number) {
    // console.log('shiftUp', currentIndex)
    const parentIndex = getParentIndex(currentIndex)
    if (parentIndex < 0) {
      return -1
    }
    const item = nodes[currentIndex]
    const parent = nodes[parentIndex]
    // 结束了
    if (compareFn(parent, item) >= 0) {
      return -1
    }

    await swap(currentIndex, parentIndex)
    await shiftDown(currentIndex)
    await shiftUp(parentIndex)
  }

  async function heapify() {
    let i = nodes.length - 1
    while (i > -1) {
      // console.log('shift up', i)
      await shiftUp(i)
      i--
    }
  }

  const btn = createButton({
    text: 'heapify',
  })
  btn.view.x = app.view.width / 3
  btn.view.y = app.view.height - 100

  app.stage.addChild(btn.view)

  let isRunning = false
  btn.view.on('pointertap', async () => {
    if (isRunning) {
      return
    }
    isRunning = true
    await heapify()
    isRunning = false
  })

  // ;(window as any)._heapify = heapify
  // ;(window as any)._shiftUp = shiftUp
  // ;(window as any)._shiftDownOnce = shiftDown
}

main()
