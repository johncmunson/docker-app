import React from 'react'
import { Route, Switch, Redirect, withRouter } from 'react-router-dom'
import CoLogoutButton from './containers/CoLogoutButton'
import Home from './views/Home'
import Work from './views/Work'

const App = ({ match }) => (
  <div>
    {/* You could put a nav bar here that would be present in every view below.
        Right now, we're just sticking with a logout button. */}
    <CoLogoutButton />
    <br />
    <br />
    <Switch>
      <Route path={`${match.path}/home`} component={Home} />
      <Route path={`${match.path}/work`} component={Work} />
      <Redirect to={`${match.url}/home`} />
    </Switch>
  </div>
)

export default withRouter(App)
