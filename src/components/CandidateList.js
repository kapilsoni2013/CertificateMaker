import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const CandidateList = () => {
  const { candidates, deleteCandidate } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Candidates</h2>
        </div>
        <div className="action-buttons">
          <Link to="/candidates/add">
            <button>Add New Candidate</button>
          </Link>
        </div>
        
        <div className="form-group">
          <input 
            type="text" 
            placeholder="Search candidates..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {filteredCandidates.length > 0 ? (
          <table>
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
              {filteredCandidates.map(candidate => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
                  <td>{candidate.rollNumber}</td>
                  <td>{candidate.class}</td>
                  <td>
                    {Object.entries(candidate.subjects || {}).map(([subject, marks]) => (
                      <div key={subject}>
                        {subject}: {marks}
                      </div>
                    ))}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/candidates/edit/${candidate.id}`}>
                        <button>Edit</button>
                      </Link>
                      <button 
                        className="secondary"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this candidate?')) {
                            deleteCandidate(candidate.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No candidates found. {searchTerm ? 'Try a different search term or ' : ''} 
            <Link to="/candidates/add">add a new candidate</Link>.
          </p>
        )}
      </div>
    </div>
  );
};

export default CandidateList;