import { throttle } from 'lodash'
import ioClient from 'socket.io-client'

export const logger = ({ getState }) => next => action => {
  const prevState = getState()
  console.log('prevState:', prevState)
  console.log('action:', action)
  const returned = next(action)
  const nextState = getState()
  console.log('nextState:', nextState)
  return returned
}

export const socket = actionTypes => ({ getState }) => next => {
  const socket = ioClient('http://localhost:3001')

  socket.on('action', action => next({ ...action, isMe: false }))

  const updateState = throttle(lines => {
    socket.emit('updateState', lines)
  }, 2000)

  return action => {
    if (actionTypes.includes(action.type)) socket.emit('action', action)
    const returned = next({ ...action, isMe: true })
    updateState(getState().lines)
    return returned
  }
}
