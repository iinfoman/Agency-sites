// Navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const pageTitle = document.getElementById('pageTitle');

function goTo(sectionId) {
  sections.forEach(s => s.classList.remove('active'));
  navItems.forEach(n => n.classList.remove('active'));
  const target = document.getElementById('section-' + sectionId);
  const navTarget = document.querySelector('[data-section="' + sectionId + '"]');
  if (target) target.classList.add('active');
  if (navTarget) navTarget.classList.add('active');
  pageTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
  if (window.innerWidth <= 768) closeSidebar();
}

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    goTo(item.dataset.section);
  });
});

// Mobile menu
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
function closeSidebar() { sidebar.classList.remove('open'); }

// Clock
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
updateClock();
setInterval(updateClock, 1000);

// Email Generator
function generateEmail() {
  const type = document.getElementById('emailType').value;
  const name = document.getElementById('emailRecipient').value || 'there';
  const details = document.getElementById('emailDetails').value || 'your project';
  const output = document.getElementById('emailOutput');

  const templates = {
    'Client Introduction': `Subject: Introduction — Let's Work Together\n\nHi ${name},\n\nI hope this message finds you well. My name is Henri, and I'm a web developer and digital solutions specialist.\n\nI came across your business and I believe I can help you with ${details}.\n\nI'd love to set up a quick call to discuss how we can work together. Please let me know a time that works for you.\n\nLooking forward to connecting!\n\nBest regards,\nHenri\niinfoman`,

    'Project Proposal': `Subject: Proposal — ${details}\n\nHi ${name},\n\nThank you for considering me for your project. I'm pleased to submit the following proposal for ${details}.\n\nScope of Work:\n- Initial consultation and requirements gathering\n- Design and development\n- Testing and revisions\n- Final delivery and handover\n\nTimeline: To be confirmed based on requirements\nDelivery: As discussed\n\nPlease review and let me know if you have any questions or adjustments.\n\nBest regards,\nHenri`,

    'Follow-up': `Subject: Following Up — ${details}\n\nHi ${name},\n\nI wanted to follow up on my previous message regarding ${details}.\n\nI understand you may be busy, but I'd love the opportunity to chat and see if there's a fit. Even a 10-minute call would be great.\n\nPlease feel free to reply or let me know a good time to connect.\n\nThanks,\nHenri`,

    'Invoice / Payment': `Subject: Invoice for ${details}\n\nHi ${name},\n\nI hope you're doing well. Please find attached the invoice for ${details}.\n\nPayment is due within 7 days of receipt. If you have any questions about the invoice, please don't hesitate to reach out.\n\nThank you for your business — it's a pleasure working with you!\n\nBest regards,\nHenri`,

    'Project Update': `Subject: Project Update — ${details}\n\nHi ${name},\n\nI wanted to give you a quick update on ${details}.\n\nProgress so far:\n✅ Completed: Initial setup and design\n🔄 In progress: Development and testing\n⏳ Upcoming: Final review and delivery\n\nEverything is on track. I'll be in touch with the next update soon.\n\nFeel free to reach out if you have any questions.\n\nBest,\nHenri`,

    'Cold Outreach': `Subject: Quick Question — ${details}\n\nHi ${name},\n\nI'll keep this short — I noticed ${details} and I think I can help.\n\nI build websites, apps, and digital tools for businesses like yours. I've helped clients improve their online presence and generate more leads.\n\nWould you be open to a 15-minute call this week?\n\nBest,\nHenri`
  };

  output.textContent = templates[type] || 'Email draft unavailable.';
  output.classList.add('visible');
}

