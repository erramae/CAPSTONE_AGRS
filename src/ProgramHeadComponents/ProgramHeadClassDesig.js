import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import YearLevelModel from '../ReactModels/YearLevelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import SectionModel from '../ReactModels/SectionModel';

const ProgramHeadClassDesig = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [semester, setSemester] = useState('First'); // Default to "First" semester
  const [program, setProgram] = useState('');
  const [sections, setSections] = useState(['A']); // Start with Section "A"
  const [selectedSection, setSelectedSection] = useState('A'); // Default to Section A

  const [academicYears, setAcademicYears] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [professors, setProfessors] = useState([
    'Prof. John Doe',
    'Prof. Jane Smith',
    'Prof. Michael Johnson',
    // Add more professors here
  ]);
  const [selectedProfessor, setSelectedProfessor] = useState('Prof. John Doe');

  const [subjects, setSubjects] = useState([
    {
      subjectCode: 'CS101',
      subjectDescription: 'Introduction to Computer Science',
      lectureUnits: 3,
      labUnits: 1,
      schedule: { day: 'Mon', startTime: '8:00 AM', endTime: '10:00 AM' },
      professor: 'Prof. John Doe',
    },
    {
      subjectCode: 'CS102',
      subjectDescription: 'Data Structures and Algorithms',
      lectureUnits: 3,
      labUnits: 2,
      schedule: { day: 'Tue', startTime: '9:00 AM', endTime: '12:00 PM' },
      professor: 'Prof. Jane Smith',
    },
    // Add more subjects as needed
  ]);

  const handleScheduleChange = (index, field, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index].schedule[field] = value;
    setSubjects(updatedSubjects);
  };

  const handleProfessorChange = (index, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index].professor = value;
    setSubjects(updatedSubjects);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
        setAcademicYears(fetchedAcademicYears);
        if (fetchedAcademicYears.length > 0) {
          setAcademicYear(fetchedAcademicYears[0].academicYear); // Set first academic year as default
        }

        const fetchedYearLevels = await YearLevelModel.fetchExistingYearLevels();
        setYearLevels(fetchedYearLevels);
        if (fetchedYearLevels.length > 0) {
          setYearLevel(fetchedYearLevels[0].yearName); // Set first year level as default
        }

        const fetchedPrograms = await ProgramModel.fetchAllPrograms();
        setPrograms(fetchedPrograms);
        if (fetchedPrograms.length > 0) {
          setProgram(fetchedPrograms[0].programName); // Set first program as default
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const printCSOG = () => {
    window.open('/SOG.pdf', '_blank');
  };

  return (
    <div>
      {/* First Row for Academic Year */}
      <Row className="mb-2 bg-white rounded p-3 m-1">
        <Col xs={6} sm={4}>
          <Form.Group controlId="academicYear">
            <Form.Label>Academic Year</Form.Label>
            <Form.Control as="select" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
              {academicYears.map((year) => (
                <option key={year.id} value={year.academicYear}>
                  {year.academicYear}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {/* Second Row for Program, Year Level, Semester */}
      <Row className="mb-4 bg-white rounded p-3 m-1">
        <Col>
          <Form.Group controlId="program">
            <Form.Label>Program</Form.Label>
            <Form.Control as="select" value={program} onChange={(e) => setProgram(e.target.value)}>
              {programs.map((prog) => (
                <option key={prog.id} value={prog.programName}>
                  {prog.programName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="yearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Control as="select" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}>
              {yearLevels.map((level) => (
                <option key={level.id} value={level.yearName}>
                  {level.yearName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="semester">
            <Form.Label>Semester</Form.Label>
            <Form.Control as="select" value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="First">First</option>
              <option value="Second">Second</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {/* Section Selection on a New Line */}
      <Row className="mb-4 bg-white rounded p-2 m-1">
        <Col xs={6} sm={4}>
          <Form.Group controlId="section">
            <Form.Control as="select" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
              {sections.map((section, index) => (
                <option key={index} value={section}>
                  Section {section}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {/* Table for Subjects */}
      <Row className="mb-3">
        <Col>
          <Table bordered hover className="text-center">
            <thead className="table-success">
              <tr>
                <th>Subject Code</th>
                <th>Subject Description</th>
                <th>Lecture Units</th>
                <th>Lab Units</th>
                <th>Schedule</th>
                <th>Professor</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={index}>
                  <td>{subject.subjectCode}</td>
                  <td>{subject.subjectDescription}</td>
                  <td>{subject.lectureUnits}</td>
                  <td>{subject.labUnits}</td>
                  <td>
                    {/* Schedule Inputs aligned in a single line */}
                    <div className="d-flex justify-content-start align-items-center">
                      <Form.Control
                        as="select"
                        value={subject.schedule.day}
                        onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                        className="mr-2"
                      >
                        <option value="Mon">Mon</option>
                        <option value="Tue">Tue</option>
                        <option value="Wed">Wed</option>
                        <option value="Thu">Thu</option>
                        <option value="Fri">Fri</option>
                        <option value="Sat">Sat</option>
                      </Form.Control>
                      <Form.Control
                        type="time"
                        value={subject.schedule.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        className="mr-2"
                      />
                      <Form.Control
                        type="time"
                        value={subject.schedule.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        className="mr-2"
                      />
                    </div>
                  </td>
                  <td>
                    {/* Professor Selection */}
                    <Form.Control
                      as="select"
                      value={subject.professor}
                      onChange={(e) => handleProfessorChange(index, e.target.value)}
                    >
                      {professors.map((prof, idx) => (
                        <option key={idx} value={prof}>
                          {prof}
                        </option>
                      ))}
                    </Form.Control>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>
  );
};

export default ProgramHeadClassDesig;
