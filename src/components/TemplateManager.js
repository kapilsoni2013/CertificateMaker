import React, { useState, useRef, useContext, useEffect } from 'react';
import { Container, Form, Button, Card, ListGroup, Modal, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { AppContext } from '../context/AppContext';
import CanvasEditor from '../components/CanvasEditor';

const TemplateManager = () => {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useContext(AppContext);
  const [templateName, setTemplateName] = useState('');
  const [templateImage, setTemplateImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [regionName, setRegionName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [validated, setValidated] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [editingRegion, setEditingRegion] = useState(null);
  
  const imageRef = useRef(null);

  useEffect(() => {
    if (imagePreview && imageRef.current) {
      const img = new Image();
      img.onload = () => {
        setImageLoading(false);
      };
      img.onerror = () => {
        setImageError('Failed to load image');
        setImageLoading(false);
      };
      img.src = imagePreview;
    }
  }, [imagePreview]);

  // Reset form
  const resetForm = () => {
    setTemplateName('');
    setTemplateImage(null);
    setImagePreview(null);
    setRegions([]);
    setEditMode(false);
    setCurrentId(null);
    setValidated(false);
    setSelectedRegion(null);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTemplateImage(file);
      setImageLoading(true);
      setImageError(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.onerror = () => {
        setImageError('Failed to read file');
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new region
  const handleRegionCreated = (newRegion) => {
    setRegions([...regions, newRegion]);
    setSelectedRegion(newRegion.id);
    setEditingRegion(newRegion);
    setShowModal(true);
  };

  // Handle region selection
  const handleRegionSelected = (id) => {
    setSelectedRegion(id);
  };

  // Handle region update (move/resize)
  const handleRegionUpdated = (updatedRegions) => {
    setRegions(updatedRegions);
  };

  // Add a new region name
  const addRegionName = () => {
    if (!regionName.trim()) {
      return;
    }
    
    if (editingRegion) {
      setRegions(regions.map(r => 
        r.id === editingRegion.id
          ? { ...r, name: regionName }
          : r
      ));
    }
    
    setRegionName('');
    setShowModal(false);
    setEditingRegion(null);
  };

  // Edit a region name
  const startEditRegionName = (region) => {
    setRegionName(region.name);
    setEditingRegion(region);
    setShowModal(true);
  };

  // Remove a region
  const removeRegion = (id) => {
    setRegions(regions.filter(region => region.id !== id));
    if (selectedRegion === id) {
      setSelectedRegion(null);
    }
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

    // Check if all regions have names
    const unnamedRegions = regions.filter(r => !r.name.trim());
    if (unnamedRegions.length > 0) {
      alert('All regions must have names. Please name all regions before saving.');
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

            {imageError && (
              <Alert variant="danger" className="mt-3">
                {imageError}
              </Alert>
            )}

            {imageLoading && (
              <div className="text-center my-3">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}

            {imagePreview && !imageLoading && (
              <>
                <h5 className="mt-4">Define Regions</h5>
                <p>Click and drag on the image to define regions where text will be placed.</p>
                
                <CanvasEditor 
                  image={imagePreview}
                  regions={regions}
                  selectedRegion={selectedRegion}
                  onRegionCreated={handleRegionCreated}
                  onRegionSelected={handleRegionSelected}
                  onRegionsUpdated={handleRegionUpdated}
                />
                
                <div className="region-list mt-3">
                  <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Defined Regions</h5>
                      <small className="text-muted">{regions.length} regions</small>
                    </Card.Header>
                    <Card.Body>
                      {regions.length === 0 ? (
                        <p>No regions defined yet. Click and drag on the image to create regions.</p>
                      ) : (
                        <ListGroup>
                          {regions.map((region) => (
                            <ListGroup.Item 
                              key={region.id} 
                              className={`d-flex justify-content-between align-items-center ${region.id === selectedRegion ? 'active' : ''}`}
                              onClick={() => setSelectedRegion(region.id)}
                            >
                              <span className="region-name-display">
                                {region.name || <span className="text-danger">(Unnamed Region)</span>}
                              </span>
                              <div>
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  className="me-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditRegionName(region);
                                  }}
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeRegion(region.id);
                                  }}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </div>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </>
            )}

            <div className="mt-4">
              <Button 
                variant="primary" 
                type="submit" 
                className="me-2"
                disabled={!imagePreview || regions.length === 0 || imageLoading}
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
              <Card className="h-100 template-card">
                <div className="template-image-container">
                  <Card.Img variant="top" src={template.image} alt={template.name} />
                  {template.regions.map((region, idx) => (
                    <div 
                      key={idx}
                      className="template-preview-region"
                      style={{
                        left: `${region.coordinates.x1 * 100}%`,
                        top: `${region.coordinates.y1 * 100}%`,
                        width: `${(region.coordinates.x2 - region.coordinates.x1) * 100}%`,
                        height: `${(region.coordinates.y2 - region.coordinates.y1) * 100}%`
                      }}
                      title={region.name}
                    ></div>
                  ))}
                </div>
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
                      <i className="bi bi-pencil me-1"></i> Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <i className="bi bi-trash me-1"></i> Delete
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
          <Modal.Title>{editingRegion?.name ? 'Edit Region Name' : 'Name this Region'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Region Name</Form.Label>
            <Form.Control 
              type="text" 
              value={regionName} 
              onChange={(e) => setRegionName(e.target.value)} 
              placeholder="e.g., name, rollNumber, className"
              autoFocus
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
          <Button variant="primary" onClick={addRegionName} disabled={!regionName.trim()}>
            {editingRegion?.name ? 'Update' : 'Add Region'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx global>{`
        .template-image-container {
          position: relative;
          overflow: hidden;
        }
        
        .template-preview-region {
          position: absolute;
          border: 1px solid rgba(40, 167, 69, 0.8);
          background-color: rgba(40, 167, 69, 0.2);
          pointer-events: none;
        }
        
        .template-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .template-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .region-name-display {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 150px;
        }
      `}</style>
    </Container>
  );
};

export default TemplateManager;