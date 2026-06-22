import fs from 'fs'
import path from 'path'
import { FileNode } from '@/types'

const DB_PATH = path.join(process.cwd(), 'lib', 'db.json')

export interface DatabaseSchema {
  files: FileNode[]
  contents: Record<string, string>
}

const defaultFiles: FileNode[] = [
  {
    id: 'readme',
    name: 'readme.md',
    type: 'file',
    path: 'readme.md',
    extension: 'md'
  },
  {
    id: 'ideas',
    name: 'ideas.md',
    type: 'file',
    path: 'ideas.md',
    extension: 'md'
  },
  {
    id: 'projects',
    name: 'projects',
    type: 'directory',
    path: 'projects',
    children: [
      {
        id: 'vehicle_rental',
        name: 'vehicle_rental.json',
        type: 'file',
        path: 'projects/vehicle_rental.json',
        extension: 'json'
      },
      {
        id: 'integrity_execution',
        name: 'integrity_execution.json',
        type: 'file',
        path: 'projects/integrity_execution.json',
        extension: 'json'
      },
      {
        id: 'crud_dash',
        name: 'crud_dash.json',
        type: 'file',
        path: 'projects/crud_dash.json',
        extension: 'json'
      }
    ]
  },
  {
    id: 'resume',
    name: 'resume.pdf',
    type: 'file',
    path: 'resume.pdf',
    extension: 'pdf'
  },
  {
    id: 'education_&_leadership',
    name: 'education_&_leadership.tsx',
    type: 'file',
    path: 'education_&_leadership.tsx',
    extension: 'tsx'
  },
  {
    id: 'contact',
    name: 'contact.env',
    type: 'file',
    path: 'contact.env',
    extension: 'env'
  }
]

