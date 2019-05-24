import React from "react";
import "./App.css";
import ContentEditableLib from "react-contenteditable";

const setAtIndex = (index, value, xs) => [
  ...xs.slice(0, index),
  typeof value === "function" ? value(xs[index]) : value,
  ...xs.slice(index + 1)
];

const ContentEditable = ({ autoFocus, ...props }) => {
  const ref = React.useRef();
  React.useEffect(() => {
    if (autoFocus) ref.current.focus();
  }, [autoFocus]);
  return <ContentEditableLib className="line" innerRef={ref} {...props} />;
};

function App() {
  const [state, setState] = React.useState({
    values: [{ type: "p", content: "" }],
    focusIndex: 0
  });

  const onKeyDown = e => {
    e.persist();

    setState(state => {
      switch (e.keyCode) {
        case 38:
          return {
            ...state,
            focusIndex: Math.max(
              0,
              Math.min(state.values.length - 1, state.focusIndex - 1)
            )
          };
        case 40:
          return {
            ...state,
            focusIndex: Math.max(
              0,
              Math.min(state.values.length - 1, state.focusIndex + 1)
            )
          };
        case 13:
          e.preventDefault();
          return {
            ...state,
            values: [...state.values, { type: "p", content: "" }],
            focusIndex: state.focusIndex + 1
          };
        default:
          return state;
      }
    });
  };

  const onFocus = index =>
    setState(state => ({
      ...state,
      focusIndex: index
    }));

  const onChange = (index, content) =>
    setState(state => ({
      ...state,
      values: setAtIndex(index, value => ({ ...value, content }), state.values)
    }));

  return (
    <div className="App">
      <div className="sidebar" />
      <div className="frame">
        <header className="header">
          <p>Notion v2</p>
        </header>
        <div className="content">
          {state.values.map(({ type, content }, index) => (
            <ContentEditable
              key={index}
              index={index}
              placeholder="Type / for commands"
              html={
                type === "p"
                  ? content
                  : type === "h1"
                  ? `<h1>${content}</h1>`
                  : type === "h2"
                  ? `<h1>${content}</h1>`
                  : type === "h3"
                  ? `<h1>${content}</h1>`
                  : "null"
              }
              onChange={e => onChange(index, e.target.value)}
              autoFocus={index === state.focusIndex}
              onFocus={() => onFocus(index)}
              onKeyDown={onKeyDown}
              style={{ minHeight: "1em" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
