"use strict";
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Kamalakar Ponaka";
pres.title = "POD Starter Kit — AI-Native SDLC Harness";

// ── Palette ─────────────────────────────────────────────────────────────────
const C = {
  navyDark:  "0A1628",
  navyMid:   "1C3A5F",
  blue:      "0078D4",
  teal:      "00B4D8",
  white:     "FFFFFF",
  offWhite:  "F8FAFC",
  textDark:  "1E293B",
  textMuted: "64748B",
  green:     "10B981",
  amber:     "F59E0B",
  purple:    "6366F1",
  pink:      "EC4899",
};

const makeShadow = () => ({
  type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.10,
});

function card(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: fill || C.white },
    line: { color: "E2E8F0", width: 0.5 },
    shadow: makeShadow(),
  });
}

function topStripe(slide, color) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.07,
    fill: { color: color || C.blue }, line: { color: color || C.blue },
  });
}

function sectionLabel(slide, tag, title, sub, dur) {
  slide.background = { color: C.navyDark };
  topStripe(slide, C.blue);
  slide.addText(tag, {
    x: 0.55, y: 1.3, w: 9, h: 0.42,
    fontSize: 12, fontFace: "Calibri", color: C.teal,
    bold: true, charSpacing: 5, margin: 0,
  });
  slide.addText(title, {
    x: 0.55, y: 1.78, w: 9, h: 1.15,
    fontSize: 46, fontFace: "Calibri", color: C.white, bold: true, margin: 0,
  });
  slide.addText(sub, {
    x: 0.55, y: 3.0, w: 9, h: 0.45,
    fontSize: 17, fontFace: "Calibri", color: "7BA7C8", margin: 0,
  });
  if (dur) {
    slide.addText(dur, {
      x: 0.55, y: 3.6, w: 2, h: 0.32,
      fontSize: 12, fontFace: "Calibri", color: C.teal, margin: 0,
    });
  }
}

// ── Slide 1: Title ───────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navyDark };
  topStripe(s);
  // left accent bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0.07, w: 0.38, h: 5.555,
    fill: { color: C.blue }, line: { color: C.blue },
  });
  s.addText("DELL TECHNOLOGIES  ·  AI-NATIVE SDLC", {
    x: 0.65, y: 1.05, w: 9, h: 0.35,
    fontSize: 10, fontFace: "Calibri", color: C.teal,
    charSpacing: 4, margin: 0,
  });
  s.addText("POD Starter Kit", {
    x: 0.65, y: 1.5, w: 8.8, h: 1.35,
    fontSize: 52, fontFace: "Calibri", color: C.white, bold: true, margin: 0,
  });
  s.addText("AI-Native SDLC Harness  ·  Training Tuesday", {
    x: 0.65, y: 2.95, w: 8.8, h: 0.5,
    fontSize: 20, fontFace: "Calibri", color: "A8C7E8", margin: 0,
  });
  s.addText("Kamalakar Ponaka  ·  kamalakar.ponaka@dell.com", {
    x: 0.65, y: 4.95, w: 8, h: 0.32,
    fontSize: 11, fontFace: "Calibri", color: "4A6A8A", margin: 0,
  });
}

// ── Slide 2: Agenda ──────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("What You'll See Today", {
    x: 0.5, y: 0.28, w: 9, h: 0.65,
    fontSize: 32, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  s.addText("30 minutes  ·  Training Tuesday  ·  Questions welcome in chat throughout", {
    x: 0.5, y: 0.95, w: 9, h: 0.32,
    fontSize: 13, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });

  const boxes = [
    { num: "01", title: "Context",            dur: "3 min",  color: C.blue,   bullets: ["JIRA: 6 levels → 3 (Non-POD → POD)", "Git: CMDB-rooted URLs", "SpecKit → SDD migration path"] },
    { num: "02", title: "POD Lead Setup",     dur: "12 min", color: C.teal,   bullets: ["Install sdd-install CLI", "Live wizard with dummy-pod", "Real POD workspace + knowledge base"] },
    { num: "03", title: "Developer Delivery", dur: "15 min", color: C.purple, bullets: ["JIRA Spec → /sdlc → 3 checkpoints", "Autonomous implementation + MRs", "wrap-up: JIRA + Confluence"] },
  ];

  boxes.forEach((b, i) => {
    const x = 0.35 + i * 3.13;
    const y = 1.48;
    card(s, x, y, 2.93, 3.78);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.93, h: 0.06, fill: { color: b.color }, line: { color: b.color } });
    s.addText(b.num, {
      x: x + 0.15, y: y + 0.2, w: 0.7, h: 0.52,
      fontSize: 28, fontFace: "Calibri", color: b.color, bold: true, margin: 0,
    });
    s.addText(b.title, {
      x: x + 0.15, y: y + 0.75, w: 2.6, h: 0.42,
      fontSize: 16, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
    });
    // Duration pill
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.15, y: y + 1.22, w: 0.72, h: 0.27, fill: { color: b.color }, line: { color: b.color } });
    s.addText(b.dur, {
      x: x + 0.15, y: y + 1.22, w: 0.72, h: 0.27,
      fontSize: 10, fontFace: "Calibri", color: C.white, bold: true, align: "center", margin: 0,
    });
    const items = b.bullets.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < b.bullets.length - 1 } }));
    s.addText(items, {
      x: x + 0.15, y: y + 1.62, w: 2.62, h: 1.9,
      fontSize: 12, fontFace: "Calibri", color: C.textMuted, margin: 0, paraSpaceAfter: 7,
    });
  });
}

