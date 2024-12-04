import React, { useState, useEffect } from 'react';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import './courses.css';
import courseImage from "../../assets/courses/course.png";
import {DescriptionIcon, AnalyticsIcon, CommentIcon, FaceIcon, CloseIcon } from '../../utils/Icons';

const Courses = () => {
    const [groupKey, setGroupKey] = useState("department"); // 分隔條件
    const [selectedCourse, setSelectedCourse] = useState(null); // 當前選中的課程資料
    const [page, setPage] = React.useState(1); //追蹤彈出視窗分頁

    //登入
    const isLoggedIn = window.Cookies.get('isLoggedIn');
    const savedUsername = window.Cookies.get('username');

    // 假設資料
    const [courseSaveData, setCourseSaveData] = useState([
        { id: "221256702345321", mark: 0 },
        { id: "221256702345322", mark: 1 },
        { id: "221256702345323", mark: 0 }
    ]);

    // 負責課程展示的資料
    const courseDisplayData = [
        { id: "221256702345321", course: "國文課", time: "星期五1~2節", credits: 2, room: "G204", teacherM: "林體闕", belongs: "四年制資管系二年級", courseType: "通識必修" },
        { id: "221256702345322", course: "微積分", time: "星期五3~4節", credits: 3, room: "H101", teacherM: "鬍鬚張", belongs: "四年制資管系一年級", courseType: "專業必修" },
        { id: "221256702345323", course: "資訊概論", time: "星期一5~6節", credits: 2, room: "I202", teacherM: "連大刀", belongs: "四年制資管系一年級", courseType: "專業選修" }
    ];

    // 負責課程內容的資料
    const courseContentData = [
        {
            term: "1121",
            department: "四年制資訊管理系",
            courseType: "通識必修",
            course: "國文課",
            courseE: "Chinese",
            code: "0234",
            id: "221256702345321",
            grade: 2,
            class: "A1",
            teacherM: "林體闕",
            "number-capacity": "39/60",
            week: "16",
            credits: 2,
            time: "星期五1~2節",
            room: "G204",
            teacher: "林體闕",
            note: "修課限-本系四技一般生二年級以上、外系二年級以上",
            info: "https://example.com/course/221256702345321"
        },
        {
            term: "1121",
            department: "四年制資訊管理系",
            courseType: "專業必修",
            course: "微積分",
            courseE: "Calculus",
            code: "0567",
            id: "221256702345322",
            grade: 1,
            class: "A2",
            teacherM: "鬍鬚張",
            "number-capacity": "45/50",
            week: "16",
            credits: 3,
            time: "星期五3~4節",
            room: "H101",
            teacher: "鬍鬚張",
            note: "修課限-本系一年級學生",
            info: "https://example.com/course/221256702345322"
        },
        {
            term: "1121",
            department: "四年制資訊管理系",
            courseType: "專業選修",
            course: "資訊概論",
            courseE: "Introduction to Information Systems",
            code: "0987",
            id: "221256702345323",
            grade: 1,
            class: "A3",
            teacherM: "連大刀",
            "number-capacity": "50/60",
            week: "16",
            credits: 2,
            time: "星期一5~6節",
            room: "I202",
            teacher: "連大刀",
            note: "修課限-本系一年級及其他系一年級以上",
            info: "https://example.com/course/221256702345323"
        }
    ];

    // 負責評論內容的資料
    const courseReviews = [
        { code: "0234", creater: "資訊管理系 三年級", "review-date": "2024-03-01", comment: "探討人生中所面對的生死、命運，人生主軸以及自我價值性的問題，以深度詮釋課程意義。" },
        { code: "0234", creater: "資訊管理系 二年級", "review-date": "2024-01-19", comment: "探討人生中所面對的生死、命運，人生主軸以及自我價值性的問題，以深度詮釋課程意義。" },
        { code: "0234", creater: "資訊管理系 二年級", "review-date": "2024-01-18", comment: "探討人生中所面對的生死、命運，人生主軸以及自我價值性的問題，以深度詮釋課程意義。" },
        { code: "0567", creater: "資訊管理系 一年級", "review-date": "2024-02-15", comment: "深入講解微積分的實際應用與理論，課程內容非常有系統，值得一修，老師非常耐心，且講解詳細." },
        { code: "0567", creater: "資訊管理系 一年級", "review-date": "2024-02-10", comment: "深入講解微積分的實際應用與理論，課程內容非常有系統，值得一修，老師非常耐心，且講解詳細." },
        { code: "0987", creater: "資訊管理系 一年級", "review-date": "2024-03-05", comment: "介紹資訊科學的基本概念，非常入門，課程氛圍輕鬆有趣，適合初學者，提供了許多實用的資訊管理案例。" },
        { code: "0987", creater: "資訊管理系 一年級", "review-date": "2024-03-04", comment: "介紹資訊科學的基本概念，非常入門，課程氛圍輕鬆有趣，適合初學者，提供了許多實用的資訊管理案例。" },
        { code: "0987", creater: "資訊管理系 一年級", "review-date": "2024-03-03", comment: "介紹資訊科學的基本概念，非常入門，課程氛圍輕鬆有趣，適合初學者，提供了許多實用的資訊管理案例。" },
        { code: "0987", creater: "資訊管理系 一年級", "review-date": "2024-03-01", comment: "介紹資訊科學的基本概念，非常入門，課程氛圍輕鬆有趣，適合初學者，提供了許多實用的資訊管理案例。" }
    ];

    const groupedCourses = courseDisplayData.reduce((acc, course) => {
        let key = course[groupKey];
        if (groupKey === "day") {
            key = course.time.substring(0, 3); // 提取 time 的前三字元
        }
        if (groupKey === "department") {
            key = course.belongs.substring(0, 6); // 提取 time 的前三字元
        }
        if (!acc[key]) acc[key] = [];
        acc[key].push(course);
        return acc;
    }, {});
    
    // 處理儲存按鈕的點擊事件
    const handleToggleSave = (id) => {
        setCourseSaveData((prevSaveData) =>
            prevSaveData.map((course) =>
                course.id === id ? { ...course, mark: course.mark === 1 ? 0 : 1 } : course
            )
        );
    };
    
    const handleCardClick = (id) => {
        const courseDetails = courseContentData.find((course) => course.id === id);
        setSelectedCourse(courseDetails || null);
    };

    const closeContent = () => {
        setSelectedCourse(null);
    };

    // 在彈出視窗開啟/關閉時切換 body 類名
    useEffect(() => {
        if (selectedCourse) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => document.body.classList.remove("modal-open"); // 清除效果
    }, [selectedCourse]);

    return (
        <div id="returnPlace">
            {/* 頁首 */}
            <Header/>
           
            <div className='main'>
                <h2>搜尋結果</h2>
                <div className='container'>
                    {/* 左側查詢結果內容 */}
                    <div className='result'>
                        <div className="classification-selector">
                            <label htmlFor="group-key">分類依據：</label>
                            <select
                                id="group-key"
                                value={groupKey}
                                onChange={(e) => setGroupKey(e.target.value)}
                            >
                                <option value="department">科系</option>
                                <option value="day">星期</option>
                                <option value="courseType">課程類型</option>                                                   
                            </select>
                        </div>
                    
                        {/* 分類顯示 */}
                        <div className="classification-container">
                            {Object.entries(groupedCourses).map(([key, courses]) => (
                                <div key={key} className="classification">
                                    <h4>{key}</h4>
                                    <div className="course-list">
                                        {courses.map((course) => {
                                            const savedCourse = courseSaveData.find((item) => item.id === course.id);
                                            return (
                                                <div
                                                key={course.id}
                                                className="course-card"
                                                onClick={() => handleCardClick(course.id)}
                                                >
                                                    <img src={courseImage} className="courseImage" alt="課程圖示" />
                                                    <div className="course-content">
                                                        <div className="course-header">
                                                            <span className="course-name">{course.course}</span>
                                                            {isLoggedIn && ( // 僅在已登入的情況下顯示按鈕
                                                            <button
                                                                onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleSave(course.id);
                                                                }}
                                                                className={`save-button ${savedCourse?.mark === 1 ? "saved" : ""}`}
                                                            >
                                                                {savedCourse?.mark === 1 ? "★" : "☆"}
                                                            </button>
                                                            )}
                                                        </div>
                                                        <div className="course-details">
                                                            {course.time} ({course.credits}) {course.room} {course.teacherM}
                                                        </div>
                                                        <div className="course-belongs">{course.belongs}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* 右側側邊欄 */}
                    <div className='besider'>
                        <h6>熱門排行榜</h6>
                        <a href=''>物件導向</a><br/>
                        <a href=''>資料庫</a><br/>
                        <a href=''>商業智慧</a><br/>
                        <a href=''>系統分析</a><br/>
                        <a href=''>系統分析</a>
                    </div>
                </div>  
            </div>
            
            {/* 彈出視窗與遮罩 */}
            {selectedCourse && (
                <>
                    {/* 背景遮罩 */}
                    <div className="overlay" onClick={closeContent}></div>

                    {/* 彈出視窗 */}
                    <div className="showContent">
                        
                        {/* 頁面標題與關閉按鈕 */}
                        <div className="content-header">
                            <h4>{selectedCourse.course} ({selectedCourse.courseE})</h4>
                            <button className="close-showContent" onClick={closeContent}>
                                <CloseIcon />
                            </button>
                        </div>

                        {/* 頁面切換區域 */}
                        <div className="tabs">
                            <button onClick={() => setPage(1)} className={page === 1 ? "active" : ""}><DescriptionIcon/></button>
                            <button onClick={() => setPage(2)} className={page === 2 ? "active" : ""}><AnalyticsIcon/></button>
                            <button onClick={() => setPage(3)} className={page === 3 ? "active" : ""}><CommentIcon/></button>
                        </div>
                            
                        {/* 分頁內容 */}
                        {page === 1 && (
                            <div>
                                <p><strong>課程代碼:</strong> {selectedCourse.code}</p>
                                <p><strong>課程全碼:</strong> {selectedCourse.id}</p>
                                <p><strong>學期:</strong> {selectedCourse.term}</p>
                                <p><strong>科系:</strong> {selectedCourse.department}</p>
                                <p><strong>課程類型:</strong> {selectedCourse.courseType}</p>
                                <p><strong>年級:</strong> {selectedCourse.grade}</p>
                                <p><strong>班級:</strong> {selectedCourse.class}</p>
                                <p><strong>授課教師:</strong> {selectedCourse.teacher} ({selectedCourse.teacherM})</p>
                                <p><strong>學分數:</strong> {selectedCourse.credits}</p>                                    <p><strong>修課人數/容量:</strong> {selectedCourse["number-capacity"]}</p>
                                <p><strong>週次:</strong> {selectedCourse.week}</p>
                                <p><strong>上課時間:</strong> {selectedCourse.time}</p>
                                <p><strong>上課地點:</strong> {selectedCourse.room}</p>
                                <p><strong>備註:</strong> {selectedCourse.note}</p>
                            </div>
                        )}
                            
                        {page === 2 && (
                            <div>
                                <p><strong>開課資訊: </strong> 
                                    <a href="{selectedCourse.info}">
                                        教學計劃.pdf
                                    </a>
                                </p>
                            </div>
                        )}
                            
                        {page === 3 && (
                            <div>
                                <p><strong>評論:</strong></p>
                                <div className="reviews">
                                    {courseReviews
                                        .filter(review => review.code === selectedCourse.code)
                                        .map((review, index) => (
                                            <div className="review" key={index}>
                                                <div className="review-header">
                                                    <span className="review-creator"><FaceIcon/>{review.creater}</span>
                                                    <span className="review-date">{review["review-date"]}</span>
                                                </div>
                                                <p>{review.comment}</p>
                                            </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* 頁尾 */}
            <Footer/>
        </div>
    );
};
export default Courses;
