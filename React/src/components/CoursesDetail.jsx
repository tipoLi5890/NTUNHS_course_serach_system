import React, { useEffect, useState } from "react";
import {DescriptionIcon, AnalyticsIcon, CommentIcon, FaceIcon, CloseIcon } from '../utils/Icons';
import "../pages/courses/courses.css";

const CoursesDeatial = ({
    selectedCourse,
    closeContent,
    courseReviews = [],
    }) => {
    const [page, setPage] = useState(1); // 頁面狀態

    // 切換彈出視窗時，控制 body 的樣式
    useEffect(() => {
        if (selectedCourse) {
        document.body.classList.add("modal-open");
        } else {
        document.body.classList.remove("modal-open");
        }
        return () => document.body.classList.remove("modal-open");
    }, [selectedCourse]);

    // 當沒有選中的課程時，不渲染彈出視窗
    if (!selectedCourse) return null;

    return (
        <>
        {/* 背景遮罩 */}
        <div className="overlay" onClick={closeContent}></div>

        {/* 彈出視窗 */}
        <div className="showContent">
            {/* 頁面標題與關閉按鈕 */}
            <div className="content-header">
            <h4>
                {selectedCourse.course} ({selectedCourse.courseE})
            </h4>
            <button className="close-showContent" onClick={closeContent}>
                <CloseIcon />
            </button>
            </div>

            {/* 頁面切換區域 */}
            <div className="tabs">
            <button
                onClick={() => setPage(1)}
                className={page === 1 ? "active" : ""}
            >
                <DescriptionIcon />
            </button>
            <button
                onClick={() => setPage(2)}
                className={page === 2 ? "active" : ""}
            >
                <AnalyticsIcon />
            </button>
            <button
                onClick={() => setPage(3)}
                className={page === 3 ? "active" : ""}
            >
                <CommentIcon />
            </button>
            </div>

            {/* 分頁內容 */}
            {page === 1 && (
            <div>
                <p>
                <strong>課程代碼:</strong> {selectedCourse.code || '未知'}
                </p>
                <p>
                <strong>課程全碼:</strong> {selectedCourse.courseID || '未知'}
                </p>
                <p>
                <strong>學期:</strong> {selectedCourse.term || '未知'}
                </p>
                <p>
                <strong>科系:</strong> {selectedCourse.department || '未知'}
                </p>
                <p>
                <strong>課程類型:</strong> {selectedCourse.courseType || '未知'} 
                </p>
                <p>
                <strong>年級:</strong> {selectedCourse.grade || '未知'}
                </p>
                <p>
                <strong>班級:</strong> {selectedCourse.class || '未知'}
                </p>
                <p>
                <strong>授課教師:</strong> {selectedCourse.teacher || '未知'} (
                {selectedCourse.teacherM})
                </p>
                <p>
                <strong>學分數:</strong> {selectedCourse.credits || '未知'}
                </p>
                <p>
                <strong>修課人數/容量:</strong>{" "}
                {selectedCourse["number-capacity"]  || '未知'}
                </p>
                <p>
                <strong>週次:</strong> {selectedCourse.week || '未知'}
                </p>
                <p>
                <strong>上課時間:</strong> {selectedCourse.time || '未知'}
                </p>
                <p>
                <strong>上課地點:</strong> {selectedCourse.room || '未知'}
                </p>
                <p>
                <strong>備註:</strong> {selectedCourse.note || '未知'}
                </p>
            </div>
            )}

            {page === 2 && (
            <div>
                <p>
                <strong>開課資訊: </strong>
                <a href={selectedCourse.info}>教學計劃.pdf</a>
                </p>
            </div>
            )}

            {page === 3 && (
            <div>
                <p>
                <strong>評論:</strong>
                </p>
                <div className="reviews">
                {courseReviews
                    .filter((review) => review.id === selectedCourse.id)
                    .map((review, index) => (
                    <div className="review" key={index}>
                        <div className="review-header">
                        <span className="review-creator">
                            <FaceIcon />
                            {review.creater}
                        </span>
                        <span className="review-date">
                            {review["review-date"]}
                        </span>
                        </div>
                        <p>{review.comment}</p>
                    </div>
                    ))}
                </div>
            </div>
            )}
        </div>
        </>
    );
};

export default CoursesDeatial;