// ── Slide 3: JIRA Hierarchy ──────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("JIRA Issue Hierarchy: Simplified", {
    x: 0.5, y: 0.28, w: 9, h: 0.6,
    fontSize: 30, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  s.addText("Non-POD teams: 6 levels  →  POD teams: 3 levels", {
    x: 0.5, y: 0.88, w: 9, h: 0.32,
    fontSize: 14, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });

  // OLD card
  card(s, 0.38, 1.32, 4.15, 3.85);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.38, y: 1.32, w: 4.15, h: 0.06, fill: { color: "94A3B8" }, line: { color: "94A3B8" } });
  s.addText("NON-POD  (6 levels)", {
    x: 0.58, y: 1.42, w: 3.8, h: 0.38,
    fontSize: 13, fontFace: "Calibri", color: "64748B", bold: true, margin: 0,
  });
  const oldLevels = ["Theme", "Portfolio Epic", "Capability", "Epic", "Story / Task / Defect", "Sub-task"];
  oldLevels.forEach((lvl, i) => {
    const indent = i * 0.16;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.58 + indent, y: 1.97 + i * 0.46, w: 0.05, h: 0.32, fill: { color: "CBD5E1" }, line: { color: "CBD5E1" } });
    s.addText(lvl, {
      x: 0.73 + indent, y: 1.97 + i * 0.46, w: 3.6, h: 0.32,
      fontSize: 13, fontFace: "Calibri", color: C.textDark, margin: 0, valign: "middle",
    });
  });

  // Arrow
  s.addText("→", {
    x: 4.6, y: 2.9, w: 0.8, h: 0.5,
    fontSize: 24, fontFace: "Calibri", color: C.blue, align: "center", margin: 0,
  });

  // NEW card
  card(s, 5.5, 1.32, 4.15, 3.85);
  s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.32, w: 4.15, h: 0.06, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("POD  (3 levels)", {
    x: 5.7, y: 1.42, w: 3.8, h: 0.38,
    fontSize: 13, fontFace: "Calibri", color: C.blue, bold: true, margin: 0,
  });
  const newLevels = [
    { name: "Program",  who: "Portfolio / L5+",      color: C.blue },
    { name: "Feature",  who: "Feature Lead",          color: C.teal },
    { name: "Spec",     who: "POD Lead refines  ·  Developer runs /sdlc", color: C.green, badge: true },
  ];
  newLevels.forEach((lvl, i) => {
    const indent = i * 0.28;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.7 + indent, y: 2.08 + i * 0.82, w: 3.6 - indent, h: 0.62,
      fill: { color: lvl.color, transparency: 88 }, line: { color: lvl.color, width: 0.5 },
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.7 + indent, y: 2.08 + i * 0.82, w: 0.06, h: 0.62, fill: { color: lvl.color }, line: { color: lvl.color } });
    s.addText(lvl.name, {
      x: 5.85 + indent, y: 2.12 + i * 0.82, w: 1.6, h: 0.3,
      fontSize: 14, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
    });
    s.addText(lvl.who, {
      x: 5.85 + indent, y: 2.44 + i * 0.82, w: 3.3 - indent, h: 0.22,
      fontSize: 11, fontFace: "Calibri", color: C.textMuted, margin: 0,
    });
  });
  // /sdlc badge
  s.addShape(pres.shapes.RECTANGLE, { x: 5.98, y: 4.45, w: 1.3, h: 0.26, fill: { color: C.green, transparency: 80 }, line: { color: C.green, width: 0.5 } });
  s.addText("/sdlc targets this", {
    x: 5.98, y: 4.45, w: 1.3, h: 0.26,
    fontSize: 9, fontFace: "Calibri", color: C.green, bold: true, align: "center", margin: 0,
  });
}

// ── Slide 4: Git Restructure ──────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("Git Structure: CMDB-Rooted URLs", {
    x: 0.5, y: 0.28, w: 9, h: 0.55,
    fontSize: 30, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  const rationale = [
    { text: "Domain, POD group, and POD changes with every reorg — Git URL change breaks include services and config servers. ", options: {} },
    { text: "CMDB IDs have proper Application Lifecycle Management in ServiceNow; all audit and compliance activities are tied to them. ", options: {} },
    { text: "Code is a first-class asset, so repos are rooted there.", options: { bold: true, color: C.textDark } },
  ];
  s.addText(rationale, {
    x: 0.5, y: 0.83, w: 9.13, h: 0.78,
    fontSize: 12, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });

  // OLD
  card(s, 0.38, 1.72, 4.15, 2.4);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.38, y: 1.72, w: 4.15, h: 0.06, fill: { color: "94A3B8" }, line: { color: "94A3B8" } });
  s.addText("OLD  —  Deep namespace", { x: 0.58, y: 1.82, w: 3.8, h: 0.32, fontSize: 12, fontFace: "Calibri", color: "64748B", bold: true, margin: 0 });
  const oldCode = [
    { text: "gitlab.dell.com/", options: { breakLine: true } },
    { text: "  dfs/", options: { breakLine: true } },
    { text: "    pricing/", options: { breakLine: true } },
    { text: "      dfsmatrix/", options: { breakLine: true } },
    { text: "        matrix-pricing-transformation-api", options: {} },
  ];
  s.addText(oldCode, { x: 0.52, y: 2.25, w: 3.9, h: 1.8, fontSize: 11, fontFace: "Courier New", color: "475569", margin: 0 });

  // Arrow
  s.addText("→", { x: 4.6, y: 2.75, w: 0.8, h: 0.5, fontSize: 24, fontFace: "Calibri", color: C.blue, align: "center", margin: 0 });

  // NEW
  card(s, 5.5, 1.72, 4.15, 2.4);
  s.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: 1.72, w: 4.15, h: 0.06, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("NEW  —  Flat CMDB-rooted", { x: 5.7, y: 1.82, w: 3.8, h: 0.32, fontSize: 12, fontFace: "Calibri", color: C.blue, bold: true, margin: 0 });
  const newCode = [
    { text: "gitlab.dell.com/", options: { breakLine: true } },
    { text: "  1003390/", options: { breakLine: true } },
    { text: "    HIGHVALUEP/", options: { breakLine: true } },
    { text: "      ai.git", options: {} },
  ];
  s.addText(newCode, { x: 5.65, y: 2.25, w: 3.9, h: 1.5, fontSize: 11, fontFace: "Courier New", color: "475569", margin: 0 });

  // Example bar
  card(s, 0.38, 4.27, 9.25, 0.95);
  s.addText("Example:", { x: 0.58, y: 4.37, w: 1.1, h: 0.28, fontSize: 11, fontFace: "Calibri", color: C.textMuted, bold: true, margin: 0 });
  s.addText("https://gitlab.dell.com/1003390/HIGHVALUEP", {
    x: 1.75, y: 4.37, w: 7.7, h: 0.28,
    fontSize: 13, fontFace: "Courier New", color: C.blue, margin: 0,
  });
  s.addText("sdd-install reads the CMDB ID (appId) from the Taxonomy API and writes this automatically — developers never type a CMDB ID", {
    x: 0.58, y: 4.72, w: 9.0, h: 0.28,
    fontSize: 11, fontFace: "Calibri", color: C.textMuted, italic: true, margin: 0,
  });
}

