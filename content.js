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
  },

  // Jobs, internships, roles. Newest dates appear first.
  experience: [
    {
      role: "IT Technician Intern",
      org: "Al Ruqi Group, Khobar",
      start: "2026-12",
      end: "2027-02", // leave empty ("") while you're still there
    },
  ],

  education: [
    {
      title: "Diploma in Information Technology",
      org: "Asia Pacific University (APU), Malaysia",
      start: "2024",
      end: "2027",
    },
  ],

  // Your projects. Newest dates show first.
  // Optional: add  image: "photo.jpg"  (file next to index.html) or  link: "https://..."
  projects: [
    {
      title: "PC Diagnostic Chatbot",
      area: "AI",
      date: "2026-09",
      summary:
        "An interactive decision tree workflow that walks users through desktop hardware faults, with scripted diagnostic branches and automatic escalation when a problem needs a technician.",
      tags: ["Voiceflow", "Decision tree workflow", "Hardware diagnostics"],
      link: "", // optional: a demo, GitHub or video URL
    },
    {
      title: "Mediclace Health Tech Venture",
      area: "Entrepreneurship",
      date: "2026-06",
      summary:
        "Developed the product features, financial framework and Business Model Canvas for a wearable health monitoring necklace with my group, and presented it.",
      tags: ["Business Model Canvas", "Financial framework", "Group project"],
      link: "",
    },
    {
      title: "Contactless Waste Management System",
      area: "Embedded systems",
      date: "2026-06",
      summary:
        "Programmed an Arduino Uno prototype in C++ that uses ultrasonic distance sensors and micro servo motors to open and run a waste container without touch.",
      tags: ["Arduino Uno", "C++", "Ultrasonic sensors", "Servo motors"],
      link: "",
    },
    {
      title: "VR PC Building Simulator",
      area: "Virtual reality",
      date: "2026-05",
      summary:
        "A Unity app for practical PC assembly training in VR, built with the XR Interaction Toolkit so users can pick up, place and connect real components.",
      tags: ["Unity", "XR Interaction Toolkit", "VR prototyping"],
      link: "",
    },
    {
      title: "Memory Hardware Concept",
      area: "Entrepreneurship",
      date: "2026-03",
      summary:
        "Business model, brand identity and structural design for a wearable memory recording device assisted by AI.",
      tags: ["Brand identity", "Product design", "Business Model Canvas"],
      link: "",
    },
  ],

  toolkit: [
    {
      group: "Programming and web",
      items: ["Java", "PHP", "HTML", "CSS", "JavaScript", "MySQL (PDO transactions)", "C++"],
    },
    {
      group: "AI and software",
      items: ["Voiceflow", "Unity (XR Interaction Toolkit)", "Visual Studio Code", "Apache NetBeans", "Git"],
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
