import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import './courses.css';
import CourseCard from "../../components/Course-Card"; // 引入新建的 CourseCard
import CoursesDetial from "../../components/CoursesDetail"; // 引入彈出視窗元件
import { useAuth } from '../../hook/AuthProvider';
import { getSavedCourses, saveCourse, unsaveCourse } from '../../services/Courses_api';
import { getRecords } from '../../services/Record_api.jsx';

const Courses = () => {
    const location = useLocation();
    const { state } = location || {};
    const { results } = state || {}; // 從 state 中解構結果資料
    const [courses, setCourses] = useState(results?.courses || []); // 確保 courses 為陣列，即使查詢結果為空
    const [groupKey, setGroupKey] = useState("department"); // 分隔條件
    const [selectedCourse, setSelectedCourse] = useState(null); // 當前選中的課程資料
    const { isAuthenticated, userInfo } = useAuth(); // 從 AuthProvider 獲取登入狀態與使用者資訊
    const [courseSaveData, setCourseSaveData] = useState([]);// 儲存使用者的課程資料
    const [courseReviews, setCourseReviews] = useState([]);// 儲存使用者評論內容的資料

    // 取得已儲存的課程
    useEffect(() => {
        if (isAuthenticated && userInfo?.userID) {
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
    }, [isAuthenticated, userInfo]);

    // 更新課程狀態
    useEffect(() => {
        if (courseSaveData.length > 0) {
            courses.forEach(course => {
                const savedCourse = courseSaveData.find(saved => saved.id === course.id);
                course.mark = savedCourse ? savedCourse.mark : 0; // 若未儲存則預設為 0
            });
        }
    }, [courseSaveData, courses]);

    // 分類課程
    const groupedCourses = courses.reduce((acc, course) => {
        let key = course[groupKey];
        if (groupKey === "day") key = course.time.substring(0, 3); // 提取 time 的前三字元
        if (groupKey === "department") key = course.belongs.substring(0, 6); // 提取 belongs 的前六字元
        if (!acc[key]) acc[key] = [];
        acc[key].push(course);
        return acc;
    }, {});

    // 處理儲存按鈕的點擊事件
    const handleToggleSave = async (id, isSaved) => {
        try {
            let response;
            console.log(isSaved);
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
            console.error("更新課程儲存狀態失敗:", error);
        }
    };

    const closeContent = () => {
        setSelectedCourse(null);
    };

    return (
        <div id="returnPlace">
            {/* 頁首 */}
            <Header />
            <div className='main'>
                <h2>搜尋結果</h2>
                <div className='containerForCourses'>
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
                            ))}
                        </div>
                    </div>

                    {/* 右側側邊欄 */}
                    <div className='besider'>
                        <h6>熱門排行榜</h6>
                        <div id="hot1" className='hot'><a href=''>物件導向</a></div>
                        <div id="hot2" className='hot'><a href=''>資料庫</a></div>
                        <div id="hot3" className='hot'><a href=''>商業智慧</a></div>
                        <div id="hot4" className='hot'><a href=''>系統分析</a></div>
                        <div id="hot5" className='hot'><a href=''>當代藝術導論</a></div>
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
export default Courses;