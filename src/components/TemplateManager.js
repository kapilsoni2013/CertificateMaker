import React, { useState, useRef, useContext, useEffect } from 'react';
import { Container, Form, Button, Card, ListGroup, Modal, Row, Col } from 'react-bootstrap';
import { AppContext } from '../context/AppContext';

const TemplateManager = () => {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useContext(AppContext);
  const [templateName, setTemplateName] = useState('');
  const [templateImage, setTemplateImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [regions, setRegions] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [regionName, setRegionName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [validated, setValidated] = useState(false);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset form
  const resetForm = () => {
    setTemplateName('');
    setTemplateImage(null);
    setImagePreview(null);
    setRegions([]);
    setEditMode(false);
    setCurrentId(null);
    setValidated(false);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTemplateImage(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle mouse events for region selection
  const handleMouseDown = (e) => {
    if (!imagePreview) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPos({ x, y });
    setEndPos({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setEndPos({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    // Only show modal if the selection has some size
    if (Math.abs(endPos.x - startPos.x) > 10 && Math.abs(endPos.y - startPos.y) > 10) {
      setShowModal(true);
    }
  };

  // Add a new region
  const addRegion = () => {
    if (!regionName.trim()) {
      alert('Please enter a region name');
      return;
    }
    
    // Calculate normalized coordinates (0-1) for responsive positioning
    const imageWidth = imageRef.current.width;
    const imageHeight = imageRef.current.height;
    
    const newRegion = {
      id: Date.now(),
      name: regionName,
      coordinates: {
        x1: Math.min(startPos.x, endPos.x) / imageWidth,
        y1: Math.min(startPos.y, endPos.y) / imageHeight,
        x2: Math.max(startPos.x, endPos.x) / imageWidth,
        y2: Math.max(startPos.y, endPos.y) / imageHeight
      }
    };
    
    setRegions([...regions, newRegion]);
    setRegionName('');
    setShowModal(false);
  };

  // Remove a region
  const removeRegion = (id) => {
    setRegions(regions.filter(region => region.id !== id));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false || !imagePreview || regions.length === 0) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const templateData = {
      name: templateName,
      image: imagePreview,
      regions: regions
    };

    if (editMode) {
      updateTemplate(currentId, templateData);
    } else {
      addTemplate(templateData);
    }

    resetForm();
  };

  // Load template for editing
  const handleEdit = (template) => {
    setTemplateName(template.name);
    setImagePreview(template.image);
    setRegions(template.regions);
    setEditMode(true);
    setCurrentId(template.id);
  };

  // Delete template
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  };

  return (
    <Container>
      <h2 className="mb-4">{editMode ? 'Edit Template' : 'Create Certificate Template'}</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Template Name</Form.Label>
              <Form.Control 
                type="text" 
                value={templateName} 
                onChange={(e) => setTemplateName(e.target.value)} 
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a template name.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Upload Certificate Template</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                required={!imagePreview}
              />
              <Form.Text className="text-muted">
                Upload an image to use as your certificate template.
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                Please upload a template image.
              </Form.Control.Feedback>
            </Form.Group>

            {imagePreview && (
              <>
                <h5 className="mt-4">Define Regions</h5>
                <p>Click and drag on the image to define regions where text will be placed.</p>
                
                <div 
                  ref={containerRef}
                  className="canvas-container"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img 
                    ref={imageRef}
                    src={imagePreview} 
                    alt="Certificate Template" 
                    style={{ maxWidth: '100%' }}
                  />
                  
                  {isDrawing && (
                    <div 
                      className="selection-box"
                      style={{
                        left: Math.min(startPos.x, endPos.x) + 'px',
                        top: Math.min(startPos.y, endPos.y) + 'px',
                        width: Math.abs(endPos.x - startPos.x) + 'px',
                        height: Math.abs(endPos.y - startPos.y) + 'px'
                      }}
                    ></div>
                  )}
                  
                  {regions.map((region) => {
                    // Convert normalized coordinates back to pixels for display
                    const imageWidth = imageRef.current ? imageRef.current.width : 0;
                    const imageHeight = imageRef.current ? imageRef.current.height : 0;
                    
                    return (
                      <div 
                        key={region.id}
                        className="region-marker"
                        style={{
                          left: (region.coordinates.x1 * imageWidth) + 'px',
                          top: (region.coordinates.y1 * imageHeight) + 'px',
                          width: ((region.coordinates.x2 - region.coordinates.x1) * imageWidth) + 'px',
                          height: ((region.coordinates.y2 - region.coordinates.y1) * imageHeight) + 'px'
                        }}
                      >
                        {region.name}
                      </div>
                    );
                  })}
                </div>
                
                <div className="region-list">
                  <h5 className="mt-3">Defined Regions</h5>
                  {regions.length === 0 ? (
                    <p>No regions defined yet. Click and drag on the image to create regions.</p>
                  ) : (
                    <ListGroup>
                      {regions.map((region) => (
                        <ListGroup.Item key={region.id} className="d-flex justify-content-between align-items-center">
                          <span>{region.name}</span>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => removeRegion(region.id)}
                          >
                            Remove
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </div>
              </>
            )}

            <div className="mt-4">
              <Button 
                variant="primary" 
                type="submit" 
                className="me-2"
                disabled={!imagePreview || regions.length === 0}
              >
                {editMode ? 'Update Template' : 'Save Template'}
              </Button>
              {editMode && (
                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <h3 className="mt-4">Saved Templates</h3>
      <Row>
        {templates.length === 0 ? (
          <Col>
            <p>No templates created yet.</p>
          </Col>
        ) : (
          templates.map((template) => (
            <Col md={4} key={template.id} className="mb-4">
              <Card>
                <Card.Img variant="top" src={template.image} alt={template.name} />
                <Card.Body>
                  <Card.Title>{template.name}</Card.Title>
                  <Card.Text>
                    {template.regions.length} defined region(s)
                  </Card.Text>
                  <div className="d-flex">
                    <Button 
                      variant="info" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEdit(template)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Modal for naming regions */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Name this Region</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Region Name</Form.Label>
            <Form.Control 
              type="text" 
              value={regionName} 
              onChange={(e) => setRegionName(e.target.value)} 
              placeholder="e.g., name, rollNumber, className"
            />
            <Form.Text className="text-muted">
              Name should match a candidate field (name, rollNumber, className) or a subject name.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={addRegion}>
            Add Region
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TemplateManager;