import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import Home from './views/Home'
import Work from './views/Work'

const App = () => (
  <div>
    {/* You could put a nav bar here that would be present in every view below */}
    <Switch>
      <Route path="/app/home" component={Home} />
      <Route path="/app/work" component={Work} />
      <Redirect to="/app/home" />
    </Switch>
  </div>
)

export default App
