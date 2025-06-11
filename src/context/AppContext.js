import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Load data from localStorage or initialize with empty arrays
  const [candidates, setCandidates] = useState(() => {
    const savedCandidates = localStorage.getItem('candidates');
    return savedCandidates ? JSON.parse(savedCandidates) : [];
  });

  const [templates, setTemplates] = useState(() => {
    const savedTemplates = localStorage.getItem('templates');
    return savedTemplates ? JSON.parse(savedTemplates) : [];
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('templates', JSON.stringify(templates));
  }, [templates]);

  // Candidate management functions
  const addCandidate = (candidate) => {
    const newCandidate = {
      id: uuidv4(),
      ...candidate
    };
    setCandidates([...candidates, newCandidate]);
  };

  const updateCandidate = (id, updatedCandidate) => {
    setCandidates(candidates.map(candidate => 
      candidate.id === id ? { ...candidate, ...updatedCandidate } : candidate
    ));
  };

  const deleteCandidate = (id) => {
    setCandidates(candidates.filter(candidate => candidate.id !== id));
  };

  // Template management functions
  const addTemplate = (template) => {
    const newTemplate = {
      id: uuidv4(),
      ...template
    };
    setTemplates([...templates, newTemplate]);
  };

  const updateTemplate = (id, updatedTemplate) => {
    setTemplates(templates.map(template => 
      template.id === id ? { ...template, ...updatedTemplate } : template
    ));
  };

  const deleteTemplate = (id) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  return (
    <AppContext.Provider value={{
      candidates,
      addCandidate,
      updateCandidate,
      deleteCandidate,
      templates,
      addTemplate,
      updateTemplate,
      deleteTemplate
    }}>
      {children}
    </AppContext.Provider>
  );
};