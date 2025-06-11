import React, { useState, useContext, useRef, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { AppContext } from '../context/AppContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CertificateGenerator = () => {
  const { candidates, templates, addCertificate } = useContext(AppContext);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [generatedCertificate, setGeneratedCertificate] = useState(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [customValues, setCustomValues] = useState({});
  
  const certificateRef = useRef(null);

  // Find template and candidate objects based on selected IDs
  const template = templates.find(t => t.id === selectedTemplate);
  const candidate = candidates.find(c => c.id === selectedCandidate);

  // Reset when templates or candidates change
  useEffect(() => {
    setSelectedTemplate('');
    setSelectedCandidate('');
    setGeneratedCertificate(null);
    setError('');
    setCustomValues({});
  }, [templates, candidates]);

  // Reset custom values when template changes
  useEffect(() => {
    if (template) {
      // Initialize custom fields from template
      const initialCustomValues = {};
      template.regions
        .filter(region => region.type === 'custom')
        .forEach(region => {
          initialCustomValues[region.name] = region.defaultValue || '';
        });
      setCustomValues(initialCustomValues);
    } else {
      setCustomValues({});
    }
  }, [template]);

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

  // Handle custom value changes
  const handleCustomValueChange = (name, value) => {
    setCustomValues(prev => ({
      ...prev,
      [name]: value
    }));
    setGeneratedCertificate(null);
  };

  // Generate certificate
  const handleGenerateCertificate = () => {
    if (!selectedTemplate || !selectedCandidate) {
      setError('Please select both a template and a candidate.');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Create a copy of the template with candidate data
      const certificateData = {
        id: `cert-${Date.now()}`,
        template: template,
        candidate: candidate,
        customValues: customValues,
        generatedAt: new Date().toISOString()
      };
      
      setGeneratedCertificate(certificateData);
      // Add to certificates collection in context
      addCertificate(certificateData);
      setError('');
    } catch (err) {
      setError('Error generating certificate: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download certificate
  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    const certificateElement = certificateRef.current;
    
    try {
      setIsGenerating(true);
      const scale = 2; // Higher scale for better quality
      const canvas = await html2canvas(certificateElement, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      
      if (downloadFormat === 'png') {
        // Download as PNG
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `certificate-${candidate.name}-${new Date().toISOString().slice(0,10)}.png`;
        link.click();
      } else if (downloadFormat === 'pdf') {
        // Download as PDF
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`certificate-${candidate.name}-${new Date().toISOString().slice(0,10)}.pdf`);
      }
    } catch (err) {
      setError('Error downloading certificate: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Get value for a specific region
  const getValueForRegion = (region) => {
    if (!candidate) return '';
    
    // For custom fields, return the custom value
    if (region.type === 'custom') {
      return customValues[region.name] || region.defaultValue || '';
    }
    
    // Check if it's a direct candidate property
    if (candidate[region.name] !== undefined) {
      return candidate[region.name];
    }
    
    // Check if it's a subject
    const subject = candidate.subjects?.find(s => s.name === region.name);
    if (subject) {
      return subject.marks;
    }
    
    // Check if it's a special field like "totalMarks"
    if (region.name === 'totalMarks') {
      return candidate.subjects?.reduce((sum, subject) => sum + Number(subject.marks || 0), 0).toString() || '0';
    }
    
    // Check if it's a date field
    if (region.name === 'currentDate') {
      return new Date().toLocaleDateString();
    }
    
    // For formatted dates
    if (region.name === 'formattedDate' && region.format) {
      const date = new Date();
      try {
        return new Intl.DateTimeFormat('en-US', 
          JSON.parse(region.format || '{"dateStyle":"full"}')
        ).format(date);
      } catch (e) {
        return date.toLocaleDateString();
      }
    }
    
    return region.defaultValue || '';
  };

  const getRegionStyle = (region) => {
    if (!certificateRef.current) return {};
    
    const containerWidth = certificateRef.current.offsetWidth;
    const containerHeight = certificateRef.current.offsetHeight;
    
    // Calculate font size based on region height or container size
    const fontSize = region.fontSize ? 
      `${region.fontSize}px` : 
      `${Math.min(containerWidth, containerHeight) * 0.02}px`;
      
    return {
      position: 'absolute',
      left: (region.coordinates.x1 * 100) + '%',
      top: (region.coordinates.y1 * 100) + '%',
      width: ((region.coordinates.x2 - region.coordinates.x1) * 100) + '%',
      height: ((region.coordinates.y2 - region.coordinates.y1) * 100) + '%',
      display: 'flex',
      alignItems: region.verticalAlign || 'center',
      justifyContent: region.textAlign || 'center',
      fontSize: fontSize,
      fontFamily: region.fontFamily || 'Arial',
      fontWeight: region.fontWeight || 'normal',
      fontStyle: region.fontStyle || 'normal',
      textDecoration: region.textDecoration || 'none',
      color: region.textColor || '#000',
      textTransform: region.textTransform || 'none',
      overflow: 'hidden',
      padding: region.padding || '0',
      letterSpacing: region.letterSpacing ? `${region.letterSpacing}px` : 'normal',
      lineHeight: region.lineHeight || 'normal',
      textShadow: region.textShadow || 'none',
      transform: region.rotation ? `rotate(${region.rotation}deg)` : 'none',
      transformOrigin: 'center center'
    };
  };

  // Render custom value input fields based on template regions
  const renderCustomValueFields = () => {
    if (!template) return null;
    
    const customFields = template.regions.filter(region => region.type === 'custom');
    
    if (customFields.length === 0) return null;
    
    return (
      <Card className="mb-4">
        <Card.Body>
          <h5>Custom Fields</h5>
          <Row>
            {customFields.map(field => (
              <Col md={6} key={field.id} className="mb-3">
                <Form.Group>
                  <Form.Label>{field.label || field.name}</Form.Label>
                  <Form.Control
                    type="text"
                    value={customValues[field.name] || ''}
                    placeholder={field.placeholder || ''}
                    onChange={(e) => handleCustomValueChange(field.name, e.target.value)}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    );
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

            {renderCustomValueFields()}
            
            <Button 
              variant="primary" 
              onClick={handleGenerateCertificate}
              disabled={!selectedTemplate || !selectedCandidate || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  {' '}Generating...
                </>
              ) : 'Generate Certificate'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
      
      {generatedCertificate && (
        <div className="mt-4">
          <h3>Generated Certificate</h3>
          <Card>
            <Card.Body>
              <div 
                ref={certificateRef} 
                className="certificate-container position-relative"
                style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
              >
                <img 
                  src={template.image} 
                  alt="Certificate" 
                  className="img-fluid w-100"
                  style={{ display: 'block' }}
                />
                
                {template.regions.map((region) => {
                  const value = getValueForRegion(region);
                  const style = getRegionStyle(region);
                  
                  return (
                    <div 
                      key={region.id}
                      className="certificate-text"
                      style={style}
                    >
                      {value}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-3 d-flex gap-3 align-items-center">
                <Form.Group className="mb-0">
                  <Form.Select 
                    value={downloadFormat} 
                    onChange={(e) => setDownloadFormat(e.target.value)}
                    style={{ width: '120px' }}
                  >
                    <option value="png">PNG Image</option>
                    <option value="pdf">PDF Document</option>
                  </Form.Select>
                </Form.Group>
                
                <Button 
                  variant="success" 
                  onClick={handleDownload}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}Downloading...
                    </>
                  ) : `Download as ${downloadFormat.toUpperCase()}`}
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