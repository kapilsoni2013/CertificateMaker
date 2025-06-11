import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

const CertificateGenerator = () => {
  const { templates, candidates } = useContext(AppContext);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [generatedCertificate, setGeneratedCertificate] = useState(null);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);
  
  const template = templates.find(t => t.id === selectedTemplate);
  const candidate = candidates.find(c => c.id === selectedCandidate);
  
  useEffect(() => {
    if (generatedCertificate) {
      renderCertificate();
    }
  }, [generatedCertificate]);
  
  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
    setGeneratedCertificate(null);
  };
  
  const handleCandidateChange = (e) => {
    setSelectedCandidate(e.target.value);
    setGeneratedCertificate(null);
  };
  
  const generateCertificate = () => {
    setError('');
    
    if (!selectedTemplate) {
      setError('Please select a certificate template');
      return;
    }
    
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }
    
    // Create a certificate object with all the necessary data
    const certificate = {
      templateId: selectedTemplate,
      candidateId: selectedCandidate,
      generatedAt: new Date().toISOString()
    };
    
    setGeneratedCertificate(certificate);
  };
  
  const renderCertificate = () => {
    if (!template || !candidate || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Load the template image
    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the template image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Add text for each region
      template.regions.forEach(region => {
        // Parse the region name to get the corresponding data from candidate
        let value = '';
        if (region.name.includes('.')) {
          // Handle nested properties like subjects.math
          const [parent, child] = region.name.split('.');
          value = candidate[parent] && candidate[parent][child] ? candidate[parent][child] : '';
        } else {
          // Handle direct properties like name, rollNumber
          value = candidate[region.name] || '';
        }
        
        // Set text style
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw text in the center of the region
        const centerX = region.x + (region.width / 2);
        const centerY = region.y + (region.height / 2);
        ctx.fillText(value, centerX, centerY);
      });
    };
    img.src = template.imageUrl;
  };
  
  const downloadCertificate = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `certificate_${candidate.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <h2>Generate Certificate</h2>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="templateSelect">Select Certificate Template</label>
        <select
          id="templateSelect"
          value={selectedTemplate}
          onChange={handleTemplateChange}
        >
          <option value="">-- Select Template --</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name} ({template.regions.length} regions)
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="candidateSelect">Select Candidate</label>
        <select
          id="candidateSelect"
          value={selectedCandidate}
          onChange={handleCandidateChange}
        >
          <option value="">-- Select Candidate --</option>
          {candidates.map(candidate => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name} (Roll: {candidate.rollNumber}, Class: {candidate.class})
            </option>
          ))}
        </select>
      </div>
      
      <div className="action-buttons">
        <button onClick={generateCertificate}>
          Generate Certificate
        </button>
      </div>
      
      {generatedCertificate && (
        <div>
          <h3>Generated Certificate</h3>
          <div className="certificate-preview-container">
            <canvas ref={canvasRef} className="certificate-preview" />
          </div>
          <div className="action-buttons">
            <button onClick={downloadCertificate}>
              Download Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateGenerator;