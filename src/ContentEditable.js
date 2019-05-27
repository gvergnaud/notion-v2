import React from 'react'
import ContentEditableLib from 'react-contenteditable'

const ContentEditable = ({ autoFocus, className, setInputRef, ...props }) => {
  const ref = React.useRef()

  React.useEffect(() => {
    if (autoFocus) ref.current.focus()
  }, [autoFocus])

  React.useEffect(() => {
    setInputRef(ref.current)
  }, [ref.current, setInputRef])

  return (
    <ContentEditableLib
      className={`editor ${className}`}
      innerRef={ref}
      {...props}
    />
  )
}

export default ContentEditable
