import React from 'react'

const Menu = ({ onSelect, search, focusIndex }) => (
  <div className="menu">
    {[
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
      .filter(item => item.name.toUpperCase().startsWith(search.toUpperCase()))
      .map(({ name, type }) => (
        <li key={type} className="menu-item" onClick={() => onSelect(type)}>
          {name}
        </li>
      ))}
  </div>
)

export default Menu
