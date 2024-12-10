import React from "react";
import courseImage from "../assets/courses/course.png";

const CourseCard = ({ 
    course, 
    isLoggedIn, 
    savedCourse, 
    handleToggleSave, 
    handleCardClick 
}) => {
    return (
        <div
            className="course-card"
            onClick={() => handleCardClick(course.id)}
        >
            <img src={courseImage} className="courseImage" alt="課程圖示" />
            <div className="course-content">
                <div className="course-header">
                    <span className="course-name">{course.course}</span>
                    {isLoggedIn && ( // 僅在已登入的情況下顯示按鈕
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSave(course.id);
                            }}
                            className={`save-button ${savedCourse?.mark === 1 ? "saved" : ""}`}
                        >
                            {savedCourse?.mark === 1 ? "★" : "☆"}
                        </button>
                    )}
                </div>
                <div className="course-details">
                    {course.time} ({course.credits}) {course.room} {course.teacherM}
                </div>
                <div className="course-belongs">{course.belongs}</div>
            </div>
        </div>
    );
};

export default CourseCard;
