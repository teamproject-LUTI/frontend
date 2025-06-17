import './App.css';
import { Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuth2ErrorPage from "./pages/login/OAuth2ErrorPage";
import Membership from "./pages/login/Membership";
import ReviewList from './pages/community/review/ReviewList';
import ReviewDetail from './pages/community/review/ReviewDetail';
import ReviewWrite from './pages/community/review/ReviewWrite';
import NoticeList from './pages/community/notice/NoticeList';
import QnaList from './pages/community/qna/QnaList';

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

          {/*멤버쉽 페이지*/}
          <Route path='/membership' element={
            <ProtectedRoute>
              <Membership />
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



        </Routes>
      </div>
  );
}

export default App;
