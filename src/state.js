import { setAtIndex, insertAtIndex, uniqId } from './utils'

export const initialState = {
  lines: [{ type: 'h1', content: '', id: 'init' }],
  focusId: 'init',
  selections: {},
  menu: {
    search: '',
    isOpen: false,
    selectedIndex: 0,
  },
}

export const types = {
  INIT_STATE: 'INIT_STATE',
  FOCUS: 'FOCUS',
  FOCUS_UP: 'FOCUS_UP',
  FOCUS_DOWN: 'FOCUS_DOWN',
  NEW_LINE: 'NEW_LINE',
  REMOVE_LINE: 'REMOVE_LINE',
  UPDATE_CONTENT: 'UPDATE_CONTENT',
  UPDATE_SELECTION: 'UPDATE_SELECTION',
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
  {
    name: 'Heading 4',
    type: 'h4',
  },
]

export const selectors = {
  maxIndex: state => state.lines.length - 1,
  getLine: (id, state) => state.lines.find(line => line.id === id),
  getIdIndex: (id, state) => state.lines.indexOf(selectors.getLine(id, state)),
  getPreviousId: (id, state) => {
    const previousLine = state.lines[selectors.getIdIndex(id, state) - 1]
    return previousLine ? previousLine.id : id
  },
  getNextId: (id, state) => {
    const nextLine = state.lines[selectors.getIdIndex(id, state) + 1]
    return nextLine ? nextLine.id : id
  },
  hasContentInFocus: state => !!selectors.getLine(state.focusId, state).content,
  filteredMenuItems: state =>
    menuItems.filter(item =>
      item.name.toUpperCase().startsWith(state.menu.search.toUpperCase()),
    ),
  getSelectedTextType: state => {
    const item = selectors.filteredMenuItems(state)[state.menu.selectedIndex]
    return item ? item.type : null
  },
}

export const reducer = (state, action) => {
  switch (action.type) {
    case types.INIT_STATE:
      return {
        ...state,
        lines: action.lines,
        focusId: action.lines[0].id,
      }

    case types.FOCUS_UP:
      return {
        ...state,
        focusId: selectors.getPreviousId(state.focusId, state),
      }

    case types.FOCUS_DOWN:
      return {
        ...state,
        focusId: selectors.getNextId(state.focusId, state),
      }

    case types.FOCUS:
      return {
        ...state,
        focusId: action.id,
      }

    case types.NEW_LINE:
      return {
        ...state,
        lines: insertAtIndex(
          selectors.getIdIndex(action.afterId, state) + 1,
          { type: 'p', content: '', id: action.newId },
          state.lines,
        ),
        focusId: action.isMe ? action.newId : state.focusId,
      }

    case types.UPDATE_CONTENT:
      return {
        ...state,
        lines: setAtIndex(
          selectors.getIdIndex(action.id, state),
          line => ({
            ...line,
            content: action.content
              .replace('-&gt;', '→')
              .replace('&lt;3', '❤️')
              .replace(':)', '🙂'),
          }),
          state.lines,
        ),
      }

    case types.REMOVE_LINE:
      return {
        ...state,
        lines:
          selectors.maxIndex(state) > 0
            ? state.lines.filter(line => action.id !== line.id)
            : state.lines,
        focusId:
          state.focusId === action.id
            ? selectors.getPreviousId(action.id, state)
            : state.focusId,
      }

    case types.SET_TEXT_TYPE:
      return {
        ...state,
        lines: setAtIndex(
          selectors.getIdIndex(action.id, state),
          line => ({
            ...line,
            type: action.textType,
            content: line.content.startsWith('/') ? '' : '',
          }),
          state.lines,
        ),
      }

    case types.UPDATE_SELECTION:
      return {
        ...state,
        selections: {
          ...state.selections,
          [action.userId]: {
            lineId: action.lineId,
            selection: action.selection,
          },
        },
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
            (state.menu.selectedIndex - 1) %
            selectors.filteredMenuItems(state).length,
        },
      }

    case types.MENU_SELECT_DOWN:
      return {
        ...state,
        menu: {
          ...state.menu,
          selectedIndex:
            (state.menu.selectedIndex + 1) %
            selectors.filteredMenuItems(state).length,
        },
      }

    default:
      return state
  }
}

export const actions = {
  menuSelectUp: () => ({ type: types.MENU_SELECT_UP }),
  menuSelectDown: () => ({ type: types.MENU_SELECT_DOWN }),
  menuClose: () => ({ type: types.MENU_CLOSE }),
  menuSetSearch: search => ({ type: types.MENU_SET_SEARCH, search }),
  focus: id => ({ type: types.FOCUS, id }),
  focusUp: () => ({ type: types.FOCUS_UP }),
  focusDown: () => ({ type: types.FOCUS_DOWN }),
  setTextType: (id, textType) => ({
    type: types.SET_TEXT_TYPE,
    textType,
    id,
  }),
  newLine: afterId => ({ type: types.NEW_LINE, afterId, newId: uniqId() }),
  removeLine: id => ({ type: types.REMOVE_LINE, id }),
  updateContent: (id, content) => ({
    type: types.UPDATE_CONTENT,
    id,
    content,
  }),
  updateSelection: (userId, lineId, selection) => ({
    type: types.UPDATE_SELECTION,
    userId,
    lineId,
    selection,
  }),
}
