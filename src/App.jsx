import './App.css';
import { Route, Routes, Outlet } from "react-router-dom";
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
import UserManagement from "./pages/admin/UserManagement";

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

            {/* 보호된 라우트들 */}
            <Route element={<ProtectedRoute />}>
              {/*메인 페이지*/}
              <Route path='/main' element={<Main />} />

              {/*멤버쉽 페이지*/}
              <Route path='/membership' element={<Membership />} />

              {/* 마이페이지*/}
              <Route path='/mypage' element={<MyPage />} />
              <Route path='/mypage/profile' element={<MyPageProfile />} />
              <Route path='/mypage/withdraw/confirm' element={<PasswordConfirmPage />} />
              <Route path='/mypage/withdraw' element={<WithdrawPage />} />

              {/*리뷰 페이지*/}
              <Route path='/community/review' element={<Review />} />

              {/*결제 페이지*/}
              <Route path='/payment' element={<Payment />} />

              {/* 회원관리 페이지 */}
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
  );
}

export default App;