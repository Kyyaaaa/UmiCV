import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link, Svg, Path, Circle, Rect } from '@react-pdf/renderer';
import { CVSections } from '../../types';

// Register Roboto font from local public folder
Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 700 },
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#1e293b', // slate-800
    backgroundColor: '#ffffff'
  },
  headerContainer: {
    textAlign: 'center',
    marginTop: 8
  },
  fullName: {
    fontSize: 30,
    fontWeight: 700,
    color: '#1e293b' // slate-800
  },
  title: {
    fontSize: 15,
    color: '#64748b', // slate-500
    marginTop: 8,
  },
  divider: {
    marginTop: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1', // slate-300
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    fontSize: 10,
    color: '#475569' // slate-600
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8
  },
  contactIcon: {
    marginRight: 6
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12
  },
  sectionIconWrapper: {
    padding: 4,
    backgroundColor: '#f1f5f9', // slate-100
    borderRadius: 9999,
    marginRight: 8
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1e293b'
  },
  summary: {
    fontSize: 13,
    lineHeight: 1.6,
    color: '#475569',
    marginBottom: 24
  },
  experienceItem: {
    flexDirection: 'column',
    marginBottom: 20
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  experienceRoleCompany: {
    fontSize: 14,
    color: '#334155'
  },
  experienceDate: {
    fontSize: 11,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#64748b',
    fontWeight: 700
  },
  experienceDescription: {
    fontSize: 13,
    lineHeight: 1.6,
    color: '#475569',
  },
  educationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 28
  },
  educationItem: {
    flexDirection: 'column',
    width: '45%',
    marginRight: '5%',
    marginBottom: 16
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  educationSchool: {
    fontSize: 13,
    color: '#334155'
  },
  educationDegree: {
    fontSize: 12,
    color: '#64748b'
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 28
  },
  skillBadge: {
    fontSize: 11,
    fontWeight: 700,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    color: '#475569',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginRight: 8,
    marginBottom: 8
  },
  projectList: {
    flexDirection: 'column',
  },
  projectItem: {
    flexDirection: 'column',
    marginBottom: 16
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%'
  },
  projectHeaderLeft: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  projectName: {
    fontSize: 11,
    fontWeight: 700,
    color: '#ffffff'
  },
  projectLink: {
    fontSize: 11,
    color: '#64748b',
    textDecoration: 'underline',
    marginBottom: 4
  },
  projectDescription: {
    fontSize: 12,
    lineHeight: 1.4,
    color: '#475569',
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderTopRightRadius: 4
  }
});

interface CVPdfDocumentProps {
  data: CVSections;
}