const defaultContents: Record<string, string> = {
  'readme.md': `# Syed Nadirsha

Systems-focused Full Stack Developer

Currently pursuing B.Tech in Computer Science (Data Science) at SR University, Warangal.

I enjoy building software for real-world ecosystems where technology, trust, and operations intersect. My primary focus is full-stack development using React, Node.js, Express, and MongoDB, while continuously strengthening my problem-solving skills through Java and Data Structures & Algorithms.

## Current Focus

* Building RentalHub — a rental ecosystem platform
* Learning scalable backend architecture
* Improving DSA and interview preparation in Java
* Exploring systems that solve local Indian problems

## Building

### RentalHub

A full-stack rental platform focused on booking workflows, role-based access, and conflict prevention.
## Interests

* Backend Systems
* System Design
* Product Development
* AI-Assisted Workflows
* Local Commerce Infrastructure

## Looking For

Software Engineering Internships and opportunities to contribute to real-world products while continuing to grow as a full-stack developer.`,

  'ideas.md': `# Future Product Ideas

## Smart Bachat App

AI-powered household budget advisor for Indian families.

## Jan Seva AI

Voice-powered civic complaint platform using NLP and AI.

## Aushadhi Sahayak

Medicine availability finder with real-time pharmacy inventory.

## Kisaan AI Advisor

Regional-language AI assistant for farmers.`,

  'projects/vehicle_rental.json': `{
  "name": "Vehicle Rental Aggregator Platform",
  "description": "A full-stack rental management platform that enables users to list, browse, and book rental vehicles efficiently.",
  "techStack": ["React.js", "Node.js", "Express.js", "MongoDB", "JWT Authentication"],
  "architecture": "React Frontend (Glassmorphism) → JWT Auth Middleware → Express.js Engine (Conflict Prevention) → MongoDB Cluster",
  "endpoints": [
    {
      "name": "List Vehicle",
      "method": "POST",
      "path": "/api/rentals",
      "description": "Submit a new vehicle profile to list on the aggregation feed (requires owner auth).",
      "mockResponse": {
        "success": true,
        "vehicle_id": "vh_scorpio_992",
        "status": "listed",
        "owner_verified": true
      },
      "mockLatency": 120
    },
    {
      "name": "Request Booking",
      "method": "POST",
      "path": "/api/bookings",
      "description": "Request a rental vehicle reservation. Triggers concurrent booking conflict checks.",
      "mockResponse": {
        "booking_id": "bk_9981a3",
        "vehicle_id": "vh_scorpio_992",
        "conflict_checked": "PASSED",
        "status": "confirmed"
      },
      "mockLatency": 250
    }
  ],
  "highlights": [
    "JWT Authentication",
    "Role-Based Access Control (RBAC)",
    "Booking Conflict Prevention Logic",
    "Scalable MVC Backend Architecture",
    "Responsive Modern UI featuring Glassmorphism templates"
  ],
  "backendFeatures": [
    "Authentication System",
    "Rental Module",
    "Owner-Based Authorization",
    "Booking System",
    "Conflict Prevention Logic",
    "Booking Cancellation System",
    "Role-Based Access Control",
    "Dashboard APIs",
    "Stable API Responses"
  ],
  "frontendFeatures": [
    "React + Vite Setup",
    "Dashboard Layout",
    "Multi-Theme System",
    "Glassmorphism UI",
    "Backend Integration",
    "Rental Creation Interface",
    "Booking Flow UI",
    "My Rentals Dashboard",
    "API Error Handling"
  ],
  "upcomingFeatures": [
    "Edit/Delete Rental Management",
    "Razorpay Payment Integration",
    "Production Deployment",
    "Performance Optimization",
    "UI/UX Enhancements"
  ]
}`,

  'projects/integrity_execution.json': `{
  "name": "Integrity & Execution Dashboard",
  "description": "Developed a high-performance personal accountability dashboard designed to eliminate \\"broken promises\\" by transforming static goals into an interactive execution framework.",
  "techStack": ["MERN Stack", "Firebase", "Vercel"],
  "liveUrl": "https://integrity-dash.vercel.app/",
  "period": "Jan 2026 – Feb 2026",
  "architecture": "React Frontend (Custom styled-components) → Firestore onSnapshot Live Listeners → Cloud Firestore Rules (Isolated environments)",
  "endpoints": [
    {
      "name": "Submit Goal Progress",
      "method": "POST",
      "path": "/api/integrity/score",
      "description": "Submit goal checklist execution states to compute integrity ratio metrics.",
      "mockResponse": {
        "score_updated": true,
        "integrity_ratio": 0.90,
        "badge": "HIGH_EXECUTION_STREAK",
        "db_synced": "firestore_onSnapshot_active"
      },
      "mockLatency": 180
    }
  ],
  "responsibilities": [
    "Real-Time Data Architecture: Engineered serverless backend using Cloud Firestore, custom security rules for isolated user environments.",
    "Frontend Precision: Built adaptive React UI featuring Glassmorphism design principles.",
    "State Management: Developed complex logic to handle real-time UI updates (checklists, dynamic progress tracking) via Firebase onSnapshot listeners.",
    "Deployment Pipeline: Managed Vercel CI/CD and secure environment variable integration."
  ],
  "results": [
    "Increased Engagement: Achieved 100% reduction in data loss transitioning from local storage to persistent cloud sync.",
    "Optimized Performance: Improved mobile accessibility and alignment precision through custom Flexbox.",
    "Accountability Metric: Introduced \\"Integrity\\" scoring system for visual feedback on goal completion rates."
  ],
  "teamwork": [
    "Collaborative Iteration: Actively engaged in design reviews, refining text inputs into advanced interactive checklists.",
    "Technical Documentation: Maintained clean Git version control history with descriptive commits."
  ]
}`,

  'projects/crud_dash.json': `{
  "name": "CrudDash – RESTful CRUD Application",
  "description": "Built a CRUD application to understand RESTful architecture and server-side rendering. Implemented complete CRUD functionality, RESTful routing, middleware handling, and deployment on Render. Solved real-world deployment issues including route handling, method overriding, and production path configuration.",
  "techStack": ["Node.js", "Express.js", "EJS", "Vanilla CSS", "UUID", "Method Override"],
  "liveUrl": "https://crud-dash.onrender.com/posts",
  "architecture": "User Browser → EJS Views (Frontend) → Express.js Server → CRUD Controllers → In-Memory Data Store (UUID-Based Posts)",
  "endpoints": [
    {
      "name": "Fetch All Posts",
      "method": "GET",
      "path": "/posts",
      "description": "Retrieve all posts from the in-memory data store.",
      "mockResponse": [
        {
          "id": "123",
          "username": "John",
          "content": "Hello World"
        }
      ],
      "mockLatency": 100
    },
    {
      "name": "Fetch Single Post",
      "method": "GET",
      "path": "/posts/123",
      "description": "Retrieve a single post by its ID.",
      "mockResponse": {
        "id": "123",
        "username": "John",
        "content": "Hello World"
      },
      "mockLatency": 120
    },
    {
      "name": "Create New Post",
      "method": "POST",
      "path": "/posts",
      "description": "Create a new post and store it in the database.",
      "mockResponse": {
        "message": "Post created successfully"
      },
      "mockLatency": 150
    },
    {
      "name": "Update Existing Post",
      "method": "PUT",
      "path": "/posts/123",
      "description": "Update post username or content.",
      "mockResponse": {
        "message": "Post updated successfully"
      },
      "mockLatency": 180
    },
    {
      "name": "Delete Post",
      "method": "DELETE",
      "path": "/posts/123",
      "description": "Remove a post from the database by ID.",
      "mockResponse": {
        "message": "Post deleted successfully"
      },
      "mockLatency": 200
    }
  ],
  "highlights": [
    "Built a complete RESTful CRUD application from scratch using Node.js and Express.js.",
    "Implemented all 7 standard REST routes following industry conventions.",
    "Successfully deployed the application on Render and resolved production issues.",
    "Gained practical experience with server-side rendering using EJS."
  ],
  "backendFeatures": [
    "Implemented Create, Read, Update, and Delete operations for post management.",
    "Designed RESTful routing architecture using Express.js.",
    "Used Method Override to support PATCH and DELETE requests through HTML forms.",
    "Generated unique post identifiers using UUID and managed request handling through middleware."
  ],
  "frontendFeatures": [
    "Built dynamic server-rendered pages using EJS templates.",
    "Developed intuitive forms for creating and editing posts.",
    "Designed a clean and responsive user interface using Vanilla CSS.",
    "Implemented dynamic content rendering based on route parameters and user actions."
  ],
  "upcomingFeatures": [
    "Integrate MongoDB for persistent data storage.",
    "Add user authentication and authorization features.",
    "Implement search, filtering, and pagination capabilities.",
    "Develop REST APIs for future frontend framework integration."
  ],
  "responsibilities": [
    "Designed the overall application structure and routing workflow.",
    "Developed backend functionality using Node.js and Express.js.",
    "Created EJS views and connected them with server-side data rendering.",
    "Managed deployment, debugging, and production issue resolution."
  ],
  "results": [
    "Strengthened understanding of RESTful architecture and HTTP methods.",
    "Gained hands-on experience with Express middleware and route handling.",
    "Learned deployment workflows and production debugging techniques.",
    "Built a fully functional CRUD application ready for real-world enhancements."
  ],
  "teamwork": [
    "Independently planned, developed, and deployed the entire application.",
    "Researched documentation and community resources to solve technical challenges.",
    "Practiced problem-solving through deployment and routing issue resolution.",
    "Managed project development lifecycle from implementation to production deployment."
  ]
}`,

  'education_&_leadership.tsx': `interface LeadershipNode {
  role: string;
  organization: string;
  contributions: string[];
}

const education = {
  institution: "SR University, Warangal",
  degree: "B.Tech – Computer Science Engineering (Data Science)",
  period: "2024 - 2028 (Expected)",
  relevantCoursework: [
    "Data Structures & Algorithms",
    "Database Management Systems (DBMS)",
    "Operating Systems",
    "Cloud Computing",
    "Machine Learning",
    "Natural Language Processing"
  ]
};

const leadershipAndResponsibility: LeadershipNode[] = [
  {
    role: "Vice Chair",
    organization: "Data Science Club",
    contributions: [
      "Strategic Coordination: Supported planning and coordination of data science activities.",
      "Peer Mentorship: Assisted peers in understanding analytics and visualization concepts.",
      "Practical Ingestion: Encouraged practical learning through datasets and mini projects.",
      "Ethical Governance: Promoted ethical and responsible use of AI tools within the club."
    ]
  }
];

export default { education, leadershipAndResponsibility };`,

  'contact.env': `SENDER_IDENTITY_NAME="Syed Nadirsha"
SENDER_CONTACT_EMAIL="nadirshasyed835@gmail.com"
SENDER_PHONE="7780605704"
GITHUB="https://github.com/Nadirsha-Syed"
LINKEDIN="www.linkedin.com/in/nadirsha-syed"`
}

