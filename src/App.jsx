import './App.css';
import { Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/login/Login"
import PaymentTestPage from "./routes/PaymentTestPage";

const App = () => {
  return (
      <div id='app'>
        <Routes>
          <Route exact path='/' element={<Login/>}/>
          <Route exact path='/main' element={<Main/>}/>
            <Route path="/test-payment" element={<PaymentTestPage />} />
        </Routes>

      </div>
  );
}

export default App;
