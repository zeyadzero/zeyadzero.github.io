
// ============================================================================
//  Zeyad Hossameldeen Mahmoud - Personal Portfolio
// ============================================================================
window.PROFILE = {
  name: "Eng. Zeyad Hossameldeen Mahmoud",
  handle: "zeyad",
  host: "devops",

  roles: [
    "DevOps Engineer",
    "System Administrator",
    "Linux Engineer",
    "IT Specialist"
  ],

  tagline: "Building, automating and maintaining reliable Linux infrastructure, cloud environments and software delivery workflows.",

  email: "zeyadhossameldeen0@gmail.com",
  availability: "Open to opportunities",

  about: [
    "I'm a DevOps and IT enthusiast focused on Linux administration, infrastructure automation, cloud technologies and CI/CD. I enjoy building practical solutions that simplify system management and software delivery.",
    "I work with Linux, Docker, GitHub Actions and monitoring tools, and continuously develop my skills in AWS, Kubernetes, Ansible and infrastructure as code. I also build and publish open-source projects."
  ],

  facts: [
    ["Role", "DevOps / System Administration / IT"],
    ["Education", "BIS - Modern Academy, 2025"],
    ["OS", "Linux Mint / Linux"],
    ["Focus", "Linux, Automation, CI/CD, Cloud"],
    ["Shell", "Bash"],
    ["Projects", "Open-source tools + APT repository"]
  ],

  skills: [
    {
      group: "os",
      items: [
        { name: "Linux", level: "running", note: "Daily usage, system administration and troubleshooting" },
        { name: "Bash", level: "running", note: "Shell scripting and automation" },
        { name: "Networking", level: "running", note: "DNS, routing, firewalls and troubleshooting" },
        { name: "systemd", level: "running", note: "Services, timers and journal logs" },
        { name: "Windows Server", level: "learning", note: "System administration and infrastructure" }
      ]
    },

    {
      group: "devops",
      items: [
        { name: "Git", level: "running", note: "Version control and repository management" },
        { name: "GitHub Actions", level: "running", note: "CI/CD and automated repository publishing" },
        { name: "Docker", level: "running", note: "Containers, images and Docker Compose" },
        { name: "Kubernetes", level: "learning", note: "Cluster administration and workloads" },
        { name: "Ansible", level: "learning", note: "Configuration management and automation" },
        { name: "Terraform", level: "learning", note: "Infrastructure as Code" },
        { name: "OpenShift", level: "learning", note: "Container platform and Kubernetes ecosystem" }
      ]
    },

    {
      group: "cloud",
      items: [
        { name: "AWS", level: "learning", note: "Cloud infrastructure, compute, networking and storage" },
        { name: "Prometheus", level: "learning", note: "Metrics collection and monitoring" },
        { name: "Grafana", level: "learning", note: "Dashboards and infrastructure visualization" },
        { name: "Monitoring", level: "running", note: "System resource monitoring and troubleshooting" }
      ]
    },

    {
      group: "backend",
      items: [
        { name: "Python", level: "running", note: "Automation scripts and Linux desktop applications" },
        { name: "C#", level: "running", note: ".NET development and backend applications" },
        { name: "ASP.NET Core", level: "running", note: "Web APIs and backend development" },
        { name: "REST APIs", level: "running", note: "API development and integration" },
        { name: "SQL Server", level: "running", note: "Relational databases and SQL queries" }
      ]
    }
  ],

  projects: [
    {
      name: "Zeyad Monitor",
      status: "released",
      description: "An open-source Linux system monitor featuring per-application RAM, CPU and GPU usage, a panel indicator, Waydroid integration, and a package and dependency explorer.",
      tags: ["Python", "GTK3", "Linux", "Waydroid", "Debian"],
      url: "https://github.com/zeyadzero/Zeyad-Monitor"
    },

    {
      name: "Zeyad Public APT Repository",
      status: "released",
      description: "A public GPG-signed Debian APT repository hosted on GitHub Pages, with automated package indexing and publishing through GitHub Actions.",
      tags: ["Debian", "APT", "GPG", "GitHub Actions", "CI/CD"],
      url: "https://zeyadzero.github.io/Zeyad-Monitor/"
    },

    {
      name: "GitHub Profile & DevOps Portfolio",
      status: "released",
      description: "A customized GitHub profile showcasing technical skills, automation projects, infrastructure interests and open-source contributions.",
      tags: ["GitHub", "SVG", "Python", "Automation"],
      url: "https://github.com/zeyadzero"
    }
  ],

  timeline: [
    {
      hash: "c0ffee1",
      date: "2026",
      title: "Published a public signed APT repository",
      detail: "Built a GPG-signed Debian repository hosted on GitHub Pages with automated publishing."
    },
    {
      hash: "9a1b2c3",
      date: "2026",
      title: "Released Zeyad Monitor 6.0",
      detail: "Developed a Linux monitoring application with resource tracking, Waydroid support and package exploration."
    },
    {
      hash: "7d4e5f6",
      date: "2025",
      title: "Graduated in Business Information Systems",
      detail: "Graduated from Modern Academy with an Excellent grade."
    }
  ],

  links: {
    github: "https://github.com/zeyadzero",
    linkedin: "https://www.linkedin.com/in/zeyad-hossameldin/",
    twitter: "",
    website: ""
  }
};

