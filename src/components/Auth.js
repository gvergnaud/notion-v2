import React from 'react'

const APILoginRoute = 'https://react-h3-backend.herokuapp.com/auth/login'
// const APILoginRoute = 'http://localhost:8000/auth/login'

// Demo credentials
// email: tom@hetic.net
// pwd:   hetic

const login = (email, password) => window.fetch(APILoginRoute, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password }),
  })

const useAPI = action => {
  const [state, setState] = React.useState({
    data: null,
    pending: false,
    error: false,
    completed: false
  })
  async function execute(...args) {
    setState({ data: null, pending: true, error: false, completed: false })
    try {
      const res = await action(...args)
      const data = await res.json()
      setState(prev => ({ ...prev, data, error: !res.ok, pending: false, completed: true }))
    } catch (e) {
      setState(prev => ({ ...prev, data: null, error: true, pending: false, completed: true }))
    }
  }

  return [state, execute]
}

const AuthForm = ({ setAuthState }) => {
  const [state, setState] = React.useState({ form: { email: '', password: '' } })
  const [loginState, executeLogin] = useAPI(login)

  React.useEffect(() => {
    if (loginState.data && loginState.data.auth === true) setAuthState(true)
  }, [loginState.data, setAuthState])

  const onChange = e => {
    const { value, name } = e.target
    setState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        [name]: value
      }
    }))
  }

  const onSubmit = async e => {
    const { email, password } = state.form
    e.preventDefault()
    executeLogin(email, password)
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={onSubmit}>
        <p className="auth-welcome">Authentication</p>
        <div className="auth-input">
          <label>Email</label>
          <input
            type="email"
            value={state.form.email}
            name="email"
            onChange={onChange}
          />
        </div>
        <div className="auth-input">
          <label>Password</label>
          <input
            type="password"
            value={state.form.password}
            name="password"
            onChange={onChange}
          />
        </div>
        {loginState.completed && loginState.data && loginState.data.auth === false && (
          <p className="auth-error">Bad credentials provided</p>
        )}
        <input
          disabled={loginState.pending}
          type="submit"
          className="auth-submit"
          value={'Log-in'}
        />
      </form>
    </div>
  )
}

const Auth = ({ children }) => {
  const [isAuth, setIsAuth] = React.useState(false)

  return isAuth ? children : <AuthForm setAuthState={setIsAuth} />
}

export default Auth