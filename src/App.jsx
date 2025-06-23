import './App.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import "./styles/MyPage/MyPage.css";
import './styles/MyPage/MyPageProfile.css';
import './styles/MyPage/MyReview.css';
import './styles/MyPage/MyAsk.css';
import './styles/MyPage/WithdrawPage.css';
import './styles/MyPage/PasswordConfirmPage.css';
import './styles/MyPage/AccountRestorePage.css';
import './styles/layout/Topbar.css';
import './styles/layout/Sidebar.css';
import './styles/layout/Footer.css';
import './styles/login/Login.css';
import './styles/login/Membership.css';
import './styles/login/GoogleLoginButton.css';
import './styles/common/LutiModal.css';
import './styles/common/theme-override.css';
import './styles/MyPage/PasswordChangePage.css'
import '@toast-ui/editor/dist/toastui-editor.css';
import { Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuth2ErrorPage from "./pages/login/OAuth2ErrorPage";
import Membership from "./pages/login/Membership";
import ReviewList from './pages/community/review/ReviewList';
import ReviewDetail from './pages/community/review/ReviewDetail';
import ReviewWrite from './pages/community/review/ReviewWrite';
import ReviewEdit from './pages/community/review/ReviewEdit';
import NoticeList from './pages/community/notice/NoticeList';
import QnaList from './pages/community/qna/QnaList';
import QnaWrite from './pages/community/qna/QnaWrite';
import QnaDetail from './pages/community/qna/QnaDetail';
import QnaEdit from './pages/community/qna/QnaEdit';
import MyPage from "./pages/mypage/MyPage"
import MyPageProfile from "./pages/mypage/profile/MyPageProfile"
import WithdrawPage from "./pages/mypage/withdraw/WithdrawPage";
import AccountRestorePage from "./pages/mypage/withdraw/AccountRestorePage";
import PasswordConfirmPage from "./pages/mypage/PasswordConfirmPage";
import { AuthProvider } from "./util/AuthContext";
import Review from './pages/community/Review';
import ChatForm from "./pages/travel/ChatForm";
import Payment from './pages/mypage/Payment';
import MyReview from "./pages/mypage/myreview/MyReview";
import MyAsk from "./pages/mypage/myask/MyAsk";
import LikeReview from "./pages/mypage/likereview/LikeReview";
import MenuManagement from "./pages/management/MenuManagement";
import AuthMAnagement from "./pages/management/AuthManagement"
import PasswordChangePage from "./pages/mypage/password/PasswordChangePage";
import OAuth2CallbackHandler from "./pages/login/OAuth2CallbackHandler";

const App = () => {
  return (
      <AuthProvider>
        <div id='app'>
          <Routes>
            {/*로그인 페이지 - 보호 안함 */}
            <Route path='/' element={<Login/>}/>
            <Route path='/login' element={<Login/>}/>

            {/* OAuth2 관련 페이지 */}
            <Route path='/auth/error' element={<OAuth2ErrorPage/>}/>

            {/* 계정 복구 페이지 - 인증 필요하지만 탈퇴한 사용자도 접근 가능 */}
            <Route path='/account/restore' element={<AccountRestorePage/>}/>

            <Route path='/membership' element={<Membership/>}/>

            <Route path='/login/oauth2/code/kakao' element={<OAuth2CallbackHandler/>}/>
            <Route path='/login/oauth2/code/google' element={<OAuth2CallbackHandler/>}/>

            {/*메인 페이지*/}
            <Route path='/main' element={
              <ProtectedRoute>
                <Main/>
              </ProtectedRoute>
            }/>

            {/*gpt 페이지*/}
            <Route path='travel/chatform' element={
              <ProtectedRoute>
                <ChatForm/>
              </ProtectedRoute>
            } />

              {/*리뷰 목록 페이지*/}
              <Route path='/community/review' element={
                  <ProtectedRoute>
                      <ReviewList />
                  </ProtectedRoute>
              } />

              {/*리뷰 상세보기 페이지*/}
              <Route path='/community/review/:id' element={
                  <ProtectedRoute>
                      <ReviewDetail />
                  </ProtectedRoute>
              } />

              {/*리뷰 글쓰기 페이지*/}
              <Route path='/community/review/write' element={
                  <ProtectedRoute>
                      <ReviewWrite />
                  </ProtectedRoute>
              } />

              {/*리뷰 내가 쓴 글 수정 페이지*/}
              <Route path='/community/review/edit/:id' element={
                  <ProtectedRoute>
                      <ReviewEdit  />
                  </ProtectedRoute>
              } />



              {/*공지사항 목록 페이지*/}
              <Route path='/community/notice' element={
                  <ProtectedRoute>
                      <NoticeList />
                  </ProtectedRoute>
              } />

              {/*QnA 목록 페이지*/}
              <Route path='/community/qna' element={
                  <ProtectedRoute>
                      <QnaList />
                  </ProtectedRoute>
              } />

            {/* 마이페이지*/}
            <Route path='/mypage' element={<ProtectedRoute/>}>
              <Route index element={<MyPage/>}/>
              <Route path='profile' element={<MyPageProfile/>}/>
              <Route path='withdraw/confirm' element={<PasswordConfirmPage/>}/>
              <Route path='withdraw' element={<WithdrawPage/>}/>
              <Route path='myreview' element={<MyReview/>}/>
              <Route path='myask' element={<MyAsk/>}/>
              <Route path='likereview' element={<LikeReview/>}/>
              <Route path='payments' element={<Payment/>}/>
              <Route path='password' element={<PasswordChangePage/>}/>
            </Route>

              {/*리뷰 목록 페이지*/}
              <Route path='/community/review' element={
                  <ProtectedRoute>
                      <ReviewList />
                  </ProtectedRoute>
              } />

              {/*리뷰 상세보기 페이지*/}
              <Route path='/community/review/:id' element={
                  <ProtectedRoute>
                      <ReviewDetail />
                  </ProtectedRoute>
              } />

              {/*리뷰 글쓰기 페이지*/}
              <Route path='/community/review/write' element={
                  <ProtectedRoute>
                      <ReviewWrite />
                  </ProtectedRoute>
              } />

              {/*리뷰 내가 쓴 글 수정 페이지*/}
              <Route path='/community/review/edit/:id' element={
                  <ProtectedRoute>
                      <ReviewEdit  />
                  </ProtectedRoute>
              } />

              {/*공지사항 목록 페이지*/}
              <Route path='/community/notice' element={
                  <ProtectedRoute>
                      <NoticeList />
                  </ProtectedRoute>
              } />

              {/*QnA 목록 페이지*/}
              <Route path='/community/qna' element={
                  <ProtectedRoute>
                      <QnaList />
                  </ProtectedRoute>
              } />

              {/*QnA 글쓰기 페이지*/}
              <Route path='/community/qna/write' element={
                  <ProtectedRoute>
                    <QnaWrite />
                  </ProtectedRoute>
              } />


              {/*QnA 상세보기 페이지*/}
              <Route path='/community/qna/:id' element={
                  <ProtectedRoute>
                      <QnaDetail />
                  </ProtectedRoute>
              } />

              {/*QnA 수정 페이지*/}
              <Route path='/community/qna/edit/:id' element={
                <ProtectedRoute>
                    <QnaEdit />
                </ProtectedRoute>
              } />

            {/*리뷰 페이지*/}
            <Route path='/community/review' element={
              <ProtectedRoute>
                <Review/>
              </ProtectedRoute>
            }/>

            {/* 관리자 페이지 */}
            <Route path='/admin' element={<ProtectedRoute />}>
              <Route path='menus' element={<MenuManagement />} />
              <Route path='permissions' element={<AuthMAnagement />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
  );
}

export default App;
