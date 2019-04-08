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
import Login from './views/Login'

const UnprotectedApp = userIsNotAuthenticated(Login)
const ProtectedApp = userIsAuthenticated(App)

const Root = ({ store }) => (
  <Provider store={store}>
    <Grommet plain>
      <Router>
        <Switch>
          <Route path="/login" component={UnprotectedApp} />
          <Route path="/app" component={ProtectedApp} />
          <Redirect to="/app" />
        </Switch>
      </Router>
    </Grommet>
  </Provider>
)

export default Root
