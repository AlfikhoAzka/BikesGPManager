import { useEffect, useState } from 'react'
import { useGameStore } from './store/gameStore'
import MainMenu from './screens/MainMenu'
import CreateManager from './screens/CreateManager'
import TeamSelection from './screens/TeamSelection'
import Layout from './components/Layout'
import Dashboard from './screens/Dashboard'
import BikeUpgrade from './screens/BikeUpgrade'
import Contracts from './screens/Contracts'
import Calendar from './screens/Calendar'
import Messages from './screens/Messages'
import RnD from './screens/RnD'
import RaceScreen from './screens/RaceScreen'

export default function App() {
  const { manager, initNewGame, resetGame, grid, initGrid } = useGameStore()
  const [appState, setAppState] = useState(manager ? 'game' : 'menu')
  const [screen, setScreen] = useState('dashboard')
  const [pendingManager, setPendingManager] = useState(null)
  const [showRace, setShowRace] = useState(false)
  const [racePhase, setRacePhase] = useState('race')

  useEffect(() => {
    const handler = (e) => {
      if (e.detail === 'messages') setScreen('messages')
    }
    document.addEventListener('navigate', handler)
    return () => document.removeEventListener('navigate', handler)
  }, [])

  function handleNewGame() { setAppState('create-manager') }

  function handleManagerCreated(managerData) {
    setPendingManager(managerData)
    setAppState('team-selection')
  }

  function handleTeamSelected(team) {
    initNewGame(pendingManager, team)
    setScreen('dashboard')
    setAppState('game')
  }

  function handleResume() { setAppState('game') }

  function handleStartRaceWeekend(phase = 'race') {
    setRacePhase(phase)
    setShowRace(true)
  }

  function handleRaceFinished() {
    setShowRace(false)
    setScreen('dashboard')
  }

  if (appState === 'menu') {
    return <MainMenu onNewGame={handleNewGame} onResume={handleResume}
      onEditor={() => { if (grid.length === 0) initGrid(); setAppState('editor') }} />
  }
  if (appState === 'create-manager') {
    return <CreateManager onConfirm={handleManagerCreated} onBack={() => setAppState('menu')} />
  }
  if (appState === 'team-selection') {
    return <TeamSelection onConfirm={handleTeamSelected} onBack={() => setAppState('create-manager')} />
  }

  if (showRace) {
    return <RaceScreen phase={racePhase} onFinished={handleRaceFinished} />
  }

  return (
    <Layout
      currentScreen={screen}
      setScreen={setScreen}
      onMainMenu={() => setAppState('menu')}
      onNewGame={() => { resetGame(); setAppState('create-manager') }}
    >
      {screen === 'dashboard' && <Dashboard onStartRace={handleStartRaceWeekend} />}
      {screen === 'bike' && <BikeUpgrade />}
      {screen === 'contracts' && <Contracts />}
      {screen === 'calendar' && <Calendar onStartRace={handleStartRaceWeekend} />}
      {screen === 'messages' && <Messages />}
      {screen === 'rnd' && <RnD />}
    </Layout>
  )
}