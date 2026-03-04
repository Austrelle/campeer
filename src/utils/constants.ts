// src/utils/constants.ts

export const CAMPUSES = [
  'JRMSU Main Campus - Dapitan',
  'JRMSU Dipolog Campus',
  'JRMSU Katipunan Campus',
  'JRMSU Siocon Campus',
  'JRMSU Tampilisan Campus',
  'JRMSU Sibuco Campus',
  'JRMSU Sindangan Campus',
  'JRMSU Liloy Campus',
  'JRMSU Gutalac Campus',
  'JRMSU Baliguian Campus',
  'JRMSU Godod Campus',
];

export const DEPARTMENTS: Record<string, string[]> = {
  'CCS': 'College of Computer Studies',
  'COE': 'College of Engineering',
  'CTED': 'College of Teacher Education',
  'CNAHS': 'College of Nursing and Allied Health Sciences',
  'CCJE': 'College of Criminal Justice Education',
  'CBA': 'College of Business Administration',
  'CALS': 'College of Agriculture and Life Sciences',
  'CF': 'College of Forestry',
  'CAS': 'College of Arts and Sciences',
  'CSSP': 'College of Social Sciences and Philosophy',
  'COL': 'College of Law',
  'CITHM': 'College of International Tourism and Hospitality Management',
};

export const COURSES: Record<string, string[]> = {
  CCS: ['BSCS', 'BSIT', 'BSIS', 'BCCS', 'BSEMC', 'ACT'],
  COE: ['BSCE', 'BSEE', 'BSME', 'BSCpE', 'BSIE', 'BSECE'],
  CTED: ['BEED', 'BSED-English', 'BSED-Math', 'BSED-Science', 'BSED-Filipino', 'BSED-Social Studies', 'BPEd', 'BTLEd'],
  CNAHS: ['BSN', 'BSMLS', 'BSPT', 'BSOT', 'BSPharma', 'BS-Radtech'],
  CCJE: ['BSCRIM', 'BSFirefighting'],
  CBA: ['BSBA', 'BSBA-FM', 'BSBA-MM', 'BSBA-HRM', 'BSBA-OM', 'BSEntrep', 'BSAcct'],
  CALS: ['BSAgriculture', 'BSAgriBusiness', 'BSABE', 'BSFisheries'],
  CF: ['BSForestry', 'BSEnv-Sci'],
  CAS: ['AB-English', 'AB-Filipino', 'AB-PolSci', 'BS-Biology', 'BS-Chemistry', 'BS-Physics', 'BS-Math', 'BS-Statistics'],
  CSSP: ['AB-Sociology', 'AB-Psychology', 'AB-History'],
  COL: ['JD'],
  CITHM: ['BSTM', 'BSHM'],
};

export const YEAR_LEVELS = [1, 2, 3, 4, 5];

export const TASK_SUBJECTS = [
  'Programming', 'Data Structures', 'Database', 'Web Development',
  'Mobile Development', 'Thesis/Research', 'Mathematics', 'Physics',
  'Chemistry', 'Biology', 'English', 'Filipino', 'Social Science',
  'Business', 'Accounting', 'Engineering Drawing', 'Statistics',
  'Networking', 'Cybersecurity', 'Other'
];

export const studentIdRegex = /^[0-9]{2}-[A-Z]-[0-9]{5}$/;
export const mobileRegex = /^(09|\+639)\d{9}$/;
export const fbLinkRegex = /^(https?:\/\/)?(www\.)?facebook\.com\/.+/i;

/**
 * Ensures a URL always has https:// prefix so anchor href works correctly.
 * "facebook.com/juan" → "https://facebook.com/juan"
 */
export function ensureUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Validates a Facebook profile URL. Accepts with/without https://, with/without www.
 * Returns error string or empty string if valid.
 */
export function validateFbLink(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return 'Facebook profile link is required.';
  if (!/^(https?:\/\/)?(www\.)?facebook\.com\/.+/i.test(trimmed)) {
    return 'Must be a valid Facebook URL — e.g. https://facebook.com/yourname';
  }
  return '';
}
