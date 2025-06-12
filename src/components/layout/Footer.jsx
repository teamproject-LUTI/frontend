import React from 'react';
import { Plane, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import '../../styles/layout/Footer.css';

const Footer = () => {
  const handleLinkClick = (section) => {
    console.log(`${section} 클릭됨`);
  };

  return (
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            {/* Company Info */}
            <div className="footer-company">
              <div className="footer-logo">
                <Plane className="footer-logo-icon" />
                <span className="footer-logo-text">LUTI</span>
              </div>
              <p className="footer-description">
                똑똑한 여행의 시작, LUTI와 함께 특별한 여행을 계획하세요.
              </p>
              <div className="social-links">
                <Facebook className="social-icon" />
                <Twitter className="social-icon" />
                <Instagram className="social-icon" />
                <Youtube className="social-icon" />
              </div>
            </div>

            {/* Services */}
            <div className="footer-section">
            {/*  <h3>서비스</h3>*/}
            {/*  <ul className="footer-links">*/}
            {/*    <li>*/}
            {/*      <button*/}
            {/*          onClick={() => handleLinkClick('여행 계획')}*/}
            {/*          className="footer-link"*/}
            {/*      >*/}
            {/*        여행 계획*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*      <button*/}
            {/*          onClick={() => handleLinkClick('숙소 예약')}*/}
            {/*          className="footer-link"*/}
            {/*      >*/}
            {/*        숙소 예약*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*      <button*/}
            {/*          onClick={() => handleLinkClick('항공편 검색')}*/}
            {/*          className="footer-link"*/}
            {/*      >*/}
            {/*        항공편 검색*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*      <button*/}
            {/*          onClick={() => handleLinkClick('액티비티')}*/}
            {/*          className="footer-link"*/}
            {/*      >*/}
            {/*        액티비티*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*      <button*/}
            {/*          onClick={() => handleLinkClick('여행 가이드')}*/}
            {/*          className="footer-link"*/}
            {/*      >*/}
            {/*        여행 가이드*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*  </ul>*/}
            {/*</div>*/}

            {/*/!* Support *!/*/}
            {/*<div className="footer-section">*/}
            {/*  <h3>고객지원</h3>*/}
            {/*  <ul className="footer-links">*/}
            {/*    <li>*/}
            {/*      <button*/}
            {/*          onClick={() => handleLinkClick('자주 묻는 질문')}*/}
            {/*          className="footer-link"*/}
            {/*      >*/}
            {/*        자주 묻는 질문*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*      <button*/}
            {/*          onClick={() => handleLinkClick('고객센터')}*/}
            {/*          className="footer-link"*/}
            {/*      >*/}
            {/*        고객센터*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*      <button*/}
            {/*          onClick={() => handleLinkClick('이용약관')}*/}
            {/*          className="footer-link"*/}
            {/*      >*/}
            {/*        이용약관*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*      <button*/}
            {/*          onClick={() => handleLinkClick('개인정보처리방침')}*/}
            {/*          className="footer-link"*/}
            {/*      >*/}
            {/*        개인정보처리방침*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*    <li>*/}
            {/*      <button*/}
            {/*          onClick={() => handleLinkClick('환불정책')}*/}
            {/*          className="footer-link"*/}
            {/*      >*/}
            {/*        환불정책*/}
            {/*      </button>*/}
            {/*    </li>*/}
            {/*  </ul>*/}
            </div>

            {/* Contact */}
            <div className="footer-section">
            {/*  <h3>연락처</h3>*/}
            {/*  <div className="contact-info">*/}
            {/*    <p>고객센터: 1588-0000</p>*/}
            {/*    <p>평일 09:00 - 18:00</p>*/}
            {/*    <p>주말 및 공휴일 휴무</p>*/}
            {/*    <p>*/}
            {/*      이메일:{' '}*/}
            {/*      <a href="mailto:support@luti.com" className="contact-email">*/}
            {/*        support@luti.com*/}
            {/*      </a>*/}
            {/*    </p>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>

          {/* Bottom Section */}
          <div className="footer-bottom">
          {/*  <div className="copyright">*/}
          {/*    © 2025 LUTI. All rights reserved.*/}
          {/*  </div>*/}
          {/*  <div className="footer-bottom-links">*/}
          {/*    <button*/}
          {/*        onClick={() => handleLinkClick('회사소개')}*/}
          {/*        className="footer-bottom-link"*/}
          {/*    >*/}
          {/*      회사소개*/}
          {/*    </button>*/}
          {/*    <button*/}
          {/*        onClick={() => handleLinkClick('채용정보')}*/}
          {/*        className="footer-bottom-link"*/}
          {/*    >*/}
          {/*      채용정보*/}
          {/*    </button>*/}
          {/*    <button*/}
          {/*        onClick={() => handleLinkClick('파트너십')}*/}
          {/*        className="footer-bottom-link"*/}
          {/*    >*/}
          {/*      파트너십*/}
          {/*    </button>*/}
          {/*    <button*/}
          {/*        onClick={() => handleLinkClick('광고문의')}*/}
          {/*        className="footer-bottom-link"*/}
          {/*    >*/}
          {/*      광고문의*/}
          {/*    </button>*/}
            </div>
          </div>
        </div>
      </footer>
  );
};

export default Footer;
