// Validation utilities for forms

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePersonalInfo = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.full_name?.trim()) {
    errors.push("Full name is required");
  }

  if (!data.matric?.trim()) {
    errors.push("Matric number is required");
  } else if (!/^\d{2}\/\d{2}[A-Za-z]{3}\d{3}$/.test(data.matric.trim())) {
    errors.push("Invalid matric number format. Use: XX/XXaaa000 (e.g., 21/08nus014)");
  }

  if (!data.department) {
    errors.push("Department is required");
  }

  if (!data.level) {
    errors.push("Level is required");
  }

  if (!data.date_of_birth) {
    errors.push("Date of birth is required");
  }

  if (!data.gender) {
    errors.push("Gender is required");
  }

  if (!data.phone?.trim()) {
    errors.push("Phone number is required");
  } else if (!/^0[789]\d{9}$/.test(data.phone.trim())) {
    errors.push("Invalid phone number (must be 11 digits starting with 07, 08, or 09)");
  }

  if (!data.photo_url) {
    errors.push("Profile photo is required");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePositionStep = (data: any, personalData: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.position_id) {
    errors.push("Please select a position");
  }

  if (!data.why_running?.trim()) {
    errors.push("Please explain why you are running for this position");
  } else {
    const wordCount = data.why_running.split(/\s+/).filter(Boolean).length;
    if (wordCount < 50) {
      errors.push("Your statement must be at least 50 words");
    }
    if (wordCount > 200) {
      errors.push("Your statement must not exceed 200 words");
    }
  }

  // Eligibility checks
  if (data.position_details && personalData) {
    const position = data.position_details;

    if (personalData.department && !position.eligible_departments?.includes(personalData.department)) {
      errors.push(`Your department (${personalData.department}) is not eligible for this position`);
    }

    if (personalData.level && !position.eligible_levels?.includes(personalData.level)) {
      errors.push(`Your level (${personalData.level}) is not eligible for this position`);
    }

    if (position.eligible_gender && personalData.gender && personalData.gender !== position.eligible_gender) {
      errors.push(`This position is only for ${position.eligible_gender} candidates`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAcademicStep = (data: any, positionData: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.cgpa) {
    errors.push("CGPA is required");
  } else {
    const cgpa = parseFloat(data.cgpa);
    if (isNaN(cgpa) || cgpa < 2.0 || cgpa > 5.0) {
      errors.push("CGPA must be between 2.00 and 5.00");
    }
    
    const minCgpa = positionData?.position_details?.min_cgpa || 0;
    if (minCgpa > 0 && cgpa < minCgpa) {
      errors.push(`Your CGPA (${cgpa.toFixed(2)}) does not meet the minimum requirement of ${minCgpa.toFixed(2)}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLeadershipStep = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.leadership_history?.trim()) {
    errors.push("Leadership history is required");
  } else if (data.leadership_history.trim().length < 50) {
    errors.push("Leadership history must be at least 50 characters");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRefereeStep = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.referee_declaration_accepted) {
    errors.push("Please accept the referee declaration");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePaymentStep = (data: any): ValidationResult => {
  const errors: string[] = [];

  if (!data.payment_proof_url) {
    errors.push("Payment proof is required");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
