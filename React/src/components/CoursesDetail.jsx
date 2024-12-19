import React, { useEffect, useState } from "react";
import { DescriptionIcon, AnalyticsIcon, CommentIcon, FaceIcon, CloseIcon } from '../utils/Icons';
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
                        {selectedCourse['科目中文名稱']} ({selectedCourse['科目英文名稱']})
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
                            <strong>系所代碼:</strong> {selectedCourse['系所代碼'] || '未知'}
                        </p>
                        <p>
                            <strong>課程全碼:</strong> {selectedCourse['科目代碼_新碼'] || '未知'}
                        </p>
                        <p>
                            <strong>學期:</strong> {selectedCourse['學期'] || '未知'}
                        </p>
                        <p>
                            <strong>系所:</strong> {selectedCourse['系所名稱'] || '未知'}
                        </p>
                        <p>
                            <strong>課程類型:</strong> {selectedCourse['課別名稱'] || '未知'}
                        </p>
                        <p>
                            <strong>年級:</strong> {selectedCourse['年級'] || '未知'}
                        </p>
                        <p>
                            <strong>班級:</strong> {selectedCourse['課表名稱_舊碼'] || '未知'}
                        </p>
                        <p>
                            <strong>授課教師:</strong> {selectedCourse['授課教師姓名'] || '未知'} (
                            {selectedCourse.teacherM})
                        </p>
                        <p>
                            <strong>學分數:</strong> {selectedCourse['學分數'] || '未知'}
                        </p>
                        <p>
                            <strong>修課人數:</strong> {selectedCourse['上課人數'] || '未知'}
                        </p>
                        <p>
                            <strong>週次:</strong> {selectedCourse['上課週次'] || '未知'}
                        </p>
                        <p>
                            <strong>上課時間:</strong> {selectedCourse['上課星期中文'] || '未知'} {selectedCourse['上課節次'] || '未知'}
                        </p>
                        <p>
                            <strong>上課地點:</strong> {selectedCourse['上課地點'] || '未知'}
                        </p>
                        <p>
                            <strong>備註:</strong> {selectedCourse['課表備註'] || '未知'}
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
                            {selectedCourse && selectedCourse['評價列表'] && selectedCourse['評價列表'].length > 0 ? (
                                selectedCourse['評價列表'].map((review, index) => (
                                    <div className="review" key={index}>
                                        <div className="review-header">
                                            <span className="review-date">
                                                {review['評價時間']}
                                            </span>
                                        </div>
                                        <p>{review['評價文本']}</p>
                                    </div>
                                ))
                            ) : (
                                <p>目前暫無該課程的評論</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CoursesDeatial;
