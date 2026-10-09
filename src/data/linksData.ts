export interface SocialLinkItem {
  id: string;
  title: string;
  url: string;
  iconName: 'Github' | 'Linkedin' | 'Mail' | 'Twitter' | 'Globe' | 'BookOpen' | 'FileText' | 'Presentation' | 'Smartphone' | 'Terminal' | 'ExternalLink';
  subtitle?: string;
  badge?: string;
  highlighted?: boolean;
  category?: 'primary' | 'social' | 'speaking' | 'writing';
}

export interface LinksProfile {
  name: string;
  handle: string;
  avatarUrl?: string;
  title: string;
  company: string;
  location: string;
  shortBio: string;
  verifiedBadge?: string;
  socials: {
    github?: string;
    linkedin?: string;
    medium?: string;
    twitter?: string;
    email?: string;
    website?: string;
  };
  links: SocialLinkItem[];
}

export const linksProfileData: LinksProfile = {
  name: 'Cagdas Caglak',
  handle: '@cagdasc',
  title: 'Senior Android Developer',
  company: 'J.P. Morgan Chase',
  location: 'London, United Kingdom',
  shortBio: '',
  // verifiedBadge: 'Droidcon Speaker',
  socials: {
    github: 'https://github.com/cagdasc',
    linkedin: 'https://www.linkedin.com/in/cagdascaglak/',
    // medium: 'https://medium.com/@cagdascaglak',
    // twitter: 'https://twitter.com/cagdascaglak',
    // email: 'cagdascaglak@gmail.com',
    website: 'https://cagdas.caglak.cc/',
  },
  links: [
    {
      id: 'home-portfolio',
      title: 'Personal Website',
      subtitle: 'Complete career journey, engineering metrics, and tech stack',
      url: 'https://cagdas.caglak.cc/',
      iconName: 'Globe',
      badge: 'Main Site',
      highlighted: false,
      category: 'primary',
    },
    {
      id: 'github',
      title: 'GitHub Repositories',
      subtitle: 'Visit my open-source projects',
      url: 'https://github.com/cagdasc',
      iconName: 'Github',
      badge: 'Open Source',
      highlighted: false,
      category: 'primary',
    },
    {
      id: 'linkedin',
      title: 'LinkedIn Profile',
      subtitle: 'Connect professionally, recommendations & engineering network',
      url: 'https://www.linkedin.com/in/cagdascaglak/',
      iconName: 'Linkedin',
      badge: 'Connect',
      highlighted: false,
      category: 'primary',
    },
    {
      id: 'blog',
      title: 'Technical Blog',
      subtitle: 'Articles on Jetpack Compose, AI agents in emulators & KMP architecture',
      url: 'https://cagdas.caglak.cc/#blog',
      iconName: 'BookOpen',
      badge: 'Articles',
      highlighted: false,
      category: 'writing',
    },
    {
      id: 'droidcon-talk',
      title: 'Droidcon London 2025 Speaker',
      subtitle: 'Android Screenshot Testing on Autopilot (Paparazzi + KSP)',
      url: 'https://www.youtube.com/watch?v=T82YYwg0GWc',
      iconName: 'Presentation',
      badge: 'Conference Talk',
      highlighted: false,
      category: 'speaking',
    },
  ],
};
