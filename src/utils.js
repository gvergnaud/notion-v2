export const setAtIndex = (index, value, xs) => [
  ...xs.slice(0, index),
  typeof value === 'function' ? value(xs[index]) : value,
  ...xs.slice(index + 1),
]

export const insertAtIndex = (index, value, xs) => [
  ...xs.slice(0, index),
  value,
  ...xs.slice(index),
]

export const between = (min, max, x) => Math.max(min, Math.min(max, x))