// ── Slide 5: Section — Part 1 ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  sectionLabel(s, "PART 1", "POD Lead Setup", "Install  ·  Configure  ·  Generate Knowledge Base", "~12 minutes");
}

// ── Slide 6: Install CLI ──────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("Step 1  ·  Install the CLI", {
    x: 0.5, y: 0.28, w: 9, h: 0.6,
    fontSize: 30, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  // Code block
  s.addShape(pres.shapes.RECTANGLE, { x: 0.38, y: 1.05, w: 9.25, h: 1.55, fill: { color: C.navyDark }, line: { color: C.navyMid } });
  s.addText("PowerShell", { x: 0.55, y: 1.1, w: 1.4, h: 0.27, fontSize: 10, fontFace: "Calibri", color: C.teal, bold: true, margin: 0 });
  const installCmd = [
    { text: "uv tool install sdd-install-kit \\", options: { breakLine: true } },
    { text: "  --from git+ssh://git@gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit.git \\", options: { breakLine: true } },
    { text: "  --reinstall", options: {} },
  ];
  s.addText(installCmd, { x: 0.55, y: 1.42, w: 9.1, h: 1.05, fontSize: 13, fontFace: "Courier New", color: "7DD3FC", margin: 0 });

  // 3 fact cards
  const facts = [
    { icon: "⚡", title: "One command", body: "Works from PowerShell or WSL. Installs the sdd-install CLI globally via uv." },
    { icon: "🔁", title: "One-time per machine", body: "After install, run sdd-install for any new workspace. No repeat installs." },
    { icon: "🔑", title: "SSH failing?", body: "Swap git+ssh:// for git+https:// and use a GitLab PAT as the password." },
  ];
  facts.forEach((f, i) => {
    const x = 0.38 + i * 3.14;
    card(s, x, 2.78, 2.95, 2.45);
    s.addText(f.icon, { x: x + 0.18, y: 2.88, w: 0.55, h: 0.48, fontSize: 22, margin: 0 });
    s.addText(f.title, { x: x + 0.18, y: 3.4, w: 2.6, h: 0.35, fontSize: 14, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0 });
    s.addText(f.body, { x: x + 0.18, y: 3.82, w: 2.6, h: 1.18, fontSize: 12, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  });
}

// ── Slide 7: dummy-pod Wizard ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("Step 2a  ·  Run the Wizard — dummy-pod  (live)", {
    x: 0.5, y: 0.28, w: 9, h: 0.6,
    fontSize: 28, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  // Command
  s.addShape(pres.shapes.RECTANGLE, { x: 0.38, y: 1.02, w: 9.25, h: 0.62, fill: { color: C.navyDark }, line: { color: C.navyMid } });
  s.addText("sdd-install --workspace C:\\temp\\sdd-dummy", {
    x: 0.55, y: 1.13, w: 9.0, h: 0.38,
    fontSize: 15, fontFace: "Courier New", color: "7DD3FC", margin: 0,
  });
  // Table
  const hdr = [
    { text: "Prompt",    options: { bold: true, color: C.white, fill: { color: C.navyMid } } },
    { text: "Enter",     options: { bold: true, color: C.white, fill: { color: C.navyMid } } },
    { text: "Why",       options: { bold: true, color: C.white, fill: { color: C.navyMid } } },
  ];
  const rows = [
    hdr,
    ["POD slug",          "dummy-pod",    "Skips Taxonomy API — safe, no credentials needed"],
    ["Clone repos?",      "No",           "No live GitLab access required for the demo"],
    ["Install Windsurf?", "Yes",          "Writes 7 skills to .windsurf\\workflows\\"],
    ["Install Devin?",    "Yes",          "Writes same skills to .devin\\skills\\"],
    ["PATs (JIRA/GitLab)","Skip",         "Stored in local.config — gitignored, never committed"],
  ];
  s.addTable(rows, {
    x: 0.38, y: 1.78, w: 9.25, h: 2.55,
    colW: [2.1, 1.75, 5.4],
    border: { pt: 0.5, color: "E2E8F0" },
    fontSize: 12, fontFace: "Calibri", color: C.textDark,
    align: "left", valign: "middle",
  });
  // Result bar
  card(s, 0.38, 4.45, 9.25, 0.68);
  s.addText("✅  30 seconds later:", { x: 0.58, y: 4.56, w: 2.0, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.green, bold: true, margin: 0 });
  s.addText("ai\\pod-info.md (placeholder values)  ·  .windsurf\\workflows\\ (7 skills)  ·  .devin\\skills\\  ·  push defaults to No", {
    x: 2.65, y: 4.56, w: 6.82, h: 0.3,
    fontSize: 12, fontFace: "Calibri", color: C.textDark, margin: 0,
  });
}

