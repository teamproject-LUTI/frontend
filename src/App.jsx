import './App.css';
import { Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/login/Login"
import Membership from "./pages/login/Membership";

const App = () => {
  return (
      <div id='app'>
        <Routes>
          <Route exact path='/' element={<Login/>}/>
          <Route exact path='/main' element={<Main/>}/>
          <Route exact path='/membership' element={<Membership/>}/>
        </Routes>
      </div>
  );
}

export default App;
