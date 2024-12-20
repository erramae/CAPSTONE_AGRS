import React, { useState, useEffect, useContext } from 'react'; 
import { Table, Form, Button, Row, Col, Modal, ButtonToolbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt,  faEnvelope, faPhoneAlt} from '@fortawesome/free-solid-svg-icons';
import { UserContext } from '../Context/UserContext';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import YearLevelModel from '../ReactModels/YearLevelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import SectionModel from '../ReactModels/SectionModel';
import StudentModel from '../ReactModels/StudentModel';
import EnrollmentModel from '../ReactModels/EnrollmentModel';
import ScheduleModel from '../ReactModels/ScheduleModel';
import PersonnelModel from '../ReactModels/PersonnelModel';
import '../App.css';


const MasterlistOfGradesTable = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [semester, setSemester] = useState('First');
  const [program, setProgram] = useState('');
  //const [sections, setSections] = useState(Array(8).fill(null).map((_, index) => `Section ${index + 1}`));
  const [sections, setSections] = useState([]);

  const [academicYears, setAcademicYears] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [programs, setPrograms] = useState([]);
  //const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [showModal, setShowModal] = useState(false); 
  const [showModalAlert, setShowModalAlert] =useState(false);
  const [showModalAlertView, setShowModalAlertView] =useState(false);
  const { user } = useContext(UserContext);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('First');
  const [selectedSection, setSelectedSection] = useState('A'); // Default to Section A
  const [currentAcademicYear, setCurrentAcadYear] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [mappedData, setMappedData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [groupedData, setGroupedData] = useState({}); 
  const [currentSection, setCurrentSection] = useState("");
  const [validatedSections, setValidatedSections] = useState([]);


const handleShowModal = (section) => {
  setCurrentSection(section); // Set the section being validated
  setShowModal(true);         // Show the modal
};

const handleCloseModal = () => {
  setShowModal(false);        // Hide the modal
  setCurrentSection("");      // Clear the current section
};

const handleValidate = () => {
  setValidatedSections([...validatedSections, currentSection]);
  setShowModal(false);  // Close the modal after validation
};


 

  const fetchAcademicYearsAndPrograms = async () => {
    try {
      // Fetch academic years and programs
      const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
      setAcademicYears(fetchedAcademicYears);

      const current = fetchedAcademicYears.filter(acadYears => acadYears.isCurrent === true);
      setCurrentAcadYear(current);
  
      const fetchedProgram = await ProgramModel.fetchAllPrograms(user.programNumber);

      setPrograms(fetchedProgram);
  
      if (fetchedProgram.length > 0) {
        const data = [];
      
        fetchedProgram.forEach(row => {
          // Check if there is already an entry for the current academicYear
          let existingAcadYear = data.find(item => item.academicYear === row.academicYear);
      
          if (!existingAcadYear) {
            // Filter programs for the current academicYear
            const programsForYear = fetchedProgram.filter(item => item.academicYear === row.academicYear);
            
            // Collect unique programs for the academicYear
            const programs = [];
            const programNamesSet = new Set();
      
            programsForYear.forEach(row => {
              if (!programNamesSet.has(row.programName)) {
                programNamesSet.add(row.programName);
      
                // Create yearLevels with default semesters [1, 2], and add semester 3 if programYrLvlSummer matches
                const yearLevels = Array.from({ length: row.programNumOfYear }, (_, i) => {
                  const yearLevel = i + 1;
                  const semesters = yearLevel === row.programYrLvlSummer ? [1, 2, 3] : [1, 2];
                  return { yearLevel, semesters };
                });
      
                programs.push({
                  programName: row.programName,
                  yearLevels: yearLevels
                });
              }
            });
      
            // Create a new entry for the academicYear
            const entry = {
              academicYear: row.academicYear,
              programs
            };
            data.push(entry); // Push the new entry into the data array
          }
        });

        setMappedData(data);
      }      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      // Find the selected program based on academic year and program name
      const program = programs.find(
        (p) =>
          p.academicYear === selectedAcademicYear &&
          p.programName === selectedProgram
      );
  
      const selectedProgramNumber = program ? program.programNumber : null;
      const yearLevel = parseInt(selectedYearLevel, 10);
      const semester = parseInt(selectedSemester, 10);
  
      if (!selectedProgramNumber) {
        console.error("No matching program found for the selected criteria.");
        return;
      }
  
      // Fetch sections filtered by the selected criteria
      const sectionData = await SectionModel.fetchExistingSections(
        selectedAcademicYear,
        yearLevel,
        semester,
        selectedProgramNumber
      );
    
  
      // Extract section numbers from sectionData and sort them in ascending order
      const sectionNumbers = sectionData
        .map((section) => section.sectionNumber)
        .sort((a, b) => {
          // Regex to split the section number into numeric part and alphanumeric part
          const regex = /(\d+)-([A-Za-z]+)(\d*)/;
          const [, numA, alphaA, suffixA] = a.match(regex) || [];
          const [, numB, alphaB, suffixB] = b.match(regex) || [];
  
          // First compare the numeric part
          if (parseInt(numA) !== parseInt(numB)) {
            return parseInt(numA) - parseInt(numB);
          }
  
          // If numeric parts are the same, compare the alphanumeric part (HM41A, HM41B, etc.)
          if (alphaA !== alphaB) {
            return alphaA.localeCompare(alphaB);
          }
  
          // If both numeric and alpha parts are the same, compare the suffixes (e.g., B, C, etc.)
          return suffixA.localeCompare(suffixB);
        });
  
      if (sectionNumbers.length === 0) {
        console.warn("No sections found for the selected criteria.");
        setGroupedData([]); // Clear data if no sections found
        return;
      }
  
      // Fetch all schedules for the selected academic year
      const scheduleData = await ScheduleModel.fetchAllSchedules(selectedAcademicYear);
  
      // Filter schedules to match the sorted section numbers
      const filteredSchedules = scheduleData.filter((schedule) =>
        sectionNumbers.includes(schedule.sectionNumber)
      );
  
      // Fetch personnel data for the selected academic year
      const personnelData = await PersonnelModel.fetchAllPersonnel(selectedAcademicYear);
  
      // Map personnel numbers to their last names
      const personnelNameLastMap = personnelData.reduce((map, personnel) => {
        map[personnel.personnelNumber] = personnel.personnelNameLast;
        return map;
      }, {});
  
  
      // Group course codes and assigned personnel by section number
      const groupedData = filteredSchedules.reduce((acc, schedule) => {
        const { sectionNumber, courseCode, personnelNumber } = schedule;
        const personnelLastName = personnelNameLastMap[personnelNumber] || "Unknown";
  
        // Initialize section entry if not already present
        if (!acc[sectionNumber]) {
          acc[sectionNumber] = { courseCodes: [], personnelNames: [] };
        }
  
        // Add the course code to the section's list
        acc[sectionNumber].courseCodes.push(courseCode);
  
        // Always append the personnel's last name for each course code, even if redundant
        acc[sectionNumber].personnelNames.push(personnelLastName);
  
        return acc;
      }, {});
  
      // Save the grouped data to state for rendering
      setGroupedData(groupedData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchStudentData = async () => {
    try {
      // Fetch only the necessary data from the models
      const studentsData = await StudentModel.fetchExistingStudents();
  
      const enrolledStudents = await EnrollmentModel.fetchAllEnrollment();
  
      const scheduleData = await ScheduleModel.fetchAllSchedules(selectedAcademicYear);
  
      // Combine the data and remove duplicates by studentNumber
      const combinedData = enrolledStudents.map((enrollment) => {
        // Match student details
        const student = studentsData.find(
          (student) => student.studentNumber === enrollment.studentNumber
        );
  
        // Match schedule details
        const schedule = scheduleData.find(
          (schedule) => schedule.scheduleNumber === enrollment.scheduleNumber
        );
  
        return {
          studentNumber: enrollment.studentNumber,
          studentName: student
            ? `${student.studentNameFirst} ${student.studentNameMiddle || ''} ${student.studentNameLast}`
            : 'Unknown',
          sectionNumber: schedule ? schedule.sectionNumber : null,
          scheduleNumber: enrollment.scheduleNumber,
        };
      });
  
      // Remove duplicates based on studentNumber
      const distinctData = combinedData.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.studentNumber === value.studentNumber)
      );
  
      // Set the distinct data to the state
      setCombinedData(distinctData);
  
      return distinctData;
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    }
  };
  
  
  useEffect(() => {
    fetchAcademicYearsAndPrograms();
  }, [user.programNumber]);


  const handleAcademicYearChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedAcademicYear(selectedYear);
    setSelectedProgram('');  // Reset dependent fields
    setSelectedYearLevel('');
    setSelectedSemester('');
    setSelectedSection('');
    
  };

  const handleProgramChange = (e) => {
    const selectedProgram = e.target.value;
    setSelectedProgram(selectedProgram);
    setSelectedYearLevel('');
    setSelectedSemester('');
    setSelectedSection('');
    
  };

  const handleYearLevelChange = (e) => {
    const selectedYear = e.target.value;
    setSelectedYearLevel(selectedYear);
    setSelectedSemester('');
    setSelectedSection('');
    
  };

  const handleSemesterChange = (e) => {
    const level = (e.target.value);
    setSelectedSemester(level);
    setSelectedSection('');
    
  };


  const getSemesterText = (sem) => {
    switch (sem) {
      case 1:
        return "First";
      case 2:
        return "Second";
      case 3:
        return "Summer";
      default:
        return `${sem}`;
    }
  };
  
  const selectedProgramData = mappedData?.filter(p => p.academicYear === selectedAcademicYear)
                                        ?.flatMap(p => p.programs)
                                        ?.filter(p => p.programName === selectedProgram)
                                        ?.flatMap(p => p.yearLevels);

  const selectedYearData = mappedData?.filter(p => p.academicYear === selectedAcademicYear)
                                     ?.flatMap(p => p.programs)
                                     ?.filter(p => p.programName === selectedProgram)
                                     ?.flatMap(p => p.yearLevels)
                                     ?.filter(p => p.yearLevel === Number(selectedYearLevel))
                                     ?.flatMap(p => p.semesters);


  const handleView = () => {
    if (selectedAcademicYear && selectedProgram && selectedYearLevel && selectedSemester) {
      fetchCourses();
      fetchStudentData();
      setDataFetched(true); // Indicate that data has been fetched successfully.
    } else {
      setShowModalAlertView(true);
      setDataFetched(false); // Ensure dataFetched is false if filters are incomplete.
    }
  };

  const closeShowModalAlert = () => {
    setShowModalAlert(false);
  }

  const closeShowModalAlertView = () => {
    setShowModalAlertView(false);
  }
  
  const printTable = () => {
    if (!dataFetched) {
      setShowModalAlert(true);
      return;
    }

    const table = document.getElementById('printableTable');
    if (!table) {
      console.error('Table not found');
      return;
    }
  
    // Clone the table
    const clonedTable = table.cloneNode(true);
  
    // Select all rows (including header and body)
    const rows = clonedTable.querySelectorAll('tr');
  
    // Get all rows for header and body
    const headerRows = clonedTable.querySelectorAll('thead tr');
    const bodyRows = clonedTable.querySelectorAll('tbody tr');
  
    // Highlight the last column (WGA) in both header and body (only for print)
    // In header (last cell in both header rows)
    const headerCells = clonedTable.querySelectorAll('thead th');
    const lastHeaderCell = headerCells[headerCells.length - 1];
    lastHeaderCell.style.backgroundColor = '#bf9000'; // Brown for WGA column in header
    lastHeaderCell.style.color = 'black'; // Text color black for WGA header
  
    // In body (last column in each row)
    bodyRows.forEach(row => {
      const lastCell = row.cells[row.cells.length - 1]; // Target the last cell in each body row
      lastCell.style.backgroundColor = '#bf9000'; // Brown for WGA column in body
    });
  
    // Apply colors to the first and second header rows (only for print)
    if (headerRows.length > 0) {
      headerRows.forEach((headerRow, index) => {
        // Apply blue color to the first header row and text color black (only for print)
        if (index === 0) {
          headerRow.querySelectorAll('th').forEach(cell => {
            cell.style.backgroundColor = '#00b0f0'; // Blue
            cell.style.color = 'black'; // Text color black
          });
        }
        // Apply yellow color to the second header row and text color black (only for print)
        if (index === 1) {
          headerRow.querySelectorAll('th').forEach(cell => {
            cell.style.backgroundColor = '#ffff00'; // Yellow
            cell.style.color = 'black'; // Text color black
          });
        }
      });
    }
  
    // Remove the last column from body rows (not the header)
    bodyRows.forEach(row => {
      row.deleteCell(row.cells.length - 1);
    });
  
    const printWindow = window.open('', '', 'height=500,width=1000');
    printWindow.document.write('<html><head><title>Print Table</title>');
    printWindow.document.write(`
      <style>
        @media print {
          @page {
            size: letter landscape; /* Set Legal size and Landscape orientation */
            margin: 0;
            /* Ensure background graphics are included */
            background: #fff;
          }
  
          body {
            font-family: Arial, sans-serif;
          }
  
          table {
            width: 125%;
            table-layout: auto;
            border-collapse: collapse;
            page-break-before: auto;
          }
  
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
          }
  
          td {
            background-color: white;
          }
  
          th {
            background-color: #4CAF50;
            color: black; /* Text color black in all header cells */
          }
  
          /* Prevent repeated header on every page */
          thead {
            display: table-row-group;
          }
  
          /* Keep rows from splitting between pages */
          tr {
            page-break-inside: avoid;
          }
  
          /* Highlight last column in print */
          th:last-child, td:last-child {
            background-color: #bf9000; /* Highlight color for last column */
            color: black; /* Text color black for WGA column */
          }
  
          /* Apply print-specific header row colors */
          thead tr:nth-child(1) th {
            background-color: #00b0f0; /* Blue for the first header row */
            color: black; /* Text color black for first header row */
          }
  
          thead tr:nth-child(2) th {
            background-color: #ffff00; /* Yellow for the second header row */
            color: black; /* Text color black for second header row */
          }
  
          .header-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            margin-top: 40px;
          }
  
          .logo {
            height: 80px;
            margin-right: 20px;
          }
  
          .text {
            text-align: left;
            margin-right: 20px;
          }
  
          .city, .college {
            color: green;
          }
  
          .college {
            font-size: 29px;
            font-weight: bold;
          }
  
          .vertical-line {
            border-left: 2px solid green;
            height: 80px;
            margin-left: 20px;
            margin-right: 20px;
          }
  
          .additional-text {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
          }
  
          .additional-line {
            font-size: 16px;
            font-weight: normal;
            display: flex;
            align-items: flex-start;
            margin-bottom: 5px;
            color: green;
          }
  
          .icon {
            margin-right: 8px;
            font-size: 18px;
            min-width: 24px;
            color: green;
          }
  
          .address-container {
            display: flex;
            align-items: flex-start;
          }
  
          .address-container .address-text {
            display: flex;
            flex-direction: column;
          }
  
          .second-logo {
            height: 80px;
            margin-left: 40px;
          }
  
          .separator {
            border: 0;
            border-top: 2px solid green;
            width: 80%;
            margin: 20px auto;
          }
  
          .centered-text {
            text-align: center;
          }
        }
  
      </style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    `);
    printWindow.document.write('</head><body>');
  
    let fullProgramName;
    if (program === "BSHM") {
      fullProgramName = "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT";
    } else if (program === "BSEntrep") {
      fullProgramName = "BACHELOR OF SCIENCE IN ENTREPRENEURSHIP";
    } else {
      fullProgramName = program;
    }
  
    printWindow.document.write(`
      <div class="header-container">
        <img src="/pcc.png" alt="PCC Logo" class="logo" id="logo">
        <div class="text">
          <div class="city">PARANAQUE CITY</div>
          <div class="college">COLLEGE</div>
        </div>
        <div class="vertical-line"></div>
        <div class="additional-text">
          <div class="additional-line address-container">
            <span class="icon"><i class="fas fa-map-marker-alt"></i></span>
            <div class="address-text">
              <div>Coastal Rd., cor. Victor Medina Street,</div>
              <div>San Dionisio, Paranaque City, Philippines</div>
            </div>
          </div>
          <div class="additional-line">
            <span class="icon"><i class="fas fa-envelope"></i></span>info@paranaquecitycollege.edu.ph
          </div>
          <div class="additional-line">
            <span class="icon"><i class="fas fa-phone-alt"></i></span>(02)85343321
          </div>
        </div>
        <img src="/pcc.png" alt="PCC Logo" class="second-logo">
      </div>
      <hr class="separator">
      <div class="centered-text">
        <h1>OFFICE OF THE COLLEGE REGISTRAR</h1>
        <h2>Summary of Grades</h2>
        <h2>${fullProgramName}</h2>
        <h2>${yearLevel}</h2>
        <h2>${semester} Semester S.Y. ${academicYear}</h2>
      </div>
    `);
  
    printWindow.document.write(clonedTable.outerHTML);
    printWindow.document.write('</body></html>');
  
    const logo = printWindow.document.getElementById('logo');
    logo.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  
    logo.onerror = () => {
      console.error('Logo failed to load.');
      printWindow.print();
      printWindow.close();
    };
  };
  
  const openModal = (student) => {
    setShowModal(true);
    console.log('sstudent',student)
    setSelectedStudent(student);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  
  return (
    <div>
      <Form className="p-3 mb-4 bg-white border border-success rounded">
      <Row className="align-items-center">
      <Col md={2} className='mb-3'>
          <Form.Group controlId="academicYear">
            <Form.Label className='custom-color-green-font custom-font'>Academic Year</Form.Label>
            <Form.Select value={selectedAcademicYear} onChange={handleAcademicYearChange} className="border-success">
              <option value="">Select Academic Year</option>
              {academicYears.sort((a, b) => {
                let yearA = parseInt(a.academicYear.split('-')[0]);
                let yearB = parseInt(b.academicYear.split('-')[0]);
                return yearB - yearA; // Sorting in descending order
              })
              .map((program) => (
                <option key={program.academicYear} value={program.academicYear}>
                  {program.academicYear}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}  className='mb-3'>
          <Form.Group controlId="program">
            <Form.Label className='custom-color-green-font custom-font'>Program</Form.Label>
            <Form.Select value={selectedProgram} onChange={handleProgramChange} className="border-success"
              disabled={!selectedAcademicYear}>
            <option value="">Select Program</option>
              {mappedData
                ?.filter(p => p.academicYear === selectedAcademicYear)
                ?.flatMap(p => p.programs)
                .map((program) => (
                  <option key={program.programNumber} value={program.programNumber}>
                    {program.programName}
                  </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2} className='mb-3'>
          <Form.Group controlId="yearLevel">
            <Form.Label className='custom-color-green-font custom-font'>Year Level</Form.Label>
            <Form.Select value={selectedYearLevel} onChange={handleYearLevelChange} className="border-success"
              disabled={!selectedAcademicYear || !selectedProgram}>
              <option value="">Select Year Level</option>
              {selectedProgramData // Get year levels for selected academic year
                ?.map(level => (
                  <option key={level.yearLevel} value={level.yearLevel}>
                    Year {level.yearLevel}
                  </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2} className='mb-3'>
          <Form.Group controlId="semester">
            <Form.Label className='custom-color-green-font custom-font'>Semester</Form.Label>
            <Form.Select value={selectedSemester} onChange={handleSemesterChange} className="border-success"
              disabled={!selectedYearLevel || !selectedAcademicYear || !selectedProgram}>
            <option value="">Select Semester</option>
              {selectedYearData
                ?.map((sem, index) => (
                  <option key={index} value={sem}>
                    {getSemesterText(sem)}
                  </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      

        <Col md={4} className='mb-3'>
        <Form.Group controlId="viewButton">
            <Form.Label className="custom-color-green-font custom-font">Action</Form.Label>
              <div className='d-flex'>
                  <Button className="w-100 btn-success me-2" onClick={handleView}>View</Button>
              </div>
          </Form.Group>
        </Col>
      </Row>
      </Form>
      

     
      <div id="printableTable" className="bg-white rounded pt-5 px-3 pb-3 table-responsive">
    {Object.keys(groupedData).length === 0 || combinedData.length === 0 ? (
      <div className="text-center py-5">
        <h5 className="custom-color-green-font fs-5">No Data Available</h5>
        <p className="fs-6">
          Please ensure that all filters are applied or data is available to display.
        </p>
      </div>
    ) : (
      Object.entries(groupedData)
        .sort(([sectionNumberA], [sectionNumberB]) =>
          sectionNumberA.localeCompare(sectionNumberB)
        )
        .map(([sectionNumber, sectionData], sectionIndex) => (
          <Table bordered hover key={sectionIndex} className="text-center mb-3">
            {/* Table Header */}
            <thead className="table-success">
              <tr>
                <th colSpan="3" className="custom-color-green-font fixed-width">{sectionNumber}</th>
                {sectionData.personnelNames.map((personnelName, index) => (
                  <th key={`personnel-${index}`} className="bg-success text-white fixed-width">
                    {personnelName}
                  </th>
                ))}
                <th colSpan={sectionData.courseCodes.length + 1} className="custom-color-green-font fixed-width">
                  WEIGHTED GRADE AVERAGE
                </th>
              </tr>
              <tr>
                <th className="bg-success text-white fixed-width">ITEM</th>
                <th className="bg-success text-white fixed-width">SNUMBER</th>
                <th className="bg-success text-white student-name">STUDENT NAME</th>
                {sectionData.courseCodes.map((courseCode, index) => (
                  <th key={`course-${index}`} className="bg-success text-white fixed-width">
                    {courseCode}
                  </th>
                ))}
                {sectionData.courseCodes.map((courseCode, index) => (
                  <th key={`course-grade-${index}`} className="bg-success text-white fixed-width">
                    {courseCode}
                  </th>
                ))}
                <th className="bg-success text-white fixed-width">WGA</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="table-success">
              {combinedData.filter((data) => data.sectionNumber === sectionNumber).length === 0 ? (
                <tr>
                  <td colSpan={3 + sectionData.courseCodes.length * 2 + 2} className="no-data-row">
                    No Student Data Available
                  </td>
                </tr>
              ) : (
                combinedData
                  .filter((studentData) => studentData.sectionNumber === sectionNumber)
                  .map((studentData, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="bg-white fixed-width">{rowIndex + 1}</td>
                      <td className="bg-white fixed-width">{studentData.studentNumber}</td>
                      <td className="bg-white student-name">{studentData.studentName}</td>

                      {sectionData.courseCodes.map((courseCode, courseIndex) => (
                        <td key={`course-${courseIndex}`} className="bg-white fixed-width">-</td>
                      ))}

                      {sectionData.courseCodes.map((courseCode, courseIndex) => (
                        <td key={`course-grade-${courseIndex}`} className="bg-white fixed-width">0.0</td>
                      ))}

                      <td className="bg-white fixed-width">0.0</td>
                    </tr>
                  ))
              )}
              <tr>
                <td colSpan={sectionData.courseCodes.length * 2 + 5} style={{ background: "white" }}>
                <Button
                  variant="primary"
                  onClick={() => handleShowModal(sectionNumber)}
                  style={{
                    width: '100%',
                    backgroundColor: validatedSections.includes(sectionNumber) ? '#6c757d' : '#dc3545', // Gray when validated, Red when active
                    borderColor: validatedSections.includes(sectionNumber) ? '#6c757d' : '#dc3545', // Same for border
                    color: validatedSections.includes(sectionNumber) ? '#fff' : '#fff', // White text for both
                    cursor: validatedSections.includes(sectionNumber) ? 'not-allowed' : 'pointer', // Disable cursor when validated
                  }}
                  disabled={validatedSections.includes(sectionNumber)} // Disable button if validated
                >
                  {validatedSections.includes(sectionNumber) ? 'VALIDATED!' : 'Validate'}
                </Button>

                </td>
              </tr>
            </tbody>
          </Table>
        ))
    )}
    {/* Validation Modal */}
    <Modal show={showModal} onHide={handleCloseModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Validate Section</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>( TENTAVITE LETTER )Are you sure you want to validate this for <strong>{currentSection}</strong>?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleValidate}>
          Validate
        </Button>
      </Modal.Footer>
    </Modal>
  </div>

      <Modal show={showModalAlert} onHide={closeShowModalAlert} centered>
        <Modal.Header closeButton>
          <Modal.Title>Action Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please click "View" to load the data before printing.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeShowModalAlert}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModalAlertView} onHide={closeShowModalAlertView} centered>
        <Modal.Header closeButton>
          <Modal.Title>Action Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Please complete all filters (Academic Year, Program, Year Level, Semester) to view schedules.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeShowModalAlertView}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MasterlistOfGradesTable;