// ── Slide 8: Real POD Workspace ───────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("Step 2b  ·  Real POD Workspace", {
    x: 0.5, y: 0.28, w: 9, h: 0.6,
    fontSize: 30, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  s.addText("One slug, one Taxonomy API call — the kit knows your CMDB ID, JIRA project, Git URL, and team", {
    x: 0.5, y: 0.9, w: 9, h: 0.32,
    fontSize: 13, fontFace: "Calibri", color: C.textMuted, italic: true, margin: 0,
  });

  // pod-info.md card
  card(s, 0.38, 1.33, 5.62, 3.88);
  s.addText("ai\\pod-info.md", { x: 0.58, y: 1.43, w: 3, h: 0.28, fontSize: 11, fontFace: "Calibri", color: C.textMuted, bold: true, margin: 0 });
  const podLines = [
    { text: "POD Namespace: dfs/pricing/dfsmatrix",           options: { breakLine: true } },
    { text: "Domain: Digital Financial Services",             options: { breakLine: true } },
    { text: "POD Name: High Value Pricing",                   options: { breakLine: true } },
    { text: "Git Parent URL: https://gitlab.dell.com/1003390/HIGHVALUEP", options: { breakLine: true } },
    { text: "Captured By: Ponaka, Kamalakar",                 options: { breakLine: true } },
    { text: "",                                               options: { breakLine: true } },
    { text: "CMDB ID: 1003390",                              options: { breakLine: true } },
    { text: "JIRA Project: HIGHVALUEP",                      options: { breakLine: true } },
    { text: "JIRA Project Link: https://jira.dell.com/projects/HIGHVALUEP", options: { breakLine: true } },
    { text: "POD Lead: Rafael.Alves1@dell.com",              options: {} },
  ];
  s.addText(podLines, { x: 0.52, y: 1.82, w: 5.35, h: 3.2, fontSize: 11, fontFace: "Courier New", color: "334155", margin: 0 });

  // Callouts
  const callouts = [
    { label: "CMDB-rooted Git URL",   body: "Written from Taxonomy appId — no manual construction",    color: C.blue },
    { label: "JIRA Project key",      body: "Skills open issues, post comments, transition status",    color: C.teal },
    { label: "POD Members",           body: "Reviewer assignments and notifications automatic",        color: C.purple },
    { label: "Push defaults to Yes",  body: "Unlike dummy-pod — real work goes to real GitLab",        color: C.green },
  ];
  callouts.forEach((c, i) => {
    const y = 1.33 + i * 0.97;
    s.addShape(pres.shapes.RECTANGLE, { x: 6.2, y, w: 0.06, h: 0.78, fill: { color: c.color }, line: { color: c.color } });
    s.addText(c.label, { x: 6.38, y: y + 0.05, w: 3.22, h: 0.3, fontSize: 13, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0 });
    s.addText(c.body, { x: 6.38, y: y + 0.38, w: 3.22, h: 0.32, fontSize: 11, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  });
}

// ── Slide 9: Knowledge Base ───────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("Step 3  ·  Generate the Knowledge Base", {
    x: 0.5, y: 0.28, w: 9, h: 0.6,
    fontSize: 30, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.38, y: 1.02, w: 9.25, h: 0.56, fill: { color: C.navyDark }, line: { color: C.navyMid } });
  s.addText("/create-pod-knowledge  (Windsurf)   |   devin run create-pod-knowledge", {
    x: 0.55, y: 1.11, w: 9.0, h: 0.35,
    fontSize: 13, fontFace: "Courier New", color: "7DD3FC", margin: 0,
  });
  s.addText("One-time per project · POD Lead runs this · Drop any docs into ai\\raw\\ first · Takes 5–10 min", {
    x: 0.5, y: 1.7, w: 9, h: 0.3,
    fontSize: 12, fontFace: "Calibri", color: C.textMuted, italic: true, margin: 0,
  });
  // 9 spec cards in 3×3
  const specs = [
    { name: "POD.md",              desc: "Executive 10-min read — purpose, entities, flows", accent: C.blue, dark: true },
    { name: "functional-spec.md",  desc: "Features, use cases, business rules" },
    { name: "technical-spec.md",   desc: "Architecture, modules, tech stack" },
    { name: "data-model-spec.md",  desc: "Entities, fields, indexes, ER diagrams" },
    { name: "api-spec.md",         desc: "Every REST endpoint with schemas" },
    { name: "integration-spec.md", desc: "Internal + external interfaces" },
    { name: "security-spec.md",    desc: "Auth, authz, data protection" },
    { name: "deployment-spec.md",  desc: "Build, CI/CD, infrastructure" },
    { name: "nfr-spec.md",         desc: "Performance, scalability SLAs" },
  ];
  specs.forEach((sp, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.38 + col * 3.14;
    const y = 2.12 + row * 1.05;
    const bg = sp.dark ? C.blue : C.white;
    const lineCol = sp.dark ? C.blue : "E2E8F0";
    const accent = sp.accent || C.blue;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.97, h: 0.93, fill: { color: bg }, line: { color: lineCol, width: 0.5 }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.05, h: 0.93, fill: { color: sp.dark ? "7DD3FC" : accent }, line: { color: sp.dark ? "7DD3FC" : accent } });
    s.addText(sp.name, { x: x + 0.14, y: y + 0.1, w: 2.73, h: 0.3, fontSize: 11, fontFace: "Courier New", color: sp.dark ? C.white : C.textDark, bold: sp.dark, margin: 0 });
    s.addText(sp.desc, { x: x + 0.14, y: y + 0.44, w: 2.73, h: 0.38, fontSize: 10, fontFace: "Calibri", color: sp.dark ? "BFD9F5" : C.textMuted, margin: 0 });
  });
}

