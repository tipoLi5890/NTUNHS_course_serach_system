import React, { useEffect, useState } from 'react';
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

    // 定義第一列（2,1 到 15,1）內容
    const firstColumnContent = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四"];

    // 必修課，增加學期欄位 "1131"
    const requiredCourses = [
        { courseName: "資料結構", startPeriod: 1, endPeriod: 3, weekDay: 1, category: 0, isPlaced: 1, semester: "1131" },
        { courseName: "線性代數", startPeriod: 6, endPeriod: 7, weekDay: 5, category: 0, isPlaced: 1, semester: "1131" },
        { courseName: "演算法", startPeriod: 3, endPeriod: 4, weekDay: 2, category: 0, isPlaced: 1, semester: "1132" }
    ];

    // 選修課，增加學期欄位 "1131"
    const electiveCourses = [
        { courseName: "物件導向", startPeriod: 2, endPeriod: 4, weekDay: 3, category: 1, isPlaced: 1, semester: "1131" },
        { courseName: "作業系統", startPeriod: 6, endPeriod: 8, weekDay: 4, category: 1, isPlaced: 0, semester: "1131" },
        { courseName: "計算機網路", startPeriod: 9, endPeriod: 10, weekDay: 1, category: 1, isPlaced: 0, semester: "1191" }
    ];

    // 獲取所有的學期，去除重複並排序
    const semesters = Array.from(
        new Set([
            ...requiredCourses.filter(course => course.isPlaced === 1).map(course => course.semester),
            ...electiveCourses.filter(course => course.isPlaced === 1).map(course => course.semester)
        ])
    ).sort((a, b) => a.localeCompare(b));

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
                {semesters.map(semester => (
                    semester === selectedSemester && (
                        <div className='schedule_container' key={semester}>
                            <h4>{semester}</h4>
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
                                                : colIndex === 1 && rowIndex > 0 // 替換時間欄位內容
                                                ? (
                                                    <span style={{ whiteSpace: "pre-line" }}>
                                                        {`${timeSlots[rowIndex - 1][0]}\n${timeSlots[rowIndex - 1][1]}`}
                                                    </span>
                                                )
                                                : `${rowIndex + 1},${colIndex + 1}`}
                                        </div>
                                    ))
                                ))}

                                {/* 渲染該學期的課程到課表上 */}
                                {coursesBySemester[semester].map((course, index) => (
                                    <div
                                        key={`course-${semester}-${index}`}
                                        className={course.category === 0 ? "courseMustOnSchedule" : "courseOnSchedule"}
                                        style={{
                                            top: `calc(${(course.startPeriod) * (100 / 15)}% + 0.5%)`, // 添加 margin 類似效果
                                            height: `calc(${(course.endPeriod - course.startPeriod + 1) * (100 / 15)}% - 1%)`, // 縮小高度
                                            left: `calc(${(course.weekDay + 1) * (100 / 9)}% + 0.5%)`, // 添加 margin 類似效果
                                            width: `calc(${(100 / 9)}% - 1%)` // 縮小寬度
                                        }}
                                    >
                                        {course.courseName}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>

            {/* 頁尾 */}
            <Footer />
        </div>
    );
};

export default Planning;
