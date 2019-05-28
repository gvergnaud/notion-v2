import React from 'react'
import ContentEditable from './ContentEditable'
import Menu from './Menu'
import { reducer, initialState, types, selectors, actions } from '../state'
import { useReducerWithMiddleware } from '../hooks'
import { logger, socket } from '../middlewares'

const KEYUP = 38
const KEYDOWN = 40
const ENTER = 13
const BACKSPACE = 8

const placeholderByType = {
  h1: 'Untitled',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  p: "Type '/' for commands",
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
  const elsByIdRef = React.useRef({})

  React.useEffect(() => {
    stateRef.current = state
  }, [state])

  const onKeyDown = e => {
    const state = stateRef.current

    switch (e.keyCode) {
      case KEYUP:
        if (!e.shiftKey) {
          if (state.menu.isOpen) dispatch(actions.menuSelectUp())
          else dispatch(actions.focusUp())
        }
        break

      case KEYDOWN:
        if (!e.shiftKey) {
          if (state.menu.isOpen) dispatch(actions.menuSelectDown())
          else dispatch(actions.focusDown())
        }
        break

      case ENTER:
        e.preventDefault()
        if (state.menu.isOpen) {
          const textType = selectors.getSelectedTextType(state)
          if (textType) dispatch(actions.setTextType(state.focusId, textType))
          dispatch(actions.menuClose())
        } else {
          dispatch(actions.newLine(state.focusId))
        }

        break

      case BACKSPACE:
        if (!selectors.hasContentInFocus(state))
          dispatch(actions.removeLine(state.focusId))
        break

      default:
        break
    }
  }

  const onFocus = id => dispatch(actions.focus(id))

  const onChange = (id, content) => {
    dispatch(actions.updateContent(id, content))
    if (content.startsWith('/')) {
      dispatch(actions.menuSetSearch(content.slice(1)))
    } else {
      if (state.menu.isOpen) dispatch(actions.menuClose())
    }
  }

  const setTextType = textType => {
    dispatch(actions.setTextType(state.focusId, textType))
    dispatch(actions.menuClose())

    const focusedEl = elsByIdRef.current[state.focusId]
    if (focusedEl) focusedEl.focus()
  }

  const { top, left } = React.useMemo(() => {
    const focusedEl = elsByIdRef.current[state.focusId]
    if (!focusedEl || !state.menu.isOpen) return {}
    const { top, left, height } = focusedEl.getBoundingClientRect()
    return {
      top: top + height,
      left,
    }
  }, [elsByIdRef.current, state.focusId, state.menu.isOpen])

  return (
    <div className="App">
      <div className="sidebar" />
      {state.menu.isOpen && (
        <Menu
          state={state.menu}
          onSelect={setTextType}
          items={selectors.filteredMenuItems(state)}
          style={{ top, left }}
        />
      )}
      <div className="frame">
        <header className="header">
          <p>Notion v2</p>
        </header>
        <div className="content" onClick={() => onFocus(0)}>
          {state.lines.map(({ type, content, id }) => (
            <div
              key={id}
              className="line"
              onClick={e => {
                e.stopPropagation()
                onFocus(id)
              }}
            >
              <ContentEditable
                setInputRef={el => (elsByIdRef.current[id] = el)}
                placeholder={placeholderByType[type]}
                className={type}
                html={content}
                onChange={e => onChange(id, e.target.value)}
                autoFocus={id === state.focusId}
                onFocus={() => onFocus(id)}
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
