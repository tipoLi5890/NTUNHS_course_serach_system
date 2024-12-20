import React from "react";
import courseImage from "../assets/courses/course.png";

const CourseCard = ({
    course,
    isAuthenticated,
    savedCourse,
    handleToggleSave,
    handleCardClick
}) => {
    return (
        <div
            key={course['編號']}
            className="course-card"
            onClick={() => handleCardClick(course['編號'])}
        >
            <img src={courseImage} className="courseImage" alt="課程圖示" />
            <div className="course-content">
                <div className="course-header">
                    <span className="course-name">{course['科目中文名稱']}</span>
                    {isAuthenticated && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSave(course['編號'], course.mark === "1");
                            }}
                            className={`save-button ${course.mark === "1" ? "saved" : ""}`}
                        >
                            {course.mark === "1" ? "★" : "☆"}
                        </button>
                    )}
                </div>
                <div className="course-details">
                    {course['上課星期中文']} {course['上課節次']} ({course['學分數']}) {course['上課地點']} {course['主開課教師姓名']}
                </div>
                <div className="course-belongs">{course['系所名稱']}</div>
            </div>
        </div>
    );
};

export default CourseCard;
