import React from 'react'

export const useReducerWithMiddleware = (
  reducer,
  initialState,
  middlewares = [],
) => {
  const [state, localDispatch] = React.useReducer(reducer, initialState)

  const stateRef = React.useRef(state)
  React.useEffect(() => {
    stateRef.current = state
  }, [state])

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
      .reduce((acc, middleware) => middleware(acc), localDispatch)

    return dispatch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [state, dispatch]
}
