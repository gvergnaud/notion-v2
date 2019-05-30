import React from 'react'
import ContentEditable from './ContentEditable'
import Menu from './Menu'
import SelectionOverlay from './SelectionOverlay'
import { reducer, initialState, types, selectors, actions } from '../state'
import { useReducerWithMiddleware } from '../hooks'
import { logger, socket } from '../middlewares'
import { uniqId } from '../utils'

const ARROW_UP = 38
const ARROW_DOWN = 40
const ENTER = 13
const BACKSPACE = 8
const ESCAPE = 27

const placeholderByType = {
  h1: 'Untitled',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  p: "Type '/' for commands",
}

const middlewares = [
  socket([
    types.NEW_LINE,
    types.REMOVE_LINE,
    types.UPDATE_CONTENT,
    types.SET_TEXT_TYPE,
    types.UPDATE_SELECTION,
  ]),
  logger,
]

function App() {
  const [state, dispatch] = useReducerWithMiddleware(
    reducer,
    initialState,
    middlewares,
  )
  const stateRef = React.useRef(state)
  const elsByIdRef = React.useRef({})

  React.useEffect(() => {
    stateRef.current = state
  }, [state])

  const onKeyDown = e => {
    const state = stateRef.current

    switch (e.keyCode) {
      case ARROW_UP:
        if (!e.shiftKey) {
          if (state.menu.isOpen) dispatch(actions.menuSelectUp())
          else dispatch(actions.focusUp())
        }
        break

      case ARROW_DOWN:
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

      case ESCAPE:
        if (state.menu.isOpen) {
          dispatch(actions.menuClose())
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elsByIdRef.current, state.focusId, state.menu.isOpen])

  const userId = React.useMemo(() => uniqId(), [])

  const onSelectionChange = React.useCallback((lineId, selection) => {
    dispatch(actions.updateSelection(userId, lineId, selection))
  }, [])

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
      <SelectionOverlay
        selections={state.selections}
        elsById={elsByIdRef.current}
        currentUserId={userId}
        lines={state.lines}
      />
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
                autoFocus={id === state.focusId}
                style={{ minHeight: '1em' }}
                onChange={e => onChange(id, e.target.value)}
                onFocus={() => onFocus(id)}
                onClick={e => e.stopPropagation()}
                onKeyDown={onKeyDown}
                onSelectionChange={selection =>
                  onSelectionChange(id, selection)
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
