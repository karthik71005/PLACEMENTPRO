import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (using standard available fonts to avoid external fetching issues)
Font.register({
    family: 'Open Sans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Open Sans',
        backgroundColor: '#ffffff',
    },
    header: {
        marginBottom: 20,
        borderBottom: '2pt solid #4f46e5', // Primary brand color
        paddingBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 12,
        color: '#4b5563',
        marginTop: 4,
    },
    section: {
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4f46e5',
        textTransform: 'uppercase',
        borderBottom: '1pt solid #e5e7eb',
        paddingBottom: 4,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    label: {
        width: 120,
        fontSize: 11,
        color: '#6b7280',
        fontWeight: 'bold',
    },
    value: {
        flex: 1,
        fontSize: 11,
        color: '#1f2937',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    skillTag: {
        backgroundColor: '#eef2ff',
        color: '#4338ca',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: 10,
        marginBottom: 4,
        marginRight: 4,
    },
    projectItem: {
        marginBottom: 12,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    projectTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111827',
    },
    projectLink: {
        fontSize: 10,
        color: '#4f46e5',
        textDecoration: 'underline',
    },
    projectDesc: {
        fontSize: 10,
        color: '#4b5563',
        lineHeight: 1.4,
        marginBottom: 4,
    },
    techStack: {
        fontSize: 9,
        color: '#6b7280',
    }
});

export const ResumePDF = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{data.full_name}</Text>
                <Text style={styles.subtitle}>
                    B.Tech in {data.branch} • Class of {data.year_of_passing}
                </Text>
            </View>

            {/* Academic Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Academic Profile</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Degree</Text>
                    <Text style={styles.value}>Bachelor of Technology ({data.branch})</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Graduation Year</Text>
                    <Text style={styles.value}>{data.year_of_passing}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>CGPA</Text>
                    <Text style={styles.value}>{data.academics.cgpa} / 10.0</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Active Backlogs</Text>
                    <Text style={styles.value}>{data.academics.backlogs}</Text>
                </View>
            </View>

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Technical Skills</Text>
                    <View style={styles.skillsContainer}>
                        {data.skills.map((skill, i) => (
                            <Text key={i} style={styles.skillTag}>{skill.toUpperCase()}</Text>
                        ))}
                    </View>
                </View>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Projects</Text>
                    {data.projects.map((project, i) => (
                        <View key={i} style={styles.projectItem}>
                            <View style={styles.projectHeader}>
                                <Text style={styles.projectTitle}>{project.title}</Text>
                                {project.link && (
                                    <Text style={styles.projectLink}>{project.link}</Text>
                                )}
                            </View>
                            <Text style={styles.projectDesc}>{project.description}</Text>
                            <Text style={styles.techStack}>Technologies: {project.tech_stack}</Text>
                        </View>
                    ))}
                </View>
            )}
        </Page>
    </Document>
);
