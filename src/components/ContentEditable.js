import React from 'react'
import ContentEditableLib from 'react-contenteditable'

const ContentEditable = ({
  autoFocus,
  className,
  setInputRef,
  onSelectionChange,
  ...props
}) => {
  const ref = React.useRef()

  React.useEffect(() => {
    if (autoFocus) ref.current.focus()
  }, [autoFocus])

  React.useEffect(() => {
    setInputRef(ref.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, setInputRef])

  React.useEffect(() => {
    if (onSelectionChange && document.activeElement !== ref.current) return
    const handler = () => {
      const selection = document.getSelection()
      console.log(selection)
      onSelectionChange({
        type: selection.type,
        start: {
          childIndex: [...ref.current.childNodes].indexOf(selection.anchorNode),
          offset: selection.anchorOffset,
        },
        end: {
          childIndex: [...ref.current.childNodes].indexOf(selection.extentNode),
          offset: selection.extentOffset,
        },
      })
    }
    document.addEventListener('selectionchange', handler)
    return () => {
      document.removeEventListener('selectionchange', handler)
    }
  }, [onSelectionChange])

  return (
    <ContentEditableLib
      className={`editor ${className}`}
      innerRef={ref}
      {...props}
    />
  )
}

export default ContentEditable
