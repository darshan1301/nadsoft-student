import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import StudentDetail from './pages/StudentDetails'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student/:id" element={<StudentDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
