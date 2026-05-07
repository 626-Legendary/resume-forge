import type { ResumeData } from "@/types/resume";

type ResumeTemplateProps = {
    data: ResumeData;
};

const ResumeTemplate = ({ data }: ResumeTemplateProps) => {
    const resumeData = data;

    const contact = resumeData.basicInfo.contact;

    const contactItems = [
        contact?.tel,
        contact?.email,
        contact?.location,
        contact?.linkedIn,
        contact?.github,
        contact?.portfolio,
        contact?.website,
    ].filter(Boolean);

    return (
        <div className="page">
            <header className="header">
                <h1 className="text-center">{resumeData.basicInfo.name}</h1>

                {contactItems.length > 0 && (
                    <div className="info text-center">
                        {contactItems.map((item, index) => {
                            const value = String(item);

                            const isLink =
                                value.includes(".com") ||
                                value.includes(".app") ||
                                value.startsWith("http");

                            return (
                                <p key={`contact-${index}-${value}`}>
                                    {isLink ? (
                                        <a
                                            href={normalizeUrl(value)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {value}
                                        </a>
                                    ) : (
                                        value
                                    )}
                                </p>
                            );
                        })}
                    </div>
                )}

                {contact?.extra && (
                    <div className="info text-center">
                        <p className="font-bold">{contact.extra}</p>
                    </div>
                )}
            </header>

            {resumeData.summary && (
                <section>
                    <h2>Summary</h2>
                    <p>{resumeData.summary}</p>
                </section>
            )}
            {resumeData.education && resumeData.education.length > 0 && (
                <section>
                    <h2>Education</h2>

                    {resumeData.education.map((education, index) => (
                        <div key={`education-${index}-${education.school}-${education.degree ?? ""}`}>
                            <div className="company">
                                <h3>
                                    {education.school}
                                </h3>
                                {education.location && (
                                    <span>{education.location}</span>
                                )}

                                {(education.date ||
                                    education.startDate ||
                                    education.endDate) && <p>{formatDateRange(education)}</p>}
                            </div>

                            {(education.degree || education.major) && (
                                <p>
                                    {[education.degree, education.major]
                                        .filter(Boolean)
                                        .join(" in ")}
                                </p>
                            )}

                            {education.gpa && (
                                <p>
                                    <strong>GPA:</strong> {education.gpa}
                                </p>
                            )}

                            {education.honors && education.honors.length > 0 && (
                                <p>
                                    <strong>Honors:</strong> {education.honors.join(", ")}
                                </p>
                            )}

                            {education.description && education.description.length > 0 && (
                                <ul>
                                    {education.description.map((item, itemIndex) => (
                                        <li key={`education-bullet-${index}-${itemIndex}`}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </section>
            )}
            {resumeData.skills && Object.keys(resumeData.skills).length > 0 && (
                <section>
                    <h2>Skills</h2>
                    <ul>
                        {Object.entries(resumeData.skills).map(([category, skills]) => (
                            <li key={category}>
                                <strong>{category}:</strong> {skills.join(", ")}
                            </li>
                        ))}
                    </ul>
                </section>
            )}



            {resumeData.projects && resumeData.projects.length > 0 && (
                <section>
                    <h2>Projects</h2>

                    {resumeData.projects.map((project, index) => (
                        <div key={`project-${index}-${project.name}`}>
                            <div className="company">
                                <h3>
                                    {project.url ? (
                                        <a
                                            href={normalizeUrl(project.url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {project.name}
                                        </a>
                                    ) : (
                                        project.name
                                    )}
                                </h3>

                                {project.date && <p>{project.date}</p>}
                            </div>

                            {project.tools && project.tools.length > 0 && (
                                <p>
                                    {project.tools.join(", ")}
                                </p>
                            )}

                            {project.description && project.description.length > 0 && (
                                <ul>
                                    {project.description.map((item, itemIndex) => (
                                        <li key={`project-bullet-${index}-${itemIndex}`}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </section>
            )}


            {resumeData.experiences && resumeData.experiences.length > 0 && (
                <section>
                    <h2>Experiences</h2>

                    {resumeData.experiences.map((experience, index) => (
                        <div key={`experience-${index}-${experience.company}-${experience.title}`}>
                            <div>
                                <div className="company">
                                    <div>
                                        <h3>
                                            {experience.company}

                                        </h3>
                                        {experience.location && (
                                            <>
                                                <span>&nbsp; - &nbsp;</span>
                                                <span>{experience.location}</span>
                                            </>
                                        )}
                                    </div>

                                    {(experience.date) && (
                                        <p>{formatDateRange(experience)}</p>
                                    )}
                                </div>

                                <h4>{experience.title}</h4>
                            </div>

                            {experience.description && experience.description.length > 0 && (
                                <ul>
                                    {experience.description.map((item, itemIndex) => (
                                        <li key={`experience-bullet-${index}-${itemIndex}`}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </section>
            )}
            {resumeData.certifications && resumeData.certifications.length > 0 && (
                <section>
                    <h2>Certifications</h2>

                    <ul>
                        {resumeData.certifications.map((certification, index) => (
                            <li key={`certification-${index}-${certification.name}`}>
                                {certification.url ? (
                                    <a className="font-semibold"
                                        href={normalizeUrl(certification.url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {certification.name}
                                    </a>
                                ) : (
                                    certification.name
                                )}

                                {certification.issuer && <> - {certification.issuer}</>}

                                {certification.date && <> | {certification.date}</>}

                                {certification.expirationDate && (
                                    <> | Expires: {certification.expirationDate}</>
                                )}

                                {certification.credentialId && (
                                    <> | Credential ID: {certification.credentialId}</>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
};

export default ResumeTemplate;

function normalizeUrl(url: string) {
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    return `https://${url}`;
}

function formatDateRange(item: {
    date?: string;
    startDate?: string;
    endDate?: string;
}) {
    if (item.date) return item.date;

    if (item.startDate && item.endDate) {
        return `${item.startDate} - ${item.endDate}`;
    }

    if (item.startDate) {
        return `${item.startDate} - Present`;
    }

    if (item.endDate) {
        return item.endDate;
    }

    return "";
}
