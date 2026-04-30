import { useState } from 'react'
import { useGameStore } from './store/gameStore'
import MainMenu from './screens/MainMenu'
import CreateManager from './screens/CreateManager'
import TeamSelection from './screens/TeamSelection'
import Layout from './components/Layout'
import Dashboard from './screens/Dashboard'
import BikeUpgrade from './screens/BikeUpgrade'
import RaceScreen from './screens/RaceScreen'
import Contracts from './screens/Contracts'

export default function App() {
  const { manager, initNewGame } = useGameStore()
  const [appState, setAppState] = useState(manager ? 'game' : 'menu')
  const [screen, setScreen] = useState('dashboard')
  const [pendingManager, setPendingManager] = useState(null)

  function handleNewGame() {
    setAppState('create-manager')
  }

  function handleManagerCreated(managerData) {
    setPendingManager(managerData)
    setAppState('team-selection')
  }

  function handleTeamSelected(team) {
    initNewGame(pendingManager, team)
    setScreen('dashboard')
    setAppState('game')
  }

  function handleResume() {
    setAppState('game')
  }

  if (appState === 'menu') {
    return <MainMenu onNewGame={handleNewGame} onResume={handleResume} />
  }

  if (appState === 'create-manager') {
    return (
      <CreateManager
        onConfirm={handleManagerCreated}
        onBack={() => setAppState('menu')}
      />
    )
  }

  if (appState === 'team-selection') {
    return (
      <TeamSelection
        onConfirm={handleTeamSelected}
        onBack={() => setAppState('create-manager')}
      />
    )
  }

  return (
    <Layout currentScreen={screen} setScreen={setScreen} onMainMenu={() => setAppState('menu')}>
      {screen === 'dashboard' && <Dashboard />}
      {screen === 'bike' && <BikeUpgrade />}
      {screen === 'race' && <RaceScreen />}
      {screen === 'contracts' && <Contracts />}
    </Layout>
  )
}