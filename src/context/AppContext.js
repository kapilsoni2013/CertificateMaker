import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Initialize state from localStorage or use defaults
  const [candidates, setCandidates] = useState(() => {
    const savedCandidates = localStorage.getItem('candidates');
    return savedCandidates ? JSON.parse(savedCandidates) : [];
  });

  const [templates, setTemplates] = useState(() => {
    const savedTemplates = localStorage.getItem('templates');
    return savedTemplates ? JSON.parse(savedTemplates) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('templates', JSON.stringify(templates));
  }, [templates]);

  // Candidate operations
  const addCandidate = (candidate) => {
    const newCandidate = {
      ...candidate,
      id: Date.now().toString(),
    };
    setCandidates([...candidates, newCandidate]);
    return newCandidate;
  };

  const updateCandidate = (id, updatedCandidate) => {
    const updatedCandidates = candidates.map(candidate => 
      candidate.id === id ? { ...updatedCandidate, id } : candidate
    );
    setCandidates(updatedCandidates);
  };

  const deleteCandidate = (id) => {
    setCandidates(candidates.filter(candidate => candidate.id !== id));
  };

  const getCandidate = (id) => {
    return candidates.find(candidate => candidate.id === id);
  };

  // Template operations
  const addTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
    };
    setTemplates([...templates, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (id, updatedTemplate) => {
    const updatedTemplates = templates.map(template => 
      template.id === id ? { ...updatedTemplate, id } : template
    );
    setTemplates(updatedTemplates);
  };

  const deleteTemplate = (id) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  const getTemplate = (id) => {
    return templates.find(template => template.id === id);
  };

  return (
    <AppContext.Provider value={{
      candidates,
      addCandidate,
      updateCandidate,
      deleteCandidate,
      getCandidate,
      templates,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      getTemplate
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;