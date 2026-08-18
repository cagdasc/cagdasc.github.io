export interface ProfileInfo {
  name: string;
  title: string;
  currentCompany: string;
  companySubtitle: string;
  location: string;
  email: string;
  website: string;
  github: string;
  linkedin: string;
  medium: string;
  twitter?: string;
  shortBio: string;
  fullBio: string;
  stats: {
    label: string;
    value: string;
    subtext: string;
  }[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  companyUrl?: string;
  companyType: string;
  period: string;
  location: string;
  badge?: string;
  description: string;
  highlights: string[];
  skills: string[];
  metrics?: string;
}

export interface SkillCategory {
  title: string;
  description: string;
  iconName: string;
  skills: {
    name: string;
    level: 'Expert' | 'Advanced' | 'Proficient';
    highlight?: string;
  }[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: 'Kotlin Multiplatform' | 'Developer Tooling' | 'Open Source' | 'Mobile Lib';
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
  highlights: string[];
}

export interface TalkItem {
  id: string;
  title: string;
  conference: string;
  date: string;
  location: string;
  description: string;
  topics: string[];
  videoUrl?: string;
  slidesUrl?: string;
  badge?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  readTime: string;
  category: string;
  tags: string[];
  content: string;
  featured?: boolean;
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  location: string;
  description: string;
}
