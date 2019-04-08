import React from 'react'
import { Provider } from 'react-redux'
import { Grommet } from 'grommet'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import { userIsAuthenticated, userIsNotAuthenticated } from './auth'
import App from './App'
import CoLoginForm from './containers/CoLoginForm'

const Login = userIsNotAuthenticated(CoLoginForm)
const ProtectedApp = userIsAuthenticated(App)

const Root = ({ store }) => (
  <Provider store={store}>
    <Grommet plain>
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/app" component={ProtectedApp} />
          <Redirect to="/app" />
        </Switch>
      </Router>
    </Grommet>
  </Provider>
)

export default Root
