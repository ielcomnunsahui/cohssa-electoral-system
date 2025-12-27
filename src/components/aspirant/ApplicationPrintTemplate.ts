export interface ApplicationPrintData {
  full_name: string;
  matric_number: string;
  department: string;
  level: string;
  email?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  position_title?: string;
  why_running?: string;
  cgpa?: string | number;
  leadership_history?: string;
  submitted_at?: string;
  status?: string;
}

const escapeHtml = (value: any) => {
  const str = String(value ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const generateApplicationPrintHTML = (data: ApplicationPrintData): string => {
  const submitted = data.submitted_at ? new Date(data.submitted_at).toLocaleString() : "N/A";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Application - ${escapeHtml(data.full_name)}</title>
  <style>
    :root { --fg: #111827; --muted: #6b7280; --border: #e5e7eb; --bg: #ffffff; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background: var(--bg); color: var(--fg); }
    .page { max-width: 900px; margin: 0 auto; padding: 28px; }
    header { display: flex; justify-content: space-between; gap: 16px; align-items: center; border-bottom: 2px solid var(--border); padding-bottom: 14px; }
    .brand h1 { margin: 0; font-size: 18px; letter-spacing: .02em; }
    .brand p { margin: 4px 0 0; color: var(--muted); font-size: 12px; }
    .meta { text-align: right; font-size: 12px; color: var(--muted); }
    .meta strong { color: var(--fg); }
    h2 { margin: 20px 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .card { border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
    .row { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px dashed var(--border); }
    .row:last-child { border-bottom: 0; }
    .label { color: var(--muted); font-size: 12px; }
    .value { font-weight: 600; font-size: 12px; text-align: right; }
    .block { white-space: pre-wrap; font-size: 12px; line-height: 1.5; }
    .badge { display: inline-block; border: 1px solid var(--border); border-radius: 999px; padding: 4px 10px; font-size: 12px; }
    @media print {
      body { background: #fff; }
      .page { padding: 0; }
      header { border-bottom: 1px solid #000; }
      .card { border-color: #000; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header>
      <div class="brand">
        <h1>COHSSA Aspirant Application</h1>
        <p>Generated from the online application portal</p>
      </div>
      <div class="meta">
        <div><strong>Status:</strong> ${escapeHtml(data.status || "N/A")}</div>
        <div><strong>Submitted:</strong> ${escapeHtml(submitted)}</div>
      </div>
    </header>

    <h2>Personal</h2>
    <section class="grid">
      <div class="card">
        <div class="row"><div class="label">Full Name</div><div class="value">${escapeHtml(data.full_name)}</div></div>
        <div class="row"><div class="label">Matric Number</div><div class="value">${escapeHtml(data.matric_number)}</div></div>
        <div class="row"><div class="label">Department</div><div class="value">${escapeHtml(data.department)}</div></div>
        <div class="row"><div class="label">Level</div><div class="value">${escapeHtml(data.level)}</div></div>
      </div>
      <div class="card">
        <div class="row"><div class="label">Email</div><div class="value">${escapeHtml(data.email || "")}</div></div>
        <div class="row"><div class="label">Phone</div><div class="value">${escapeHtml(data.phone || "")}</div></div>
        <div class="row"><div class="label">Gender</div><div class="value">${escapeHtml(data.gender || "")}</div></div>
        <div class="row"><div class="label">Date of Birth</div><div class="value">${escapeHtml(data.date_of_birth || "")}</div></div>
      </div>
    </section>

    <h2>Position</h2>
    <section class="card">
      <div class="row"><div class="label">Position</div><div class="value">${escapeHtml(data.position_title || "N/A")}</div></div>
      <div class="row"><div class="label">CGPA</div><div class="value">${escapeHtml(data.cgpa ?? "")}</div></div>
      <div style="margin-top: 10px;">
        <div class="label">Why I'm Running</div>
        <div class="block">${escapeHtml(data.why_running || "")}</div>
      </div>
    </section>

    <h2>Leadership</h2>
    <section class="card">
      <div class="block">${escapeHtml(data.leadership_history || "")}</div>
    </section>

    <div style="margin-top: 18px; color: var(--muted); font-size: 11px;">
      Note: This PDF is generated via your browser's Print-to-PDF.
    </div>
  </main>
</body>
</html>`;
};
