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
            key={course.id}
            className="course-card"
            onClick={() => handleCardClick(course.id)}
        >
            <img src={courseImage} className="courseImage" alt="課程圖示" />
            <div className="course-content">
                <div className="course-header">
                    <span className="course-name">{course.course}</span>
                    {isAuthenticated && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSave(course.id, course.mark === 1);
                            }}
                            className={`save-button ${course.mark === 1 ? "saved" : ""}`}
                        >
                            {course.mark === 1 ? "★" : "☆"}
                        </button>
                    )}
                </div>
                <div className="course-details">
                    {course.time} ({course.credits}) {course.room} {course.teacherM}
                </div>
                <div className="course-belongs">{course.department}</div>
            </div>
        </div>
    );
};

export default CourseCard;
