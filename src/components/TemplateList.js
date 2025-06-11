import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const TemplateList = () => {
  const { templates, deleteTemplate } = useContext(AppContext);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2>Certificate Templates</h2>
        </div>
        <div className="action-buttons">
          <Link to="/templates/add">
            <button>Add New Template</button>
          </Link>
        </div>
        
        {templates.length > 0 ? (
          <div className="grid">
            {templates.map(template => (
              <div key={template.id} className="card">
                <h3>{template.name}</h3>
                {template.imageUrl && (
                  <img 
                    src={template.imageUrl} 
                    alt={template.name} 
                    className="template-preview" 
                  />
                )}
                <p>Regions: {template.regions ? template.regions.length : 0}</p>
                <div className="action-buttons">
                  <Link to={`/templates/edit/${template.id}`}>
                    <button>Edit</button>
                  </Link>
                  <button 
                    className="secondary"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this template?')) {
                        deleteTemplate(template.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No templates found. <Link to="/templates/add">Add a new template</Link>.</p>
        )}
      </div>
    </div>
  );
};

export default TemplateList;