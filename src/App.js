import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';
import CandidateManager from './components/CandidateManager';
import TemplateManager from './components/TemplateManager';
import CertificateGenerator from './components/CertificateGenerator';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
              <Navbar.Brand as={Link} to="/">Certificate Maker</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/">Candidates</Nav.Link>
                  <Nav.Link as={Link} to="/templates">Templates</Nav.Link>
                  <Nav.Link as={Link} to="/generate">Generate Certificates</Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

          <Container className="mt-4">
            <Routes>
              <Route path="/" element={<CandidateManager />} />
              <Route path="/templates" element={<TemplateManager />} />
              <Route path="/generate" element={<CertificateGenerator />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;