// types/resume.ts

export type ResumeData = {
  basicInfo: BasicInfo;
  summary?: string;
  skills?: SkillsByCategory;
  experiences?: Experience[];
  projects?: Project[];
  education?: Education[];
  certifications?: Certification[];
};

export type BasicInfo = {
  name: string;
  contact?: ContactInfo;
};

export type ContactExtraEntry = {
  content: string;
  link?: string;
};

export type ContactExtraMap = Record<string, string | ContactExtraEntry>;

export type ContactInfo = {
  tel: string;
  email: string;
  location: string;
  extra?: ContactExtraMap;
};

export type SkillsByCategory = Record<string, string[]>;

export type Experience = {
  company: string;
  title: string;
  location?: string;
  date?: string;
  description?: string[];
};

export type Project = {
  name: string;
  tools?: string[];
  date?: string;
  url?: string;
  description?: string[];
};

export type Education = {
  school: string;
  degree?: string;
  major?: string;
  location?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  honors?: string[];
  description?: string[];
};

export type Certification = {
  name: string;
  issuer?: string;
  date?: string;
  expirationDate?: string;
  credentialId?: string;
  url?: string;
};

