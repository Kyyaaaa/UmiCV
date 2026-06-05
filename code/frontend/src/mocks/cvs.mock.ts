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
        fullName: 'Alice Nguyen',
        email: 'emp1@umicv.com',
        phone: '0123456789',
        title: 'Frontend Developer',
        summary: 'A passionate developer with 2 years of experience in React.',
      },
      skills: [
        { name: 'React', level: 'Intermediate' },
        { name: 'TypeScript', level: 'Intermediate' },
      ],
      experience: [
        {
          company: 'Tech Corp',
          role: 'Junior Dev',
          startDate: '2024-01-01',
          endDate: 'Present',
          description: 'Developed frontend features.',
        },
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          role: 'Frontend Dev',
          technologies: ['React', 'Tailwind'],
          description: 'Built a scalable e-commerce site.',
        },
      ],
      education: [
        { school: 'University of Technology', degree: 'BSc Computer Science', year: '2023' },
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
        fullName: 'John Doe',
        email: 'techlead1@umicv.com',
        phone: '0987654321',
        title: 'Senior Fullstack Engineer',
        summary: 'Expert in Node.js and React with 8 years of experience.',
      },
      skills: [
        { name: 'Node.js', level: 'Expert' },
        { name: 'React', level: 'Expert' },
        { name: 'AWS', level: 'Advanced' },
      ],
      experience: [
        {
          company: 'Umi Corp',
          role: 'Tech Lead',
          startDate: '2020-01-01',
          endDate: 'Present',
          description: 'Leading a team of 10 engineers.',
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
