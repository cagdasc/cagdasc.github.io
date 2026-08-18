import { ProfileInfo, ExperienceItem, SkillCategory, ProjectItem, TalkItem, EducationItem } from '../types';

export const profileData: ProfileInfo = {
  name: 'Cagdas Caglak',
  title: 'Senior Android Developer',
  currentCompany: 'J.P.Morgan Chase',
  companySubtitle: null,
  location: 'London, United Kingdom',
  email: 'cagdascaglak@gmail.com',
  website: 'https://cagdas.caglak.cc/',
  github: 'https://github.com/cagdasc',
  linkedin: 'https://www.linkedin.com/in/cagdascaglak/',
  medium: 'https://medium.com/@cagdascaglak',
  twitter: 'https://twitter.com/cagdascaglak',
  shortBio: 'Passionate Senior Android Engineer specializing in Jetpack Compose, Kotlin Multiplatform (KMP), Clean Architecture, and Developer Tooling. Building scalable fintech & consumer products and open-source automation tools.',
  fullBio: 'I am an experienced Android developer with a strong background in the finance sector. Passionate about exploring new technologies, mentoring others, and solving complex problems, I thrive on building efficient and scalable solutions. Beyond my day-to-day work, I have a special interest in enhancing developer experience by creating tools and workflows that improve productivity. In my free time, I enjoy developing my own applications and contributing to open-source projects, continuously learning and giving back to the community.',
  stats: [
    {
      value: '10+',
      label: 'Years of Experience',
      subtext: 'Deep native Android & Kotlin specialization'
    }
  ]
};

export const experiencesData: ExperienceItem[] = [
  {
    id: 'jpmchase',
    role: 'Senior Lead Software Engineer',
    company: 'J.P.Morgan Chase',
    companyUrl: 'https://www.personalinvesting.jpmorgan.com/',
    companyType: 'Personal investing',
    period: 'March 2023 - Present',
    location: 'London, United Kingdom',
    badge: 'Current Role',
    description: 'JPMPI is the UK\'s largest truly digital wealth manager, offering clarity and transparency to both seasoned and first-time investors as they seek to achieve their financial goals.',
    highlights: [
      'Leading mobile platform development and modernization of the core Nutmeg Android application, delivering secure personal investing services at scale',
      'Leading the migration from RxJava to Kotlin Coroutines and Flow, modernizing asynchronous programming across the Android platform',
      'Driving the migration from XML-based Android UI to Jetpack Compose, improving UI development consistency and maintainability',
      'Building a screenshot test generator using KSP, Paparazzi, and custom Gradle tooling to eliminate manually written screenshot tests and automate UI regression coverage',
      'Architecting and evolving a modular, multi-module Clean Architecture using Kotlin, Jetpack Compose, Coroutines, and Flow to accelerate feature delivery',
      'Working on core features of a personal investing application, including portfolio management, investment workflows, and real-time financial insights',
      'Driving developer experience and platform modernization initiatives across the Android codebase, improving engineering efficiency and reducing maintenance overhead'
    ],
    skills: ['Kotlin', 'Jetpack Compose', 'Kotlin Multiplatform', 'KSP', 'Paparazzi', 'Coroutines & Flow', 'Dagger / Hilt', 'RxJava', 'Clean Architecture'],
    metrics: '99.95% crash-free users, 70% reduction in UI regression cycle time'
  },
  {
    id: 'meditopia',
    role: 'Senior Android Developer',
    company: 'Meditopia',
    companyUrl: 'https://meditopia.com',
    companyType: 'Mental Wellness & Healthtech',
    period: 'Nov 2021 - Nov 2022',
    location: 'Istanbul / Turkey',
    description: 'The world\'s most popular mental wellness platform for non-English speakers.',
    highlights: [
      'Taking key roles at scaling "Meditopia" application to millions of users on Android platforms',
      'Developing "Meditopia" Android applications, maintaining and integrating new technologies',
      'Taking advantage of declarative UI development with Jetpack Compose',
      'Taking advantage of functional programming by using Kotlin programming languages',
      'Implemented Clean Architecture using Hilt and Kotlin Flow',
      'Working on Android Media infrastructure and implemented media content using ExoPlayer',
      'Determined architectural and product design details for open-ended tasks or specifications',
      'Collaborated with quality engineers, user research, product management, design, and support teams to ensure quality in all phases of app development',
      'Comprehensive experience in the design and implementation of Continuous Integration, Continuous Deployment, Continuous Delivery, and DevOps Operations'
    ],
    skills: ['Kotlin', 'Jetpack Compose', 'ExoPlayer Media2', 'Kotlin Flow', 'Hilt', 'Modular Architecture', 'In-App Purchases', 'Internationalization'],
    metrics: 'Scaled to 35M+ downloads globally, 4.8-star Play Store rating'
  },
  {
    id: 'garanti-bbva',
    role: 'Senior Mobile Software Engineer',
    company: 'Garanti BBVA Technology',
    companyType: 'Bank',
    period: '2016 - 2021',
    location: 'Istanbul / Turkey',
    description: 'Garanti BBVA Technology is one of the biggest banking infrastructure companies in Turkey.',
    highlights: [
      'Developing "Garanti BBVA Mobile" Android application, maintaining and integrating new technologies.',
      'Fulfilling key roles at scaling "Garanti BBVA Mobile" application to millions of users on Android platforms.',
      'Developing an AI based customer assistants to increase the accessibility of application features.',
      'Taking advantage of functional programming by using Kotlin programming languages.',
      'Building a code generation tool and save 30% of development time.',
      'Increasing code coverage with move application architecture from MVC to MVVM.',
      'Comprehensive experience in the design and implementation of Continuous Integration, Continuous Deployment, Continuous Delivery and DevOps Operations.',
      'Participated within an Agile/Scrum team as a Scrum Master, extensive hands on experience with quality assurance methods.',
    ],
    skills: ['Android SDK', 'Java', 'Kotlin', 'CI/CD Pipelines'],
    metrics: 'Delivered 8+ production applications with zero critical security vulnerabilities'
  }
];

