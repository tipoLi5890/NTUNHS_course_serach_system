import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./recommendation.css";
import '../courses/courses.css';
import CourseCard from "../../components/Course-Card"; // 引入新建的 CourseCard
import CoursesDetial from "../../components/CoursesDetail"; // 引入彈出視窗元件
import pic1 from "../../assets/recommendation/1.png";
import pic2 from "../../assets/recommendation/2.png";
import pic3 from "../../assets/recommendation/3.png";
import pic4 from "../../assets/recommendation/4.png";
import pic5 from "../../assets/recommendation/5.png";

const Recommendation = () => {
    //登入
    const isLoggedIn = window.Cookies.get("isLoggedIn");
    const savedUsername = window.Cookies.get("username");

    // 如果未登入，跳轉至 /Login
    useEffect(() => {
        if (!isLoggedIn) {
            window.location.href = "/Login";
        }
    }, [isLoggedIn]);

     // 幻燈片圖片
     const slides = [pic1, pic2, pic3, pic4, pic5];
     const [currentSlide, setCurrentSlide] = useState(0);

    // 自動換頁功能
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // 每3秒切換
        return () => clearInterval(interval);
    }, [slides.length]);

    const [groupKey, setGroupKey] = useState("department"); // 分隔條件
    const [selectedCourse, setSelectedCourse] = useState(null); // 當前選中的課程資料

    // 儲存課程的狀態
    const [savedCourse, setSavedCourse] = useState({});

    // 切換儲存狀態的函式
    const handleToggleSave = (courseId) => {
        setSavedCourse((prev) => ({
            ...prev,
            [courseId]: !prev[courseId],
        }));
        console.log(`課程 ${courseId} 的儲存狀態已切換`);
    };

    // 卡片點擊處理
    const handleCardClick = (courseId) => {
        console.log(`點擊了課程卡片: ${courseId}`);
    };

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

    const groupedCourses = { all: courseDisplayData }; // 統一為一組，所有課程都放在這裡
    

    const closeContent = () => {
        setSelectedCourse(null);
    };

    return (
        <div id="returnPlace">
            {/* 頁首 */}
            <Header />
            <div className="main">
                <div id="section1">
                    {/* 幻燈片 */}
                    <div id="ad_courses">
                        <div className="carousel">
                            {slides.map((slide, index) => (
                                <div
                                    key={index}
                                    className={`slide ${currentSlide === index ? "active" : ""}`}
                                    style={{ backgroundImage: `url(${slide})` }}
                                ></div>
                            ))}
                            {/* 手動換頁點 */}
                            <div className="dots">
                                {slides.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`dot ${currentSlide === index ? "active" : ""}`}
                                        onClick={() => setCurrentSlide(index)}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 個人頁面 */}
                    <div id="personal">
                        <div id="person"><strong>{savedUsername}</strong></div>
                        <div id="level">等級</div>
                        <button id="personal_levelUp" type="submit">點我渡劫</button>
                        <div id="type">
                            <div className="typeLable">初生之犢</div>
                            <div className="typeLable">學分斯巴達</div>
                            <div className="typeLable">夜貓子</div>
                        </div>                        
                        <button id="personal_analyze" type="submit">點我分析</button>
                    </div>
                </div>
                <br/>
                <hr/>
                <div id="section2">
                    <h4>以下課程可能讓您感到興奮</h4>
                    <div className='result'>
                        <div className="course-list">
                            {groupedCourses.all.map((course) => {
                                const savedCourse = courseSaveData.find((item) => item.id === course.id);
                                return (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        isLoggedIn={isLoggedIn}
                                        savedCourse={savedCourse}
                                        handleToggleSave={handleToggleSave}
                                        handleCardClick={handleCardClick}
                                    />

                                );
                            })}
                        </div>
                    </div>
                </div>                
            </div>

            {/* 彈出視窗與遮罩 */}
            {selectedCourse && (
                <CoursesDetial
                    selectedCourse={selectedCourse}
                    closeContent={closeContent}
                    courseReviews={courseReviews}
                />
            )}

            {/* 頁尾 */}
            <Footer />
        </div>
    );
};

export default Recommendation;
