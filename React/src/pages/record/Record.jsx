import React, { useEffect, useState } from 'react';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import '../courses/courses.css'
import './record.css';
import courseImage from "../../assets/courses/course.png";
import { getHistoryCourses, getUserRecords, commentData } from '../../services/Record_api.jsx';

const Record = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // 紀錄評論欄位狀態
    const [openCommentId, setOpenCommentId] = useState(null);
    const [commentInput, setCommentInput] = useState("");
    const [courseDisplayData, setCourseDisplayData] = useState([]);// 儲存使用者的課程資料

    /* const courseDisplayData = [
        { id: "4", course: "羽球", time: "星期三1~2節", credits: 2, room: "G204", teacherM: "林老師", belongs: "四年制資管系二年級" },
        { id: "2", course: "微積分", time: "星期五3~4節", credits: 3, room: "H101", teacherM: "張老師", belongs: "四年制資管系一年級" },
        { id: "323456789654373", course: "心理學概論", time: "星期一5~6節", credits: 2, room: "I202", teacherM: "陳老師", belongs: "四年制資管系一年級" },
    ]; */

    // 取得歷史課程
    useEffect(() => {
        const loadHistoryCourses = async () => {
            try {
                const courseData = await getHistoryCourses();
                if (Array.isArray(courseData)) {
                    setCourseDisplayData(courseData); // 確保資料是陣列形式
                } else {
                    console.error("無效的課程資料結構:", courseData);
                    setCourseDisplayData([]); // 回傳空陣列以避免畫面崩潰
                }
            } catch (error) {
                console.error("無法載入已儲存的課程:", error);
                setCourseDisplayData([]); // 發生錯誤時設為空資料
            }
        };
        loadHistoryCourses();
    }, []);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                setLoading(true);
                const userRecords = await getUserRecords();
                setRecords(userRecords);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    if (loading) return <p>資料載入中...</p>;
    if (error) return <p>發生錯誤: {error}</p>;

    // 選擇使用者的課程紀錄
    /* const userRecords = courseRecordData.filter(
        (record) => record.username === savedUsername
    ); */

    const recordsByTerm = records.reduce((acc, record) => {
        if (!acc[record.term]) acc[record.term] = [];
        acc[record.term].push(record);
        return acc;
    }, {});

    // 處理評論欄位顯示
    const toggleCommentSection = (id, existingComment = "") => {
        if (id === openCommentId) {
            setOpenCommentId(null);
        } else {
            setOpenCommentId(id);
            setCommentInput(existingComment); // 填入現有評論
        }
    };

    // 處理評論提交
    const handleCommentSubmit = async (id) => {
        try {
            // 呼叫 API 提交評論
            const updatedRecord = await commentData(id, commentInput);
            // 更新 records 資料
            setRecords((prevRecords) =>
                prevRecords.map((record) =>
                    record.id === id ? { ...record, ...updatedRecord } : record
                )
            );
            console.log("評論提交成功", updatedRecord);
        } catch (error) {
            console.error("評論提交失敗:", error.message);
        } finally {
            // 關閉評論欄位
            toggleCommentSection(null, "");
        }
    };

    return (
        <div id="returnPlace">
            <Header />

            <div className="main">
                <h2>我的修課紀錄</h2>
                <div className="record-list">
                    {/* 依照學期區隔 */}
                    {Object.keys(recordsByTerm).map((term) => (
                        <div key={term} className="record-term">
                            <h6 className="term-title">{term}</h6>
                            <div className="record-items">
                                {/* 讀取評論 */}
                                {recordsByTerm[term].map((record) => {
                                    const courseData = courseDisplayData.find(course => course.id === record.id);
                                    return (
                                        <div key={record.id} className="record-item">
                                            {/* 課程區域 */}
                                            <div className="record-content">
                                                <div className="course-card">
                                                    <img
                                                        src={courseImage}
                                                        className="courseImage"
                                                        alt="課程圖示"
                                                    />
                                                    <div className="course-content">
                                                        <div className="course-header">
                                                            <span className="course-name">{courseData?.course}</span>
                                                        </div>
                                                        <div className="course-details">
                                                            {courseData?.time} ({courseData?.credits}) {courseData?.room} {courseData?.teacherM}
                                                        </div>
                                                        <div className="course-belongs">{courseData?.belongs}</div>
                                                    </div>
                                                </div>
                                                {/* 開啟評論 */}
                                                <div className="record-actions">
                                                    <button
                                                        className="record-action"
                                                        onClick={() => toggleCommentSection(record.id, record.comment)}
                                                    >
                                                        {record.lock === "1" ? "查看評論" : record.isCommend === "1" ? "修改/檢視" : "建立評論"}
                                                        {record.lock === "0" && record.isCommend === "0" && (
                                                            <span className="red-dot"></span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* 評論區域 */}
                                            {openCommentId === record.id && (
                                                <div className="Comment">
                                                    {record.lock === "1" ? (
                                                        <p>{record.comment || "尚無評論"}</p>
                                                    ) : (
                                                        <>
                                                            <textarea
                                                                className="comment-input"
                                                                value={commentInput}
                                                                onChange={(e) => setCommentInput(e.target.value)}
                                                                placeholder="請輸入您的評論..."
                                                            />
                                                            <div className="comment-actions">
                                                                <button className="clear-comment" onClick={() => setCommentInput("")}>
                                                                    清除評論
                                                                </button>
                                                                <button className="close-comment" onClick={() => toggleCommentSection(null)}>
                                                                    關閉
                                                                </button>
                                                                <button className="submit-comment" onClick={() => handleCommentSubmit(record.id)}>
                                                                    送出
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Record;