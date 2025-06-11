import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Card, Badge, Alert } from 'react-bootstrap';
import { AppContext } from '../context/AppContext';

const CandidateManager = () => {
  const { candidates, addCandidate, updateCandidate, deleteCandidate } = useContext(AppContext);
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [className, setClassName] = useState('');
  const [subjects, setSubjects] = useState([{ name: '', marks: '' }]);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [validated, setValidated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Get unique class names for filtering
  const uniqueClasses = [...new Set(candidates.map(candidate => candidate.className))];

  const resetForm = () => {
    setName('');
    setRollNumber('');
    setClassName('');
    setSubjects([{ name: '', marks: '' }]);
    setEditMode(false);
    setCurrentId(null);
    setValidated(false);
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const candidateData = {
      name,
      rollNumber,
      className,
      subjects: subjects.filter(subject => subject.name.trim() !== '')
    };

    if (editMode) {
      updateCandidate(currentId, candidateData);
      showNotification(`Candidate ${name} updated successfully!`, 'success');
    } else {
      addCandidate(candidateData);
      showNotification(`New candidate ${name} added successfully!`, 'success');
    }

    resetForm();
  };

  const handleEdit = (candidate) => {
    setName(candidate.name);
    setRollNumber(candidate.rollNumber);
    setClassName(candidate.className);
    setSubjects(candidate.subjects.length > 0 ? [...candidate.subjects] : [{ name: '', marks: '' }]);
    setEditMode(true);
    setCurrentId(candidate.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      deleteCandidate(id);
      showNotification('Candidate deleted successfully!', 'warning');
    }
  };

  const addSubjectField = () => {
    setSubjects([...subjects, { name: '', marks: '' }]);
  };

  const removeSubjectField = (index) => {
    const updatedSubjects = [...subjects];
    updatedSubjects.splice(index, 1);
    setSubjects(updatedSubjects.length > 0 ? updatedSubjects : [{ name: '', marks: '' }]);
  };

  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index][field] = value;
    setSubjects(updatedSubjects);
  };

  // Filter candidates based on search term and class filter
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         candidate.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass ? candidate.className === filterClass : true;
    return matchesSearch && matchesClass;
  });

  // Calculate total and average marks for a candidate
  const calculateStats = (subjects) => {
    if (!subjects || subjects.length === 0) return { total: 0, average: 0 };
    
    let total = 0;
    let validSubjectsCount = 0;
    
    subjects.forEach(subject => {
      const marks = parseFloat(subject.marks);
      if (!isNaN(marks)) {
        total += marks;
        validSubjectsCount++;
      }
    });
    
    const average = validSubjectsCount > 0 ? total / validSubjectsCount : 0;
    return { total, average: average.toFixed(1) };
  };

  return (
    <Container>
      {notification.show && (
        <Alert variant={notification.type} className="mt-3 animate__animated animate__fadeIn">
          {notification.message}
        </Alert>
      )}
      
      <h2 className="mb-4 text-primary">
        {editMode ? 'Edit Candidate' : 'Add New Candidate'}
      </h2>
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter full name"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a name.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Roll Number</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={rollNumber} 
                    onChange={(e) => setRollNumber(e.target.value)} 
                    placeholder="Enter roll number"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a roll number.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Class</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={className} 
                    onChange={(e) => setClassName(e.target.value)} 
                    placeholder="Enter class (e.g., 10A)"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a class.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mt-3 border-bottom pb-2">Subjects & Marks</h5>
            {subjects.map((subject, index) => (
              <Row key={index} className="mb-3 align-items-center">
                <Col md={5}>
                  <Form.Group>
                    <Form.Control 
                      type="text" 
                      placeholder="Subject Name" 
                      value={subject.name} 
                      onChange={(e) => handleSubjectChange(index, 'name', e.target.value)} 
                      required={index === 0}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a subject name.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Control 
                      type="number" 
                      placeholder="Marks" 
                      value={subject.marks} 
                      onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)} 
                      required={subject.name.trim() !== ''}
                      min="0"
                      max="100"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide valid marks (0-100).
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Button 
                    variant="outline-danger" 
                    onClick={() => removeSubjectField(index)}
                    disabled={subjects.length === 1 && index === 0}
                    size="sm"
                  >
                    <i className="bi bi-trash"></i> Remove
                  </Button>
                </Col>
              </Row>
            ))}

            <div className="mt-2 mb-4">
              <Button variant="outline-secondary" onClick={addSubjectField} size="sm">
                <i className="bi bi-plus-circle"></i> Add Subject
              </Button>
            </div>

            <div className="d-flex">
              <Button variant={editMode ? "success" : "primary"} type="submit" className="me-2">
                {editMode ? <><i className="bi bi-check-circle"></i> Update Candidate</> : 
                <><i className="bi bi-person-plus"></i> Add Candidate</>}
              </Button>
              {editMode && (
                <Button variant="secondary" onClick={resetForm}>
                  <i className="bi bi-x-circle"></i> Cancel
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mt-4 shadow-sm">
        <Card.Header className="bg-light">
          <h3 className="mb-0">Candidates List</h3>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Control 
                  type="text" 
                  placeholder="Search by name or roll number" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Select 
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map((cls, index) => (
                    <option key={index} value={cls}>{cls}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="table-responsive">
            <Table striped bordered hover className="align-middle">
              <thead className="table-primary">
                <tr>
                  <th>Name</th>
                  <th>Roll Number</th>
                  <th>Class</th>
                  <th>Subjects & Marks</th>
                  <th>Stats</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-3">
                      <i className="bi bi-exclamation-circle text-muted me-2"></i>
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const stats = calculateStats(candidate.subjects);
                    return (
                      <tr key={candidate.id}>
                        <td>{candidate.name}</td>
                        <td>{candidate.rollNumber}</td>
                        <td>
                          <Badge bg="info" className="py-2 px-3">{candidate.className}</Badge>
                        </td>
                        <td>
                          {candidate.subjects.length === 0 ? (
                            <span className="text-muted">No subjects</span>
                          ) : (
                            <ul className="list-unstyled mb-0">
                              {candidate.subjects.map((subject, index) => (
                                <li key={index}>
                                  <strong>{subject.name}:</strong> {subject.marks}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td>
                          <div><strong>Total:</strong> {stats.total}</div>
                          <div><strong>Average:</strong> {stats.average}</div>
                        </td>
                        <td>
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="me-2 mb-1"
                            onClick={() => handleEdit(candidate)}
                          >
                            <i className="bi bi-pencil"></i> Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(candidate.id)}
                          >
                            <i className="bi bi-trash"></i> Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
          <div className="text-muted mt-2">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CandidateManager;