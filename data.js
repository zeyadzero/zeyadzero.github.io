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
      url: "https://github.com/zeyadzero/Zeyad-Monitor", demo: ""
    },
    {
      name: "Signed APT repo on GitHub Pages", status: "released", category: ["devops", "linux", "automation"],
      image: "assets/projects/apt-repo.svg",
      description: "A fully automated, GPG-signed Debian repository: push a .deb, GitHub Actions rebuilds the index and publishes it. Users just apt install.",
      tech: ["githubactions", "git", "debian", "linux"], tags: ["APT", "GPG"],
      url: "https://github.com/zeyadzero/Zeyad-Monitor", demo: "https://zeyadzero.github.io/Zeyad-Monitor/"
    },
    {
      name: "Animated GitHub profile", status: "released", category: ["frontend", "automation"],
      image: "assets/projects/profile.svg",
      description: "A profile README made of generated, JavaScript-free animated SVGs: terminal, CI/CD pipeline, infrastructure map and a kubectl-style skills table.",
      tech: ["python", "github"], tags: ["SVG"],
      url: "https://github.com/zeyadzero/zeyadzero", demo: ""
    },
  ],

  // kind: "course" or "training".  certificate = image (or PDF) of your certificate - shown next to the item.
  courses: [],

  // Official certificates: the Validate button opens verifyUrl (Credly / vendor verification page).
  certificates: [],

  // Buttons that open your registered courses (e.g. Google Drive folders). Empty url = "soon".
  library: {
    title: "Course library",
    note: "The courses I am registered in, grouped by track. Each button opens the folder.",
    tracks: []
  },

  // CV files (PDF or image). Several versions are fine: visitors switch between them and can download each.
  cvs: [],

  // Volunteering, talks, community work. image = a photo from the activity (click to enlarge on the site).
  volunteering: [],

  // Photos from events, talks, hackathons... tag creates filter buttons.
  gallery: [],

  timeline: [
    { hash: "43bb072", date: "2026-11-18", title: "Published Zeyad Monitor 6.1", detail: "Merged the release updates and published the latest version." },
    { hash: "c7a7231", date: "2026-11-14", title: "Added project screenshots to the README and GitHub Pages", detail: "Made the project and its release page easier to review." },
    { hash: "1729d40", date: "2026-11-14", title: "Published the signed APT repository", detail: "Released Zeyad Monitor 6.0 through the Debian package repository." }
  ],

  links: {
    github: "https://github.com/zeyadzero",
    linkedin: "https://www.linkedin.com/in/zeyad-hossameldin/",
    credly: "",
    twitter: "",
    youtube: "",
    website: ""
  }
};