export const skillCategoriesData: SkillCategory[] = [
  {
    title: 'Modern Android',
    description: 'Declarative UI, language mastery, and modern platform architectures',
    iconName: 'Smartphone',
    skills: [
      { name: 'Kotlin', level: 'Expert', highlight: 'Coroutines, Flow, DSLs, Functional idioms' },
      { name: 'Jetpack Compose', level: 'Expert', highlight: 'Design systems, Custom Layouts, Recomposition optimization' },
      { name: 'Kotlin Multiplatform (KMP)', level: 'Advanced', highlight: 'Shared business logic, UI foundation, expect/actual' },
      { name: 'Android SDK & Jetpack', level: 'Expert', highlight: 'Lifecycle, Room, Navigation, WorkManager, ExoPlayer' },
      { name: 'Architecture Patterns', level: 'Expert', highlight: 'Clean Architecture, MVI, MVVM, Unidirectional Data Flow' },
      { name: 'Dependency Injection', level: 'Expert', highlight: 'Dagger 2, Hilt, Koin, Scoped singletons' }
    ]
  },
  {
    title: 'DevEx & Automated Testing',
    description: 'Tooling that empowers engineering velocity and automated visual verification',
    iconName: 'Cpu',
    skills: [
      { name: 'Screenshot Testing Autopilot', level: 'Expert', highlight: 'Paparazzi, Compose Preview generation' },
      { name: 'Kotlin Symbol Processing (KSP)', level: 'Advanced', highlight: 'Custom code generation & annotation processors' },
      { name: 'Custom Gradle Plugins', level: 'Advanced', highlight: 'Gradle Kotlin DSL, task configuration' },
      { name: 'CI/CD Pipelines', level: 'Expert', highlight: 'GitHub Actions, Fastlane, Bitrise, Cache optimization' },
      { name: 'Unit & Integration Testing', level: 'Expert', highlight: 'JUnit 5, Mockk, Turbine, Flow testing, Robolectric' }
    ]
  },
  {
    title: 'Systems, Languages & Tools',
    description: 'Broad programming expertise and low-level protocol capabilities',
    iconName: 'Layers',
    skills: [
      { name: 'Java & JVM Ecosystem', level: 'Expert', highlight: 'Multithreading, memory management, bytecode inspection' },
      { name: 'Python & Scripting', level: 'Advanced', highlight: 'Automation scripts, data manipulation, tooling' },
      { name: 'Bash & Unix CLI', level: 'Expert', highlight: 'Build scripts, server automation, developer environment' },
    ]
  }
];

export const projectsData: ProjectItem[] = [
  {
    id: 'screenshot-testing-autopilot',
    title: 'Android Screenshot Testing on Autopilot',
    description: 'Custom Gradle & KSP tooling that automatically scans all @Preview annotations in your codebase and generates headless Paparazzi screenshot test suites on the fly without writing manual boilerplate tests.',
    category: 'Developer Tooling',
    technologies: ['KSP (Kotlin Symbol Processing)', 'Paparazzi', 'Gradle Plugin', 'Jetpack Compose'],
    githubUrl: 'https://github.com/cagdasc',
    featured: true,
    highlights: [
      'Zero test boilerplate needed for design system screenshot validation',
      'Runs in seconds on CI without starting heavy Android emulators',
      'Featured in Droidcon London 2025 presentation'
    ]
  },
  {
    id: 'beaglebone-i2c-driver',
    title: 'BeagleBone Black I2C Driver & Library',
    description: 'Low-level C++ and Java interface library for interacting with I2C bus sensors, digital-to-analog converters, and peripheral controllers on embedded Linux boards.',
    category: 'Open Source',
    technologies: ['C++', 'Java', 'Embedded Linux', 'I2C Protocol', 'Hardware Interfacing'],
    githubUrl: 'https://github.com/cagdasc',
    featured: false,
    highlights: [
      'Direct memory-mapped hardware communication',
      'Used by robotics and IoT hobbyists and academic researchers'
    ]
  }
];

export const talksData: TalkItem[] = [
  {
    id: 'droidcon-london-2025',
    title: 'Android Screenshot Testing on Autopilot',
    conference: 'Droidcon London 2025',
    date: 'October 2025',
    location: 'London, United Kingdom',
    badge: 'Featured Speaker',
    description: 'Delivered an in-depth technical talk exploring how to eliminate UI regression test maintenance by connecting Jetpack Compose @Preview annotations directly to Paparazzi screenshot engines via Kotlin Symbol Processing (KSP) and custom Gradle automation.',
    topics: ['Jetpack Compose', 'KSP Code Generation', 'Paparazzi Screenshot Testing', 'Gradle Automation', 'CI Optimization'],
    videoUrl: 'https://www.youtube.com',
    slidesUrl: 'https://cagdas.caglak.cc/'
  }
];

export const educationData: EducationItem[] = [
  {
    degree: 'Bachelor of Science in Computer Engineering',
    institution: 'Yildiz Technical University / Engineering Faculty',
    period: '2010 - 2015',
    location: 'Turkey / Europe',
    description: 'Comprehensive curriculum spanning algorithms, operating systems, embedded hardware systems, database architectures, and distributed systems.'
  }
];
