import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const navigate = useNavigate();
    const handleCourseSelection = (course) => {
        setSelectedCourse(course);
        navigate('/image');
    };

    return (
        <div>
            <h1>Welcome to the Course Selection Page</h1>
            <p>Please select a course:</p>
            <ul>
                <li>
                    <button onClick={() => handleCourseSelection('Course 1')}>
                        Course 1
                    </button>
                </li>
                {/* <li>
                    <button onClick={() => handleCourseSelection('Course 2')}>
                        Course 2
                    </button>
                </li>
                <li>
                    <button onClick={() => handleCourseSelection('Course 3')}>
                        Course 3
                    </button>
                </li> */}
            </ul>
            {/* {selectedCourse && (
                <p>You have selected: {selectedCourse}</p>
            )} */}
        </div>
    );
};

export default HomePage;