// ── Slide 10: Section — Part 2 ────────────────────────────────────────────────
{
  const s = pres.addSlide();
  sectionLabel(s, "PART 2", "Developer: Feature Delivery", "JIRA Spec  →  3 Human Checkpoints  →  Merged Code  →  Confluence", "~15 minutes");
}

// ── Slide 11: One Command ─────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("One Command Chains It All", {
    x: 0.5, y: 0.28, w: 9, h: 0.6,
    fontSize: 30, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.38, y: 1.02, w: 9.25, h: 0.65, fill: { color: C.navyDark }, line: { color: C.navyMid } });
  s.addText("/sdlc PODT-9", {
    x: 0.55, y: 1.13, w: 9.0, h: 0.42,
    fontSize: 20, fontFace: "Courier New", color: "7DD3FC", margin: 0,
  });

  // Flow boxes
  const steps = [
    { cmd: "create-specs", out: "specs.md",          color: C.blue,   cp: "CHECKPOINT 1", cpDesc: "Review scope,\nFRs & ACs" },
    { cmd: "create-plan",  out: "plan.md",           color: C.teal,   cp: "CHECKPOINT 2", cpDesc: "Review files,\nTDD order" },
    { cmd: "execute",      out: "Code + MRs",        color: C.purple, cp: "CHECKPOINT 3", cpDesc: "Human MR\nreview in GitLab" },
    { cmd: "wrap-up",      out: "JIRA + Confluence", color: C.green,  cp: null,            cpDesc: null },
  ];
  steps.forEach((st, i) => {
    const x = 0.3 + i * 2.38;
    const y = 1.9;
    // Skill box
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.15, h: 1.02, fill: { color: st.color }, line: { color: st.color }, shadow: makeShadow() });
    s.addText(st.cmd, { x: x + 0.1, y: y + 0.1, w: 1.95, h: 0.38, fontSize: 14, fontFace: "Courier New", color: C.white, bold: true, margin: 0 });
    s.addText(st.out, { x: x + 0.1, y: y + 0.54, w: 1.95, h: 0.3, fontSize: 12, fontFace: "Calibri", color: "D1E8FF", margin: 0 });
    if (i < 3) s.addText("→", { x: x + 2.15, y: y + 0.3, w: 0.22, h: 0.38, fontSize: 16, color: "94A3B8", align: "center", margin: 0 });
    // Checkpoint
    if (st.cp) {
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.08, y: 3.1, w: 1.98, h: 1.8, fill: { color: st.color, transparency: 90 }, line: { color: st.color, width: 0.5 } });
      s.addText("◆", { x: x + 0.08, y: 3.15, w: 1.98, h: 0.3, fontSize: 12, fontFace: "Calibri", color: st.color, align: "center", margin: 0 });
      s.addText(st.cp, { x: x + 0.08, y: 3.48, w: 1.98, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.textDark, align: "center", bold: true, margin: 0 });
      s.addText(st.cpDesc, { x: x + 0.08, y: 3.88, w: 1.98, h: 0.72, fontSize: 11, fontFace: "Calibri", color: C.textMuted, align: "center", margin: 0 });
    }
  });
}

// ── Slide 12: Checkpoint 1 — specs.md ────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("Checkpoint 1  ·  Review specs.md", {
    x: 0.5, y: 0.28, w: 9, h: 0.6,
    fontSize: 28, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  s.addText("The AI fetches the JIRA Spec ticket, cross-references ai\\knowledge\\, and self-validates before showing you anything", {
    x: 0.5, y: 0.9, w: 9, h: 0.35,
    fontSize: 13, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });
  const items = [
    { title: "Functional Requirements", body: "Atomic, testable, traceable — one behavior per FR. Source column traces to JIRA or app-spec.", color: C.blue },
    { title: "Acceptance Criteria", body: "Preserved verbatim from JIRA. Tech-agnostic — no DB names, no framework terms.", color: C.teal },
    { title: "Scope Boundary", body: "Both In Scope and Out of Scope lists non-empty. Prevents drift at plan time.", color: C.purple },
    { title: "8-Point Self-Validation", body: "AI checks: no implementation leakage, all FRs testable, no orphan requirements — fixes before showing.", color: C.green },
    { title: "Open Questions (max 5)", body: "3-iteration clarification loop runs first. Only genuinely unresolvable items surface here.", color: C.amber },
    { title: "Your Action", body: "Read, edit specs.md directly if needed, then say 'continue'. Downstream respects the file, not JIRA.", color: C.pink },
  ];
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.38 + col * 4.75, y = 1.45 + row * 1.32;
    card(s, x, y, 4.5, 1.18);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.18, fill: { color: it.color }, line: { color: it.color } });
    s.addText(it.title, { x: x + 0.2, y: y + 0.12, w: 4.18, h: 0.32, fontSize: 13, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0 });
    s.addText(it.body,  { x: x + 0.2, y: y + 0.48, w: 4.18, h: 0.58, fontSize: 11, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  });
}

