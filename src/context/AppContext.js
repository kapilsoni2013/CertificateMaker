import React, { createContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Load data from localStorage or initialize with empty arrays
  const [candidates, setCandidates] = useState(() => {
    try {
      const savedCandidates = localStorage.getItem('candidates');
      return savedCandidates ? JSON.parse(savedCandidates) : [];
    } catch (error) {
      console.error('Error loading candidates from localStorage:', error);
      return [];
    }
  });

  const [templates, setTemplates] = useState(() => {
    try {
      const savedTemplates = localStorage.getItem('templates');
      return savedTemplates ? JSON.parse(savedTemplates) : [];
    } catch (error) {
      console.error('Error loading templates from localStorage:', error);
      return [];
    }
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('candidates', JSON.stringify(candidates));
    } catch (error) {
      console.error('Error saving candidates to localStorage:', error);
    }
  }, [candidates]);

  useEffect(() => {
    try {
      localStorage.setItem('templates', JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving templates to localStorage:', error);
    }
  }, [templates]);

  // Candidate management functions
  const addCandidate = useCallback((candidate) => {
    const newCandidate = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...candidate
    };
    setCandidates(prevCandidates => [...prevCandidates, newCandidate]);
    return newCandidate;
  }, []);

  const updateCandidate = useCallback((id, updatedCandidate) => {
    setCandidates(prevCandidates => 
      prevCandidates.map(candidate => 
        candidate.id === id ? { 
          ...candidate, 
          ...updatedCandidate,
          updatedAt: new Date().toISOString() 
        } : candidate
      )
    );
  }, []);

  const deleteCandidate = useCallback((id) => {
    setCandidates(prevCandidates => 
      prevCandidates.filter(candidate => candidate.id !== id)
    );
  }, []);

  const getCandidateById = useCallback((id) => {
    return candidates.find(candidate => candidate.id === id);
  }, [candidates]);

  // Template management functions
  const addTemplate = useCallback((template) => {
    const newTemplate = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...template
    };
    setTemplates(prevTemplates => [...prevTemplates, newTemplate]);
    return newTemplate;
  }, []);

  const updateTemplate = useCallback((id, updatedTemplate) => {
    setTemplates(prevTemplates => 
      prevTemplates.map(template => 
        template.id === id ? { 
          ...template, 
          ...updatedTemplate,
          updatedAt: new Date().toISOString() 
        } : template
      )
    );
  }, []);

  const deleteTemplate = useCallback((id) => {
    setTemplates(prevTemplates => 
      prevTemplates.filter(template => template.id !== id)
    );
  }, []);

  const getTemplateById = useCallback((id) => {
    return templates.find(template => template.id === id);
  }, [templates]);

  // Data cleanup function
  const clearAllData = useCallback(() => {
    setCandidates([]);
    setTemplates([]);
    localStorage.removeItem('candidates');
    localStorage.removeItem('templates');
  }, []);

  const contextValue = {
    candidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    getCandidateById,
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    clearAllData
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};