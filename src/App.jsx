import './App.css';
import { Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuth2ErrorPage from "./pages/login/OAuth2ErrorPage";
import Membership from "./pages/login/Membership";
import MyPage from "./pages/mypage/MyPage"
import MyPageProfile from "./pages/mypage/profile/MyPageProfile"
import WithdrawPage from "./pages/mypage/withdraw/WithdrawPage";
import AccountRestorePage from "./pages/mypage/withdraw/AccountRestorePage";
import PasswordConfirmPage from "./pages/mypage/PasswordConfirmPage";
import { AuthProvider } from "./util/AuthContext";
import Review from './pages/community/Review';
import Payment from './pages/Payment';

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

            {/* 계정 복구 페이지 - 인증 필요하지만 탈퇴한 사용자도 접근 가능 */}
            <Route path='/account/restore' element={<AccountRestorePage />} />

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
              <Route path='withdraw/confirm' element={<PasswordConfirmPage />} />
              <Route path='withdraw' element={<WithdrawPage />} />
            </Route>

            {/*리뷰 페이지*/}
            <Route path='/community/review' element={
              <ProtectedRoute>
                <Review />
              </ProtectedRoute>
            } />

            {/*리뷰 페이지*/}
            <Route path='/payment' element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
  );
}

export default App;
