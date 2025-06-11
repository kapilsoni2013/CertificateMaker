import React, { useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

const CertificatePreview = ({ template, candidate }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!template || !candidate || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load the template image
    const image = new Image();
    image.src = template.imageData;
    
    image.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Draw the template image
      ctx.drawImage(image, 0, 0);
      
      // Draw candidate data on regions
      template.regions.forEach(region => {
        // Get the corresponding candidate field
        let fieldValue = '';
        
        // Handle special fields
        if (region.name === 'name') {
          fieldValue = candidate.name;
        } else if (region.name === 'rollNumber') {
          fieldValue = candidate.rollNumber;
        } else if (region.name === 'class') {
          fieldValue = candidate.class;
        } else if (region.name.startsWith('subject_')) {
          // Extract subject index from region name (e.g., "subject_0")
          const subjectIndex = parseInt(region.name.split('_')[1]);
          if (candidate.subjects && candidate.subjects[subjectIndex]) {
            fieldValue = candidate.subjects[subjectIndex].name;
          }
        } else if (region.name.startsWith('marks_')) {
          // Extract subject index from region name (e.g., "marks_0")
          const subjectIndex = parseInt(region.name.split('_')[1]);
          if (candidate.subjects && candidate.subjects[subjectIndex]) {
            fieldValue = candidate.subjects[subjectIndex].marks;
          }
        } else if (region.name === 'totalMarks') {
          // Calculate total marks
          if (candidate.subjects && candidate.subjects.length > 0) {
            const total = candidate.subjects.reduce(
              (sum, subject) => sum + parseFloat(subject.marks || 0),
              0
            );
            fieldValue = total.toString();
          }
        } else if (region.name === 'percentage') {
          // Calculate percentage
          if (candidate.subjects && candidate.subjects.length > 0) {
            const total = candidate.subjects.reduce(
              (sum, subject) => sum + parseFloat(subject.marks || 0),
              0
            );
            const maxPossible = candidate.subjects.length * 100; // Assuming max marks is 100 per subject
            const percentage = (total / maxPossible) * 100;
            fieldValue = percentage.toFixed(2) + '%';
          }
        } else {
          // Try to find a matching field in the candidate object
          fieldValue = candidate[region.name] || '';
        }
        
        // Set text style based on region size
        const fontSize = Math.min(region.height * 0.8, region.width / (fieldValue.length * 0.6));
        ctx.font = `${Math.max(12, Math.min(fontSize, 36))}px Arial`;
        ctx.fillStyle = 'black';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        
        // Draw the text centered in the region
        ctx.fillText(
          fieldValue,
          region.x + region.width / 2,
          region.y + region.height / 2,
          region.width - 10
        );
      });
    };
    
    image.onerror = () => {
      console.error('Failed to load template image');
    };
  }, [template, candidate]);

  const downloadCertificate = () => {
    if (!canvasRef.current) return;
    
    html2canvas(canvasRef.current).then(canvas => {
      canvas.toBlob(blob => {
        saveAs(blob, `certificate_${candidate.name.replace(/\\s+/g, '_')}.png`);
      });
    });
  };

  if (!template || !candidate) {
    return <div className="text-center p-5">Select a template and candidate to preview certificate</div>;
  }

  return (
    <div className="certificate-preview" ref={containerRef}>
      <div className="canvas-container mb-3">
        <canvas ref={canvasRef} className="certificate-canvas" />
      </div>
      
      <div className="text-center mt-3">
        <Button variant="primary" onClick={downloadCertificate}>
          <i className="bi bi-download"></i> Download Certificate
        </Button>
      </div>
    </div>
  );
};

export default CertificatePreview;