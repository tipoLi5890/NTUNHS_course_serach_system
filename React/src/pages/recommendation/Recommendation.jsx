import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useAuth } from '../../hook/AuthProvider.jsx';
import { getSavedCourses, saveCourse, unsaveCourse } from '../../services/Courses_api';
import { getRecords } from '../../services/Record_api';
import { getUserTitle, getElectiveCourses, getRecommendedCourses } from '../../services/Recommendation_api';

const Recommendation = () => {
    const navigate = useNavigate(); // React Router 的導引函數
    const [selectedAnswers, setSelectedAnswers] = useState({}); // 儲存用戶選擇答案
    const [results] = useState([]); // 儲存完整測驗資料
    const [selectedCourse, setSelectedCourse] = useState(null);
    const location = useLocation();
    const { analyzeType } = location.state || {};
    const { isAuthenticated, userInfo } = useAuth(); // 從 AuthProvider 獲取登入狀態與使用者資訊
    const [userTitle, setUserTitle] = useState(null);
    const [courses, setCourses] = useState([]); // 確保 courses 為陣列，即使查詢結果為空
    const [courseSaveData, setCourseSaveData] = useState([]);// 儲存使用者收藏的課程資料
    const [courseReviews, setCourseReviews] = useState([]);// 儲存使用者評論內容的資料
    
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
    
    // 取得使用者稱號
    useEffect(() => {
        if (userInfo?.username) {
            const loadUserTitle = async () => {
                try {
                    const title = await getUserTitle(userInfo.username);
                    setUserTitle(title);
                } catch (error) {
                    console.error('無法載入使用者稱號:', error);
                }
            };
            loadUserTitle();
        }
    }, [userInfo]);

    // 根據 analyzeType 查找對應文字，若無對應則回傳空陣列
    const typeLabels = [userTitle, ...(analyzeTypeMapping[analyzeType] || [])];

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

    // 取得推薦課程
    useEffect(() => {
        if (analyzeType==="" && userInfo?.userID) {
            const loadElectiveCourses = async () => {
                try {
                    const electiveCourses = await getElectiveCourses(userInfo.userID);
                    setCourses(electiveCourses);
                } catch (error) {
                    console.error('無法載入推薦課程:', error);
                }
            };
            loadElectiveCourses();
        }else{
            const loadRecommendedCourses = async () => {
                try {
                    const recommendedCourses = await getRecommendedCourses(userInfo.userID, analyzeType);
                    setCourses(recommendedCourses);
                } catch (error) {
                    console.error('無法載入推薦課程:', error);
                }
            };
            loadRecommendedCourses();
        }
    }, [userInfo]);

    // 取得已儲存的課程
    useEffect(() => {
        if (userInfo?.userID) {
            const loadSavedCourses = async () => {
                try {
                    const savedCourses = await getSavedCourses(userInfo.userID);
                    setCourseSaveData(savedCourses);
                } catch (error) {
                    console.error('無法載入已儲存的課程:', error);
                }
            };
            loadSavedCourses();
        }
    }, [userInfo]);

    // 更新課程狀態
    useEffect(() => {
        if (courseSaveData.length > 0) {
            courses.forEach(course => {
                const savedCourse = courseSaveData.find(saved => saved.id === course.id);
                course.mark = savedCourse ? savedCourse.mark : 0; // 若未儲存則預設為 0
            });
        }
    }, [courseSaveData, courses]);

    // 處理儲存按鈕的點擊事件
    const handleToggleSave = async (id, isSaved) => {
        try {
            let response;
            if (isSaved) {
                response = await unsaveCourse(id, userInfo?.userID);
            } else {
                response = await saveCourse(id, userInfo?.userID);
            }
            if (response.success) {
                // 成功儲存或取消儲存後，更新已儲存課程清單
                const updatedSaveData = await getSavedCourses(userInfo.userID);
                setCourseSaveData(updatedSaveData);

                // 更新 courses 狀態，讓按鈕顯示即時同步
                setCourses(prevCourses =>
                    prevCourses.map(course =>
                        course.id === id
                            ? { ...course, mark: isSaved ? 0 : 1 }
                            : course
                    )
                );
            } else {
                console.error("操作失敗:", response.message);
            }
        } catch (error) {
            console.error("更新課程儲存狀態失敗:", error);
        }
    };
    
    const handleCardClick = async(id) => {
        const courseDetails = courses.find(course => course.id === id);
        if (!courseDetails) {
            alert('無法取得課程詳細資料');
            return;
        }
        setSelectedCourse(courseDetails || null);
        try {
            const courseReviews = await getRecords(id);
            setCourseReviews(courseReviews);
            console.log(courseReviews);
        } catch (error) {
            console.error("取得課程評論失敗:", error);
        }
    };

    const closeContent = () => {
        setSelectedCourse(null);
    };

    const groupedCourses = { all: courses }; // 統一為一組，所有課程都放在這裡

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
        navigate("/testAnalyze", { state: { username: userInfo?.username, results: completedResults } });
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
                            <strong>{userInfo?.username}</strong>
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
                                        isAuthenticated={isAuthenticated}
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