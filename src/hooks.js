import React from 'react'

export const useReducerWithMiddleware = (
  reducer,
  initialState,
  middlewares = [],
) => {
  const [state, setState] = React.useState(initialState)
  const stateRef = React.useRef(state)

  const localDispatch = action =>
    setState(state => {
      const newState = reducer(state, action)
      stateRef.current = newState
      return newState
    })

  const dispatch = React.useMemo(() => {
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`,
      )
    }
    const middlewareAPI = {
      getState: () => stateRef.current,
      dispatch: (...args) => dispatch(...args),
    }

    dispatch = middlewares
      .map(middleware => middleware(middlewareAPI))
      .reduceRight((acc, middleware) => middleware(acc), localDispatch)

    return dispatch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [state, dispatch]
}
