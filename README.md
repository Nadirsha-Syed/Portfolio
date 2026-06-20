# 💻 Syed Nadirsha's Developer Workstation (IDE-Notebook Portfolio)

An interactive, high-fidelity simulated developer workspace built using **Next.js**, **React**, and **Tailwind CSS**. It replicates a modern IDE interface (inspired by VS Code) to display Syed's academic trajectory, projects, and contact info in a format familiar to software engineers and technical recruiters.

🔗 **Live Link**: [https://syed-nadirsha.vercel.app](https://syed-nadirsha.vercel.app)

---

## 🛠️ Architecture & Core Features

- **Collapsible File Explorer & Workspace Tabs**: Mimics file system navigations, active buffers, and standard tab behaviors.
- **Dynamic Terminal Output**: Features simulated spin-up logs checking server states, databases, and microservice status sequences.
- **Live Sandbox Simulator**: A built-in sandbox that lets visitors mock API endpoints, test latencies, and check response payloads for full-stack projects.
- **Interactive Configuration Editor**: Displays contact links (`contact.env`) inside a custom dashboard replicating modern cloud settings panels (like Vercel and Render), including click-to-copy fields and redirection links.
- **Dark/Light Mode Theme Toggle**: Instant status-bar theme switching.

---

## 🚀 Getting Started (Local Development)

To run the IDE portfolio locally on your workstation, follow these steps:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) installed (v18.x or higher is recommended).

### 2. Clone the Repository
```bash
git clone https://github.com/Nadirsha-Syed/Portfolio.git
cd Portfolio
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the workstation.

---

## ☁️ Deployment Instructions

### Continuous Deployment via Git (Recommended)
This repository is configured with **Vercel GitHub Integration**. 
1. Push changes to the `main` branch:
   ```bash
   git add .
   git commit -m "feat: update readme"
   git push origin main
   ```
2. Vercel will automatically build and publish the changes to [syed-nadirsha.vercel.app](https://syed-nadirsha.vercel.app).

### Deployment via Vercel CLI
To manually deploy a production release from your terminal:
```bash
# Login to Vercel
npx vercel login

# Deploy a production release
npx vercel --prod
```

---

## 💡 Why Portfolio Deployment Instructions Matter

Including detailed local setup and deployment instructions directly in the `README.md` is standard practice for professional software repositories because:
1. **Demonstrates Technical Operations (DevOps) Competency**: Shows that the engineer designs repositories following industry best practices, detailing environment setups and CI/CD pipelines.
2. **Lowers Friction for Reviewers**: Engineering managers and tech recruiters can easily inspect the codebase configuration or pull it down locally to verify structure, unit tests, and performance profiles.
3. **Open Source Alignment**: Ensures that other developers looking to leverage or contribute to the portfolio pattern have a clear, step-by-step roadmap to run it.
