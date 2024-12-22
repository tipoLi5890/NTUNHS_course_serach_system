import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import './courses.css';
import CourseCard from "../../components/Course-Card"; // 引入新建的 CourseCard
import CoursesDetial from "../../components/CoursesDetail"; // 引入彈出視窗元件
import { useAuth } from '../../hook/AuthProvider';
import { useSearch } from '../../hook/SearchProvider';
import { getSavedCourses, saveCourse, unsaveCourse } from '../../services/Courses_api';
import { getRecords } from '../../services/Record_api.jsx';

const Courses = () => {
    const location = useLocation();
    const { state } = location || {};
    const { results } = state || {}; // 從 state 中解構結果資料
    const { lastSearchResult, updateLastSearchResult } = useSearch(); // 解構出 updateLastSearchResult
    const [courses, setCourses] = useState([]); // 確保 courses 為陣列 //儲存查詢結果
    const [groupKey, setGroupKey] = useState("department"); // 分隔條件
    const [selectedCourse, setSelectedCourse] = useState(null); // 當前選中的課程資料
    const { isAuthenticated } = useAuth(); // 從 AuthProvider 獲取登入狀態與使用者資訊
    const [courseSaveData, setCourseSaveData] = useState([]); // 儲存使用者收藏的課程資料
    const [courseReviews, setCourseReviews] = useState([]); // 儲存使用者評論內容的資料

    //判斷是否為歷史搜尋
    useEffect(() => {
        if (lastSearchResult?.results?.length > 0) {
            // 有歷史搜尋結果時，優先使用歷史搜尋
            setCourses(lastSearchResult.results);
        } else if (results?.courses?.length > 0) {
            // 若無歷史搜尋，則使用當前查詢結果
            setCourses(results.courses);
            // 更新歷史搜尋結果
            updateLastSearchResult({ results: results.courses });
        } else {
            // 若兩者皆無，設定為空陣列
            setCourses([]);
        }
    }, [lastSearchResult, results]);

    // 初始化課程和儲存狀態
    useEffect(() => {
        const fetchData = async () => {
            try {
                let initialCourses = [];
                if (lastSearchResult?.results?.length > 0) {
                    initialCourses = lastSearchResult.results;
                } else if (results?.courses?.length > 0) {
                    initialCourses = results.courses;
                    updateLastSearchResult({ results: results.courses });
                }

                if (isAuthenticated) {
                    const savedCourses = await getSavedCourses();
                    setCourseSaveData(savedCourses);

                    // 合併儲存狀態到課程資料
                    const updatedCourses = initialCourses.map(course => {
                        const isSaved = savedCourses.some(saved => saved['編號'] === course['編號']);
                        return { ...course, mark: isSaved ? "1" : "0" };
                    });
                    setCourses(updatedCourses);
                } else {
                    setCourses(initialCourses);
                }
            } catch (error) {
                console.error('載入課程或儲存狀態失敗:', error);
            }
        };

        fetchData();
    }, [lastSearchResult, results, isAuthenticated]);

    // 更新課程儲存狀態
    const handleToggleSave = async (id, isSaved) => {
        try {
            let updatedCourses;
            let updatedSaveData;

            if (isSaved) {
                await unsaveCourse(id);
                updatedSaveData = courseSaveData.

                    filter(course => course['編號'] !== id);
            }

            else {
                await saveCourse(id);
                const newSavedCourse = courses.find(course => course['編號'] === id);
                updatedSaveData = [...courseSaveData, newSavedCourse];
            }

            setCourseSaveData(updatedSaveData);
            updatedCourses = courses.map(course => {
                if (course['編號'] === id) {
                    return { ...course, mark: isSaved ? "0" : "1" };
                }
                return course;
            });
            setCourses(updatedCourses);
        } catch (error) {


            console.error("更新課程儲存狀態失敗:", error);
        }
    };

    // 分類課程
    const groupedCourses = Array.isArray(courses)
        ? courses.reduce((acc, course) => {
            let key = course[groupKey];
            if (groupKey === "day") key = course['上課星期中文'].substring(0, 3); // 提取 time 的前三字元
            if (groupKey === "department") key = course['系所名稱'].substring(0, 7); // 提取 belongs 的前七字元
            if (groupKey === "courseType") key = course['課別名稱'].substring(0, 4); // 提取 courseType 的前四字元
            if (!acc[key]) acc[key] = [];
            acc[key].push(course);
            return acc;
        }, {})
        : {};

    // 點擊課程卡片顯示詳細資訊
    const handleCardClick = async (id) => {
        const courseDetails = courses.find(course => course['編號'] === id);
        if (!courseDetails) {
            alert('無法取得課程詳細資料');
            return;
        }
        setSelectedCourse(courseDetails || null);

        // 提取課程內的評論資料
        try {
            const courseCode = courseDetails['科目代碼_新碼']; // 使用科目代碼_新碼
            const courseReviews = await getRecords(courseCode);
            setCourseReviews(courseReviews);
            console.log(courseReviews);
        } catch (error) {
            console.error("取得課程評論失敗:", error);
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

                        {/* 當查詢結果為空時，顯示提示 */}
                        {courses.length === 0 ? (
                            <div className="no-results">
                                <p>查無符合搜尋條件的課程。</p>
                            </div>
                        ) : (
                            /* 分類顯示 */
                            <div className="classification-container">
                                {Object.entries(groupedCourses).map(([key, courses]) => (
                                    <div key={key} className="classification">
                                        <h4>{key}</h4>
                                        <div className="course-list">
                                            {courses.map((course) => {
                                                const savedCourse = courseSaveData.find((item) => item.id === course['編號']);
                                                return (
                                                    <CourseCard
                                                        key={course['編號']}
                                                        course={course}
                                                        isAuthenticated={isAuthenticated}
                                                        savedCourse={savedCourse || { mark: "0" }} // 確保有預設值
                                                        handleToggleSave={handleToggleSave}
                                                        handleCardClick={handleCardClick}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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