export const CVPdfDocument = ({ data }: CVPdfDocumentProps) => {
  const personalInfo = data?.personalInfo || {} as any;
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills || [];
  const projects = data?.projects || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header / Personal Info */}
        <View style={styles.headerContainer}>
          <Text style={styles.fullName}>{personalInfo.name || 'HỌ VÀ TÊN'}</Text>
          <Text style={styles.title}>{personalInfo.role || 'Vị trí ứng tuyển'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.contactInfo}>
          {personalInfo.phone ? (
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </Svg>
              </View>
              <Text>{personalInfo.phone}</Text>
            </View>
          ) : null}
          {personalInfo.email ? (
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Rect width="20" height="16" x="2" y="4" rx="2" />
                  <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </Svg>
              </View>
              <Text>{personalInfo.email}</Text>
            </View>
          ) : null}
          {personalInfo.location ? (
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <Circle cx="12" cy="10" r="3" />
                </Svg>
              </View>
              <Text>{personalInfo.location}</Text>
            </View>
          ) : null}
          {personalInfo.website ? (
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Circle cx="12" cy="12" r="10" />
                  <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <Path d="M2 12h20" />
                </Svg>
              </View>
              <Link src={personalInfo.website}>Website</Link>
            </View>
          ) : null}
          {personalInfo.github ? (
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <Path d="M9 18c-4.51 2-5-2-7-2" />
                </Svg>
              </View>
              <Link src={`https://github.com/${personalInfo.github}`}>@{personalInfo.github}</Link>
            </View>
          ) : null}
          {personalInfo.linkedin ? (
            <View style={styles.contactItem}>
              <View style={styles.contactIcon}>
                <Svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <Rect width="4" height="12" x="2" y="9" />
                  <Circle cx="4" cy="4" r="2" />
                </Svg>
              </View>
              <Link src={personalInfo.linkedin}>LinkedIn</Link>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        {/* About */}
        {personalInfo.about ? (
          <View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                <Svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Circle cx="12" cy="12" r="10" />
                  <Circle cx="12" cy="12" r="6" />
                  <Circle cx="12" cy="12" r="2" />
                </Svg>
              </View>
              <Text style={styles.sectionTitle}>About :</Text>
            </View>
            <Text style={styles.summary}>{personalInfo.about}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {experience.length > 0 ? (
          <View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                <Svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <Path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </Svg>
              </View>
              <Text style={styles.sectionTitle}>Experience :</Text>
            </View>
            {experience.map((exp: any, idx: number) => (
              <View key={idx} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceRoleCompany}>
                    <Text style={{ fontWeight: 700 }}>{exp.title}</Text>
                    {exp.company ? ` - ${exp.company}` : ''}
                  </Text>
                  <Text style={styles.experienceDate}>{exp.date}</Text>
                </View>
                <Text style={styles.experienceDescription}>{exp.desc}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {education.length > 0 ? (
          <View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                <Svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <Path d="M6 12v5c3 3 9 3 12 0v-5" />
                </Svg>
              </View>
              <Text style={styles.sectionTitle}>Education :</Text>
            </View>
            <View style={styles.educationGrid}>
              {education.map((edu: any, idx: number) => (
                <View key={idx} style={styles.educationItem}>
                  <View style={styles.educationHeader}>
                    <Text style={styles.educationSchool}>{edu.institution}</Text>
                    <Text style={styles.experienceDate}>{edu.date}</Text>
                  </View>
                  <Text style={styles.educationDegree}>{edu.qualification}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Skills */}
        {skills.length > 0 ? (
          <View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                <Svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-3.46-3.52 2.5 2.5 0 0 1-1.12-3.72 2.5 2.5 0 0 1 3-3.64 2.5 2.5 0 0 1 3.52-2.48A2.5 2.5 0 0 1 9.5 2Z" />
                  <Path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 3.46-3.52 2.5 2.5 0 0 0 1.12-3.72 2.5 2.5 0 0 0-3-3.64 2.5 2.5 0 0 0-3.52-2.48A2.5 2.5 0 0 0 14.5 2Z" />
                </Svg>
              </View>
              <Text style={styles.sectionTitle}>Skills :</Text>
            </View>
            <View style={styles.skillsContainer}>
              {skills.map((skill: any, idx: number) => (
                <Text key={idx} style={styles.skillBadge}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* Projects */}
        {projects.length > 0 ? (
          <View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                <Svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <Circle cx="12" cy="12" r="10" />
                  <Path d="m4.93 4.93 4.24 4.24" />
                  <Path d="m14.83 9.17 4.24-4.24" />
                  <Path d="m14.83 14.83 4.24 4.24" />
                  <Path d="m9.17 14.83-4.24 4.24" />
                  <Circle cx="12" cy="12" r="4" />
                </Svg>
              </View>
              <Text style={styles.sectionTitle}>Projects :</Text>
            </View>
            <View style={styles.projectList}>
              {projects.map((proj: any, idx: number) => (
                <View key={idx} style={styles.projectItem}>
                  <View style={styles.projectHeader}>
                    <View style={styles.projectHeaderLeft}>
                      <Text style={styles.projectName}>{proj.name}</Text>
                    </View>
                    {proj.link ? <Link src={proj.link} style={styles.projectLink}>Link</Link> : null}
                  </View>
                  <Text style={styles.projectDescription}>{proj.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        
      </Page>
    </Document>
  );
};
