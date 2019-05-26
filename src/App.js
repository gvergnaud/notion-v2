import React from "react";
import "./App.css";
import ContentEditableLib from "react-contenteditable";

const setAtIndex = (index, value, xs) => [
  ...xs.slice(0, index),
  typeof value === "function" ? value(xs[index]) : value,
  ...xs.slice(index + 1)
];

const between = (min, max, x) => Math.max(min, Math.min(max, x));

const ContentEditable = ({ autoFocus, className, ...props }) => {
  const ref = React.useRef();

  React.useEffect(() => {
    if (autoFocus) ref.current.focus();
  }, [autoFocus]);

  return (
    <ContentEditableLib
      className={`editor ${className}`}
      innerRef={ref}
      {...props}
    />
  );
};

const Menu = ({ onSelect, search, focusIndex }) => (
  <div className="menu">
    {[
      {
        name: "Text",
        type: "p"
      },
      {
        name: "Heading 1",
        type: "h1"
      },
      {
        name: "Heading 2",
        type: "h2"
      },
      {
        name: "Heading 3",
        type: "h3"
      }
    ]
      .filter(item => item.name.toUpperCase().startsWith(search.toUpperCase()))
      .map(({ name, type }) => (
        <li key={type} className="menu-item" onClick={() => onSelect(type)}>
          {name}
        </li>
      ))}
  </div>
);

const initialState = {
  lines: [{ type: "h1", content: "" }],
  focusIndex: 0
};

const types = {
  FOCUS: "FOCUS",
  FOCUS_UP: "FOCUS_UP",
  FOCUS_DOWN: "FOCUS_DOWN",
  NEW_LINE: "NEW_LINE",
  REMOVE_FOCUSED_LINE: "REMOVE_FOCUSED_LINE",
  UPDATE_CONTENT: "UPDATE_CONTENT",
  SET_TEXT_TYPE: "SET_TEXT_TYPE"
};

const maxIndex = state => state.lines.length - 1;
const hasContentInFocus = state => !!state.lines[state.focusIndex].content;

const reducer = (state, action) => {
  switch (action.type) {
    case types.FOCUS_UP:
      return {
        ...state,
        focusIndex: between(0, maxIndex(state), state.focusIndex - 1)
      };

    case types.FOCUS_DOWN:
      return {
        ...state,
        focusIndex: between(0, maxIndex(state), state.focusIndex + 1)
      };

    case types.FOCUS:
      return {
        ...state,
        focusIndex: action.index
      };

    case types.NEW_LINE:
      return {
        ...state,
        lines: [...state.lines, { type: "p", content: "" }],
        focusIndex: state.focusIndex + 1
      };

    case types.UPDATE_CONTENT:
      return {
        ...state,
        lines: setAtIndex(
          action.index,
          line => ({ ...line, content: action.content }),
          state.lines
        )
      };

    case types.REMOVE_FOCUSED_LINE:
      return {
        ...state,
        lines:
          maxIndex(state) > 0
            ? state.lines.filter((_, index) => index !== state.focusIndex)
            : state.lines,
        focusIndex: between(0, maxIndex(state), state.focusIndex - 1)
      };

    case types.SET_TEXT_TYPE:
      return {
        ...state,
        lines: setAtIndex(
          state.focusIndex,
          line => ({
            ...line,
            type: action.textType,
            content: line.content.startsWith("/") ? "" : ""
          }),
          state.lines
        )
      };

    default:
      return state;
  }
};

const KEYUP = 38;
const KEYDOWN = 40;
const ENTER = 13;
const BACKSPACE = 8;
const SLASH = 191;

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const stateRef = React.useRef(state);

  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const onKeyDown = e => {
    switch (e.keyCode) {
      case KEYUP:
        if (!e.shiftKey) dispatch({ type: types.FOCUS_UP });
        break;

      case KEYDOWN:
        if (!e.shiftKey) dispatch({ type: types.FOCUS_DOWN });
        break;

      case ENTER:
        e.preventDefault();
        dispatch({ type: types.NEW_LINE });
        break;

      case BACKSPACE:
        if (!hasContentInFocus(stateRef.current))
          dispatch({ type: types.REMOVE_FOCUSED_LINE });
        break;

      default:
        break;
    }
  };

  const onFocus = index => dispatch({ type: types.FOCUS, index });

  const onChange = (index, content) => {
    dispatch({ type: types.UPDATE_CONTENT, index, content });
    if (content.startsWith("/")) {
      setIsMenuOpen(true);
      setSearch(content.slice(1));
    } else {
      setIsMenuOpen(false);
    }
  };

  const setTextType = textType => {
    dispatch({ type: types.SET_TEXT_TYPE, textType });
    setIsMenuOpen(false);
    // TODO fix focus
  };

  return (
    <div className="App">
      <div className="sidebar" />
      {isMenuOpen && (
        <Menu
          search={search}
          focusIndex={state.focusIndex}
          onSelect={setTextType}
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
                e.stopPropagation();
                onFocus(index);
              }}
            >
              <ContentEditable
                index={index}
                placeholder={
                  type === "h1" ? "Heading 1" : "Type / for commands"
                }
                className={type}
                html={content}
                onChange={e => onChange(index, e.target.value)}
                autoFocus={index === state.focusIndex}
                onFocus={() => onFocus(index)}
                onKeyDown={onKeyDown}
                style={{ minHeight: "1em" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
