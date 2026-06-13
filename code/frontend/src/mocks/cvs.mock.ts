import { CVProfile } from '../types';

export const mockCVs: CVProfile[] = [
  {
    id: 'cv1',
    userId: 'u4',
    languageCode: 'vi',
    status: 'PendingApproval',
    versionNumber: 1,
    sectionsData: {
      personalInfo: {
        name: 'Alice Nguyen',
        email: 'emp1@umicv.com',
        phone: '0123456789',
        role: 'Frontend Developer',
        about: 'A passionate developer with 2 years of experience in React.',
        location: '',
        website: '',
        github: '',
        linkedin: ''
      },
      skills: [
        { name: 'React' },
        { name: 'TypeScript' },
      ],
      experience: [
        {
          company: 'Tech Corp',
          title: 'Junior Dev',
          date: '2024-01-01 - Present',
          desc: 'Developed frontend features.',
        },
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          link: '',
          desc: 'Built a scalable e-commerce site using React and Tailwind.',
        },
      ],
      education: [
        { institution: 'University of Technology', qualification: 'BSc Computer Science', date: '2023' },
      ],
    },
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    publishedAt: null,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cv2',
    userId: 'u2',
    languageCode: 'en',
    status: 'Updated',
    versionNumber: 3,
    sectionsData: {
      personalInfo: {
        name: 'John Doe',
        email: 'techlead1@umicv.com',
        phone: '0987654321',
        role: 'Senior Fullstack Engineer',
        about: 'Expert in Node.js and React with 8 years of experience.',
        location: '',
        website: '',
        github: '',
        linkedin: ''
      },
      skills: [
        { name: 'Node.js' },
        { name: 'React' },
        { name: 'AWS' },
      ],
      experience: [
        {
          company: 'Umi Corp',
          title: 'Tech Lead',
          date: '2020-01-01 - Present',
          desc: 'Leading a team of 10 engineers.',
        },
      ],
      projects: [],
      education: [],
    },
    submittedAt: new Date(Date.now() - 864000000).toISOString(),
    publishedAt: new Date(Date.now() - 864000000).toISOString(),
    updatedAt: new Date(Date.now() - 864000000).toISOString(),
  },
];
