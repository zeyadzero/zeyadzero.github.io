// ============================================================================
//  YOUR PORTFOLIO DATA.  Easiest way to change it: open  editor.html  (forms + live
//  preview), then press "Download data.js" and replace this file.
//  You can also edit this file by hand. Items with  sample: true  show a SAMPLE
//  ribbon - delete them (or set sample: false) when you add your own.
//  Images/PDFs: copy the files into the assets/ folder and write their path here.
// ============================================================================
window.PROFILE = {
  name: "Zeyad Hossam",
  handle: "zeyad",
  host: "devops",
  roles: ["DevOps Engineer", "Cloud Engineer", "Backend Developer", "IT Specialist"],
  tagline: "I automate infrastructure, ship reliable services and keep production quietly boring.",
  email: "",
  availability: "Open to opportunities",
  photo: "",
  photoAlt: "Portrait of Zeyad Hossam",

  about: [
    "I work across infrastructure, cloud and backend: the pipelines, packages and services that keep software shipping and systems boring in the best way.",
    "I live on Linux (Linux Mint daily, with Android apps running in Waydroid on Weston), automate everything that repeats, and publish what I build."
  ],
  facts: [
    ["Role", "DevOps / Cloud / Backend / IT"],
    ["OS", "Linux Mint (Cinnamon)"],
    ["Focus", "Automation, CI/CD, infrastructure"],
    ["Shell", "bash"],
    ["Packaging", "Debian packages + signed APT repo"],
    ["Status", "building in public"]
  ],

  experience: [
    {
      role: "DevOps & Backend Engineer (self-directed)",
      company: "Personal projects and open source",
      location: "",
      period: "2026 - Present",
      logo: "",
      points: [
        "Built and released Zeyad Monitor, a Python/GTK system monitor with Waydroid awareness, packaged as a .deb and an AppImage.",
        "Automated a GPG-signed APT repository on GitHub Pages with GitHub Actions: push a .deb and users get it with apt upgrade.",
        "Run Android apps in Waydroid on Weston and integrate them with Linux tooling."
      ],
      tags: ["Python", "GitHub Actions", "Debian packaging", "Linux"]
    }
  ],

  skills: [
    { group: "os", items: [
      { name: "Linux", level: "running", note: "Daily driver, administration, troubleshooting" },
      { name: "Bash", level: "running", note: "Automation and glue scripts" },
      { name: "Networking", level: "running", note: "DNS, routing, firewalls, debugging" },
      { name: "systemd", level: "running", note: "Services, timers, journald" }
    ]},
    { group: "devops", items: [
      { name: "Git", level: "running", note: "Branching, reviews, release flow" },
      { name: "GitHub Actions", level: "running", note: "CI/CD, automated publishing" },
      { name: "Docker", level: "running", note: "Images, compose, registries" },
      { name: "Kubernetes", level: "learning", note: "Workloads, services, ingress" },
      { name: "Terraform", level: "learning", note: "Infrastructure as code" },
      { name: "Ansible", level: "learning", note: "Configuration management" }
    ]},
    { group: "cloud", items: [
      { name: "AWS", level: "learning", note: "Compute, networking, storage" },
      { name: "Monitoring", level: "running", note: "Metrics, logs, alerting" }
    ]},
    { group: "backend", items: [
      { name: "Python", level: "running", note: "Services, tools, desktop apps (GTK)" },
      { name: "REST APIs", level: "running", note: "Design and integration" },
      { name: "PostgreSQL", level: "learning", note: "Schema design, queries" }
    ]}
  ],

  // Project filter buttons. A project can belong to several categories (ids below).
  categories: [
    { id: "devops", label: "DevOps" }, { id: "backend", label: "Backend" }, { id: "frontend", label: "Frontend" },
    { id: "cloud", label: "Cloud" }, { id: "linux", label: "Linux" }, { id: "program", label: "Programs" },
    { id: "web", label: "Websites" }, { id: "automation", label: "Automation" }
  ],

  // tech = technology icons (examples: terraform aws jenkins docker kubernetes python linux git github-actions
  //        nginx postgresql ansible bash javascript react nodejs prometheus grafana ... see editor for the full list)
  // url = source code / repo link.  demo = live demo or website link (optional).
  projects: [
    {
      name: "Zeyad Monitor", status: "released", category: ["linux", "program"],
      image: "assets/projects/zeyad-monitor.svg",
      description: "RAM / CPU / GPU monitor for Linux: per-app usage with logos, a panel indicator, Waydroid apps with real names, and a package + dependency explorer.",
      tech: ["python", "gtk", "linux", "debian"], tags: ["GTK3", "Waydroid"],
      url: "https://github.com/YOUR-GITHUB-USERNAME/zeyad-monitor", demo: ""
    },
    {
      name: "Signed APT repo on GitHub Pages", status: "released", category: ["devops", "linux", "automation"],
      image: "assets/projects/apt-repo.svg",
      description: "A fully automated, GPG-signed Debian repository: push a .deb, GitHub Actions rebuilds the index and publishes it. Users just apt install.",
      tech: ["githubactions", "git", "debian", "linux"], tags: ["APT", "GPG"],
      url: "https://github.com/YOUR-GITHUB-USERNAME/zeyad-monitor-repo", demo: ""
    },
    {
      name: "Animated GitHub profile", status: "released", category: ["frontend", "automation"],
      image: "assets/projects/profile.svg",
      description: "A profile README made of generated, JavaScript-free animated SVGs: terminal, CI/CD pipeline, infrastructure map and a kubectl-style skills table.",
      tech: ["python", "github"], tags: ["SVG"],
      url: "https://github.com/YOUR-GITHUB-USERNAME", demo: ""
    },
    {
      name: "Cloud infrastructure with Terraform", status: "in progress", category: ["cloud", "devops"], sample: true,
      image: "assets/samples/project-cloud.svg",
      description: "Sample project: VPC, load balancer and an autoscaling group described as code and deployed through a Jenkins pipeline.",
      tech: ["terraform", "aws", "jenkins", "docker"], tags: ["IaC"],
      url: "", demo: "https://example.com/demo"
    },
    {
      name: "Deployments REST API", status: "released", category: ["backend"], sample: true,
      image: "assets/samples/project-api.svg",
      description: "Sample project: a typed REST API for servers and deployments with PostgreSQL, tests and a containerised release.",
      tech: ["python", "fastapi", "postgresql", "docker", "nginx"], tags: ["REST"],
      url: "https://example.com/source", demo: "https://example.com/api-docs"
    },
    {
      name: "Status page website", status: "released", category: ["frontend", "web"], sample: true,
      image: "assets/samples/project-web.svg",
      description: "Sample project: a fast static status page with a live demo, built with modern HTML, CSS and JavaScript.",
      tech: ["html5", "css3", "javascript", "react"], tags: ["Web"],
      url: "", demo: "https://example.com"
    }
  ],

  // kind: "course" or "training".  certificate = image (or PDF) of your certificate - shown next to the item.
  courses: [
    { title: "DevOps Foundations", provider: "Sample Academy", kind: "course", date: "2025", duration: "40 hours",
      topics: ["CI/CD", "Docker", "Git"], certificate: "assets/samples/cert-devops.svg", verifyUrl: "", sample: true },
    { title: "Cloud Practitioner Essentials", provider: "Sample Cloud Training", kind: "training", date: "2025", duration: "16 hours",
      topics: ["AWS", "Networking", "Security"], certificate: "assets/samples/cert-cloud.svg", verifyUrl: "https://example.com/verify", sample: true },
    { title: "Linux System Administration", provider: "Sample Institute", kind: "course", date: "2024", duration: "60 hours",
      topics: ["Linux", "Shell", "Services"], certificate: "assets/samples/cert-linux.svg", verifyUrl: "", sample: true }
  ],

  // Official certificates: the Validate button opens verifyUrl (Credly / vendor verification page).
  certificates: [
    { title: "DevOps Foundations", issuer: "Sample Academy", date: "2025", credentialId: "SAMPLE-0000-0000",
      image: "assets/samples/cert-devops.svg", verifyUrl: "https://example.com/verify/devops", sample: true },
    { title: "Cloud Practitioner Essentials", issuer: "Sample Cloud Training", date: "2025", credentialId: "SAMPLE-1111-2222",
      image: "assets/samples/cert-cloud.svg", verifyUrl: "https://example.com/verify/cloud", sample: true }
  ],

  // Buttons that open your registered courses (e.g. Google Drive folders). Empty url = "soon".
  library: {
    title: "Course library",
    note: "The courses I am registered in, grouped by track. Each button opens the folder.",
    tracks: [
      { label: "DevOps", url: "", tech: "docker" }, { label: "Backend", url: "", tech: "python" },
      { label: "Frontend", url: "", tech: "javascript" }, { label: "System Admin", url: "", tech: "linux" },
      { label: "IT Support", url: "", tech: "windows" }, { label: "Cloud", url: "", tech: "aws" }
    ]
  },

  // CV files (PDF or image). Several versions are fine: visitors switch between them and can download each.
  cvs: [
    { label: "DevOps CV", file: "assets/cv/sample-devops-cv.pdf", updated: "2026", sample: true },
    { label: "Backend CV", file: "assets/cv/sample-backend-cv.pdf", updated: "2026", sample: true },
    { label: "System Admin CV", file: "assets/cv/sample-sysadmin-cv.pdf", updated: "2026", sample: true }
  ],

  // Volunteering, talks, community work. image = a photo from the activity (click to enlarge on the site).
  volunteering: [
    { role: "Volunteer organizer", organization: "Sample Tech Meetup", period: "2025",
      description: "Sample: helped run monthly DevOps meetups: venue, speakers and live streaming.", tags: ["Community", "Events"],
      image: "assets/samples/photo-3.svg", link: "", sample: true },
    { role: "Speaker", organization: "Sample DevOps Day", period: "2025",
      description: "Sample: a 30-minute talk about automating releases with CI/CD.", tags: ["Talk", "CI/CD"],
      image: "assets/samples/photo-1.svg", link: "https://example.com/talk", sample: true }
  ],

  // Photos from events, talks, hackathons... tag creates filter buttons.
  gallery: [
    { src: "assets/samples/photo-1.svg", caption: "Speaking on stage", tag: "Speaker", sample: true },
    { src: "assets/samples/photo-2.svg", caption: "Presenting a talk", tag: "Speaker", sample: true },
    { src: "assets/samples/photo-3.svg", caption: "Tech event", tag: "Events", sample: true },
    { src: "assets/samples/photo-4.svg", caption: "Hackathon team", tag: "Events", sample: true }
  ],

  timeline: [
    { hash: "c0ffee1", date: "2026", title: "Published a signed APT repository on GitHub Pages", detail: "Automated with GitHub Actions: push a .deb and users get it with apt upgrade." },
    { hash: "9a1b2c3", date: "2026", title: "Released Zeyad Monitor 6.0", detail: "Python + GTK3 monitor with Waydroid awareness, a package explorer and a panel indicator." },
    { hash: "7d4e5f6", date: "2026", title: "Set up Android apps in Waydroid on Weston", detail: "Containerised Android on a Linux desktop, wired into the system tooling." },
    { hash: "0a0a0a0", date: "next", title: "Add your next milestone here", detail: "Edit the timeline in the editor." }
  ],

  links: {
    github: "https://github.com/YOUR-GITHUB-USERNAME",
    linkedin: "",
    credly: "https://www.credly.com/users/YOUR-NAME",
    twitter: "",
    youtube: "",
    website: ""
  }
};
