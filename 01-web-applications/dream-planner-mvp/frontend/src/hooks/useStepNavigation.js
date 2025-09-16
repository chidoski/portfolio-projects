/**
 * Centralized Navigation Hook for Multi-Step Flows
 * Manages step transitions, validation, and progress tracking across the retirement planning flow
 */

import { useState, useMemo } from 'react';

export const useStepNavigation = (initialStep = 1, totalSteps = 3) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isNavigating, setIsNavigating] = useState(false);

  // Step definitions with validation rules
  const stepDefinitions = {
    1: {
      name: 'Dream Vision',
      title: 'Envision Your Retirement',
      description: 'Design your ideal retirement lifestyle',
      requiredFields: ['dreamDescription', 'selectedArchetype'],
      validationRules: {
        dreamDescription: (value) => value && value.trim().length >= 50,
        selectedArchetype: (value) => value && value.trim() !== ''
      }
    },
    2: {
      name: 'Financial Reality',
      title: 'Financial Assessment',
      description: 'Understand your current financial position',
      requiredFields: ['currentAge', 'incomeRange', 'selectedState'],
      validationRules: {
        currentAge: (value) => value && !isNaN(value) && value >= 18 && value <= 80,
        incomeRange: (value) => value && value.trim() !== '',
        selectedState: (value) => value && value.trim() !== ''
      }
    },
    3: {
      name: 'Action Plan',
      title: 'Your Retirement Plan',
      description: 'Create your personalized action plan',
      requiredFields: [],
      validationRules: {}
    }
  };

  // Calculate step completion status
  const getStepCompletionStatus = (stepNumber, formData = {}) => {
    const step = stepDefinitions[stepNumber];
    if (!step) return { isComplete: false, errors: [] };

    const errors = [];
    let isComplete = true;

    // Check each required field
    step.requiredFields.forEach(fieldName => {
      const value = formData[fieldName];
      const validator = step.validationRules[fieldName];
      
      if (!validator || !validator(value)) {
        isComplete = false;
        errors.push({
          field: fieldName,
          message: getFieldErrorMessage(fieldName, value)
        });
      }
    });

    // Special validation for step 1 archetype-specific questions
    if (stepNumber === 1 && formData.selectedArchetype) {
      const archetypeQuestions = getArchetypeQuestions(formData.selectedArchetype);
      archetypeQuestions.forEach(question => {
        const value = formData[question.id];
        if (!value || value.trim() === '') {
          isComplete = false;
          errors.push({
            field: question.id,
            message: `Please complete: ${question.label}`
          });
        }
      });
    }

    return { isComplete, errors };
  };

  // Helper function to get archetype questions (would be passed in from component)
  const getArchetypeQuestions = (archetype) => {
    // This would be injected from the component that uses this hook
    // For now, return empty array
    return [];
  };

  // Generate error messages for specific fields
  const getFieldErrorMessage = (fieldName, value) => {
    const errorMessages = {
      dreamDescription: 'Please describe your retirement vision (at least 50 characters)',
      selectedArchetype: 'Please choose a retirement lifestyle archetype',
      currentAge: 'Please enter a valid age between 18 and 80',
      incomeRange: 'Please select your income range',
      selectedState: 'Please select your state'
    };

    return errorMessages[fieldName] || `Please complete the ${fieldName} field`;
  };

  // Check if user can proceed to next step
  const canProceed = useMemo(() => {
    return (formData, customValidation = null) => {
      if (customValidation) {
        return customValidation(formData);
      }
      
      const { isComplete } = getStepCompletionStatus(currentStep, formData);
      return isComplete;
    };
  }, [currentStep]);

  // Navigate to next step with optional validation
  const proceedToNext = async (formData = {}, onStepChange = null) => {
    if (!canProceed(formData)) {
      return false;
    }

    setIsNavigating(true);

    try {
      // Simulate processing time for visual feedback
      await new Promise(resolve => setTimeout(resolve, 800));

      const nextStep = Math.min(currentStep + 1, totalSteps);
      setCurrentStep(nextStep);
      
      if (onStepChange) {
        onStepChange(nextStep, currentStep);
      }

      return true;
    } catch (error) {
      console.error('Navigation error:', error);
      return false;
    } finally {
      setIsNavigating(false);
    }
  };

  // Navigate to previous step
  const goToPrevious = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
  };

  // Navigate to specific step
  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setCurrentStep(stepNumber);
    }
  };

  // Get validation errors for current step
  const getValidationErrors = (formData = {}) => {
    const { errors } = getStepCompletionStatus(currentStep, formData);
    return errors;
  };

  // Calculate overall progress percentage
  const getProgressPercentage = (formData = {}) => {
    let completedSteps = 0;
    
    for (let i = 1; i <= currentStep; i++) {
      const { isComplete } = getStepCompletionStatus(i, formData);
      if (isComplete) {
        completedSteps++;
      }
    }
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  // Get current step information
  const getCurrentStepInfo = () => {
    return {
      ...stepDefinitions[currentStep],
      stepNumber: currentStep,
      totalSteps,
      isFirstStep: currentStep === 1,
      isLastStep: currentStep === totalSteps
    };
  };

  return {
    // State
    currentStep,
    isNavigating,
    totalSteps,
    
    // Navigation functions
    proceedToNext,
    goToPrevious,
    goToStep,
    
    // Validation functions
    canProceed,
    getValidationErrors,
    getStepCompletionStatus,
    
    // Progress tracking
    getProgressPercentage,
    getCurrentStepInfo,
    
    // Step definitions
    stepDefinitions
  };
};

export default useStepNavigation;
