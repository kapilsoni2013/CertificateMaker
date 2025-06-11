import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Home = () => {
  const { candidates, templates } = useContext(AppContext);

  return (
    <div>
      <h1>Certificate Maker</h1>
      <p>Welcome to the Certificate Maker application. This tool allows you to create custom certificates by uploading templates and adding candidate information.</p>
      
      <div className="card">
        <div className="card-header">Quick Stats</div>
        <div>
          <p>Total Candidates: {candidates.length}</p>
          <p>Total Templates: {templates.length}</p>
        </div>
        <div className="action-buttons">
          <Link to="/candidates/add">
            <button>Add New Candidate</button>
          </Link>
          <Link to="/templates/add">
            <button>Create New Template</button>
          </Link>
          <Link to="/generate">
            <button>Generate Certificates</button>
          </Link>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">How to Use</div>
        <ol>
          <li>Add candidate information including name, roll number, class, and subject marks.</li>
          <li>Upload certificate templates and define regions where candidate information should appear.</li>
          <li>Generate certificates by selecting a template and candidate records.</li>
        </ol>
      </div>
    </div>
  );
};

export default Home;