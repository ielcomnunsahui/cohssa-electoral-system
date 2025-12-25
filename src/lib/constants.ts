// Centralized department definitions for the College of Health Sciences
export const DEPARTMENTS = [
  "Nursing Sciences",
  "Medical Laboratory Sciences",
  "Community Medicine and Public Health",
  "Medicine and Surgery",
  "Human Anatomy",
  "Human Physiology",
  "Medical Biochemistry"
] as const;

// Department codes for CSV imports and compact displays
export const DEPARTMENT_CODES = [
  "NSC - Nursing Sciences",
  "MLS - Medical Laboratory Sciences",
  "PUH - Community Medicine and Public Health",
  "MED - Medicine and Surgery",
  "ANA - Human Anatomy",
  "PHS - Human Physiology",
  "BCH - Medical Biochemistry"
] as const;

// Department with "All" option for filters
export const DEPARTMENTS_WITH_ALL = ["All Departments", ...DEPARTMENTS] as const;

export type Department = typeof DEPARTMENTS[number];
export type DepartmentCode = typeof DEPARTMENT_CODES[number];
