import React, { useState, useContext, useRef } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { AppContext } from '../context/AppContext';

const CertificateGenerator = () => {
  const { candidates, templates } = useContext(AppContext);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [generatedCertificate, setGeneratedCertificate] = useState(null);
  const [error, setError] = useState('');
  
  const certificateRef = useRef(null);

  // Find template and candidate objects based on selected IDs
  const template = templates.find(t => t.id === selectedTemplate);
  const candidate = candidates.find(c => c.id === selectedCandidate);

  // Handle template selection
  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
    setGeneratedCertificate(null);
    setError('');
  };

  // Handle candidate selection
  const handleCandidateChange = (e) => {
    setSelectedCandidate(e.target.value);
    setGeneratedCertificate(null);
    setError('');
  };

  // Generate certificate
  const handleGenerateCertificate = () => {
    if (!selectedTemplate || !selectedCandidate) {
      setError('Please select both a template and a candidate.');
      return;
    }

    try {
      // Create a copy of the template with candidate data
      const certificateData = {
        template: template,
        candidate: candidate,
        generatedAt: new Date().toISOString()
      };
      
      setGeneratedCertificate(certificateData);
      setError('');
    } catch (err) {
      setError('Error generating certificate: ' + err.message);
    }
  };

  // Download certificate as image
  const handleDownload = () => {
    if (!certificateRef.current) return;
    
    const certificateElement = certificateRef.current;
    
    // Use html2canvas to capture the certificate (would need to be added as a dependency)
    // For this example, we'll just open the image in a new tab
    window.open(template.image, '_blank');
  };

  // Get value for a specific region
  const getValueForRegion = (regionName) => {
    if (!candidate) return '';
    
    // Check if it's a direct candidate property
    if (candidate[regionName] !== undefined) {
      return candidate[regionName];
    }
    
    // Check if it's a subject
    const subject = candidate.subjects.find(s => s.name === regionName);
    if (subject) {
      return subject.marks;
    }
    
    // Check if it's a special field like "totalMarks"
    if (regionName === 'totalMarks') {
      return candidate.subjects.reduce((sum, subject) => sum + Number(subject.marks || 0), 0).toString();
    }
    
    return '';
  };

  return (
    <Container>
      <h2 className="mb-4">Generate Certificate</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Template</Form.Label>
                  <Form.Select 
                    value={selectedTemplate} 
                    onChange={handleTemplateChange}
                  >
                    <option value="">Choose a template...</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.regions.length} regions)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Candidate</Form.Label>
                  <Form.Select 
                    value={selectedCandidate} 
                    onChange={handleCandidateChange}
                  >
                    <option value="">Choose a candidate...</option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} (Roll: {candidate.rollNumber}, Class: {candidate.className})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Button 
              variant="primary" 
              onClick={handleGenerateCertificate}
              disabled={!selectedTemplate || !selectedCandidate}
            >
              Generate Certificate
            </Button>
          </Form>
        </Card.Body>
      </Card>
      
      {generatedCertificate && (
        <div className="mt-4">
          <h3>Generated Certificate</h3>
          <Card>
            <Card.Body>
              <div ref={certificateRef} className="certificate-container">
                <img 
                  src={template.image} 
                  alt="Certificate" 
                  className="img-fluid"
                />
                
                {template.regions.map((region) => {
                  const value = getValueForRegion(region.name);
                  const imageWidth = certificateRef.current ? certificateRef.current.offsetWidth : 0;
                  const imageHeight = certificateRef.current ? certificateRef.current.offsetHeight : 0;
                  
                  return (
                    <div 
                      key={region.id}
                      className="certificate-text"
                      style={{
                        left: (region.coordinates.x1 * 100) + '%',
                        top: (region.coordinates.y1 * 100) + '%',
                        width: ((region.coordinates.x2 - region.coordinates.x1) * 100) + '%',
                        height: ((region.coordinates.y2 - region.coordinates.y1) * 100) + '%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: Math.min(imageWidth, imageHeight) * 0.02 + 'px'
                      }}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-3">
                <Button variant="success" onClick={handleDownload}>
                  Download Certificate
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
      
      {(!templates.length || !candidates.length) && (
        <Alert variant="info">
          {!templates.length && !candidates.length && (
            "You need to create templates and add candidates before generating certificates."
          )}
          {!templates.length && candidates.length > 0 && (
            "You need to create templates before generating certificates."
          )}
          {templates.length > 0 && !candidates.length && (
            "You need to add candidates before generating certificates."
          )}
        </Alert>
      )}
    </Container>
  );
};

export default CertificateGenerator;