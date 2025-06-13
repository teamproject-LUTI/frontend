import './App.css';
import { Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuth2ErrorPage from "./pages/login/OAuth2ErrorPage";
import Membership from "./pages/login/Membership";
import MyPage from "./pages/mypage/MyPage"
import MyPageProfile from "./pages/mypage/MyPageProfile"
import { AuthProvider } from "./util/AuthContext";

const App = () => {
  return (
      <AuthProvider>
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
            {/*멤버쉽 페이지*/}
            <Route path='/membership' element={
              <ProtectedRoute>
                <Membership />
              </ProtectedRoute>
            } />
            {/* 마이페이지*/}
            <Route path='/mypage' element={<ProtectedRoute />}>
              <Route index element={<MyPage />} />
              <Route path='profile' element={<MyPageProfile />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
  );
}

export default App;