// ── Slide 13: Checkpoint 2 — plan.md ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("Checkpoint 2  ·  Review plan.md", {
    x: 0.5, y: 0.28, w: 9, h: 0.6,
    fontSize: 28, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  s.addText("Hard gate: all open questions must be resolved before plan generation starts", {
    x: 0.5, y: 0.9, w: 9, h: 0.35,
    fontSize: 13, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });
  const items = [
    { title: "Exact File Changes", body: "Actual paths, method names, approximate line numbers. No TBD, no placeholders.", color: C.teal },
    { title: "TDD Order", body: "Tests listed before the code they cover. AI writes red tests first, implements until green.", color: C.blue },
    { title: "Traceability Matrix", body: "FR-01 → clip-app/.../Handler.java → HandlerTest.java. Every requirement maps to a file and a test.", color: C.purple },
    { title: "CONSTITUTION Check", body: "Validates against your team's architectural rulebook. Hard violations block. Soft mismatches are warnings.", color: C.amber },
    { title: "Files NOT to Modify", body: "Explicit list of files the AI will leave untouched — prevents accidental scope creep.", color: C.pink },
    { title: "Your Action", body: "Review, approve, say 'execute'. The AI will not start writing code until you confirm.", color: C.green },
  ];
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.38 + col * 4.75, y = 1.45 + row * 1.32;
    card(s, x, y, 4.5, 1.18);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.18, fill: { color: it.color }, line: { color: it.color } });
    s.addText(it.title, { x: x + 0.2, y: y + 0.12, w: 4.18, h: 0.32, fontSize: 13, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0 });
    s.addText(it.body,  { x: x + 0.2, y: y + 0.48, w: 4.18, h: 0.58, fontSize: 11, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  });
}

// ── Slide 14: Execute — Autonomous ───────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("Between Checkpoints 2 and 3  ·  Fully Autonomous", {
    x: 0.5, y: 0.28, w: 9, h: 0.6,
    fontSize: 28, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  s.addText("No user input required. Take a meeting, review another ticket, have lunch.", {
    x: 0.5, y: 0.9, w: 9, h: 0.32,
    fontSize: 13, fontFace: "Calibri", color: C.textMuted, italic: true, margin: 0,
  });
  const phases = [
    { phase: "Pre-flight check",  what: "Scans spec and plan for unresolved questions, traceability gaps, placeholder text. Blocks if anything is unclear.", color: C.amber },
    { phase: "Branch + JIRA",    what: "Creates develop-PODT-9 across all impacted repos and ai/ repo. Transitions JIRA issue → In Development.", color: C.blue },
    { phase: "TDD cycle",        what: "Writes failing tests → implements until green → refactors. Full build runs after each cycle.", color: C.purple },
    { phase: "Self-review",      what: "Validates its own implementation against specs.md and plan.md. Fixes discrepancies before pushing.", color: C.teal },
    { phase: "Push + MRs",       what: "Commits, pushes, opens GitLab MRs targeting develop. One MR per impacted source project + one for ai/ repo.", color: C.green },
    { phase: "change-summary.md",what: "Written to ai/specs/PODT-9/ — MR links, traceability matrix, task checklist.", color: C.pink },
  ];
  phases.forEach((p, i) => {
    const y = 1.42 + i * 0.68;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.38, y, w: 0.06, h: 0.54, fill: { color: p.color }, line: { color: p.color } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.54, y, w: 9.08, h: 0.54, fill: { color: p.color, transparency: 93 }, line: { color: "E2E8F0", width: 0.5 } });
    s.addText(p.phase, { x: 0.68, y: y + 0.11, w: 1.7, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0 });
    s.addText(p.what,  { x: 2.45, y: y + 0.11, w: 7.0, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  });
}

// ── Slide 15: Checkpoint 3 + Wrap-up ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("Checkpoint 3  ·  MR Review  +  Wrap-Up", {
    x: 0.5, y: 0.28, w: 9, h: 0.6,
    fontSize: 28, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });

  // CP3 card
  card(s, 0.38, 1.08, 4.5, 2.32);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.38, y: 1.08, w: 4.5, h: 0.06, fill: { color: C.purple }, line: { color: C.purple } });
  s.addText("◆  CHECKPOINT 3 — Human Code Review", { x: 0.58, y: 1.18, w: 4.15, h: 0.35, fontSize: 12, fontFace: "Calibri", color: C.purple, bold: true, margin: 0 });
  s.addText("A teammate reviews the GitLab MR and adds inline comments.", { x: 0.58, y: 1.6, w: 4.15, h: 0.35, fontSize: 12, fontFace: "Calibri", color: C.textDark, margin: 0 });
  s.addText("Re-run /execute PODT-9 — the AI fetches each comment, implements fixes or replies with justification, builds, and pushes. MR thread updated automatically.", {
    x: 0.58, y: 2.02, w: 4.15, h: 1.18, fontSize: 12, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });

  // wrap-up card
  card(s, 5.15, 1.08, 4.5, 2.32);
  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 1.08, w: 4.5, h: 0.06, fill: { color: C.green }, line: { color: C.green } });
  s.addText("/wrap-up PODT-9", { x: 5.35, y: 1.18, w: 4.15, h: 0.35, fontSize: 12, fontFace: "Courier New", color: C.green, bold: true, margin: 0 });
  const wrapBullets = [
    "Verifies all MRs are merged",
    "Deletes feature branches",
    "Posts coding summary to JIRA",
    "Adds AI-Delivered label, transitions → Complete",
    "Publishes Confluence docs (mandatory)",
  ];
  const wrapItems = wrapBullets.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < wrapBullets.length - 1 } }));
  s.addText(wrapItems, { x: 5.35, y: 1.62, w: 4.15, h: 1.65, fontSize: 12, fontFace: "Calibri", color: C.textDark, margin: 0, paraSpaceAfter: 5 });

  // update-knowledge bar
  card(s, 0.38, 3.55, 9.27, 1.72);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.38, y: 3.55, w: 9.27, h: 0.06, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("Periodic (POD Lead, post-sprint)  —  /update-knowledge", { x: 0.58, y: 3.65, w: 8.9, h: 0.35, fontSize: 12, fontFace: "Courier New", color: C.blue, bold: true, margin: 0 });
  s.addText("Integrates every delivered Spec into ai\\knowledge\\. The next /sdlc run already knows what shipped last sprint — new patterns, data model changes, API endpoints. Knowledge compounds sprint over sprint.", {
    x: 0.58, y: 4.08, w: 8.9, h: 0.9, fontSize: 11, fontFace: "Calibri", color: C.textDark, margin: 0,
  });
}

