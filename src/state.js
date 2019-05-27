import { between, setAtIndex, insertAtIndex } from './utils'

export const initialState = {
  lines: [{ type: 'h1', content: '' }],
  focusIndex: 0,
  menu: {
    search: '',
    isOpen: false,
    selectedIndex: 0,
  },
}

export const types = {
  FOCUS: 'FOCUS',
  FOCUS_UP: 'FOCUS_UP',
  FOCUS_DOWN: 'FOCUS_DOWN',
  NEW_LINE: 'NEW_LINE',
  REMOVE_LINE: 'REMOVE_LINE',
  UPDATE_CONTENT: 'UPDATE_CONTENT',
  SET_TEXT_TYPE: 'SET_TEXT_TYPE',
  MENU_SET_SEARCH: 'MENU_SET_SEARCH',
  MENU_CLOSE: 'MENU_CLOSE',
  MENU_SELECT_UP: 'MENU_SELECT_UP',
  MENU_SELECT_DOWN: 'MENU_SELECT_DOWN',
}

export const menuItems = [
  {
    name: 'Text',
    type: 'p',
  },
  {
    name: 'Heading 1',
    type: 'h1',
  },
  {
    name: 'Heading 2',
    type: 'h2',
  },
  {
    name: 'Heading 3',
    type: 'h3',
  },
]

export const maxIndex = state => state.lines.length - 1
export const hasContentInFocus = state =>
  !!state.lines[state.focusIndex].content
export const filteredMenuItems = state =>
  menuItems.filter(item =>
    item.name.toUpperCase().startsWith(state.menu.search.toUpperCase()),
  )

export const getSelectedTextType = state => {
  const item = filteredMenuItems(state)[state.menu.selectedIndex]
  return item ? item.type : null
}

export const reducer = (state, action) => {
  switch (action.type) {
    case types.FOCUS_UP:
      return {
        ...state,
        focusIndex: between(0, maxIndex(state), state.focusIndex - 1),
      }

    case types.FOCUS_DOWN:
      return {
        ...state,
        focusIndex: between(0, maxIndex(state), state.focusIndex + 1),
      }

    case types.FOCUS:
      return {
        ...state,
        focusIndex: action.index,
      }

    case types.NEW_LINE:
      return {
        ...state,
        lines: insertAtIndex(
          action.index,
          { type: 'p', content: '' },
          state.lines,
        ),
        focusIndex: action.isMe
          ? state.focusIndex + 1
          : action.index > state.focusIndex
          ? state.focusIndex
          : state.focusIndex + 1,
      }

    case types.UPDATE_CONTENT:
      return {
        ...state,
        lines: setAtIndex(
          action.index,
          line => ({ ...line, content: action.content }),
          state.lines,
        ),
      }

    case types.REMOVE_LINE:
      return {
        ...state,
        lines:
          maxIndex(state) > 0
            ? state.lines.filter((_, index) => index !== action.index)
            : state.lines,
        focusIndex: between(
          0,
          maxIndex(state),
          action.index > state.focusIndex
            ? state.focusIndex
            : state.focusIndex - 1,
        ),
      }

    case types.SET_TEXT_TYPE:
      return {
        ...state,
        lines: setAtIndex(
          action.index,
          line => ({
            ...line,
            type: action.textType,
            content: line.content.startsWith('/') ? '' : '',
          }),
          state.lines,
        ),
      }

    case types.MENU_CLOSE:
      return {
        ...state,
        menu: {
          ...state.menu,
          isOpen: false,
          selectedIndex: 0,
        },
      }

    case types.MENU_SET_SEARCH:
      return {
        ...state,
        menu: {
          ...state.menu,
          isOpen: true,
          search: action.search,
        },
      }

    case types.MENU_SELECT_UP:
      return {
        ...state,
        menu: {
          ...state.menu,
          selectedIndex:
            (state.menu.selectedIndex - 1) % filteredMenuItems(state).length,
        },
      }

    case types.MENU_SELECT_DOWN:
      return {
        ...state,
        menu: {
          ...state.menu,
          selectedIndex:
            (state.menu.selectedIndex + 1) % filteredMenuItems(state).length,
        },
      }

    default:
      return state
  }
}
