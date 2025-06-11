import React, { useRef, useState, useEffect } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';

const CanvasEditor = ({ templateImage, regions, onRegionsChange }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regionName, setRegionName] = useState('');
  const [error, setError] = useState('');
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Load the image and set up the canvas
  useEffect(() => {
    if (!templateImage) return;

    const image = new Image();
    image.src = templateImage;
    image.onload = () => {
      setImageLoaded(true);
      
      // Set canvas size based on image dimensions and container size
      const container = containerRef.current;
      if (container) {
        const containerWidth = container.clientWidth;
        const imageAspectRatio = image.width / image.height;
        
        let canvasWidth = Math.min(containerWidth - 30, image.width);
        let canvasHeight = canvasWidth / imageAspectRatio;
        
        setCanvasSize({ width: canvasWidth, height: canvasHeight });
        setScale(canvasWidth / image.width);
      }
    };
    image.onerror = () => {
      setError('Failed to load image. Please try again with a different image.');
    };
  }, [templateImage]);

  // Draw the canvas whenever relevant state changes
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image
    const image = new Image();
    image.src = templateImage;
    
    ctx.drawImage(
      image, 
      offset.x, offset.y, 
      image.width * scale, image.height * scale
    );
    
    // Draw all regions
    regions.forEach((region, index) => {
      const isSelected = selectedRegion === index;
      
      // Calculate scaled coordinates
      const scaledX = region.x * scale + offset.x;
      const scaledY = region.y * scale + offset.y;
      const scaledWidth = region.width * scale;
      const scaledHeight = region.height * scale;
      
      // Draw region rectangle
      ctx.strokeStyle = isSelected ? '#ff0000' : '#00ff00';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
      
      // Fill with semi-transparent color
      ctx.fillStyle = isSelected ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.1)';
      ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
      
      // Draw region name
      ctx.fillStyle = isSelected ? '#ff0000' : '#00ff00';
      ctx.font = '14px Arial';
      ctx.fillText(region.name, scaledX + 5, scaledY + 20);
      
      // Draw resize handles if selected
      if (isSelected) {
        const handleSize = 8;
        
        // Draw corner handles
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(scaledX - handleSize/2, scaledY - handleSize/2, handleSize, handleSize); // Top-left
        ctx.fillRect(scaledX + scaledWidth - handleSize/2, scaledY - handleSize/2, handleSize, handleSize); // Top-right
        ctx.fillRect(scaledX - handleSize/2, scaledY + scaledHeight - handleSize/2, handleSize, handleSize); // Bottom-left
        ctx.fillRect(scaledX + scaledWidth - handleSize/2, scaledY + scaledHeight - handleSize/2, handleSize, handleSize); // Bottom-right
        
        // Draw edge handles
        ctx.fillRect(scaledX + scaledWidth/2 - handleSize/2, scaledY - handleSize/2, handleSize, handleSize); // Top
        ctx.fillRect(scaledX + scaledWidth/2 - handleSize/2, scaledY + scaledHeight - handleSize/2, handleSize, handleSize); // Bottom
        ctx.fillRect(scaledX - handleSize/2, scaledY + scaledHeight/2 - handleSize/2, handleSize, handleSize); // Left
        ctx.fillRect(scaledX + scaledWidth - handleSize/2, scaledY + scaledHeight/2 - handleSize/2, handleSize, handleSize); // Right
      }
    });
    
    // Draw current region being created
    if (currentRegion) {
      ctx.strokeStyle = '#0000ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        currentRegion.x * scale + offset.x, 
        currentRegion.y * scale + offset.y, 
        currentRegion.width * scale, 
        currentRegion.height * scale
      );
      
      ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
      ctx.fillRect(
        currentRegion.x * scale + offset.x, 
        currentRegion.y * scale + offset.y, 
        currentRegion.width * scale, 
        currentRegion.height * scale
      );
    }
  }, [imageLoaded, regions, currentRegion, selectedRegion, scale, offset, templateImage]);

  // Handle mouse down event
  const handleMouseDown = (e) => {
    if (!imageLoaded) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - offset.x / scale;
    const y = (e.clientY - rect.top) / scale - offset.y / scale;
    
    // Check if clicking on a resize handle of selected region
    if (selectedRegion !== null) {
      const region = regions[selectedRegion];
      const scaledX = region.x * scale + offset.x;
      const scaledY = region.y * scale + offset.y;
      const scaledWidth = region.width * scale;
      const scaledHeight = region.height * scale;
      const handleSize = 8;
      
      // Check each resize handle
      const handles = [
        { name: 'tl', x: scaledX, y: scaledY },
        { name: 'tr', x: scaledX + scaledWidth, y: scaledY },
        { name: 'bl', x: scaledX, y: scaledY + scaledHeight },
        { name: 'br', x: scaledX + scaledWidth, y: scaledY + scaledHeight },
        { name: 't', x: scaledX + scaledWidth/2, y: scaledY },
        { name: 'b', x: scaledX + scaledWidth/2, y: scaledY + scaledHeight },
        { name: 'l', x: scaledX, y: scaledY + scaledHeight/2 },
        { name: 'r', x: scaledX + scaledWidth, y: scaledY + scaledHeight/2 }
      ];
      
      for (const handle of handles) {
        const dx = (e.clientX - rect.left) - handle.x;
        const dy = (e.clientY - rect.top) - handle.y;
        if (Math.sqrt(dx*dx + dy*dy) <= handleSize) {
          setResizing(true);
          setResizeHandle(handle.name);
          setDragStart({ x: e.clientX, y: e.clientY });
          return;
        }
      }
      
      // Check if clicking inside the selected region (for moving)
      if (
        x >= region.x && 
        x <= region.x + region.width && 
        y >= region.y && 
        y <= region.y + region.height
      ) {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        return;
      }
    }
    
    // Check if clicking on any existing region
    for (let i = regions.length - 1; i >= 0; i--) {
      const region = regions[i];
      if (
        x >= region.x && 
        x <= region.x + region.width && 
        y >= region.y && 
        y <= region.y + region.height
      ) {
        setSelectedRegion(i);
        setRegionName(region.name);
        return;
      }
    }
    
    // Start drawing a new region
    setIsDrawing(true);
    setCurrentRegion({
      x,
      y,
      width: 0,
      height: 0
    });
    setSelectedRegion(null);
  };

  // Handle mouse move event
  const handleMouseMove = (e) => {
    if (!imageLoaded) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - offset.x / scale;
    const y = (e.clientY - rect.top) / scale - offset.y / scale;
    
    // Update cursor based on position
    if (selectedRegion !== null) {
      const region = regions[selectedRegion];
      const scaledX = region.x * scale + offset.x;
      const scaledY = region.y * scale + offset.y;
      const scaledWidth = region.width * scale;
      const scaledHeight = region.height * scale;
      const handleSize = 8;
      
      // Check each resize handle
      const handles = [
        { name: 'tl', x: scaledX, y: scaledY, cursor: 'nwse-resize' },
        { name: 'tr', x: scaledX + scaledWidth, y: scaledY, cursor: 'nesw-resize' },
        { name: 'bl', x: scaledX, y: scaledY + scaledHeight, cursor: 'nesw-resize' },
        { name: 'br', x: scaledX + scaledWidth, y: scaledY + scaledHeight, cursor: 'nwse-resize' },
        { name: 't', x: scaledX + scaledWidth/2, y: scaledY, cursor: 'ns-resize' },
        { name: 'b', x: scaledX + scaledWidth/2, y: scaledY + scaledHeight, cursor: 'ns-resize' },
        { name: 'l', x: scaledX, y: scaledY + scaledHeight/2, cursor: 'ew-resize' },
        { name: 'r', x: scaledX + scaledWidth, y: scaledY + scaledHeight/2, cursor: 'ew-resize' }
      ];
      
      let foundHandle = false;
      for (const handle of handles) {
        const dx = (e.clientX - rect.left) - handle.x;
        const dy = (e.clientY - rect.top) - handle.y;
        if (Math.sqrt(dx*dx + dy*dy) <= handleSize) {
          canvas.style.cursor = handle.cursor;
          foundHandle = true;
          break;
        }
      }
      
      if (!foundHandle) {
        if (
          x >= region.x && 
          x <= region.x + region.width && 
          y >= region.y && 
          y <= region.y + region.height
        ) {
          canvas.style.cursor = 'move';
        } else {
          canvas.style.cursor = 'crosshair';
        }
      }
    } else {
      canvas.style.cursor = 'crosshair';
    }
    
    // Handle resizing
    if (resizing && selectedRegion !== null) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      
      const updatedRegions = [...regions];
      const region = { ...updatedRegions[selectedRegion] };
      
      switch (resizeHandle) {
        case 'tl': // Top-left
          region.x += dx;
          region.y += dy;
          region.width -= dx;
          region.height -= dy;
          break;
        case 'tr': // Top-right
          region.y += dy;
          region.width += dx;
          region.height -= dy;
          break;
        case 'bl': // Bottom-left
          region.x += dx;
          region.width -= dx;
          region.height += dy;
          break;
        case 'br': // Bottom-right
          region.width += dx;
          region.height += dy;
          break;
        case 't': // Top
          region.y += dy;
          region.height -= dy;
          break;
        case 'b': // Bottom
          region.height += dy;
          break;
        case 'l': // Left
          region.x += dx;
          region.width -= dx;
          break;
        case 'r': // Right
          region.width += dx;
          break;
        default:
          break;
      }
      
      // Ensure width and height are positive
      if (region.width < 0) {
        region.x += region.width;
        region.width = Math.abs(region.width);
      }
      
      if (region.height < 0) {
        region.y += region.height;
        region.height = Math.abs(region.height);
      }
      
      updatedRegions[selectedRegion] = region;
      onRegionsChange(updatedRegions);
      
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Handle dragging
    if (isDragging && selectedRegion !== null) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      
      const updatedRegions = [...regions];
      const region = { ...updatedRegions[selectedRegion] };
      
      region.x += dx;
      region.y += dy;
      
      updatedRegions[selectedRegion] = region;
      onRegionsChange(updatedRegions);
      
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Handle drawing
    if (isDrawing && currentRegion) {
      const width = x - currentRegion.x;
      const height = y - currentRegion.y;
      
      setCurrentRegion({
        ...currentRegion,
        width,
        height
      });
    }
  };

  // Handle mouse up event
  const handleMouseUp = () => {
    if (resizing) {
      setResizing(false);
      setResizeHandle('');
      return;
    }
    
    if (isDragging) {
      setIsDragging(false);
      return;
    }
    
    if (isDrawing && currentRegion) {
      setIsDrawing(false);
      
      // Normalize the region (ensure width and height are positive)
      let normalizedRegion = { ...currentRegion };
      
      if (normalizedRegion.width < 0) {
        normalizedRegion.x += normalizedRegion.width;
        normalizedRegion.width = Math.abs(normalizedRegion.width);
      }
      
      if (normalizedRegion.height < 0) {
        normalizedRegion.y += normalizedRegion.height;
        normalizedRegion.height = Math.abs(normalizedRegion.height);
      }
      
      // Only add region if it has some size
      if (normalizedRegion.width > 5 && normalizedRegion.height > 5) {
        setSelectedRegion(regions.length);
        onRegionsChange([...regions, { ...normalizedRegion, name: 'New Region' }]);
        setRegionName('New Region');
      }
      
      setCurrentRegion(null);
    }
  };

  // Handle mouse leave event
  const handleMouseLeave = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentRegion(null);
    }
    
    if (isDragging) {
      setIsDragging(false);
    }
    
    if (resizing) {
      setResizing(false);
      setResizeHandle('');
    }
  };

  // Handle region name change
  const handleRegionNameChange = (e) => {
    setRegionName(e.target.value);
  };

  // Save region name
  const saveRegionName = () => {
    if (selectedRegion !== null) {
      const updatedRegions = [...regions];
      updatedRegions[selectedRegion] = {
        ...updatedRegions[selectedRegion],
        name: regionName
      };
      onRegionsChange(updatedRegions);
    }
  };

  // Delete selected region
  const deleteSelectedRegion = () => {
    if (selectedRegion !== null) {
      const updatedRegions = regions.filter((_, index) => index !== selectedRegion);
      onRegionsChange(updatedRegions);
      setSelectedRegion(null);
    }
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale * 1.2, 5));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale / 1.2, 0.1));
  };

  // Handle reset zoom
  const handleResetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="canvas-editor" ref={containerRef}>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="canvas-controls mb-3">
        <Button variant="outline-secondary" onClick={handleZoomIn} className="me-2">
          <i className="bi bi-zoom-in"></i> Zoom In
        </Button>
        <Button variant="outline-secondary" onClick={handleZoomOut} className="me-2">
          <i className="bi bi-zoom-out"></i> Zoom Out
        </Button>
        <Button variant="outline-secondary" onClick={handleResetZoom} className="me-2">
          <i className="bi bi-aspect-ratio"></i> Reset View
        </Button>
        {selectedRegion !== null && (
          <>
            <Button variant="outline-danger" onClick={deleteSelectedRegion} className="ms-2">
              <i className="bi bi-trash"></i> Delete Region
            </Button>
          </>
        )}
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="template-canvas"
        />
      </div>
      
      {selectedRegion !== null && (
        <div className="region-editor mt-3">
          <Form.Group className="mb-3">
            <Form.Label>Region Name</Form.Label>
            <div className="d-flex">
              <Form.Control
                type="text"
                value={regionName}
                onChange={handleRegionNameChange}
                placeholder="Enter region name"
              />
              <Button variant="primary" onClick={saveRegionName} className="ms-2">
                Save Name
              </Button>
            </div>
            <Form.Text className="text-muted">
              Name this region to match a field from candidate data (e.g., "name", "rollNumber", etc.)
            </Form.Text>
          </Form.Group>
        </div>
      )}
      
      <div className="regions-list mt-3">
        <h5>Defined Regions ({regions.length})</h5>
        {regions.length === 0 ? (
          <p className="text-muted">No regions defined. Click and drag on the image to create regions.</p>
        ) : (
          <ul className="list-group">
            {regions.map((region, index) => (
              <li 
                key={index} 
                className={`list-group-item d-flex justify-content-between align-items-center ${selectedRegion === index ? 'active' : ''}`}
                onClick={() => {
                  setSelectedRegion(index);
                  setRegionName(region.name);
                }}
              >
                <span>{region.name}</span>
                <span className="badge bg-secondary">
                  {Math.round(region.x)},{Math.round(region.y)} ({Math.round(region.width)}×{Math.round(region.height)})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CanvasEditor;