export function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Ensure the directory exists
      const dir = path.dirname(DB_PATH)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      const data: DatabaseSchema = {
        files: defaultFiles,
        contents: defaultContents
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
      return data
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    const data = JSON.parse(raw) as DatabaseSchema
    
    let changed = false

    const sanitizePath = (p: string): string => {
      return p.split('/').map(part => part.replace(/\s+/g, '')).join('/')
    }

    const sanitizeNode = (node: FileNode) => {
      const oldPath = node.path
      const newPath = sanitizePath(node.path)
      if (oldPath !== newPath) {
        node.path = newPath
        node.name = node.name.replace(/\s+/g, '')
        node.id = node.id.replace(/\s+/g, '')
        changed = true
      }
      if (node.children) {
        node.children.forEach(sanitizeNode)
      }
    }

    data.files.forEach(sanitizeNode)

    const sanitizedContents: Record<string, string> = {}
    for (const [k, v] of Object.entries(data.contents)) {
      const cleanKey = sanitizePath(k)
      if (cleanKey !== k) {
        changed = true
      }
      sanitizedContents[cleanKey] = v
    }
    data.contents = sanitizedContents

    // Self-healing merge of new projects
    const projectsFolder = data.files.find(f => f.id === 'projects')
    if (projectsFolder && projectsFolder.children) {
      const hasCrudDash = projectsFolder.children.some(c => c.id === 'crud_dash')
      if (!hasCrudDash) {
        projectsFolder.children.push({
          id: 'crud_dash',
          name: 'crud_dash.json',
          type: 'file',
          path: 'projects/crud_dash.json',
          extension: 'json'
        })
        changed = true
      }
    }
    
    if (!('projects/crud_dash.json' in data.contents)) {
      data.contents['projects/crud_dash.json'] = defaultContents['projects/crud_dash.json']
      changed = true
    }

    if (changed) {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
    }

    return data
  } catch (error) {
    console.error('Failed to read database file', error)
    return {
      files: defaultFiles,
      contents: defaultContents
    }
  }
}

export function writeDb(data: DatabaseSchema): boolean {
  try {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Failed to write database file', error)
    return false
  }
}
