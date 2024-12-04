import React, { useEffect, useState } from 'react';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import './record.css';
import courseImage from "../../assets/courses/course.png";

const Record = () => {
    // 登入資訊
    const isLoggedIn = window.Cookies.get('isLoggedIn');
    const savedUsername = window.Cookies.get('username');

    // 如果未登入，跳轉至 /Login
    useEffect(() => {
        if (!isLoggedIn) {
            window.location.href = "/Login";
        }
    }, [isLoggedIn]);

    const courseRecordData = [
        {
            username: "admin",
            id: "123456789654371",
            term: "1121",
            course: "羽球",
            isCommend: "1",
            comment: "老師教得很好，課堂活動很有趣！",
            "review-date": "2023-10-15",
            lock: "1",
        },
        {
            username: "admin",
            id: "223456789654372",
            term: "1121",
            course: "微積分",
            isCommend: "0",
            comment: "",
            "review-date": "",
            lock: "0",
        },
        {
            username: "admin",
            id: "323456789654373",
            term: "1122",
            course: "心理學概論",
            isCommend: "1",
            comment: "內容深入淺出，推薦給對心理學有興趣的人！",
            "review-date": "2023-11-02",
            lock: "0",
        },
        {
            username: "112214204",
            id: "423456789654374",
            term: "1131",
            course: "資料結構",
            isCommend: "0",
            comment: "",
            "review-date": "",
            lock: "1",
        },
        {
            username: "112214205",
            id: "523456789654375",
            term: "1132",
            course: "數位邏輯",
            isCommend: "1",
            comment: "課程內容充實，實作練習很有幫助。",
            "review-date": "2024-02-20",
            lock: "1",
        },
    ];

    const courseDisplayData = [
        { id: "123456789654371", course: "羽球", time: "星期三1~2節", credits: 2, room: "G204", teacherM: "林老師", belongs: "四年制資管系二年級" },
        { id: "223456789654372", course: "微積分", time: "星期五3~4節", credits: 3, room: "H101", teacherM: "張老師", belongs: "四年制資管系一年級" },
        { id: "323456789654373", course: "心理學概論", time: "星期一5~6節", credits: 2, room: "I202", teacherM: "陳老師", belongs: "四年制資管系一年級" },
    ];

    // 選擇使用者的課程紀錄
    const userRecords = courseRecordData.filter(
        (record) => record.username === savedUsername
    );

    const recordsByTerm = userRecords.reduce((acc, record) => {
        if (!acc[record.term]) {
            acc[record.term] = [];
        }
        acc[record.term].push(record);
        return acc;
    }, {});

    // 紀錄評論欄位狀態
    const [openCommentId, setOpenCommentId] = useState(null);
    const [commentInput, setCommentInput] = useState("");

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
    const handleCommentSubmit = (id) => {
        console.log("提交評論", { id, comment: commentInput });
        toggleCommentSection(null, "");
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
                                                            <span className="course-name">{courseData.course}</span>
                                                        </div>
                                                        <div className="course-details">
                                                            {courseData.time} ({courseData.credits}) {courseData.room} {courseData.teacherM}
                                                        </div>
                                                        <div className="course-belongs">{courseData.belongs}</div>
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
