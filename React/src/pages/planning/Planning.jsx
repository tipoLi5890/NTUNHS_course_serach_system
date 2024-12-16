import React, { useEffect, useState, useMemo } from 'react';
import CoursesDetail from "../../components/CoursesDetail"; // 引入彈出視窗元件
import html2canvas from 'html2canvas';
import Header from "../../components/Header";
import Footer from '../../components/Footer';
import './planning.css';
import '../courses/courses.css';
import { useAuth } from '../../hook/AuthProvider.jsx';
import { toggleCourseMark } from '../../services/Courses_api';
import { getSavedRequiredCourses, getSavedElectiveCourses, updateCourseVisibility, savedCourseDetail } from '../../services/Planning_api';
import { getRecords } from '../../services/Record_api';

const Planning = () => {
    const { isAuthenticated, userInfo } = useAuth(); // 從 AuthProvider 獲取登入狀態與使用者資訊
    const [requiredCourses, setRequiredCourses] = useState([]);// 儲存使用者收藏的必修(預設)課程資料
    const [electiveCourses, setElectiveCourses] = useState([]);// 儲存使用者收藏的選修(其他)課程資料

    // 取得儲存的課程列表
    useEffect(() => {
        if (isAuthenticated && userInfo?.userID) {
            const loadSavedElective = async () => {
                try {
                    const savedRequired = await getSavedRequiredCourses(userInfo.userID);
                    setRequiredCourses(savedRequired);
                } catch (error) {
                    console.error('無法載入已儲存的預設課程:', error);
                }
            };
            loadSavedElective();
            const loadSavedRequired = async () => {
                try {
                    const savedElective = await getSavedElectiveCourses(userInfo.userID);
                    setElectiveCourses(savedElective);
                } catch (error) {
                    console.error('無法載入已儲存的其他課程:', error);
                }
            };
            loadSavedRequired();
        }
    }, [isAuthenticated, userInfo]);

    // 檢查重疊
    const checkConflict = (newCourse, existingCourses) => {
        return existingCourses.some(
            (existingCourse) =>
                existingCourse.isPlaced === 1 &&
                existingCourse.weekDay === newCourse.weekDay &&
                Math.max(existingCourse.startPeriod, newCourse.startPeriod) <=
                Math.min(existingCourse.endPeriod, newCourse.endPeriod)
        );
    };

    // 切換顯示/隱藏狀態 (當期科系必修不能調整)
    const handleVisibilityToggle = async (id, currentVisibility) => {
        try {
            // 明確定義新狀態：0 -> 1，1 -> 0
            const updatedVisibility = currentVisibility === 1 ? 0 : 1;

            // 先檢查課程是否衝突，只在「要顯示」時進行檢查
            if (updatedVisibility === 1) {
                const targetCourse = electiveCourses.find((course) => course.id === id);
                const conflict = checkConflict(targetCourse, coursesBySemester[targetCourse.semester]);
                if (conflict) {
                    alert("已有課程");
                    return; // 提早返回，不執行後續邏輯
                }
            }
            // 更新狀態到後端
            const response = await updateCourseVisibility(userInfo.userID, id, updatedVisibility);

            // 確保後端回傳新狀態
            if (response.success && response.updatedCourse) {
                setElectiveCourses((prevCourses) =>
                    prevCourses.map((course) =>
                        course.id === id ? { ...course, isPlaced: updatedVisibility } : course
                    )
                );
            } else {
                console.error("後端更新失敗");
            }
        } catch (error) {
            console.error('更新顯示/隱藏狀態失敗:', error);
        }
    };

    // 切換儲存/取消儲存狀態 (當期科系必修不能調整)
    const handleMarkToggle = async (id, currentMark) => {
        try {
            // 如果是取消儲存，先提示使用者確認
            if (currentMark === 1) {
                const isConfirmed = window.confirm(
                    "取消儲存後該課程將不會在儲存的課程中顯示"
                );
                if (!isConfirmed) {
                    return; // 使用者取消操作，不繼續執行
                }
            }
            const updatedMark = currentMark === 1 ? 0 : 1; // 切換狀態 1 -> 0, 0 -> 1

            const response = await toggleCourseMark(userInfo.userID, id, updatedMark);

            if (response.success) {
                // 更新狀態到前端
                setElectiveCourses((prevCourses) =>
                    prevCourses.map((course) =>
                        course.id === id ? { ...course, mark: updatedMark } : course
                    )
                );
            } else {
                console.error("後端更新儲存狀態失敗");
            }
        } catch (error) {
            console.error("更新課程儲存狀態失敗:", error);
        }
    };

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

    // 獲取所有的學期
    const semesters = Array.from(
        new Set([
            ...requiredCourses.map(course => course.semester),
            ...electiveCourses.map(course => course.semester)
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

    const [selectedSemester, setSelectedSemester] = useState(semesters[0]); // 狀態：當前選中的學期，預設為第一個學期
    const [selectedCourse, setSelectedCourse] = useState(null); // 用於存放選中的課程資料
    const [courseReviews, setCourseReviews] = useState([]);// 儲存使用者評論內容的資料

    // 顯示課程詳情
    const handleCourseClick = async (course) => {
        if (!course) {
            console.error('課程資料無效');
            return;
        }
        try {
            const courseDetails = await savedCourseDetail(userInfo?.userID, course.id);
            if (courseDetails && courseDetails.length > 0) {
                const selectedCourseDetails = courseDetails[0];
                setSelectedCourse({ ...selectedCourseDetails });
            } else {
                console.error('無法取得課程詳細資訊');
            }
            console.log(selectedCourse);
        } catch (error) {
            console.error('取得課程詳細資訊時發生錯誤：', error.message);
        }
        try {
            const courseReviews = await getRecords(course.id);
            setCourseReviews(courseReviews);
            console.log(courseReviews);
        } catch (error) {
            console.error("取得課程評論失敗:", error);
        }
    };

    // 關閉彈出視窗
    const closeCourseDetail = () => {
        setSelectedCourse(null);
    };

    // 優化表格渲染
    const tableCells = useMemo(() => {
        return Array.from({ length: 15 }, (_, rowIndex) => (
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
        ));
    }, []);

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
                                {tableCells}

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

                <hr />

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
                            {/* 預設 當期科系必修 */}
                            {requiredCourses.map((course, index) => (
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
                                    <td>
                                        <div
                                            className='storageCourses_star'
                                            onClick={() => {
                                                if (course.mark === 1) {
                                                    alert("此課程為該學期科系必修無法取消儲存");
                                                    course.mark === 1;
                                                    return;
                                                }
                                            }}
                                            title={course.mark === 1 ? "取消儲存" : "儲存"}
                                        >
                                            ★
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                if (course.isPlaced === 1) {
                                                    alert("此課程為該學期科系必修無法隱藏");
                                                    course.isPlaced === 1;
                                                    return;
                                                }
                                            }}
                                        >
                                            {course.isPlaced === 1 ? '隱藏' : '顯示'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {/* 預設 其他另外儲存的課程 */}
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
                                    <td>
                                        <div
                                            className='storageCourses_star'
                                            onClick={() => handleMarkToggle(course.id, course.mark)}
                                            title={course.mark === 1 ? "取消儲存" : "儲存"}
                                        >
                                            ★
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                handleVisibilityToggle(course.id, course.isPlaced)
                                            }}
                                        >
                                            {course.isPlaced === 1 ? '隱藏' : '顯示'}
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