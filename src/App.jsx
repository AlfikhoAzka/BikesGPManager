import { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './screens/Dashboard'
import BikeUpgrade from './screens/BikeUpgrade'
import RaceScreen from './screens/RaceScreen'
import Contracts from './screens/Contracts'

function App() {
  const [screen, setScreen] = useState('dashboard')

  return (
    <Layout currentScreen={screen} setScreen={setScreen}>
      {screen === 'dashboard' && <Dashboard />}
      {screen === 'bike' && <BikeUpgrade />}
      {screen === 'race' && <RaceScreen />}
      {screen === 'contracts' && <Contracts />}
    </Layout>
  )
}

export default App