import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Card } from 'react-bootstrap';
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

  const resetForm = () => {
    setName('');
    setRollNumber('');
    setClassName('');
    setSubjects([{ name: '', marks: '' }]);
    setEditMode(false);
    setCurrentId(null);
    setValidated(false);
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
    } else {
      addCandidate(candidateData);
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
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      deleteCandidate(id);
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

  return (
    <Container>
      <h2 className="mb-4">{editMode ? 'Edit Candidate' : 'Add New Candidate'}</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
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
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a class.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mt-3">Subjects</h5>
            {subjects.map((subject, index) => (
              <Row key={index} className="mb-2">
                <Col md={5}>
                  <Form.Group>
                    <Form.Control 
                      type="text" 
                      placeholder="Subject Name" 
                      value={subject.name} 
                      onChange={(e) => handleSubjectChange(index, 'name', e.target.value)} 
                      required={index === 0}
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Control 
                      type="text" 
                      placeholder="Marks" 
                      value={subject.marks} 
                      onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)} 
                      required={subject.name.trim() !== ''}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Button 
                    variant="danger" 
                    onClick={() => removeSubjectField(index)}
                    disabled={subjects.length === 1 && index === 0}
                  >
                    Remove
                  </Button>
                </Col>
              </Row>
            ))}

            <div className="mt-2 mb-3">
              <Button variant="secondary" onClick={addSubjectField}>
                Add Subject
              </Button>
            </div>

            <div className="d-flex">
              <Button variant="primary" type="submit" className="me-2">
                {editMode ? 'Update Candidate' : 'Add Candidate'}
              </Button>
              {editMode && (
                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <h3 className="mt-4">Candidates List</h3>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Class</th>
              <th>Subjects</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No candidates added yet</td>
              </tr>
            ) : (
              candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
                  <td>{candidate.rollNumber}</td>
                  <td>{candidate.className}</td>
                  <td>
                    {candidate.subjects.map((subject, index) => (
                      <div key={index}>
                        {subject.name}: {subject.marks}
                      </div>
                    ))}
                  </td>
                  <td>
                    <Button 
                      variant="info" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEdit(candidate)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(candidate.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default CandidateManager;