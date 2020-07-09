import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import { TrackSelection } from './components/TrackSelection'
import { TrackTool } from './components/TrackTool'
import { Stories } from './components/Stories'

import './styles.css'

export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AppContainer>
        <Dashboard />
      </AppContainer>
    </BrowserRouter>
  )
}

function AppContainer({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return <div className="app container">{children}</div>
}

function Dashboard(): JSX.Element {
  return (
    <Switch>
      <Route path="/stories" component={Stories} />
      <Route path="/:trackId" component={TrackTool} />
      <Route path="/" exact component={TrackSelection} />
    </Switch>
  )
}
