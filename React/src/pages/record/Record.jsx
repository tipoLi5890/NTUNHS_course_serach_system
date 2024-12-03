import React, { useEffect } from 'react';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import './record.css';

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
        },
        {
            username: "admin",
            id: "223456789654372",
            term: "1121",
            course: "微積分",
            isCommend: "0",
            comment: "",
            "review-date": "",
        },
        {
            username: "admin",
            id: "323456789654373",
            term: "1122",
            course: "心理學概論",
            isCommend: "1",
            comment: "內容深入淺出，推薦給對心理學有興趣的人！",
            "review-date": "2023-11-02",
        },
        {
            username: "112214204",
            id: "423456789654374",
            term: "1131",
            course: "資料結構",
            isCommend: "0",
            comment: "",
            "review-date": "",
        },
        {
            username: "112214205",
            id: "523456789654375",
            term: "1132",
            course: "數位邏輯",
            isCommend: "1",
            comment: "課程內容充實，實作練習很有幫助。",
            "review-date": "2024-02-20",
        },
    ];

    // 篩選出與當前登入者相關的課程紀錄
    const userRecords = courseRecordData.filter(
        (record) => record.username === savedUsername
    );

    // 按學期分組紀錄
    const recordsByTerm = userRecords.reduce((acc, record) => {
        if (!acc[record.term]) {
            acc[record.term] = [];
        }
        acc[record.term].push(record);
        return acc;
    }, {});

    return (
        <div id="returnPlace">
            {/* 頁首 */}
            <Header />

            <div className="main">
                <h2>我的修課紀錄</h2>
                <div className="record-list">
                    {Object.keys(recordsByTerm).map((term) => (
                        <div key={term} className="record-term">
                            {/* 修改為顯示四碼學期的 h6 */}
                            <h6 className="term-title">{term}</h6>
                            <div className="record-items">
                                {recordsByTerm[term].map((record) => (
                                    <div key={record.id} className="record-item">
                                        <div className="record-info">
                                            <span className="record-course">{record.course}</span>
                                            <span className="record-status">
                                                {record.isCommend === "1" ? "已評論" : "未評論"}
                                            </span>
                                        </div>
                                        <div className="record-actions">
                                            {record.isCommend === "1" ? (
                                                <button className="edit-review">
                                                    修改/檢視
                                                </button>
                                            ) : (
                                                <button className="add-review">
                                                    建立評論
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 頁尾 */}
            <Footer />
        </div>
    );
};

export default Record;
