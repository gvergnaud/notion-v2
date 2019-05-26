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
  UPDATE_CONTENT: "UPDATE_CONTENT"
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
          value => ({ ...value, content: action.content }),
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

    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const onKeyDown = e => {
    switch (e.keyCode) {
      case 38:
        return dispatch({ type: types.FOCUS_UP });

      case 40:
        return dispatch({ type: types.FOCUS_DOWN });

      case 13:
        e.preventDefault();
        return dispatch({ type: types.NEW_LINE });

      case 8:
        if (!hasContentInFocus(stateRef.current))
          dispatch({ type: types.REMOVE_FOCUSED_LINE });
        break;

      default:
        break;
    }
  };

  const onFocus = index => dispatch({ type: types.FOCUS, index });

  const onChange = (index, content) =>
    dispatch({ type: types.UPDATE_CONTENT, index, content });

  return (
    <div className="App">
      <div className="sidebar" />
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
