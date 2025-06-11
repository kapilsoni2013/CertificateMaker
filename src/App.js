import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import CandidateList from './components/CandidateList';
import CandidateForm from './components/CandidateForm';
import TemplateList from './components/TemplateList';
import TemplateForm from './components/TemplateForm';
import CertificateGenerator from './components/CertificateGenerator';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/" className="navbar-brand">Certificate Maker</Link>
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} end>Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/candidates" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Candidates</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/templates" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Templates</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/generate" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Generate Certificate</NavLink>
              </li>
            </ul>
          </div>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/candidates" element={<CandidateList />} />
            <Route path="/candidates/add" element={<CandidateForm />} />
            <Route path="/candidates/edit/:id" element={<CandidateForm />} />
            <Route path="/templates" element={<TemplateList />} />
            <Route path="/templates/add" element={<TemplateForm />} />
            <Route path="/templates/edit/:id" element={<TemplateForm />} />
            <Route path="/generate" element={<CertificateGenerator />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;