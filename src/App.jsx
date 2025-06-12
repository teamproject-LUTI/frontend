import './App.css';
import { Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuth2ErrorPage from "./pages/login/OAuth2ErrorPage";

const App = () => {
  return (
      <div id='app'>
        <Routes>
          {/*로그인 페이지 - 보호 안함 */}
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />

          {/* OAuth2 관련 페이지 */}
          <Route path='/auth/error' element={<OAuth2ErrorPage />} />

          {/*메인 페이지*/}
          <Route path='/main' element={
            <ProtectedRoute>
              <Main />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
  );
}

export default App;
