import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/loginPage/login';
import HomePage from './pages/homePage/home';
import ProfilePage from './pages/profilePage/profile';
import CoursePage from './pages/coursePage/course';
import PuzzlePage from './pages/puzzlePage/puzzle';
import ImagePage from './pages/imgPage/image';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/mainpage" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/course" element={<CoursePage />} />
          <Route path="/puzzle" element={<PuzzlePage />} />
          <Route path="/image" element={<ImagePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