// ── Slide 16: Full Flow Summary ───────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navyDark };
  topStripe(s);
  s.addText("The Full Flow", {
    x: 0.5, y: 0.22, w: 9, h: 0.58,
    fontSize: 30, fontFace: "Calibri", color: C.white, bold: true, margin: 0,
  });
  const flow = [
    { label: "JIRA Spec",         sub: "ticket",         color: "334155", textColor: "94A3B8", cp: null },
    { label: "create-specs",      sub: "specs.md",       color: C.blue,   textColor: C.white,  cp: "◆ CP1" },
    { label: "create-plan",       sub: "plan.md",        color: C.teal,   textColor: C.white,  cp: "◆ CP2" },
    { label: "execute",           sub: "Code + MRs",     color: C.purple, textColor: C.white,  cp: "◆ CP3" },
    { label: "wrap-up",           sub: "JIRA+Confluence",color: C.green,  textColor: C.white,  cp: null },
  ];
  flow.forEach((f, i) => {
    const x = 0.28 + i * 1.9;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.05, w: 1.65, h: 1.15, fill: { color: f.color }, line: { color: f.color }, shadow: makeShadow() });
    s.addText(f.label, { x: x + 0.08, y: 1.15, w: 1.48, h: 0.38, fontSize: 13, fontFace: "Calibri", color: f.textColor, bold: true, align: "center", margin: 0 });
    s.addText(f.sub,   { x: x + 0.08, y: 1.57, w: 1.48, h: 0.28, fontSize: 11, fontFace: "Calibri", color: f.textColor, align: "center", margin: 0 });
    if (f.cp) s.addText(f.cp, { x: x + 0.08, y: 2.28, w: 1.48, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.teal, align: "center", bold: true, margin: 0 });
    if (i < flow.length - 1) s.addText("→", { x: x + 1.65, y: 1.42, w: 0.24, h: 0.38, fontSize: 15, color: "475569", align: "center", margin: 0 });
  });
  // Stats
  const stats = [
    { num: "1",  label: "command to start" },
    { num: "3",  label: "human checkpoints" },
    { num: "7",  label: "AI skills included" },
    { num: "0",  label: "docs written manually" },
  ];
  stats.forEach((st, i) => {
    const x = 0.75 + i * 2.25;
    s.addText(st.num,   { x, y: 2.88, w: 1.5, h: 0.88, fontSize: 52, fontFace: "Calibri", color: C.teal, bold: true, align: "center", margin: 0 });
    s.addText(st.label, { x, y: 3.78, w: 1.5, h: 0.35, fontSize: 12, fontFace: "Calibri", color: "7BA7C8", align: "center", margin: 0 });
  });
}

