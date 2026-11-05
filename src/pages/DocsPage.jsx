import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    id: 'overview',
    icon: '⚡',
    title: 'Overview',
    content: [
      {
        type: 'intro',
        text: 'Interview AI is a real-time AI assistant that listens to your interview, transcribes questions, and streams answers — invisible to the interviewer and undetectable by screen share.',
      },
      {
        type: 'apps',
        items: [
          { name: 'Windows Overlay', icon: '🖥', desc: 'Transparent overlay that sits above Zoom/Teams. Invisible to screen capture.' },
          { name: 'Mobile App', icon: '📱', desc: 'Companion app for call listening, gaze tracking, and AI answers on your phone.' },
          { name: 'Web Admin', icon: '🌐', desc: 'Manage sessions, upload resume, configure training context.' },
        ],
      },
    ],
  },
  {
    id: 'shortcuts',
    icon: '⌨',
    title: 'Keyboard Shortcuts',
    content: [
      {
        type: 'subtitle', text: '🌐 Global Shortcuts — fire from ANY focused window (VS Code, Zoom, Chrome, etc.)',
      },
      {
        type: 'table',
        headers: ['Shortcut', 'Action', 'When to use'],
        rows: [
          ['Ctrl+Shift+H', 'Show / hide overlay', 'Toggle visibility without touching the mouse'],
          ['Ctrl+Shift+L', 'Lock (click-through on/off)', 'Let clicks pass through overlay to Zoom / IDE'],
          ['Ctrl+Shift+S', 'Screenshot → AI answer', 'Interviewer shares a coding problem on screen'],
          ['Ctrl+Shift+P', 'Peek 5 s in stealth mode', 'Glance at AI answer without disabling stealth'],
          ['Ctrl+Shift+←', 'Snap to top-left', 'Move overlay out of the way while coding'],
          ['Ctrl+Shift+→', 'Snap to top-right', 'Default reading position'],
          ['Ctrl+Shift+↑', 'Snap to bottom-left', 'Clear the right side of screen'],
          ['Ctrl+Shift+↓', 'Snap to bottom-right', 'Out of the way for fullscreen IDE'],
          ['Ctrl+Alt+↓', 'Scroll answer down', 'Read AI answer without leaving your IDE'],
          ['Ctrl+Alt+↑', 'Scroll answer up', 'Scroll back through a long answer'],
          ['Ctrl+Alt+PageDown', 'Scroll one full page down', 'Jump through a long code answer'],
          ['Ctrl+Alt+PageUp', 'Scroll one full page up', 'Jump back to top of answer'],
        ],
      },
      {
        type: 'note',
        text: 'All 12 shortcuts above are OS-level global — registered via Electron globalShortcut, not the overlay window. They fire even when the overlay is hidden.',
      },
      {
        type: 'subtitle', text: '🖥 In-Overlay Shortcuts — overlay must be in focus',
      },
      {
        type: 'table',
        headers: ['Key', 'Action', 'Notes'],
        rows: [
          ['← Arrow', 'Previous question in history', 'Browse past Q&A pairs from this session'],
          ['→ Arrow', 'Next question / back to LIVE', '→ at last item returns to live answer'],
          ['Escape', 'Exit type mode', 'Cancel keyboard input without sending'],
          ['Enter', 'Send typed question to AI', 'Works only when ⌨ type mode is active'],
        ],
      },
      {
        type: 'subtitle', text: '🔘 Title Bar Buttons',
      },
      {
        type: 'table',
        headers: ['Button', 'Action', 'Shortcut'],
        rows: [
          ['↖ ↗ ↙ ↘', 'Snap to corner', 'Ctrl+Shift+← → ↑ ↓'],
          ['🕵', 'Toggle stealth mode', '—'],
          ['👁', 'Toggle gaze correction', '—'],
          ['📅', 'Google Calendar panel', '—'],
          ['⚙', 'Settings (font, opacity, audio device)', '—'],
          ['_', 'Minimize to compact bar', '—'],
          ['✕', 'End session → back to session list', '—'],
          ['⏻', 'Quit app completely', '—'],
        ],
      },
      {
        type: 'subtitle', text: '🔘 Question Box Buttons',
      },
      {
        type: 'table',
        headers: ['Button', 'Action'],
        rows: [
          ['⎘', 'Copy question to clipboard — paste into IDE or search'],
          ['↺', 'Retry — resend same question to AI (after error or bad answer)'],
        ],
      },
      {
        type: 'subtitle', text: '🔘 Action Bar Buttons',
      },
      {
        type: 'table',
        headers: ['Button', 'Action', 'Shortcut'],
        rows: [
          ['⌨', 'Enable type mode — keyboard input into overlay', '—'],
          ['📸', 'Screenshot → GPT-4o reads the question on screen', 'Ctrl+Shift+S'],
          ['🎤', 'Start / stop mic recording', '—'],
          ['🎧 / 🔴', 'Toggle auto-listen (system audio / Stereo Mix)', '—'],
          ['⚡ / ⏸', 'Auto-answer — send questions instantly without confirm', '—'],
        ],
      },
      {
        type: 'subtitle', text: '📱 Mobile App Buttons',
      },
      {
        type: 'table',
        headers: ['Button', 'Action'],
        rows: [
          ['🕵', 'Stealth mode — answer hidden, phone vibrates on new answer'],
          ['👁', 'Gaze tracking — vibrates if you look away > 2.5 s'],
          ['📞', 'Call listen mode — continuous mic with VAD'],
          ['🎤', 'Hold to record, release to send'],
          ['📷', 'Pick photo from gallery → AI reads the question'],
          ['➤', 'Send typed question to AI'],
        ],
      },
    ],
  },
  {
    id: 'audio',
    icon: '🎧',
    title: 'Audio Capture',
    content: [
      {
        type: 'subtitle', text: 'Auto-Listen (Headphone / System Audio)',
      },
      {
        type: 'text',
        text: 'Click the 🎧 button to start listening to your call audio. The app captures the interviewer\'s voice through your Stereo Mix device and automatically transcribes it.',
      },
      {
        type: 'steps',
        title: 'Setup Stereo Mix (Windows)',
        steps: [
          'Click "Open Sound Settings →" in the overlay settings panel',
          'Go to the Recording tab',
          'Right-click → Show Disabled Devices',
          'Right-click Stereo Mix → Enable',
          'Restart auto-listen — it will detect Stereo Mix automatically',
        ],
      },
      {
        type: 'subtitle', text: 'Manual Mic (🎤)',
      },
      {
        type: 'text',
        text: 'Click 🎤 to record your voice. After 1.5s of silence the question is sent to AI automatically. Hold to record, release to send.',
      },
      {
        type: 'subtitle', text: 'Mobile Call Mode (📞)',
      },
      {
        type: 'text',
        text: 'Tap 📞 in the mobile app to start continuous call listening. Works for WhatsApp, Zoom, Google Meet, or any app on speakerphone. The mic captures the interviewer\'s voice through the speaker.',
      },
      {
        type: 'note',
        text: 'Regular cellular/GSM calls: put on speakerphone — the mic picks up both sides. Android 10+ and iOS block direct call audio capture for all third-party apps.',
      },
    ],
  },
  {
    id: 'transcription',
    icon: '📝',
    title: 'Transcription',
    content: [
      {
        type: 'table',
        headers: ['Setting', 'Value'],
        rows: [
          ['Model', 'Whisper-1 (OpenAI)'],
          ['Language', 'English — supports Indian, British, and other accents'],
          ['Chunk size', '1.8 s per audio chunk'],
          ['Silence flush', '500 ms after speech stops'],
          ['Whisper temperature', '0.1 — beam search for accent accuracy'],
          ['Vocabulary hint', 'React, Node.js, Docker, SQL, Big O... (50+ tech terms)'],
          ['Hallucination filter', 'Word count, repetition loop, and phrase blocklist'],
        ],
      },
      {
        type: 'subtitle', text: 'How it works',
      },
      {
        type: 'text',
        text: 'Audio is recorded in 1.8 s chunks and sent to Whisper in parallel as you speak. When 500 ms of silence is detected after the question ends, the buffer is flushed to AI. Total delay from end of speech to first AI word: ~1.5–2 s.',
      },
    ],
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'AI Answers',
    content: [
      {
        type: 'table',
        headers: ['Setting', 'Value'],
        rows: [
          ['Answer model', 'gpt-4o (streaming)'],
          ['Screenshot model', 'gpt-4o (vision)'],
          ['Max tokens', '500'],
          ['Temperature', '0.35'],
          ['Context window', 'Last 6 turns (covers 3 rounds of code iteration)'],
          ['Streaming', 'Yes — words appear as generated'],
        ],
      },
      {
        type: 'subtitle', text: 'Answer format',
      },
      {
        type: 'text',
        text: 'Concept questions: 2-3 sentences then one concrete example. Coding: one sentence on approach then full working code block. For code follow-ups ("modify that / add error handling"), the AI builds on the previous code — not from scratch.',
      },
      {
        type: 'subtitle', text: 'History navigation',
      },
      {
        type: 'text',
        text: 'Use ← → arrow keys (or ◀ ▶ buttons) to browse previous questions and answers in the current session.',
      },
    ],
  },
  {
    id: 'screenshot',
    icon: '📸',
    title: 'Screenshot AI',
    content: [
      {
        type: 'text',
        text: 'Press 📸 button or Ctrl+Shift+S to capture the screen. GPT-4o reads the screenshot, identifies the question or coding problem, and provides a direct answer with working code.',
      },
      {
        type: 'note',
        text: 'Content protection is always ON — the overlay is invisible to screen capture. Screenshot captures the whole screen except the overlay itself.',
      },
    ],
  },
  {
    id: 'stealth',
    icon: '🕵',
    title: 'Stealth Mode',
    content: [
      {
        type: 'subtitle', text: 'What it does',
      },
      {
        type: 'text',
        text: 'Stealth mode makes the overlay nearly invisible (4% opacity — undetectable to human eye or webcam). When a new AI answer arrives, it automatically peeks at full opacity for 6 seconds then hides again.',
      },
      {
        type: 'table',
        headers: ['Windows', 'Mobile'],
        rows: [
          ['Click 🕵 in title bar', 'Tap 🕵 in action row'],
          ['Overlay → 4% opacity (ghost)', 'Answer area hidden'],
          ['New answer → auto-peek 6s', 'Phone vibrates + shows 7s'],
          ['Ctrl+Shift+P → peek 5s', 'Tap stealth bar → peek 7s'],
          ['Click 🕵 again to exit', 'Tap 🕵 again to exit'],
        ],
      },
      {
        type: 'subtitle', text: 'What interviewers can detect',
      },
      {
        type: 'table',
        headers: ['Detection method', 'Our protection'],
        rows: [
          ['Tab switching', 'Overlay stays on top — you never leave Zoom'],
          ['Screen recording / sharing', 'setContentProtection(true) — overlay invisible'],
          ['Eye tracking (HireVue AI)', 'Gaze correction redirects iris to camera'],
          ['Copy-paste detection', 'You type answers — never paste'],
          ['Phone / 2nd device', 'Mobile is separate device — undetectable'],
          ['Keyboard sounds while thinking', 'Use voice input — no typing needed'],
        ],
      },
    ],
  },
  {
    id: 'gaze',
    icon: '👁',
    title: 'Gaze Correction',
    content: [
      {
        type: 'text',
        text: 'Gaze correction uses MediaPipe FaceMesh (478 landmarks including iris) to detect where your eyes are looking and digitally shifts the iris toward the camera direction.',
      },
      {
        type: 'table',
        headers: ['Parameter', 'Value'],
        rows: [
          ['Correction strength', '55% — natural, not robotic'],
          ['Smoothing (LERP)', '0.10 — fluid, no snapping'],
          ['Max correction', '14px — prevents over-correction'],
          ['Micro-jitter', '±0.6px — eyes never look frozen'],
          ['Processing rate', '~15fps (low CPU)'],
        ],
      },
      {
        type: 'steps',
        title: 'To show corrected video in Zoom/Teams',
        steps: [
          'Install OBS Studio (free) — obsproject.com',
          'In OBS: Tools → Virtual Camera → Start',
          'In Zoom: Settings → Video → Camera → select "OBS Virtual Camera"',
          'In our overlay: click 👁 to enable gaze correction',
          'OBS will show a browser source of the corrected canvas (see setup guide)',
        ],
      },
      {
        type: 'note',
        text: 'Mobile gaze tracking uses head pose detection (yaw/pitch angles). If you look away >12° for >2.5s, your phone vibrates once as a reminder to look at camera.',
      },
    ],
  },
  {
    id: 'training',
    icon: '⚡',
    title: 'Training Context',
    content: [
      {
        type: 'text',
        text: 'Training context tells the AI who you are so it answers experience and background questions from your actual resume — not generic answers.',
      },
      {
        type: 'table',
        headers: ['Field', 'Used for'],
        rows: [
          ['Role', 'AI speaks as this job title'],
          ['Skills', 'Included in every answer prompt'],
          ['Experience Summary', 'Background for "tell me about yourself"'],
          ['Resume (PDF/TXT)', 'Primary source for all personal questions — up to 4000 chars'],
          ['Custom Instructions', 'Override AI behavior, e.g. "always mention leadership"'],
          ['Other Files', 'Portfolio, projects, cover letter — additional context'],
        ],
      },
      {
        type: 'note',
        text: 'Always upload your resume using the dedicated "Upload Resume" button — not the "Other Files" section. The resume goes into a special field that the AI checks first for personal questions.',
      },
    ],
  },
  {
    id: 'sessions',
    icon: '📋',
    title: 'Sessions',
    content: [
      {
        type: 'text',
        text: 'Each interview is a session. Windows overlay and mobile app can both join the same session — questions sent from either device stream AI answers to both simultaneously.',
      },
      {
        type: 'steps',
        title: 'Starting an interview',
        steps: [
          'Create a session in Web Admin or the mobile/overlay app',
          'Open the Windows overlay — it joins the session automatically',
          'Optionally open mobile app → Sessions → tap the same session',
          'Both devices now share the same AI answer stream',
          'Start auto-listen (🎧) or call mode (📞) to begin',
        ],
      },
      {
        type: 'table',
        headers: ['Feature', 'Windows', 'Mobile'],
        rows: [
          ['Auto-listen (Stereo Mix)', '✅', '—'],
          ['Call mode (mic)', '—', '✅'],
          ['Manual mic', '✅', '✅'],
          ['Screenshot AI', '✅', '📷 photo picker'],
          ['Stealth mode', '✅', '✅'],
          ['Gaze correction', '✅ MediaPipe', '✅ Head pose'],
          ['History navigation', '✅ ← → keys', '✅ scroll'],
          ['Session timer', '✅', '✅'],
        ],
      },
    ],
  },
];

