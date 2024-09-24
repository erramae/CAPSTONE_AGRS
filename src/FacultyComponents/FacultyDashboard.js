import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faBars, faChalkboardTeacher, faCalendar } from '@fortawesome/free-solid-svg-icons';
import '../StudentComponents/Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSection, setSelectedSection] = useState('classes');
  const [showClassesSubmenu, setShowClassesSubmenu] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  const handleProfileClick = () => {
    setSelectedSection('profile');
    setShowDropdown(false);
  };

  const handleChangePasswordClick = () => {
    setSelectedSection('change-password');
    setShowDropdown(false);
  };

  const handleClassClick = (className) => {
    setSelectedClass(className);
    navigate(`/class-details/${className}`);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.removeEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showDropdown]);

  return (
    <div className="dashboard-container d-flex">
      <div className={`sidebar bg-custom-color-green ${showSidebar ? 'd-block' : 'd-none d-md-block'}`}>
        <img src="pcc.png" alt="Logo" className="college-logo align-items-center ms-5 mb-3" />
        <div className="welcome-message mb-3 text-center">Hello, John Doe!</div>
        <nav className="menu mb-3">
          <Link to="/faculty-dashboard" className="menu-item active d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
            CLASSES
          </Link>
          <Link to="/faculty-schedule" className="menu-item d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faCalendar} className="me-2" />
            SCHEDULE
          </Link>
          <Link to="/hris" className="menu-item d-flex align-items-center mb-2">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            HRIS
          </Link>
        </nav>
        
      </div>

      <div className="main-content flex-grow-1">
        <header className="header d-flex justify-content-between align-items-center p-3 border-bottom rounded">
          <h1 className="m-0 custom-color-green-font custom-font d-none d-md-block">
            PARAÑAQUE CITY COLLEGE
          </h1>
          <button className="btn btn-link text-dark d-md-none" onClick={toggleSidebar} aria-label="Toggle Sidebar">
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>

          <div className="user-info d-flex align-items-center position-relative" ref={dropdownRef}>
            <span className="me-2">JOHN DOE (Faculty ID: 2020-00123)</span>
            <FontAwesomeIcon
              icon={faUser}
              className="user-icon"
              onClick={toggleDropdown}
              aria-label="User Menu"
              style={{ cursor: 'pointer' }}
            />
            {showDropdown && (
              <div className="dropdown-menu position-absolute end-0 mt-2 show">
                <button className="dropdown-item" onClick={handleProfileClick}>
                  Profile
                </button>
                <button className="dropdown-item" onClick={handleChangePasswordClick}>
                  Change Password
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {selectedSection === 'classes' && (
          <section className="classes-section">
            <h2 className="custom-font custom-color-green-font">Class Records</h2>
            {selectedClass ? (
              <div className="class-details">
                <h3>Details for {selectedClass}</h3>
              </div>
            ) : (
              <div className="class-box-container">
                <div className="class-box" onClick={() => handleClassClick('BSIT1-1')}>BSIT 1-1</div>
                <div className="class-box" onClick={() => handleClassClick('BSIT1-2')}>BSIT 1-2</div>
                <div className="class-box" onClick={() => handleClassClick('BSIT1-1')}>BSIT 2-1</div>
                <div className="class-box" onClick={() => handleClassClick('BSIT1-2')}>BSIT 2-2</div>
                <div className="class-box" onClick={() => handleClassClick('BSIT1-1')}>BSIT 3-1</div>
                <div className="class-box" onClick={() => handleClassClick('BSIT1-2')}>BSIT 3-2</div>
                <div className="class-box" onClick={() => handleClassClick('BSIT1-1')}>BSIT 4-1</div>
                <div className="class-box" onClick={() => handleClassClick('BSIT1-2')}>BSIT 4-2</div>
              </div>
            )}
          </section>
        )}

        {selectedSection === 'profile' && (
          <section className="card border-success p-3">
            <h2 className='custom-color-green-font custom-font'>Profile</h2>
            <div className="custome-font custom-color-green-font fs-6 mb-2">Faculty ID: 2020-00202-PQ-O</div>
            <input type="text" placeholder="First Name" className="form-control custom-color-green-font mb-2" required />
            <input type="text" placeholder="Last Name" className="form-control custom-color-green-font mb-2" required />
            <input type="email" placeholder="Email" className="form-control custom-color-green-font mb-2" required />
            <button className="btn custom-color-font bg-custom-color-green p-2" onClick={() => alert('Profile information saved!')}>
              Save
            </button>
          </section>
        )}

        {selectedSection === 'change-password' && (
          <section className="card border-success p-3">
            <h2 className='custom-color-green-font custom-font'>Change Password</h2>
            <input type="password" placeholder="New Password" className="form-control custom-color-green-font mb-2" required />
            <button className="btn custom-color-font bg-custom-color-green p-2" onClick={() => alert('Password changed successfully!')}>
              Save
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