// ── Slide 17: Demo Guide Suggestions ─────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("Suggested Changes to the Demo Guide", {
    x: 0.5, y: 0.28, w: 9, h: 0.6,
    fontSize: 28, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  s.addText("Six improvements for a tighter, more reliable 30-minute webinar", {
    x: 0.5, y: 0.9, w: 9, h: 0.32,
    fontSize: 13, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });
  const suggestions = [
    { icon: "⏱", title: "Add timestamps to section headings", body: "e.g. '## Part 1a (0:05–0:12)'. The header declares timing but sections don't — you'll need to count while presenting." },
    { icon: "🃏", title: "Move cheat sheet to the top", body: "It's on line 576 but it's your presenter prompt card. Place it right after the pre-flight checklist." },
    { icon: "📦", title: "Pin support DL in the chat at the start", body: "Post ai.native.sdlc.support@dell.com in Zoom chat before you begin — attendees can save it without waiting for the closing slide." },
    { icon: "🖥", title: "Specify screen share window + resolution", body: "'Share the Windsurf window at 1920×1080, crop taskbar.' Prevents the most common webinar setup failure." },
    { icon: "💬", title: "Take chat questions at checkpoints", body: "State explicitly: 'I'll read chat while the AI runs between checkpoints.' Natural pause; removes awkward silence." },
    { icon: "🔗", title: "Add Taxonomy Tool URL to pre-flight", body: "Mentioned in Accounts section without the URL inline. Attendees will ask for it in chat during the demo." },
  ];
  suggestions.forEach((sg, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.38 + col * 4.75, y = 1.42 + row * 1.3;
    card(s, x, y, 4.5, 1.18);
    s.addText(sg.icon + "  " + sg.title, { x: x + 0.2, y: y + 0.12, w: 4.18, h: 0.32, fontSize: 12, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0 });
    s.addText(sg.body,  { x: x + 0.2, y: y + 0.48, w: 4.18, h: 0.6,  fontSize: 11, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  });
}

// ── Slide 18: What's Coming Next ──────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };
  s.addText("What's Coming Next", {
    x: 0.5, y: 0.28, w: 9, h: 0.6,
    fontSize: 30, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
  });
  s.addText("Roadmap — driven by your feedback from this and prior sessions", {
    x: 0.5, y: 0.9, w: 9, h: 0.32,
    fontSize: 13, fontFace: "Calibri", color: C.textMuted, margin: 0,
  });

  const roadmap = [
    {
      icon: "🔐",
      title: "MCP Server with OAuth",
      tag: "Replaces PATs",
      body: "Drop per-developer JIRA & GitLab PATs. Auth flows through enterprise MCP — installer simplifies, secrets stop living in local.config.",
      color: C.blue,
    },
    {
      icon: "📊",
      title: "Prompt Telemetry & Security",
      tag: "Visibility + guardrails",
      body: "Capture prompt patterns across PODs to measure adoption, surface anti-patterns, and enforce safe-use policies — without leaking sensitive context.",
      color: C.teal,
    },
    {
      icon: "🛡",
      title: "Security Hooks Integration",
      tag: "Snyk + policy gates",
      body: "Wire Snyk SAST, SCA & IaC scans into the harness as automated hooks — block MR creation on High/Critical findings; no manual invocation.",
      color: C.purple,
    },
    {
      icon: "🗂",
      title: "AI Native SDLC Taxonomy Tool",
      tag: "Roles · Guilds · Hierarchy",
      body: "Add Program Lead & Feature Lead roles, clean up legacy fields, and model Guilds and Leadership Hierarchy so /sdlc resolves reviewers, approvers, and escalation paths automatically.",
      color: C.amber,
    },
    {
      icon: "🔁",
      title: "Continuous Refinement",
      tag: "Driven by you",
      body: "Every webinar, demo, and POD onboarding feeds the backlog. Skills, CONSTITUTION rules, and knowledge templates evolve sprint over sprint.",
      color: C.green,
    },
  ];

  // Stacked rows — 5 items
  roadmap.forEach((r, i) => {
    const y = 1.4 + i * 0.74;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.38, y, w: 0.06, h: 0.62, fill: { color: r.color }, line: { color: r.color } });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.54, y, w: 9.08, h: 0.62,
      fill: { color: r.color, transparency: 93 }, line: { color: "E2E8F0", width: 0.5 },
    });
    s.addText(r.icon, { x: 0.66, y: y + 0.13, w: 0.42, h: 0.4, fontSize: 17, margin: 0 });
    s.addText(r.title, {
      x: 1.12, y: y + 0.08, w: 2.95, h: 0.3,
      fontSize: 13, fontFace: "Calibri", color: C.textDark, bold: true, margin: 0,
    });
    // tag pill
    s.addShape(pres.shapes.RECTANGLE, {
      x: 1.12, y: y + 0.36, w: 2.05, h: 0.22,
      fill: { color: r.color, transparency: 82 }, line: { color: r.color, width: 0.5 },
    });
    s.addText(r.tag, {
      x: 1.12, y: y + 0.36, w: 2.05, h: 0.22,
      fontSize: 8, fontFace: "Calibri", color: r.color, bold: true, align: "center", margin: 0,
    });
    s.addText(r.body, {
      x: 4.25, y: y + 0.1, w: 5.3, h: 0.5,
      fontSize: 10.5, fontFace: "Calibri", color: C.textMuted, margin: 0, valign: "middle",
    });
  });

  // Footer note
  s.addText("Have a request? Drop it in chat or email ai.native.sdlc.support@dell.com", {
    x: 0.5, y: 5.18, w: 9, h: 0.3,
    fontSize: 11, fontFace: "Calibri", color: C.textMuted, italic: true, align: "center", margin: 0,
  });
}

// ── Slide 19: Q&A / Closing ───────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navyDark };
  topStripe(s);
  s.addText("Questions?", {
    x: 0.5, y: 0.95, w: 9, h: 1.05,
    fontSize: 58, fontFace: "Calibri", color: C.white, bold: true, margin: 0,
  });
  s.addText("Drop them in the Zoom chat — I'll work through them now", {
    x: 0.5, y: 2.08, w: 9, h: 0.45,
    fontSize: 19, fontFace: "Calibri", color: "7BA7C8", margin: 0,
  });
  const links = [
    { label: "POD Taxonomy Tool",           val: "https://ai-native.devops360-p3.kob.dell.com/SDD/Pods" },
    { label: "Support DL",                  val: "ai.native.sdlc.support@dell.com" },
    { label: "POD Starter Kit",             val: "https://gitlab.dell.com/ai-native-sdlc/sdd/pod-starter-kit" },
  ];
  links.forEach((lk, i) => {
    card(s, 0.5, 2.75 + i * 0.85, 9.05, 0.7);
    s.addText(lk.label, { x: 0.72, y: 2.85 + i * 0.85, w: 2.5, h: 0.38, fontSize: 13, fontFace: "Calibri", color: C.textMuted, bold: true, margin: 0 });
    s.addText(lk.val,   { x: 3.3,  y: 2.85 + i * 0.85, w: 6.1, h: 0.38, fontSize: 12, fontFace: "Courier New", color: C.blue, margin: 0 });
  });
}

// ── Write ─────────────────────────────────────────────────────────────────────
pres.writeFile({ fileName: "C:\\Users\\Kamalakar_Ponaka\\Downloads\\POD-Starter-Kit-Webinar.pptx" })
  .then(() => console.log("Done"))
  .catch(err => { console.error(err); process.exit(1); });
