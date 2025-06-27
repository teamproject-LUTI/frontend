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
import './styles/MyPage/Route.css';
import './styles/MyPage/TravelRecord.css';
import './styles/accomodation/HotelBooking.css';
import { Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Main from "./pages/Main";
import Login from "./pages/login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuth2ErrorPage from "./pages/login/OAuth2ErrorPage";
import Membership from "./pages/login/Membership";
import ReviewList from './pages/community/review/ReviewList';
import ReviewDetail from './pages/community/review/ReviewDetail';
import ReviewWrite from './pages/community/review/ReviewWrite';
import ReviewEdit from './pages/community/review/ReviewEdit';
import QnaList from './pages/community/qna/QnaList';
import QnaWrite from './pages/community/qna/QnaWrite';
import QnaDetail from './pages/community/qna/QnaDetail';
import QnaEdit from './pages/community/qna/QnaEdit';
import NoticeList from './pages/community/notice/NoticeList';
import NoticeWrite from './pages/community/notice/NoticeWrite';
import NoticeDetail from './pages/community/notice/NoticeDetail';
import NoticeEdit  from './pages/community/notice/NoticeEdit';
import MyPage from "./pages/mypage/MyPage"
import MyPageProfile from "./pages/mypage/profile/MyPageProfile"
import WithdrawPage from "./pages/mypage/withdraw/WithdrawPage";
import AccountRestorePage from "./pages/mypage/withdraw/AccountRestorePage";
import PasswordConfirmPage from "./pages/mypage/PasswordConfirmPage";
import { AuthProvider } from "./util/AuthContext";
import ChatForm from "./components/chatgpt/ChatForm";
import HotelBooking from "./pages/accomodation/HotelBooking";
import Payment from './pages/mypage/Payment';
import MyReview from "./pages/mypage/myreview/MyReview";
import MyAsk from "./pages/mypage/myask/MyAsk";
import LikeReview from "./pages/mypage/likereview/LikeReview";
import MenuManagement from "./pages/management/MenuManagement";
import FindAccountPage from './pages/login/FindAccountPage';
import AuthMAnagement from "./pages/management/AuthManagement";

import PasswordChangePage from "./pages/mypage/password/PasswordChangePage";
import PaymentManagement from "./pages/management/PaymentManagement";
import RouteMark from "./pages/mypage/route/Route";
import OAuth2CallbackHandler from "./pages/login/OAuth2CallbackHandler";
import TravelRecord from "./pages/mypage/TravelRecord/TravelRecord";

const App = () => {
    const location = useLocation();

    // 레이아웃이 필요 없는 페이지들 (로그인, 회원가입 등)
    const noLayoutPaths = ['/', '/login', '/membership', '/auth/error', '/account/restore', '/account/find'];
    const needsLayout = !noLayoutPaths.includes(location.pathname);

    return (
        <AuthProvider>
            <div id='app'>
                {needsLayout ? (
                    // Layout 컴포넌트 사용 (Sidebar 한 번만 렌더링)
                    <Layout>
                        <Routes>
                            {/* 메인 페이지 */}
                            <Route path='/main' element={
                                <ProtectedRoute>
                                    <Main/>
                                </ProtectedRoute>
                            }/>

                            {/* 커뮤니티 - 리뷰 */}
                            <Route path='/community/review' element={
                                <ProtectedRoute>
                                    <ReviewList />
                                </ProtectedRoute>
                            } />

                            <Route path='/community/review/:id' element={
                                <ProtectedRoute>
                                    <ReviewDetail />
                                </ProtectedRoute>
                            } />

                            <Route path='/community/review/write' element={
                                <ProtectedRoute>
                                    <ReviewWrite />
                                </ProtectedRoute>
                            } />

                            <Route path='/community/review/edit/:id' element={
                                <ProtectedRoute>
                                    <ReviewEdit  />
                                </ProtectedRoute>
                            } />

                            {/* 커뮤니티 - QnA */}
                            <Route path='/community/qna' element={
                                <ProtectedRoute>
                                    <QnaList />
                                </ProtectedRoute>
                            } />

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

                            {/* 공지사항 목록 */}
                            <Route path='/community/notice' element={
                                <ProtectedRoute>
                                    <NoticeList/>
                                </ProtectedRoute>
                            }/>

                            {/* 공지사항 글쓰기 */}
                            <Route path='/community/notice/write' element={
                                <ProtectedRoute>
                                    <NoticeWrite/>
                                </ProtectedRoute>
                            }/>

                            {/* 공지사항 상세보기 */}
                            <Route path='/community/notice/:id' element={
                                <ProtectedRoute>
                                    <NoticeDetail/>
                                </ProtectedRoute>
                            }/>

                            {/* 공지사항 수정 */}
                            <Route path='/community/notice/edit/:id' element={
                                <ProtectedRoute>
                                    <NoticeEdit/>
                                </ProtectedRoute>
                            }/>

                            {/* 마이페이지 - 개별 Routes로 변경 */}
                            <Route path='/mypage' element={
                                <ProtectedRoute>
                                    <MyPage/>
                                </ProtectedRoute>
                            }/>
                            <Route path='/mypage/profile' element={
                                <ProtectedRoute>
                                    <MyPageProfile/>
                                </ProtectedRoute>
                            }/>
                            <Route path='/mypage/withdraw/confirm' element={
                                <ProtectedRoute>
                                    <PasswordConfirmPage/>
                                </ProtectedRoute>
                            }/>
                            <Route path='/mypage/withdraw' element={
                                <ProtectedRoute>
                                    <WithdrawPage/>
                                </ProtectedRoute>
                            }/>

                            <Route path='/mypage/travelRecord' element={
                                <ProtectedRoute>
                                    <TravelRecord/>
                                </ProtectedRoute>
                            }/>

                            <Route path='/mypage/myreview' element={
                                <ProtectedRoute>
                                    <MyReview/>
                                </ProtectedRoute>
                            }/>
                            <Route path='/mypage/myask' element={
                                <ProtectedRoute>
                                    <MyAsk/>
                                </ProtectedRoute>
                            }/>
                            <Route path='/mypage/likereview' element={
                                <ProtectedRoute>
                                    <LikeReview/>
                                </ProtectedRoute>
                            }/>
                            <Route path='/mypage/payments' element={
                                <ProtectedRoute>
                                    <Payment/>
                                </ProtectedRoute>
                            }/>
                            <Route path='/mypage/password' element={
                                <ProtectedRoute>
                                    <PasswordChangePage/>
                                </ProtectedRoute>
                            }/>

                            <Route path='/mypage/routes' element={
                                <ProtectedRoute>
                                    <RouteMark/>
                                </ProtectedRoute>
                            }/>

                            {/* 관리자 페이지 - 개별 Routes로 변경 */}
                            <Route path='/admin/menus' element={
                                <ProtectedRoute>
                                    <MenuManagement />
                                </ProtectedRoute>
                            } />
                            <Route path='/admin/permissions' element={
                                <ProtectedRoute>
                                    <AuthMAnagement />
                                </ProtectedRoute>
                            } />
                            <Route path='/admin/payments' element={
                                <ProtectedRoute>
                                    <PaymentManagement />
                                </ProtectedRoute>
                            } />

                            {/*gpt 페이지*/}
                            <Route path='travel/chatform' element={
                                <ProtectedRoute>
                                    <ChatForm/>
                                </ProtectedRoute>
                            } />

                            {/*  숙소 예약 */}
                            <Route path='/hotels/booking' element={
                                <ProtectedRoute>
                                    <HotelBooking/>
                                </ProtectedRoute>
                            } />

                        </Routes>
                    </Layout>
                ) : (
                    //  레이아웃이 필요 없는 페이지들 (로그인 등)
                    <Routes>
                        <Route path='/' element={<Login/>}/>
                        <Route path='/login' element={<Login/>}/>
                        <Route path='/membership' element={<Membership/>}/>
                        <Route path='/auth/error' element={<OAuth2ErrorPage/>}/>
                        <Route path='/account/restore' element={<AccountRestorePage/>}/>
                        <Route path='/login/OAuth2CallbackHandler' element={<OAuth2CallbackHandler/>}/>
                        <Route path='/account/find' element={<FindAccountPage/>}/>
                    </Routes>
                )}
            </div>
        </AuthProvider>
    );
}

export default App;
