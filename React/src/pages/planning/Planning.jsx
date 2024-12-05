import React, { useEffect, useState } from 'react';
import Header from "../../components/Header";
import Footer from '../../components/Footer';
import './planning.css';

const Planning = () => {

    // 登入資訊
    const isLoggedIn = window.Cookies.get('isLoggedIn');
    const savedUsername = window.Cookies.get('username');

    // 如果未登入，跳轉至 /Login
    useEffect(() => {
        if (!isLoggedIn) {
            window.location.href = "/Login";
        }
    }, [isLoggedIn]);

    const savedCourses = [
        { id: 1, name: "可填評論", day: "一", startPeriod: 2, endPeriod: 4, color: "green" },
        { id: 2, name: "校定課程", day: "三", startPeriod: 3, endPeriod: 6, color: "blue" },
        { id: 3, name: "校定課程", day: "二", startPeriod: 3, endPeriod: 4, color: "green" },
    ];
      
    return (
        <div id="returnPlace">
            {/* 頁首 */}
            <Header/>

            <div className='main'>
                <h2>我的課程規劃</h2>

                <div className="schedule">
                {/* 課表的標題列 */}
                <div className="schedule-header">
                    <div className="time-label">節次</div>
                    {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
                    <div key={day} className="day-header">{day}</div>
                    ))}
                </div>

                {/* 課表的內容列 */}
                {[...Array(13)].map((_, period) => (
                    <div key={period} className="schedule-row">
                    <div className="time-label">第 {period + 1} 節</div>
                    {["一", "二", "三", "四", "五", "六", "日"].map((day) => {
                        // 篩選出符合條件的課程
                        const course = savedCourses.find(
                        (c) => c.day === day && c.startPeriod <= period + 1 && c.endPeriod >= period + 1
                        );

                        return (
                        <div key={day} className="cell">
                            {course && (
                            <div
                                className="course"
                                style={{ backgroundColor: course.color }}
                            >
                                {course.name}
                            </div>
                            )}
                        </div>
                        );
                    })}
                    </div>
                ))}
                </div>


            </div>
            
            {/* 頁尾 */}
            <Footer/>
        </div>
    );
};

export default Planning;

