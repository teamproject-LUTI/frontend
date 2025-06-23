import React, { useState, useEffect } from 'react';
const Review = () => {
   const [reviews, setReviews] = useState([]);

  // 임시로 더미 데이터 사용
  useEffect(() => {
    const dummyReviews = [
      { id: 1, title: "제주도 너무 좋았어요!", author: "수빈", likeCount: 12 },
      { id: 2, title: "부산 해운대는 역시 최고", author: "영희", likeCount: 8 },
    ];
    setReviews(dummyReviews);

    // 실제 API 호출 예시
    // fetchReviews().then(data => setReviews(data));
  }, []);

  return (
    <div className="main-layout">
      <div className="main-content-wrapper">
        <main className="main-content">
          <h1>여행 후기 게시판 ✈️</h1>
          <ul>
            {reviews.map((review) => (
              <li key={review.id}>
                <h3>{review.title}</h3>
                <p>작성자: {review.author}</p>
                <p>❤️ 좋아요: {review.likeCount}</p>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
};

export default Review;