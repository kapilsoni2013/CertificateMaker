import React, { useState, useRef, useContext, useEffect } from 'react';
import { Container, Form, Button, Card, ListGroup, Modal, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { AppContext } from '../context/AppContext';

const TemplateManager = () => {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useContext(AppContext);
  const [templateName, setTemplateName] = useState('');
  const [templateImage, setTemplateImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [regions, setRegions] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [regionName, setRegionName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [validated, setValidated] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [editingRegion, setEditingRegion] = useState(null);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

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
    setZoom(1);
    setPan({ x: 0, y: 0 });
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

  // Convert screen coordinates to image coordinates
  const screenToImageCoords = (x, y) => {
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / (imageRef.current.width * zoom);
    const scaleY = imageRef.current.naturalHeight / (imageRef.current.height * zoom);
    
    return {
      x: (x - rect.left - pan.x) * scaleX / zoom,
      y: (y - rect.top - pan.y) * scaleY / zoom
    };
  };

  // Convert image coordinates to screen coordinates
  const imageToScreenCoords = (x, y) => {
    if (!imageRef.current) return { x: 0, y: 0 };
    
    const scaleX = imageRef.current.width * zoom / imageRef.current.naturalWidth;
    const scaleY = imageRef.current.height * zoom / imageRef.current.naturalHeight;
    
    return {
      x: x * scaleX * zoom + pan.x,
      y: y * scaleY * zoom + pan.y
    };
  };

  // Check if point is inside region
  const isPointInRegion = (x, y, region) => {
    const imageWidth = imageRef.current.naturalWidth;
    const imageHeight = imageRef.current.naturalHeight;
    
    const regionLeft = region.coordinates.x1 * imageWidth;
    const regionTop = region.coordinates.y1 * imageHeight;
    const regionRight = region.coordinates.x2 * imageWidth;
    const regionBottom = region.coordinates.y2 * imageHeight;
    
    return x >= regionLeft && x <= regionRight && y >= regionTop && y <= regionBottom;
  };

  // Check if point is on resize handle
  const getResizeHandle = (x, y, region) => {
    const imageWidth = imageRef.current.naturalWidth;
    const imageHeight = imageRef.current.naturalHeight;
    const handleSize = 10 / zoom;
    
    const handles = [
      { name: 'topLeft', x: region.coordinates.x1 * imageWidth, y: region.coordinates.y1 * imageHeight },
      { name: 'topRight', x: region.coordinates.x2 * imageWidth, y: region.coordinates.y1 * imageHeight },
      { name: 'bottomLeft', x: region.coordinates.x1 * imageWidth, y: region.coordinates.y2 * imageHeight },
      { name: 'bottomRight', x: region.coordinates.x2 * imageWidth, y: region.coordinates.y2 * imageHeight }
    ];
    
    for (const handle of handles) {
      if (Math.abs(x - handle.x) <= handleSize && Math.abs(y - handle.y) <= handleSize) {
        return handle.name;
      }
    }
    
    return null;
  };

  // Handle mouse events for region selection, moving, and resizing
  const handleMouseDown = (e) => {
    if (!imagePreview || imageLoading) return;
    
    // Right click for panning
    if (e.button === 2) {
      e.preventDefault();
      setIsPanning(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      return;
    }
    
    const coords = screenToImageCoords(e.clientX, e.clientY);
    
    // Check if we're clicking on an existing region for selection or resize
    let clickedRegion = null;
    let handle = null;
    
    for (const region of regions) {
      handle = getResizeHandle(coords.x, coords.y, region);
      if (handle) {
        clickedRegion = region;
        break;
      }
      
      if (isPointInRegion(coords.x, coords.y, region)) {
        clickedRegion = region;
      }
    }
    
    if (handle && clickedRegion) {
      setIsResizing(true);
      setResizeHandle(handle);
      setSelectedRegion(clickedRegion.id);
      setStartPos(coords);
    } else if (clickedRegion) {
      setIsMoving(true);
      setSelectedRegion(clickedRegion.id);
      setStartPos(coords);
    } else {
      setIsDrawing(true);
      setStartPos(coords);
      setEndPos(coords);
      setSelectedRegion(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    
    if (isPanning) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setStartPos({ x: e.clientX, y: e.clientY });
      return;
    }
    
    const coords = screenToImageCoords(e.clientX, e.clientY);
    
    if (isDrawing) {
      setEndPos(coords);
    } else if (isMoving && selectedRegion !== null) {
      const region = regions.find(r => r.id === selectedRegion);
      if (!region) return;
      
      const dx = coords.x - startPos.x;
      const dy = coords.y - startPos.y;
      const imageWidth = imageRef.current.naturalWidth;
      const imageHeight = imageRef.current.naturalHeight;
      
      let newX1 = region.coordinates.x1 + dx / imageWidth;
      let newY1 = region.coordinates.y1 + dy / imageHeight;
      let newX2 = region.coordinates.x2 + dx / imageWidth;
      let newY2 = region.coordinates.y2 + dy / imageHeight;
      
      // Ensure the region stays within the image bounds
      if (newX1 < 0) {
        newX2 -= newX1;
        newX1 = 0;
      }
      if (newY1 < 0) {
        newY2 -= newY1;
        newY1 = 0;
      }
      if (newX2 > 1) {
        newX1 -= (newX2 - 1);
        newX2 = 1;
      }
      if (newY2 > 1) {
        newY1 -= (newY2 - 1);
        newY2 = 1;
      }
      
      setRegions(regions.map(r => 
        r.id === selectedRegion 
          ? { ...r, coordinates: { x1: newX1, y1: newY1, x2: newX2, y2: newY2 } } 
          : r
      ));
      setStartPos(coords);
    } else if (isResizing && selectedRegion !== null && resizeHandle) {
      const region = regions.find(r => r.id === selectedRegion);
      if (!region) return;
      
      const imageWidth = imageRef.current.naturalWidth;
      const imageHeight = imageRef.current.naturalHeight;
      
      let newCoords = { ...region.coordinates };
      
      if (resizeHandle.includes('top')) {
        newCoords.y1 = Math.min(Math.max(0, coords.y / imageHeight), newCoords.y2 - 0.01);
      }
      if (resizeHandle.includes('bottom')) {
        newCoords.y2 = Math.min(Math.max(newCoords.y1 + 0.01, coords.y / imageHeight), 1);
      }
      if (resizeHandle.includes('Left')) {
        newCoords.x1 = Math.min(Math.max(0, coords.x / imageWidth), newCoords.x2 - 0.01);
      }
      if (resizeHandle.includes('Right')) {
        newCoords.x2 = Math.min(Math.max(newCoords.x1 + 0.01, coords.x / imageWidth), 1);
      }
      
      setRegions(regions.map(r => 
        r.id === selectedRegion 
          ? { ...r, coordinates: newCoords } 
          : r
      ));
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && Math.abs(endPos.x - startPos.x) > 10 && Math.abs(endPos.y - startPos.y) > 10) {
      // Calculate normalized coordinates (0-1) for responsive positioning
      const imageWidth = imageRef.current.naturalWidth;
      const imageHeight = imageRef.current.naturalHeight;
      
      const newRegion = {
        id: Date.now(),
        name: "",
        coordinates: {
          x1: Math.min(startPos.x, endPos.x) / imageWidth,
          y1: Math.min(startPos.y, endPos.y) / imageHeight,
          x2: Math.max(startPos.x, endPos.x) / imageWidth,
          y2: Math.max(startPos.y, endPos.y) / imageHeight
        }
      };
      
      setRegions([...regions, newRegion]);
      setSelectedRegion(newRegion.id);
      setEditingRegion(newRegion);
      setShowModal(true);
    }
    
    setIsDrawing(false);
    setIsMoving(false);
    setIsResizing(false);
    setIsPanning(false);
    setResizeHandle(null);
  };

  const handleZoom = (factor) => {
    setZoom(prev => {
      const newZoom = Math.max(0.1, Math.min(5, prev * factor));
      return newZoom;
    });
  };

  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      handleZoom(factor);
    }
  };

  // Add a new region
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
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Delete template
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  };

  // Reset canvas view
  const resetCanvasView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const renderRegions = () => {
    if (!imageRef.current) return null;
    
    return regions.map((region) => {
      const isSelected = region.id === selectedRegion;
      const imageWidth = imageRef.current.naturalWidth;
      const imageHeight = imageRef.current.naturalHeight;
      
      // Calculate screen coordinates for the region
      const x1 = imageToScreenCoords(region.coordinates.x1 * imageWidth, 0).x;
      const y1 = imageToScreenCoords(0, region.coordinates.y1 * imageHeight).y;
      const x2 = imageToScreenCoords(region.coordinates.x2 * imageWidth, 0).x;
      const y2 = imageToScreenCoords(0, region.coordinates.y2 * imageHeight).y;
      
      return (
        <div 
          key={region.id}
          className={`region-marker ${isSelected ? 'selected' : ''}`}
          style={{
            left: x1 + 'px',
            top: y1 + 'px',
            width: (x2 - x1) + 'px',
            height: (y2 - y1) + 'px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRegion(region.id);
          }}
        >
          <div className="region-name">{region.name || 'Unnamed Region'}</div>
          {isSelected && (
            <>
              <div className="resize-handle top-left"></div>
              <div className="resize-handle top-right"></div>
              <div className="resize-handle bottom-left"></div>
              <div className="resize-handle bottom-right"></div>
            </>
          )}
        </div>
      );
    });
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
                
                <div className="canvas-controls mb-2">
                  <Button variant="outline-secondary" size="sm" onClick={() => handleZoom(1.2)} className="me-1">
                    <i className="bi bi-zoom-in"></i> Zoom In
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={() => handleZoom(0.8)} className="me-1">
                    <i className="bi bi-zoom-out"></i> Zoom Out
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={resetCanvasView} className="me-1">
                    <i className="bi bi-aspect-ratio"></i> Reset View
                  </Button>
                  <small className="text-muted ms-2">Tip: Hold right-click to pan, use Ctrl+scroll to zoom</small>
                </div>
                
                <div 
                  ref={containerRef}
                  className="canvas-container"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ 
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: isDrawing ? 'crosshair' : isMoving ? 'move' : isResizing ? 'nwse-resize' : 'default'
                  }}
                >
                  <div style={{ 
                    transform: `scale(${zoom}) translate(${pan.x/zoom}px, ${pan.y/zoom}px)`,
                    transformOrigin: '0 0'
                  }}>
                    <img 
                      ref={imageRef}
                      src={imagePreview} 
                      alt="Certificate Template" 
                      style={{ 
                        maxWidth: '100%',
                        display: 'block'
                      }}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>
                  
                  {isDrawing && (
                    <div 
                      className="selection-box"
                      style={{
                        left: Math.min(
                          imageToScreenCoords(startPos.x, 0).x,
                          imageToScreenCoords(endPos.x, 0).x
                        ) + 'px',
                        top: Math.min(
                          imageToScreenCoords(0, startPos.y).y,
                          imageToScreenCoords(0, endPos.y).y
                        ) + 'px',
                        width: Math.abs(
                          imageToScreenCoords(startPos.x, 0).x - imageToScreenCoords(endPos.x, 0).x
                        ) + 'px',
                        height: Math.abs(
                          imageToScreenCoords(0, startPos.y).y - imageToScreenCoords(0, endPos.y).y
                        ) + 'px'
                      }}
                    ></div>
                  )}
                  
                  {renderRegions()}
                </div>
                
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
        .canvas-container {
          min-height: 400px;
          background-color: #f8f9fa;
          overflow: hidden;
        }
        
        .selection-box {
          position: absolute;
          border: 2px dashed #007bff;
          background-color: rgba(0, 123, 255, 0.1);
          pointer-events: none;
          z-index: 10;
        }
        
        .region-marker {
          position: absolute;
          border: 2px solid rgba(255, 193, 7, 0.8);
          background-color: rgba(255, 193, 7, 0.1);
          cursor: move;
          z-index: 10;
        }
        
        .region-marker.selected {
          border: 2px solid #28a745;
          background-color: rgba(40, 167, 69, 0.15);
          z-index: 11;
        }
        
        .region-name {
          position: absolute;
          top: 0;
          left: 0;
          padding: 2px 6px;
          background-color: rgba(0, 0, 0, 0.6);
          color: white;
          font-size: 0.8rem;
          border-radius: 0 0 3px 0;
          z-index: 1;
        }
        
        .resize-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background: white;
          border: 1px solid #28a745;
        }
        
        .top-left {
          top: -5px;
          left: -5px;
          cursor: nwse-resize;
        }
        
        .top-right {
          top: -5px;
          right: -5px;
          cursor: nesw-resize;
        }
        
        .bottom-left {
          bottom: -5px;
          left: -5px;
          cursor: nesw-resize;
        }
        
        .bottom-right {
          bottom: -5px;
          right: -5px;
          cursor: nwse-resize;
        }
        
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