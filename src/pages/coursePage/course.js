import React, { useState, useEffect } from 'react';
import courseData from '../../assets/course1/lesson.json'; 
import { Link, useNavigate} from 'react-router-dom';


function CoursePage() {
    const [course, setCourse] = useState(null);
    const [content, setContent] = useState(null);
    const [lessonId, setLessonId] = useState(0);
    const [lessonNum, setLessonNum] = useState(0);
    const [lessonDescription, setLessonDescription] = useState('');

    const navigate = useNavigate();
  
    // Use useEffect to initialize course data from the imported JSON
    useEffect(() => {
      const fetchCourseData = async () => {
        try {
          // Directly set the imported course data
          setCourse(courseData);
          setContent(courseData.courses[lessonId]);
          setLessonNum(courseData.courses.length);
          setLessonDescription(courseData.courses[lessonId].description);
          console.log('Course data loaded:', courseData);
          console.log('Lesson data loaded:', courseData.courses[lessonId]);
        } catch (error) {
          console.error('Error loading course data:', error);
        }
      };
  
      fetchCourseData();
    }, []);
  
    useEffect(() => {
    // Update lesson description when lessonId changes
    if (course) {
        setLessonDescription(course.courses[lessonId].description);
        console.log('Lesson updated to:', course.courses[lessonId]);
    }
    }, [lessonId, course]); // Dependency on lessonId and course

    // Handle loading state
    if (!course) {
    return <div>Loading...</div>;
    }

    const nextLesson = () => {
      setLessonId((prevLessonId) => Math.min(prevLessonId + 1, course.courses.length - 1));
    };

    const prevLesson = () => {
      setLessonId((prevLessonId) => Math.max(prevLessonId - 1, 0));
    };

    const startGame = () => {
      navigate('/puzzle');
      console.log(lessonId)
    }
  
    // Render current lesson content
    return (
      <div className="course-page">
        <h1>Course Page</h1>
        <h2>{lessonDescription}</h2>
        

        <div>
          <button 
            onClick={prevLesson}
            disabled={lessonId === 0}
          >
            Previous Lesson
          </button>

          <button 
            onClick={nextLesson}
            disabled={lessonId === lessonNum - 1}
          >
            Next Lesson
          </button>
          <br></br>

          <button 
            onClick={startGame}
            disabled={lessonId !== lessonNum - 1}
          > 
            Finish The Puzzle 
          </button>

          

        </div>


      </div>
    );
  }
  
  export default CoursePage;