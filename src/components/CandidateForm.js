import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const CandidateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addCandidate, updateCandidate, getCandidate } = useContext(AppContext);
  
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    class: '',
    subjects: {}
  });
  
  const [subjectInputs, setSubjectInputs] = useState([{ name: '', marks: '' }]);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (id) {
      const candidate = getCandidate(id);
      if (candidate) {
        setFormData({
          name: candidate.name,
          rollNumber: candidate.rollNumber,
          class: candidate.class,
          subjects: candidate.subjects || {}
        });
        
        // Convert subjects object to array for form inputs
        const subjectArray = Object.entries(candidate.subjects || {}).map(
          ([name, marks]) => ({ name, marks })
        );
        
        // Ensure there's at least one empty input at the end
        setSubjectInputs(subjectArray.length > 0 ? subjectArray : [{ name: '', marks: '' }]);
      } else {
        setError('Candidate not found');
      }
    }
  }, [id, getCandidate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubjectChange = (index, field, value) => {
    const updatedInputs = [...subjectInputs];
    updatedInputs[index][field] = value;
    setSubjectInputs(updatedInputs);
    
    // Add a new empty input if the last one is being filled
    if (index === subjectInputs.length - 1 && value !== '') {
      if (field === 'marks' && updatedInputs[index].name !== '') {
        setSubjectInputs([...updatedInputs, { name: '', marks: '' }]);
      }
    }
  };
  
  const removeSubject = (index) => {
    if (subjectInputs.length > 1) {
      const updatedInputs = subjectInputs.filter((_, i) => i !== index);
      setSubjectInputs(updatedInputs);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.name || !formData.rollNumber || !formData.class) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Convert subject inputs to object format
    const subjects = {};
    subjectInputs.forEach(input => {
      if (input.name && input.marks) {
        subjects[input.name] = input.marks;
      }
    });
    
    const candidateData = {
      ...formData,
      subjects
    };
    
    if (id) {
      updateCandidate(id, candidateData);
    } else {
      addCandidate(candidateData);
    }
    
    navigate('/candidates');
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <h2>{id ? 'Edit Candidate' : 'Add New Candidate'}</h2>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="rollNumber">Roll Number *</label>
          <input
            type="text"
            id="rollNumber"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="class">Class *</label>
          <input
            type="text"
            id="class"
            name="class"
            value={formData.class}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Subjects and Marks</label>
          {subjectInputs.map((input, index) => (
            <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Subject Name"
                value={input.name}
                onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                style={{ flex: 1, marginRight: '10px' }}
              />
              <input
                type="text"
                placeholder="Marks"
                value={input.marks}
                onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                style={{ flex: 1, marginRight: '10px' }}
              />
              {index > 0 && (
                <button 
                  type="button" 
                  className="secondary"
                  onClick={() => removeSubject(index)}
                  style={{ flex: 0 }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="action-buttons">
          <button type="submit">
            {id ? 'Update Candidate' : 'Add Candidate'}
          </button>
          <button 
            type="button" 
            className="secondary"
            onClick={() => navigate('/candidates')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CandidateForm;