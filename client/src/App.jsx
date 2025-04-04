// App.jsx

import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './firebaseConfig'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import LandingPage from './pages/LandingPage'
import Redirect from './components/Redirect'
import Dashboard from './pages/Dashboard'
import EditorPage from './pages/EditorPage'

const App = () => {
  const auth = getAuth()
  const [currentUser, setCurrentUser] = useState(null)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null)
      }
    })
  
    return () => unsubscribe()
  }, [auth])
 
    return (
      <div className='App'>
        <Router>
          <Routes>

            <Route
              path='/'
              element={<LandingPage parentCallback={onAuthStateChanged} />}
            />
            <Route
              path='/editor'
              element={currentUser ? <EditorPage /> : <Redirect to='/' />}
            />
            <Route
              path='/dashboard'
              element={<Redirect to='/' />}
            />
            <Route
              path='*'
              element={<Redirect to='/' />} 
            />

          </Routes>
        </Router>
      </div>
    )
  }

export default App;
