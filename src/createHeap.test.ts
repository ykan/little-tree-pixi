import { createHeap } from './createHeap';

type G<T = any> = Generator<T>

test('shiftUp', () => {
  const heap = createHeap((a: number, b: number) => a - b)

  function* shift(pos: number): G<G> {
    console.log('pos', pos)
    if (pos > 0) {
      yield shift(pos - 1)
    }
  }

  const g = shift(5)
  let result = g.next()
  while (!result.done) {
    if (result.value && result.value.toString() === '[object Generator]') {
      result = result.value.next()
    } else {
      result = g.next()
    }
  }
  // console.log(shift(5))
})