// Document Templates
function loadTemplate(type) {
  const output = document.getElementById('docOutput');
  const printBtn = document.getElementById('printBtn');

  const templates = {
    contract: `CLIENT SERVICE AGREEMENT
═══════════════════════════════════════

Service Provider: Henri (iinfoman)
Client Name: ___________________________
Date: ___________________________

SERVICES
The Service Provider agrees to provide the following services:
_______________________________________________________________
_______________________________________________________________

PAYMENT
Total Amount: R ___________________________
Deposit (50%): R ___________________________  Due: _______________
Balance (50%): R ___________________________  Due: On completion

TIMELINE
Project Start Date: ___________________________
Estimated Completion: ___________________________

REVISIONS
This agreement includes ___ rounds of revisions.
Additional revisions will be billed at R___/hour.

OWNERSHIP
Upon full payment, the client owns all final deliverables.

SIGNATURES
Service Provider: ___________________________  Date: ___________
Client: ___________________________  Date: ___________`,

    proposal: `PROJECT PROPOSAL
═══════════════════════════════════════

Prepared by: Henri (iinfoman)
Prepared for: ___________________________
Date: ___________________________
Project: ___________________________

PROJECT OVERVIEW
_______________________________________________________________
_______________________________________________________________

SCOPE OF WORK
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

DELIVERABLES
• _______________________________________________________________
• _______________________________________________________________

TIMELINE
Phase 1: ___________________________ (__ days)
Phase 2: ___________________________ (__ days)
Phase 3: ___________________________ (__ days)

INVESTMENT
Total: R ___________________________
Payment Terms: 50% deposit, 50% on completion

This proposal is valid for 14 days from the date above.`,

    invoice: `INVOICE
═══════════════════════════════════════

From: Henri (iinfoman)
       Email: iinfoworks@gmail.com

To: ___________________________
    ___________________________

Invoice #: ___________________________
Date: ___________________________
Due Date: ___________________________

SERVICES
─────────────────────────────────────
Description                    Amount
─────────────────────────────────────
___________________________    R _______
___________________________    R _______
___________________________    R _______
─────────────────────────────────────
TOTAL                          R _______

PAYMENT DETAILS
Bank: ___________________________
Account Name: ___________________________
Account Number: ___________________________

Thank you for your business!`,

    brief: `PROJECT BRIEF
═══════════════════════════════════════

Client Name: ___________________________
Business Name: ___________________________
Date: ___________________________

WHAT DO YOU NEED?
_______________________________________________________________
_______________________________________________________________

WHO IS YOUR TARGET AUDIENCE?
_______________________________________________________________

WHAT PAGES / FEATURES DO YOU NEED?
☐ Home   ☐ About   ☐ Services   ☐ Contact   ☐ Other: _______

DESIGN PREFERENCES
Colors: ___________________________
Style: ☐ Modern  ☐ Minimal  ☐ Bold  ☐ Corporate  ☐ Creative
Examples (websites you like): ___________________________

CONTENT
Do you have a logo? ☐ Yes  ☐ No
Do you have copy/text? ☐ Yes  ☐ No  ☐ Need help with it

TIMELINE & BUDGET
Deadline: ___________________________
Budget: R ___________________________

ADDITIONAL NOTES
_______________________________________________________________`
  };

  output.textContent = templates[type] || '';
  output.classList.add('visible');
  printBtn.style.display = 'inline-block';
}

// Projects
let projects = JSON.parse(localStorage.getItem('ah-projects') || '[]');

function renderProjects() {
  const list = document.getElementById('projectList');
  list.innerHTML = '';
  if (projects.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">No projects yet. Add your first one above.</p>';
    return;
  }
  projects.forEach((p, i) => {
    const statusClass = 'status-' + p.status.replace(' ', '-');
    list.innerHTML += `
      <div class="project-item">
        <span style="flex:1;font-weight:500">${p.name}</span>
        <span class="status-badge ${statusClass}">${p.status}</span>
        <button class="remove-btn" onclick="removeProject(${i})">×</button>
      </div>`;
  });
}

function addProject() {
  const name = document.getElementById('projectName').value.trim();
  const status = document.getElementById('projectStatus').value;
  if (!name) return;
  projects.unshift({ name, status });
  localStorage.setItem('ah-projects', JSON.stringify(projects));
  document.getElementById('projectName').value = '';
  renderProjects();
}

function removeProject(i) {
  projects.splice(i, 1);
  localStorage.setItem('ah-projects', JSON.stringify(projects));
  renderProjects();
}

renderProjects();

// Tasks
let tasks = JSON.parse(localStorage.getItem('ah-tasks') || '[]');

function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  if (tasks.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:13px;padding:12px 0">No tasks yet. Add your first one above.</p>';
    return;
  }
  tasks.forEach((t, i) => {
    const priorityClass = 'priority-' + t.priority;
    list.innerHTML += `
      <div class="task-item">
        <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${i})" />
        <span class="${t.done ? 'done' : ''}">${t.text}</span>
        <span class="priority-badge ${priorityClass}">${t.priority}</span>
        <button class="remove-btn" onclick="removeTask(${i})">×</button>
      </div>`;
  });
}

function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  const priority = document.getElementById('taskPriority').value;
  if (!text) return;
  tasks.unshift({ text, priority, done: false });
  localStorage.setItem('ah-tasks', JSON.stringify(tasks));
  document.getElementById('taskInput').value = '';
  renderTasks();
}

function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  localStorage.setItem('ah-tasks', JSON.stringify(tasks));
  renderTasks();
}

function removeTask(i) {
  tasks.splice(i, 1);
  localStorage.setItem('ah-tasks', JSON.stringify(tasks));
  renderTasks();
}

renderTasks();
