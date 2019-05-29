import React from 'react'

const Selection = ({ el, selection }) => {
  const [rect, setRect] = React.useState(null)

  React.useEffect(() => {
    if (!el) return

    const range = document.createRange()

    const start =
      selection.start.offset < selection.end.offset
        ? selection.start
        : selection.end
    const end =
      selection.start.offset < selection.end.offset
        ? selection.end
        : selection.start

    const startEl = el.childNodes[start.childIndex] || el
    const endEl = el.childNodes[end.childIndex] || el

    try {
      range.setStart(startEl, start.offset)
      range.setEnd(endEl, end.offset)

      setRect(range.getBoundingClientRect())
    } catch (e) {
      console.error(e)
    }
  }, [el, selection.end, selection.start])

  return !rect ? null : (
    <div
      className="selection"
      data-type={selection.type}
      style={{
        position: 'absolute',
        top: rect.top,
        left: rect.left,
        height: rect.height,
        width: Math.max(3, Math.abs(rect.width)),
      }}
    />
  )
}

export default function SelectionOverlay({
  selections,
  elsById,
  currentUserId,
}) {
  return (
    <div className="selection-overlay">
      {Object.entries(selections)
        .filter(([userId]) => userId !== currentUserId)
        .map(([userId, { lineId, selection }]) => (
          <Selection key={userId} el={elsById[lineId]} selection={selection} />
        ))}
    </div>
  )
}
