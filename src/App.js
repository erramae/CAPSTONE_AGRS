// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import StudentPage from './StudentPage'; // Import the component for the student page
import FacultyPage from './FacultyPage'; // Import the component for the faculty page
import Dashboard from './Dashboard'; // Your dashboard page component
import Schedule from './Schedule';
import Grades from './Grades'; // Your grades page component
import FacultyDashboard from './FacultyDashboard';
import FacultySchedulePage from './FacultySchedulePage';
import ClassDetails from './ClassDetails';
import ErrorPage from './ErrorPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/student" element={<StudentPage />} /> {/* Define the student route */}
      <Route path="/faculty" element={<FacultyPage />} /> {/* Define the faculty route */}
      <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard route */}
      <Route path="/schedule" element={<Schedule />} /> {/* Schedule route */}
      <Route path="/faculty-schedule" element={<FacultySchedulePage />} /> {/* Add the faculty schedule route */}
      <Route path="/faculty-dashboard" element={<FacultyDashboard />} /> {/* New faculty dashboard route */}
      <Route path="/grades" element={<Grades />} /> {/* Grades route */}
      <Route path="/class-details/:className" element={<ClassDetails />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
};

export default App;
