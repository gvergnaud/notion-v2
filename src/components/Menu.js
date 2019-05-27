import React from 'react'

const Menu = ({ onSelect, state, items, style }) => {
  return (
    <ul className="menu" style={style}>
      {items.length ? (
        items.map(({ name, type }, index) => (
          <li
            key={type}
            className={`menu-item ${
              index === state.selectedIndex ? 'selected' : ''
            }`}
            onClick={() => onSelect(type)}
          >
            {name}
          </li>
        ))
      ) : (
        <li className="menu-item" key="no">
          <p>No results</p>
        </li>
      )}
    </ul>
  )
}

export default Menu