export default function DocsPage() {
  const [active, setActive] = useState('overview');

  const section = SECTIONS.find(s => s.id === active);

  return (
    <div style={d.page}>
      {/* Sidebar */}
      <div style={d.sidebar}>
        <h2 style={d.logo}>Interview AI</h2>
        <div style={d.navLinks}>
          <Link to="/" style={d.navLink}>📋 Sessions</Link>
          <Link to="/training" style={d.navLink}>⚡ Training</Link>
          <span style={d.navActive}>📖 Docs</span>
        </div>
        <div style={d.toc}>
          {SECTIONS.map(s => (
            <button key={s.id} style={{ ...d.tocItem, ...(active === s.id ? d.tocItemActive : {}) }}
              onClick={() => setActive(s.id)}>
              <span style={d.tocIcon}>{s.icon}</span>
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={d.main}>
        <div style={d.header}>
          <span style={d.headerIcon}>{section.icon}</span>
          <h1 style={d.heading}>{section.title}</h1>
        </div>

        <div style={d.body}>
          {section.content.map((block, i) => <Block key={i} block={block} />)}
        </div>

        {/* Prev / Next */}
        <div style={d.navFooter}>
          {SECTIONS.findIndex(s => s.id === active) > 0 && (
            <button style={d.navBtn} onClick={() => setActive(SECTIONS[SECTIONS.findIndex(s => s.id === active) - 1].id)}>
              ← {SECTIONS[SECTIONS.findIndex(s => s.id === active) - 1].title}
            </button>
          )}
          <div style={{ flex: 1 }} />
          {SECTIONS.findIndex(s => s.id === active) < SECTIONS.length - 1 && (
            <button style={d.navBtn} onClick={() => setActive(SECTIONS[SECTIONS.findIndex(s => s.id === active) + 1].id)}>
              {SECTIONS[SECTIONS.findIndex(s => s.id === active) + 1].title} →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function Block({ block }) {
  if (block.type === 'intro') return <p style={d.intro}>{block.text}</p>;
  if (block.type === 'text') return <p style={d.text}>{block.text}</p>;
  if (block.type === 'subtitle') return <h3 style={d.subtitle}>{block.text}</h3>;

  if (block.type === 'note') return (
    <div style={d.note}>
      <span style={d.noteIcon}>💡</span>
      <span style={d.noteText}>{block.text}</span>
    </div>
  );

  if (block.type === 'apps') return (
    <div style={d.appGrid}>
      {block.items.map((a, i) => (
        <div key={i} style={d.appCard}>
          <span style={d.appIcon}>{a.icon}</span>
          <div>
            <div style={d.appName}>{a.name}</div>
            <div style={d.appDesc}>{a.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );

  if (block.type === 'steps') return (
    <div style={d.stepsWrap}>
      {block.title && <div style={d.stepsTitle}>{block.title}</div>}
      {block.steps.map((step, i) => (
        <div key={i} style={d.step}>
          <div style={d.stepNum}>{i + 1}</div>
          <div style={d.stepText}>{step}</div>
        </div>
      ))}
    </div>
  );

  if (block.type === 'table') return (
    <div style={d.tableWrap}>
      <table style={d.table}>
        <thead>
          <tr>{block.headers.map((h, i) => <th key={i} style={d.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i} style={i % 2 === 0 ? d.trEven : {}}>
              {row.map((cell, j) => <td key={j} style={j === 0 ? d.tdKey : d.td}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return null;
}

const d = {
  page: { display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a14' },
  sidebar: { width: 220, background: '#1e1e2e', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16, borderRight: '1px solid #334155', flexShrink: 0 },
  logo: { color: '#a78bfa', fontSize: 18, fontWeight: 800, margin: 0 },
  navLinks: { display: 'flex', flexDirection: 'column', gap: 4 },
  navActive: { color: '#e2e8f0', padding: '8px 12px', background: 'rgba(124,58,237,0.2)', borderRadius: 8, fontSize: 14 },
  navLink: { color: '#94a3b8', padding: '8px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none', display: 'block' },
  toc: { display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 },
  tocItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', textAlign: 'left' },
  tocItemActive: { background: 'rgba(124,58,237,0.15)', color: '#a78bfa' },
  tocIcon: { fontSize: 14, width: 18 },
  main: { flex: 1, padding: '40px 48px', maxWidth: 820 },
  header: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 },
  headerIcon: { fontSize: 32 },
  heading: { color: '#e2e8f0', fontSize: 28, fontWeight: 800, margin: 0 },
  body: { display: 'flex', flexDirection: 'column', gap: 16 },
  intro: { color: '#94a3b8', fontSize: 16, lineHeight: 1.7, margin: 0, padding: '16px 20px', background: 'rgba(124,58,237,0.06)', borderRadius: 10, borderLeft: '3px solid #7c3aed' },
  text: { color: '#94a3b8', fontSize: 14, lineHeight: 1.8, margin: 0 },
  subtitle: { color: '#e2e8f0', fontSize: 16, fontWeight: 700, margin: '8px 0 4px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 },
  note: { display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, padding: '10px 14px' },
  noteIcon: { fontSize: 16, flexShrink: 0, marginTop: 1 },
  noteText: { color: '#fde68a', fontSize: 13, lineHeight: 1.6 },
  appGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  appCard: { display: 'flex', gap: 14, alignItems: 'flex-start', background: '#1e1e2e', borderRadius: 10, padding: '14px 16px', border: '1px solid #334155' },
  appIcon: { fontSize: 24, flexShrink: 0 },
  appName: { color: '#e2e8f0', fontWeight: 700, fontSize: 14, marginBottom: 3 },
  appDesc: { color: '#64748b', fontSize: 13 },
  stepsWrap: { background: '#1e1e2e', borderRadius: 10, padding: '16px 18px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 10 },
  stepsTitle: { color: '#a78bfa', fontWeight: 700, fontSize: 13, marginBottom: 4 },
  step: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  stepNum: { width: 22, height: 22, borderRadius: 11, background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepText: { color: '#94a3b8', fontSize: 13, lineHeight: 1.6 },
  tableWrap: { borderRadius: 10, overflow: 'hidden', border: '1px solid #334155' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#1e1e2e', color: '#a78bfa', fontWeight: 700, fontSize: 12, padding: '10px 14px', textAlign: 'left', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #334155' },
  trEven: { background: 'rgba(255,255,255,0.015)' },
  tdKey: { color: '#e2e8f0', fontSize: 13, padding: '9px 14px', fontWeight: 600, fontFamily: 'monospace', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  td: { color: '#64748b', fontSize: 13, padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  navFooter: { display: 'flex', marginTop: 40, paddingTop: 20, borderTop: '1px solid #1e293b' },
  navBtn: { background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, padding: '8px 16px', color: '#a78bfa', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
};
