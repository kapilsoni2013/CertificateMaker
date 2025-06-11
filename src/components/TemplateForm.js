import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const TemplateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTemplate, updateTemplate, getTemplate } = useContext(AppContext);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    regions: []
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRegion, setCurrentRegion] = useState(null);
  const [regionName, setRegionName] = useState('');
  const [showRegionForm, setShowRegionForm] = useState(false);
  
  useEffect(() => {
    if (id) {
      const template = getTemplate(id);
      if (template) {
        setFormData(template);
      } else {
        setError('Template not found');
      }
    }
  }, [id, getTemplate]);
  
  useEffect(() => {
    if (formData.imageUrl) {
      const img = new Image();
      img.onload = () => {
        drawImage();
        drawRegions();
      };
      img.src = formData.imageUrl;
      imageRef.current = img;
    }
  }, [formData.imageUrl, formData.regions]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          imageUrl: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const drawImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image on canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  
  const drawRegions = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Draw all saved regions
    formData.regions.forEach(region => {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(region.x, region.y, region.width, region.height);
      
      // Add region name
      ctx.fillStyle = 'red';
      ctx.font = '14px Arial';
      ctx.fillText(region.name, region.x, region.y - 5);
    });
  };
  
  const handleCanvasMouseDown = (e) => {
    if (!formData.imageUrl) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPos({ x, y });
  };
  
  const handleCanvasMouseMove = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Redraw the image and existing regions
    drawImage();
    drawRegions();
    
    // Draw the current selection rectangle
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      startPos.x,
      startPos.y,
      x - startPos.x,
      y - startPos.y
    );
  };
  
  const handleCanvasMouseUp = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate region dimensions
    const width = Math.abs(x - startPos.x);
    const height = Math.abs(y - startPos.y);
    
    // Only create a region if it has some size
    if (width > 10 && height > 10) {
      const newRegion = {
        x: Math.min(startPos.x, x),
        y: Math.min(startPos.y, y),
        width,
        height
      };
      
      setCurrentRegion(newRegion);
      setShowRegionForm(true);
    } else {
      // Redraw to clear the small selection
      drawImage();
      drawRegions();
    }
    
    setIsDrawing(false);
  };
  
  const addRegion = () => {
    if (!regionName.trim()) {
      setError('Please enter a name for the region');
      return;
    }
    
    const newRegion = {
      ...currentRegion,
      name: regionName.trim()
    };
    
    const updatedRegions = [...formData.regions, newRegion];
    
    setFormData({
      ...formData,
      regions: updatedRegions
    });
    
    setRegionName('');
    setCurrentRegion(null);
    setShowRegionForm(false);
    setSuccess('Region added successfully');
    
    // Redraw canvas with the new region
    setTimeout(() => {
      drawImage();
      drawRegions();
    }, 100);
  };
  
  const removeRegion = (index) => {
    const updatedRegions = formData.regions.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      regions: updatedRegions
    });
    
    // Redraw canvas without the removed region
    setTimeout(() => {
      drawImage();
      drawRegions();
    }, 100);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!formData.name) {
      setError('Please enter a template name');
      return;
    }
    
    if (!formData.imageUrl) {
      setError('Please upload a certificate template image');
      return;
    }
    
    if (formData.regions.length === 0) {
      setError('Please define at least one region on the template');
      return;
    }
    
    if (id) {
      updateTemplate(id, formData);
    } else {
      addTemplate(formData);
    }
    
    navigate('/templates');
  };
  
  const cancelRegionSelection = () => {
    setShowRegionForm(false);
    setCurrentRegion(null);
    setRegionName('');
    
    // Redraw to clear the selection
    drawImage();
    drawRegions();
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <h2>{id ? 'Edit Certificate Template' : 'Add New Certificate Template'}</h2>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Template Name *</label>
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
          <label htmlFor="templateImage">Certificate Template Image *</label>
          <input
            type="file"
            id="templateImage"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {!formData.imageUrl && <p>Please upload a certificate template image</p>}
        </div>
        
        {formData.imageUrl && (
          <div>
            <h3>Define Regions</h3>
            <p>Click and drag on the image to define regions where candidate information will be placed.</p>
            
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                style={{ maxWidth: '100%', border: '1px solid #ddd' }}
              />
            </div>
            
            {showRegionForm && (
              <div className="card">
                <h4>Add Region</h4>
                <div className="form-group">
                  <label htmlFor="regionName">Region Name *</label>
                  <input
                    type="text"
                    id="regionName"
                    value={regionName}
                    onChange={(e) => setRegionName(e.target.value)}
                    placeholder="e.g., name, rollNumber, class, subjects.math"
                    required
                  />
                  <p>
                    <small>
                      Use field names that match candidate data (name, rollNumber, class) or 
                      use dot notation for subjects (e.g., subjects.math)
                    </small>
                  </p>
                </div>
                <div className="action-buttons">
                  <button type="button" onClick={addRegion}>
                    Add Region
                  </button>
                  <button 
                    type="button" 
                    className="secondary"
                    onClick={cancelRegionSelection}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="region-list">
              <h4>Defined Regions ({formData.regions.length})</h4>
              {formData.regions.length > 0 ? (
                formData.regions.map((region, index) => (
                  <div key={index} className="region-item">
                    <div>
                      <strong>{region.name}</strong>
                      <div>
                        Position: ({region.x}, {region.y}), 
                        Size: {region.width} x {region.height}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="secondary"
                      onClick={() => removeRegion(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p>No regions defined yet. Click and drag on the image to create regions.</p>
              )}
            </div>
          </div>
        )}
        
        <div className="action-buttons">
          <button type="submit">
            {id ? 'Update Template' : 'Save Template'}
          </button>
          <button 
            type="button" 
            className="secondary"
            onClick={() => navigate('/templates')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateForm;