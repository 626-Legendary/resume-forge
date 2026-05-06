// data/mockResume.ts

import type { ResumeData } from "@/types/resume";

export const mockResumeData: ResumeData = {
    basicInfo: {
        name: "Zexiang Zhang",
        contact: {
            tel: "+1 626-265-2954",
            email: "zhangzexiang626@gmail.com",
            linkedIn: "linkedin.com/in/zexiangzhang",
            github: "github.com/626-Legendary",
            portfolio: "zexiang-zhang-portfolio.vercel.app",
            website: "",
            location: "Los Angeles, CA",
            extra: "No sponsorship needed",
        },
    },

    summary:
        "Full-stack engineer building high-performance, cloud-native, and data-intensive applications across security systems, AI platforms, and productivity tools. Experienced in scalable web architecture, distributed backend services, and LLM-driven workflows using React, TypeScript, Python, FastAPI, Django, Java, and AWS.",

    skills: {
        Languages: ["Python", "Java", "TypeScript", "JavaScript", "Go", "C++", "SQL"],
        Frontend: ["React", "Next.js", "Tailwind CSS", "HTML", "CSS", "Vue"],
        Backend: ["Node.js", "Express", "FastAPI", "Django", "REST APIs"],
        Databases: ["PostgreSQL", "MongoDB", "MySQL", "Redis"],
        CloudDevOps: ["AWS", "Docker", "Vercel", "GitHub Actions", "CI/CD", "Linux","Nginx"],
        Tools: ["Git", "GitHub", "Postman", "Figma", "Jira"],
    },

    experiences: [
        {
            company: "Bolide Technology Group Inc",
            title: "Full-Stack Software Engineer",
            location: "San Dimas, CA",
            date: "Jul 2023 – Sep 2025",
            description: [
                "Built and maintained full-stack web applications using React, Next.js, TypeScript, Node.js, and PostgreSQL.",
                "Designed RESTful APIs for authentication, user management, dashboard analytics, and data synchronization.",
                "Improved page load performance by optimizing API calls, database queries, and frontend rendering patterns.",
                "Collaborated with product and design teams to deliver responsive, accessible, and production-ready user interfaces.",
            ],
        },
        {
            company: "UCAR LA Auto Group",
            title: "Software Developer",
            location: "Walnut, CA",
            date: "Sep 2021 – Jul 2023",
            description: [
                "Developed backend services for security monitoring workflows using Python, FastAPI, and PostgreSQL.",
                "Implemented role-based access control, JWT authentication, and structured logging for internal tools.",
                "Created automated tests to validate API behavior, edge cases, and authorization logic.",
            ],
        },
    ],

    projects: [
        {
            name: "Catty Claw",
            tools: ["Next.js", "TypeScript","Tailwind CSS", "MongoDB","PostgreSQL",  "Stripe", "Resend",""],
            date: "",
            url: "cattyclaw.vercel.app",
            description: [
                "Designed and developed a personal productivity dashboard with quick links, calendar notes, scratch pad, calculator, and user preferences.",
                "Implemented JWT-based authentication, MongoDB persistence, subscription checkout flow, and transactional email templates.",
                "Built responsive UI components with Tailwind CSS and optimized dashboard interactions for daily workflow use.",
            ],
        },
        {
            name: "FairStart — AI Resume ",
            tools: ["React", "JavaScript","Tailwind CSS", "FastAPI", "PostgreSQL", "AWS","Docker"],
            date: "",
            url: "ai-resume-one-alpha.vercel.app/",
            description: [
                "Built a resume generation tool that converts structured JSON data into a clean, printable resume layout.",
                "Designed extensible TypeScript types for resume sections including skills, experience, projects, education, and certifications.",
                "Created reusable rendering components to support flexible resume templates and future PDF export.",
            ],
        },
    ],

    education: [
        {
            school: "Georgia Institute of Technology",
            degree: "Master of Science",
            major: "Computer Science",
            location: "Atlanta, GA",
            date: "",
            startDate: "",
            endDate: "",
            gpa: "",
            honors: [],
            description: [
            ],
        },
        {
            school: "University of California, Riverside",
            degree: "Bachelor of Science",
            major: "Computer Science",
            location: "Riverside, CA",
            date: "",
            startDate: "",
            endDate: "",
            gpa: "",
            honors: [],
            description: [
            ],
        }
    ],

    certifications: [
        {
            name: "Oracle Certified Professional, MySQL 8.0 Database Administrator",
            issuer: "Oracle",
            date: "Jun 26, 2025",
            expirationDate: "",
            credentialId: "FD27E914945354A13BFD17382D5471D507D714A18BB689FD4F0A7A0B85B73EE4",
            url: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=FD27E914945354A13BFD17382D5471D507D714A18BB689FD4F0A7A0B85B73EE4",
        },
        {
            name: "Meta Full Stack Developer",
            issuer: "Meta",
            date: "Oct 24, 2025",
            expirationDate: "",
            credentialId: "ASQJKVD6YB8M",
            url: "https://www.coursera.org/account/accomplishments/specialization/ASQJKVD6YB8M",
        },
    ],
};