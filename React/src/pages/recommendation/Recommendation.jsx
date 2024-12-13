import React, { useState, useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./recommendation.css";
import '../courses/courses.css';
import CourseCard from "../../components/Course-Card";
import CoursesDetial from "../../components/CoursesDetail";
import { CloseIcon } from '../../utils/Icons';
import pic1 from "../../assets/recommendation/1.png";
import pic2 from "../../assets/recommendation/2.png";
import pic3 from "../../assets/recommendation/3.png";
import pic4 from "../../assets/recommendation/4.png";
import pic5 from "../../assets/recommendation/5.png";
import personalPic1 from "../../assets/recommendation/personal1.png";
import TestAnalyze from "./testAnalyze";

const Recommendation = () => {
    const navigate = useNavigate(); // React Router 的導引函數
    const [selectedAnswers, setSelectedAnswers] = useState({}); // 儲存用戶選擇答案
    const [results] = useState([]); // 儲存完整測驗資料
    const [selectedCourse, setSelectedCourse] = useState(null);
    const location = useLocation();
    const { analyzeType } = location.state || {};
    //登入
    const isLoggedIn = window.Cookies.get("isLoggedIn");
    const savedUsername = window.Cookies.get("username");

    // 定義 analyzeType 對應的文字轉換表
    const analyzeTypeMapping = {
        "111": ["百尺竿頭", "諸神的晨練"],
        "112": ["登峰造極", "武鬥場戰士"],
        "113": ["夜總會之王", "暗夜之智"],
        "121": ["匠心獨運", "晨光守望者"],
        "122": ["踏雪無痕", "金色夕陽"],
        "123": ["至理傳承", "星夜追夢人"],
        "131": ["百尺竿頭", "逐光者"],
        "132": ["學識高峰", "黃昏行者"],
        "133": ["暗影之狼"],
        "211": ["七海舵主", "晨起打卡王"],
        "212": ["開疆闢土", "落日遠行者"],
        "213": ["燈火守望人", "開拓者"],
        "221": ["學術匠人", "破曉之翼"],
        "222": ["探索先鋒", "來杯下午茶"],
        "223": ["靈感捕手", "月光追逐者"],
        "231": ["學海逐光", "日出夢想家"],
        "232": ["來杯下午茶", "探索無界"],
        "233": ["午夜旅人", "星夜築夢師"],
        "311": ["飄飄拳", "晨曦學徒"],
        "312": ["穩步前行", "江湖新秀"],
        "313": ["江湖新秀", "夢中覺醒者"],
        "321": ["根基構築者", "初入江湖"],
        "322": ["初入江湖", "來杯下午茶"],
        "323": ["星夜守望人","俠影初現"],
        "331": ["晨起打卡王","初入江湖"],
        "332": ["黃昏築路人", "初入江湖"],
        "333": ["俠影初現", "暗夜創造家"],
        "411": ["江湖風雲客", "晨曦逐光者"],
        "412": ["小品達人", "夕陽漫步"],
        "413": ["江湖風雲客", "星河"],
        "421": ["神機閣主", "編織晨光"],
        "422": ["小品達人", "隨心而行"],
        "423": ["獨攬星辰"],
        "431": ["自由建築師", "旭日築夢人"],
        "432": ["小品達人", "來杯下午茶"],
        "433": ["午夜探險家", "星夜交響曲"]
    }
    

    // 根據 analyzeType 查找對應文字，若無對應則回傳空陣列
    const typeLabels = ["資訊管理系四年級", ...(analyzeTypeMapping[analyzeType] || [])];

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

    // 彈出視窗顯示控制
    const [showAnalyzePopup, setShowAnalyzePopup] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0); // 當前測驗問題
    const questions = [
        {
            question: "您打算規劃的學習方向？",
            options: ["深度學習", "廣度探索", "基礎能力", "其他技能與休閒"],
            //1.本系選修、2.外系選修、3.通識必修、4.通識選修
        },
        {
            question: "您想要尋找？",
            options: ["火辣辣的熱門課程", "較佳的師生比", "隨意"],
            //歷史或上次休課人數
        },
        {
            question: "您喜歡的學習時間？",
            options: ["早上", "下午", "晚上"],
            //課程時間
        },
    ];

    // 處理選擇答案
  const handleOptionChange = (questionIndex, optionValue) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionValue,
    }));
  };


  // 下一題或完成測驗
  const handleNextQuestion = () => {
    if (!selectedAnswers[currentQuestion]) {
        alert("請選擇一個選項才能繼續！");
        return;
    }

    if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
    } else {
        const completedResults = questions.map((q, index) => ({
            question: index + 1, // 問題編號 (從 1 開始)
            answer: selectedAnswers[index], // 選項的編號
        }));

        // 傳遞使用者名稱和測驗結果
        navigate("/testAnalyze", { state: { username: savedUsername, results: completedResults } });
    }
};

    const openAnalyzePopup = () => {
        setShowAnalyzePopup(true);
    };
    
    const closeAnalyzePopup = () => {
        setShowAnalyzePopup(false);
        setCurrentQuestion(0);
        setSelectedAnswers({});
    };

    

    //圖片提式
    const [showTooltip, setShowTooltip] = useState(false);

    const handleMouseEnter = () => setShowTooltip(true);
    const handleMouseLeave = () => setShowTooltip(false);

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
                        <div id="person">
                            <strong>{savedUsername}</strong>
                        </div>
                        <div style={{ position: "relative", display: "inline-block" }}>
                        <img 
                            id="photo" 
                            src={personalPic1} 
                            alt="Personal" 
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        />
                        {showTooltip && (
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "110%",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    backgroundColor: "#000",
                                    color: "#fff",
                                    padding: "8px",
                                    borderRadius: "5px",
                                    fontSize: "12px",
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                    zIndex: 10,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <a
                                    href="https://zh.lovepik.com/images/png-1128834.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#fff", textDecoration: "none" }}
                                >
                                    Ink Png vectors by Lovepik.com
                                </a>
                            </div>
                        )}
                        </div>
                        <h6>江湖封號</h6>
                        <div id="type">
                            {typeLabels.map((label, index) => (
                                <div
                                    key={index}
                                    className="typeLable"
                                    id={index === 0 ? "typeOfIdentity" : undefined}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                        <button
                            id="personal_analyze"
                            type="button"
                            onClick={openAnalyzePopup}
                        >
                            點我分析
                        </button>
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

            {/* 測驗彈窗 */}
            {showAnalyzePopup && (
            <>
                <div className="overlay" onClick={closeAnalyzePopup}></div>
                <div className="popup">
                <div className="popup-content">
                    <button onClick={closeAnalyzePopup} id="close-analyze">
                        <CloseIcon />
                    </button>

                    {/* 進度條 */}
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>

                    <h4>{questions[currentQuestion].question}</h4>
                    {questions[currentQuestion].options.map((option, index) => (
                    <div key={index} className="option">
                        <input
                        type="radio"
                        id={`q${currentQuestion}-${index}`}
                        name={`q${currentQuestion}`}
                        value={index + 1} // 編號從 1 開始
                        checked={selectedAnswers[currentQuestion] === index + 1}
                        onChange={() =>
                            handleOptionChange(currentQuestion, index + 1)
                        }
                        />
                        <label htmlFor={`q${currentQuestion}-${index}`}>
                        {option}
                        </label>
                    </div>
                    ))}
                    <button onClick={handleNextQuestion}>
                    {currentQuestion < questions.length - 1 ? "下一題" : "完成測驗"}
                    </button>
                </div>
                </div>
            </>
            )}
            
            {/* 頁尾 */}
            <Footer />

            {/* 傳送測驗資料到 TestAnalyze */}
            {results.length > 0 && (
                <TestAnalyze username={savedUsername} results={results} />
            )}
        </div>
    );
};

export default Recommendation;
