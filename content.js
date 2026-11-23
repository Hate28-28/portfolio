/*
  ============================================================
  THIS IS THE ONLY FILE YOU NEED TO EDIT TO UPDATE YOUR SITE.
  ============================================================
  - Add a project: copy one { ... } block inside "projects",
    paste it at the top of the list, and change the text.
  - Dates use "YYYY-MM" (e.g. "2027-03"). The site sorts by date
    on its own, so order here doesn't matter.
  - Keep the commas between blocks. Text goes inside "quotes".
*/

window.SITE = {
  name: "Mohamad Yassine",
  initials: "MY",
  headline: "I build things across software, hardware, VR and AI.",
  // The big statement under the top section (lights up word by word as you scroll)
  tagline: "I like knowing how things work all the way down, from the parts inside a desktop to the logic behind a chatbot.",
  intro:
    "IT student at Asia Pacific University. This page is a running log of what I've made and what I'm learning, updated as I go.",

  email: "Mohamad.yassine005@gmail.com",
  linkedin: "https://my.linkedin.com/in/mohamad-yassine-4a2b9a33a",
  cv: "Mohamad-Yassine-CV.pdf", // the PDF sits in the same folder as index.html

  about:
    "Most of my projects mix more than one field: a VR app that teaches PC assembly, an Arduino bin that opens itself, a diagnostic bot for hardware faults.",

  facts: [
    { label: "Based in", value: "Kuala Lumpur, Malaysia" },
    { label: "Also in", value: "Khobar, Saudi Arabia" },
    { label: "Languages", value: "English, Arabic" },
  ],

  // Each project "area" gets its own colour.
  // Add a new area here with any colour you like. Unknown areas get a colour automatically.
  areaColors: {
    "AI": "#3A7BFF",
    "Entrepreneurship": "#FFB020",
    "Embedded systems": "#2BE38A",
    "Virtual reality": "#C04BFF",
    "Web development": "#22D3EE",
  },

  // Jobs, internships, roles. Newest dates appear first.
  experience: [
    {
      role: "IT Technician Intern",
      org: "Alruqee Group, Khobar",
      start: "2026-12",
      end: "2027-02", // leave empty ("") while you're still there
    },
  ],

  education: [
    {
      title: "Diploma in Information Technology",
      org: "Asia Pacific University (APU), Malaysia",
      start: "2024-11",
      end: "2027",
      // Modules show as a dropdown under this entry, in groups.
      // Short lines shown under this entry
      highlights: [
        "Scored 98% on the networking skills assessment (IPv4 subnetting and router and switch security in Cisco Packet Tracer).",
      ],
      modules: [
        { semester: "Web and systems", items: ["Capstone Project (Trash2Cash)", "Responsive Web Design and Development", "Fundamentals of UI/UX Design"] },
        { semester: "Hardware, IoT and immersive tech", items: ["Introduction to Internet of Things", "Introduction to VR/AR and Metaverse"] },
        { semester: "Software engineering", items: ["Programming with Python", "Object Oriented Programming", "System Analysis and Design", "Database Management"] },
        { semester: "Networking and infrastructure", items: ["Networking Technologies", "Operating Systems", "Information Systems with Cloud Concepts"] },
        { semester: "AI and cybersecurity", items: ["Introduction to Artificial Intelligence", "Cyber Security and Forensics"] },
        { semester: "Foundations", items: ["Math and Statistics in Computing", "Algebra and Discrete Mathematics", "Academic Research Skills", "Digital Thinking and Innovation", "Fundamentals of Entrepreneurship", "Integrity and Anti Corruption"] },
      ],
    },
  ],

  // Your projects. Newest dates show first.
  // Optional: add  image: "photo.jpg"  (file next to index.html) or  link: "https://..."
  projects: [
    {
      title: "PC Hardware Troubleshooting Chatbot",
      area: "AI",
      date: "2026-09",
      summary:
        "A rule based chatbot built in Voiceflow that walks users through PC hardware faults step by step.",
      // "points" show as bullet points on the card
      points: [
        "Mapped fault symptoms into conditional decision trees that guide users through methodical hardware checks.",
        "Scoped clear diagnostic paths so non experts can isolate common hardware issues without hitting dead ends.",
        "Added automatic escalation when a problem needs a technician.",
      ],
      tags: ["Voiceflow", "Decision trees", "Hardware diagnostics"],
      link: "", // optional: a demo, GitHub or video URL
    },
    {
      title: "Trash2Cash Web App: Staff Module",
      area: "Web development",
      date: "2026", // capstone project; change to "YYYY-MM" if you want the exact month
      summary:
        "My part of our group capstone project: the Staff module of the Trash2Cash web platform.",
      points: [
        "Built the Staff module using HTML, CSS and JavaScript.",
        "Implemented workflows for reviewing user submissions and managing inventory.",
        "Worked with teammates to keep the staff interface in line with the platform's data flow.",
      ],
      tags: ["HTML", "CSS", "JavaScript", "Capstone project", "Group project"],
      link: "",
    },
    {
      title: "Mediclace Health Tech Venture",
      area: "Entrepreneurship",
      date: "2026-06",
      concept: true, // shows a "Concept" label so it isn't mistaken for a shipped product
      summary:
        "Developed the product features, financial framework and Business Model Canvas for a wearable health monitoring necklace with my group, and presented it.",
      tags: ["Business Model Canvas", "Financial framework", "Group project"],
      link: "",
    },
    {
      title: "Contactless Smart Garbage Disposal System",
      area: "Embedded systems",
      date: "2026-06",
      summary:
        "An automated contactless waste bin prototype built around an Arduino Uno R3.",
      points: [
        "Programmed the prototype in C++ with two ultrasonic sensors for more reliable detection than a single sensor.",
        "Controlled the lid with a micro servo motor, paired with status LEDs for clear visual feedback.",
        "Tested sensor response and actuation thresholds to keep opening and closing consistent.",
      ],
      tags: ["Arduino Uno R3", "C++", "Ultrasonic sensors", "Servo motor", "IoT"],
      link: "",
    },
    {
      title: "VR PC Assembly Training Simulator",
      area: "Virtual reality",
      date: "2026-05",
      summary:
        "A VR training prototype in Unity that teaches beginners how to assemble a PC, step by step.",
      points: [
        "Built the simulation with the XR Interaction Toolkit, using socket snapping so components click into place.",
        "Guided the assembly flow with world space UI canvases, audio cues and blue holographic guidance meshes.",
        "Structured the experience around beginner hardware understanding and clear spatial feedback.",
      ],
      tags: ["Unity", "XR Interaction Toolkit", "VR prototyping", "UX"],
      link: "",
    },
    {
      title: "Memory Hardware Concept",
      area: "Entrepreneurship",
      date: "2026-03",
      concept: true,
      summary:
        "Business model, brand identity and structural design for a wearable memory recording device assisted by AI.",
      tags: ["Brand identity", "Product design", "Business Model Canvas"],
      link: "",
    },
  ],

  toolkit: [
    {
      group: "Programming and web",
      items: ["Python", "Java", "C++", "PHP", "HTML", "CSS", "JavaScript", "MySQL (PDO transactions)"],
    },
    {
      group: "AI and software",
      items: ["Voiceflow", "Unity (XR Interaction Toolkit)", "Visual Studio Code", "Apache NetBeans", "Git"],
    },
    {
      group: "Networking and security",
      items: ["Cisco Packet Tracer", "IPv4 subnetting", "Router and switch security", "FTK Imager (digital forensics)"],
    },
    {
      group: "Systems and design",
      items: ["Hardware assembly and diagnostics", "UI/UX wireframing in Figma", "macOS Terminal"],
    },
    {
      group: "Productivity",
      items: ["Microsoft Word", "Microsoft Excel", "Microsoft PowerPoint"],
    },
  ],

  phones: [
    { label: "Malaysia", value: "+60 142421080" },
    { label: "Saudi Arabia", value: "+966 50 176 0179" },
  ],
};
