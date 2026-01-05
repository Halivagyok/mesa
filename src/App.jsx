import "./App.css"
//
import {BrowserRouter, Routes, Route} from "react-router"
//
import { Navigation } from "./components/Navigation"
//
import { Home } from "./pages/Home"

export const App = () => {
  return (
    <div className='h-screen bg-gradient-to-r from-black to-purple-700 text-white'>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}
