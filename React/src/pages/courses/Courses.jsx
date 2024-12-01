import React, { useState } from 'react';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import './courses.css';
import courseImage from "../../assets/courses/course.png";

const Courses = () => {
    const [groupKey, setGroupKey] = useState("department"); // 分隔條件

    //登入
    const isLoggedIn = window.Cookies.get('isLoggedIn');
    const savedUsername = window.Cookies.get('username');

    //登出
    const handleLogout = () => {
        // 清除登入 Cookies
        Cookies.remove('isLoggedIn');
        Cookies.remove('username');
        // 重定向到首頁
        navigate('/');
        // 確保清理狀態立即反映
        window.location.reload(); // 強制重新載入頁面，確保 UI 更新
    };

    // 假設資料
    const [courseSaveData, setCourseSaveData] = useState([
        { id: "221256702345321", mark: 0 },
        { id: "221256702345322", mark: 1 },
        { id: "221256702345323", mark: 0 }
    ]);

    // 負責課程展示的資料
    const courseDisplayData = [
        { id: "221256702345321", course: "國文課", time: "星期三1~2節", credits: 2, room: "G204", teacherM: "林體闕", belongs: "四年制資管系二年級" },
        { id: "221256702345322", course: "微積分", time: "星期五3~4節", credits: 3, room: "H101", teacherM: "鬍鬚張", belongs: "四年制資管系一年級" },
        { id: "221256702345323", course: "資訊概論", time: "星期一5~6節", credits: 2, room: "I202", teacherM: "連大刀", belongs: "四年制資管系一年級" }
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
            time: "星期三1~2節",
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

    const groupedCourses = courseContentData.reduce((acc, course) => {
        let key = course[groupKey];
        if (groupKey === "day") {
            key = course.time.substring(0, 3); // 提取 time 的前三字元
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
    
    return (
        <div id="returnPlace">
            {/* 頁首 */}
            <Header/>
           
            <div className='main'>
                <h2>搜尋結果</h2>
                <div className='container'>
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
                                        <div key={course.id} className="course-card">
                                            <img src={courseImage} className="courseImage" alt="課程圖示" />
                                            <div className="course-content">
                                                <div className="course-header">
                                                    <span className="course-name">{course.course}</span>
                                                    <button
                                                        onClick={() => handleToggleSave(course.id)}
                                                        className={`save-button ${savedCourse?.mark === 1 ? "saved" : ""}`}
                                                    >
                                                        {savedCourse?.mark === 1 ? "★" : "☆"}
                                                    </button>
                                                </div>
                                                <div className="course-details">
                                                    {course.time} ({course.credits}) {course.room} {course.teacherM}
                                                </div>
                                                <div className="course-belongs">{course.department}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                    </div>
                    <div className='besider'>
                        <h6>熱門排行榜</h6>
                        <br/>物件導向<br/>資料庫<br/>
                    </div>
                </div>  
            </div>

            {/* 頁尾 */}
            <Footer/>
        </div>
    );
};
export default Courses;
