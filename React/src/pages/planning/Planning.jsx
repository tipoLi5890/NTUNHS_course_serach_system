import React, { useEffect, useState } from 'react';
import CoursesDetail from "../../components/CoursesDetail"; // 引入彈出視窗元件
import html2canvas from 'html2canvas';
import Header from "../../components/Header";
import Footer from '../../components/Footer';
import './planning.css';

const Planning = () => {
    // 登入資訊
    const isLoggedIn = window.Cookies.get('isLoggedIn');

    // 如果未登入，跳轉至 /Login
    useEffect(() => {
        if (!isLoggedIn) {
            window.location.href = "/Login";
        }
    }, [isLoggedIn]);

    // 定義第一行的內容
    const firstRowContent = [
        "節次", "時間", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"
    ];

    // 定義時間表
    const timeSlots = [
        ["0810", "0900"], ["0910", "1000"], ["1010", "1100"], ["1110", "1200"],
        ["1240", "1330"], ["1340", "1430"], ["1440", "1530"], ["1540", "1630"],
        ["1640", "1730"], ["1740", "1830"], ["1835", "1925"], ["1930", "2020"],
        ["2025", "2115"], ["2120", "2210"]
    ];

    // 定義第一列
    const firstColumnContent = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四"];

    // 必修課，增加學期欄位 "1131" 並新增學分
    const requiredCourses = [
        { courseName: "資料結構", startPeriod: 1, endPeriod: 3, weekDay: 1, category: 0, isPlaced: 1, semester: "1131", credits: 3 },
        { courseName: "線性代數", startPeriod: 6, endPeriod: 7, weekDay: 5, category: 0, isPlaced: 1, semester: "1131", credits: 2 },
        { courseName: "演算法", startPeriod: 3, endPeriod: 4, weekDay: 2, category: 0, isPlaced: 1, semester: "1132", credits: 2 },
        { courseName: "數位邏輯", startPeriod: 1, endPeriod: 2, weekDay: 2, category: 0, isPlaced: 1, semester: "1131", credits: 2 },
        { courseName: "資料庫系統", startPeriod: 4, endPeriod: 6, weekDay: 4, category: 0, isPlaced: 1, semester: "1131", credits: 3 },
        { courseName: "作業系統", startPeriod: 1, endPeriod: 3, weekDay: 4, category: 0, isPlaced: 1, semester: "1122", credits: 3 },
        { courseName: "計算機組織", startPeriod: 5, endPeriod: 7, weekDay: 2, category: 0, isPlaced: 1, semester: "1121", credits: 3 },
        { courseName: "軟體工程", startPeriod: 3, endPeriod: 5, weekDay: 5, category: 0, isPlaced: 1, semester: "1112", credits: 3 },
        { courseName: "網路安全", startPeriod: 6, endPeriod: 8, weekDay: 1, category: 0, isPlaced: 1, semester: "1111", credits: 3 },
        { courseName: "人工智慧", startPeriod: 2, endPeriod: 4, weekDay: 4, category: 0, isPlaced: 1, semester: "1112", credits: 3 },
        { courseName: "雲端運算", startPeriod: 7, endPeriod: 8, weekDay: 3, category: 0, isPlaced: 1, semester: "1111", credits: 2 }
    ];

    // 選修課，增加學期欄位 "1131" 並新增學分
    const electiveCourses = [
        { courseName: "物件導向", startPeriod: 2, endPeriod: 4, weekDay: 3, category: 1, isPlaced: 1, semester: "1131", credits: 3 },
        { courseName: "作業系統", startPeriod: 2, endPeriod: 4, weekDay: 5, category: 1, isPlaced: 0, semester: "1131", credits: 3 },
        { courseName: "計算機網路", startPeriod: 6, endPeriod: 10, weekDay: 2, category: 1, isPlaced: 0, semester: "1121", credits: 5 },
        { courseName: "人機互動", startPeriod: 2, endPeriod: 3, weekDay: 2, category: 1, isPlaced: 1, semester: "1111", credits: 2 },
        { courseName: "行動應用程式開發", startPeriod: 4, endPeriod: 5, weekDay: 5, category: 1, isPlaced: 1, semester: "1111", credits: 2 },
        { courseName: "網路程式設計", startPeriod: 1, endPeriod: 3, weekDay: 6, category: 1, isPlaced: 0, semester: "1132", credits: 3 },
        { courseName: "資料分析", startPeriod: 6, endPeriod: 7, weekDay: 3, category: 1, isPlaced: 1, semester: "1131", credits: 2 },
        { courseName: "雲端技術", startPeriod: 8, endPeriod: 10, weekDay: 2, category: 1, isPlaced: 0, semester: "1132", credits: 3 },
        { courseName: "數據庫管理系統", startPeriod: 4, endPeriod: 5, weekDay: 1, category: 1, isPlaced: 1, semester: "1131", credits: 2 },
        { courseName: "資訊安全", startPeriod: 6, endPeriod: 8, weekDay: 4, category: 1, isPlaced: 0, semester: "1132", credits: 3 },
        { courseName: "機器學習", startPeriod: 2, endPeriod: 4, weekDay: 5, category: 1, isPlaced: 1, semester: "1122", credits: 3 }
    ];



    // 獲取所有的學期
    const semesters = Array.from(
        new Set([
            ...requiredCourses.filter(course => course.isPlaced === 1).map(course => course.semester),
            ...electiveCourses.filter(course => course.isPlaced === 1).map(course => course.semester)
        ])
    ).sort((a, b) => b.localeCompare(a)); // 由大到小排列


    // 按學期分類課程
    const coursesBySemester = semesters.reduce((acc, semester) => {
        acc[semester] = [
            ...requiredCourses.filter(course => course.isPlaced === 1 && course.semester === semester),
            ...electiveCourses.filter(course => course.isPlaced === 1 && course.semester === semester)
        ];
        return acc;
    }, {});

    // 狀態：當前選中的學期，預設為第一個學期
    const [selectedSemester, setSelectedSemester] = useState(semesters[0]);

    // 用於存放選中的課程資料
    const [selectedCourse, setSelectedCourse] = useState(null); 

    // 顯示課程詳情
    const handleCourseClick = (course) => {
        setSelectedCourse(course);
    };

    // 關閉彈出視窗
    const closeCourseDetail = () => {
        setSelectedCourse(null);
    };

    return (
        <div id="returnPlace">
            {/* 頁首 */}
            <Header />

            <div className="main">
                <h2>我的課程規劃</h2>

                {/* 學期選單 */}
                <div className="semester-select">
                    <label htmlFor="semester">選擇學期：</label>
                    <select
                        id="semester"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                    >
                        {semesters.map(semester => (
                            <option value={semester} key={semester}>
                                {semester}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 根據選中的學期顯示對應的課表 */}
                {semesters.map(semester => {
                    // 計算該學期的總學分
                    const totalCredits = coursesBySemester[semester]
                        .filter(course => course.isPlaced === 1)
                        .reduce((sum, course) => sum + (course.credits || 0), 0);

                    return semester === selectedSemester && (
                        <div className='schedule_container' key={semester}>
                            <h4>{semester} 學分數：{totalCredits}</h4>
                            <div className="schedule">
                                {/* 創建 15 行 9 列的表格 */}
                                {Array.from({ length: 15 }, (_, rowIndex) => (
                                    Array.from({ length: 9 }, (_, colIndex) => (
                                        <div
                                            className={`cell ${rowIndex === 0 ? "first-row" : ""}`}
                                            id={`${rowIndex + 1},${colIndex + 1}`}
                                            key={`${rowIndex + 1},${colIndex + 1}`}
                                        >
                                            {rowIndex === 0
                                                ? firstRowContent[colIndex]
                                                : colIndex === 0 && rowIndex > 0
                                                ? firstColumnContent[rowIndex - 1]
                                                : colIndex === 1 && rowIndex > 0
                                                ? (
                                                    <span style={{ whiteSpace: "pre-line" }}>
                                                        {`${timeSlots[rowIndex - 1][0]}\n${timeSlots[rowIndex - 1][1]}`}
                                                    </span>
                                                )
                                                : ""}
                                        </div>
                                    ))
                                ))}

                                {/* 渲染該學期的課程到課表上 */}
                                {coursesBySemester[semester].map((course, index) => (
                                    <div
                                        key={`course-${semester}-${index}`}
                                        className={course.category === 0 ? "courseMustOnSchedule" : "courseOnSchedule"}
                                        style={{
                                            top: `calc(${(course.startPeriod) * (100 / 15)}% + 0.5%)`,
                                            height: `calc(${(course.endPeriod - course.startPeriod + 1) * (100 / 15)}% - 1%)`, 
                                            left: `calc(${(course.weekDay + 1) * (100 / 9)}% + 0.5%)`,
                                            width: `calc(${(100 / 9)}% - 1%)`
                                        }}
                                    >
                                        {course.courseName}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* 新增下載按鈕 */}
                <div className="download-options">
                    <button
                        className="download-btn"
                        onClick={() => {
                            const container = document.querySelector('.schedule_container');
                            if (container) {
                                html2canvas(container, { scale: 3 }).then(canvas => {
                                    const link = document.createElement('a');
                                    link.href = canvas.toDataURL('image/png', 1.0);
                                    link.download = `${selectedSemester}林千心請客.png`;
                                    link.click();
                                });
                            }
                        }}
                    >
                        下載課表
                    </button>
                </div>
                
                <hr/>
                
                <div className='storageCourses'>
                    <h4>儲存的課程</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>課程名稱</th>
                                <th>課程學期</th>
                                <th>課程星期</th>
                                <th>課程節次</th>
                                <th>內容</th>
                                <th>儲存</th>
                                <th>顯示</th>
                            </tr>
                        </thead>
                        <tbody>
                            {electiveCourses.map((course, index) => (
                                <tr key={index}>
                                    <td>{course.courseName}</td>
                                    <td>{course.semester}</td>
                                    <td>{`星期${course.weekDay}`}</td>
                                    <td>{`${course.startPeriod}~${course.endPeriod}`}</td>
                                    <td>
                                        <div
                                            className="storageCourses_content"
                                            onClick={() => handleCourseClick(course)}
                                        >
                                            內容
                                        </div>
                                    </td>
                                    <td><div className='storageCourses_star'>★</div></td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                if (course.isPlaced === 0) {
                                                    // 檢查重疊
                                                    const conflict = coursesBySemester[course.semester].some(
                                                        (existingCourse) =>
                                                            existingCourse.isPlaced === 1 &&
                                                            existingCourse.weekDay === course.weekDay &&
                                                            Math.max(existingCourse.startPeriod, course.startPeriod) <=
                                                            Math.min(existingCourse.endPeriod, course.endPeriod)
                                                    );
                                                    if (conflict) {
                                                        alert("已有課程");
                                                        return;
                                                    }
                                                }
                                                // 切換狀態
                                                course.isPlaced = course.isPlaced === 1 ? 0 : 1;
                                                setSelectedSemester((prev) => prev); // 觸發重新渲染
                                            }}
                                        >
                                            {course.isPlaced === 1 ? "隱藏" : "顯示"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 彈出視窗 */}
                {selectedCourse && (
                    <CoursesDetail
                        selectedCourse={selectedCourse}
                        closeContent={closeCourseDetail}
                        courseReviews={courseReviews}
                    />
                )}
            </div>

            {/* 頁尾 */}
            <Footer />
        </div>
    );
};

export default Planning;
