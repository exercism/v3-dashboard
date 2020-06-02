import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import { TrackSelection } from './components/TrackSelection'
import { TrackTool } from './components/TrackTool'

import './styles.css'

export function App(): JSX.Element {
  return (
    <Router>
      <AppContainer>
        <TrackMaintenanceTool />
      </AppContainer>
    </Router>
  )
}

function AppContainer({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return <div className="app container">{children}</div>
}

function TrackMaintenanceTool(): JSX.Element {
  return (
    <Switch>
      <Route path="/" component={TrackSelection} exact />
      <Route path="/:trackId" component={TrackTool} />
    </Switch>
  )
}
