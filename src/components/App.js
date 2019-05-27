import React from 'react'
import ContentEditable from './ContentEditable'
import Menu from './Menu'
import {
  reducer,
  initialState,
  types,
  getSelectedTextType,
  hasContentInFocus,
  filteredMenuItems,
} from '../state'
import { useReducerWithMiddleware } from '../hooks'
import ioClient from 'socket.io-client'

const KEYUP = 38
const KEYDOWN = 40
const ENTER = 13
const BACKSPACE = 8

const logger = ({ getState }) => next => action => {
  const prevState = getState()
  const returned = next(action)
  const nextState = getState()
  console.log('prevState:', prevState)
  console.log('action:', action)
  console.log('nextState:', nextState)
  return returned
}

const socket = actionTypes => () => next => {
  const socket = ioClient('http://localhost:3001')
  socket.on('action', action => next({ ...action, isMe: false }))
  return action => {
    if (actionTypes.includes(action.type)) socket.emit('action', action)
    return next({ ...action, isMe: true })
  }
}

function App() {
  const [state, dispatch] = useReducerWithMiddleware(reducer, initialState, [
    logger,
    socket([
      types.NEW_LINE,
      types.REMOVE_LINE,
      types.UPDATE_CONTENT,
      types.SET_TEXT_TYPE,
    ]),
  ])
  const stateRef = React.useRef(state)
  const lineElRefs = React.useRef({})

  React.useEffect(() => {
    stateRef.current = state
  }, [state])

  const onKeyDown = e => {
    const state = stateRef.current

    switch (e.keyCode) {
      case KEYUP:
        if (!e.shiftKey) {
          if (state.menu.isOpen) dispatch({ type: types.MENU_SELECT_UP })
          else dispatch({ type: types.FOCUS_UP })
        }
        break

      case KEYDOWN:
        if (!e.shiftKey) {
          if (state.menu.isOpen) dispatch({ type: types.MENU_SELECT_DOWN })
          else dispatch({ type: types.FOCUS_DOWN })
        }
        break

      case ENTER:
        e.preventDefault()
        if (state.menu.isOpen) {
          const textType = getSelectedTextType(state)
          if (textType)
            dispatch({
              type: types.SET_TEXT_TYPE,
              textType,
              index: state.focusIndex,
            })
          dispatch({ type: types.MENU_CLOSE })
        } else {
          dispatch({ type: types.NEW_LINE, index: state.focusIndex + 1 })
        }

        break

      case BACKSPACE:
        if (!hasContentInFocus(state))
          dispatch({ type: types.REMOVE_LINE, index: state.focusIndex })
        break

      default:
        break
    }
  }

  const onFocus = index => dispatch({ type: types.FOCUS, index })

  const onChange = (index, content) => {
    dispatch({ type: types.UPDATE_CONTENT, index, content })
    if (content.startsWith('/')) {
      dispatch({ type: types.MENU_SET_SEARCH, search: content.slice(1) })
    } else {
      if (state.menu.isOpen) dispatch({ type: types.MENU_CLOSE })
    }
  }

  const setTextType = textType => {
    dispatch({ type: types.SET_TEXT_TYPE, textType, index: state.focusIndex })
    dispatch({ type: types.MENU_CLOSE })

    const focusedLineEl = lineElRefs.current[state.focusIndex]
    if (focusedLineEl) focusedLineEl.focus()
  }

  const { top, left } = React.useMemo(() => {
    const focusedLine = lineElRefs.current[state.focusIndex]
    if (!focusedLine || !state.menu.isOpen) return {}
    const { top, left, height } = focusedLine.getBoundingClientRect()
    return {
      top: top + height,
      left,
    }
  }, [lineElRefs.current, state.focusIndex, state.menu.isOpen])

  return (
    <div className="App">
      <div className="sidebar" />
      {state.menu.isOpen && (
        <Menu
          state={state.menu}
          onSelect={setTextType}
          items={filteredMenuItems(state)}
          style={{ top, left }}
        />
      )}
      <div className="frame">
        <header className="header">
          <p>Notion v2</p>
        </header>
        <div className="content" onClick={() => onFocus(0)}>
          {state.lines.map(({ type, content }, index) => (
            <div
              key={index}
              className="line"
              onClick={e => {
                e.stopPropagation()
                onFocus(index)
              }}
            >
              <ContentEditable
                setInputRef={el => (lineElRefs.current[index] = el)}
                index={index}
                placeholder={
                  type === 'h1' ? 'Heading 1' : "Type '/' for commands"
                }
                className={type}
                html={content}
                onChange={e => onChange(index, e.target.value)}
                autoFocus={index === state.focusIndex}
                onFocus={() => onFocus(index)}
                onClick={e => e.stopPropagation()}
                onKeyDown={onKeyDown}
                style={{ minHeight: '1em' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
