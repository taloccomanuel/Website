// ════════════════════════════════════════════════════════════════════════
//  EQUIPMENT DOWNTIME TRACKER — Google Apps Script web app
//  Log and monitor equipment downtime occurrences at the clinic.
//
//  BOOTSTRAP (first time only — do this once in your Google account):
//    1. Create a new Google Sheet, copy its ID into SPREADSHEET_ID below.
//    2. Create a new Apps Script project (script.google.com), paste this file
//       in as "Code", and add the appsscript.json manifest.
//    3. Deploy → New deployment → Web app (Execute as: Me,
//       Who has access: Anyone). Copy the deployment ID into DEPLOYMENT_ID
//       below AND into the iframe src in equipment-downtime-tracker.html
//       AND into the deploy step in .github/workflows/auto-merge-claude.yml.
//    4. Project Settings → Script Properties → add GITHUB_TOKEN (a PAT with
//       repo read access) so self-update can pull new code from GitHub.
//  After bootstrap, every push that edits this file auto-redeploys via the
//  workflow's doPost(action=deploy) webhook.
// ════════════════════════════════════════════════════════════════════════

var VERSION       = "01.01g";
var TITLE         = "Equipment Downtime Tracker";
var GITHUB_OWNER  = "taloccomanuel";
var GITHUB_REPO   = "Website";
var GITHUB_BRANCH = "main";
var FILE_PATH     = "googleAppsScripts/equipment-downtime-tracker/Code.gs";

// ── Fill these in after bootstrap (see header) ──
var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
var DEPLOYMENT_ID  = "YOUR_DEPLOYMENT_ID";
var SHEET_NAME     = "Downtime Log";

// Comma-separated addresses emailed when a new downtime is logged.
// Leave empty ("") to disable notifications.
var NOTIFY_EMAIL_TO = "taloccomanuel@gmail.com";

// Sheet column order. Column A is an internal ID used to target row updates;
// the remaining columns match the requested headings. "Logged At" is appended.
var HEADERS = [
  "ID",
  "Date of Initial Downtime Occurrence",
  "Time of Initial Downtime Occurrence",
  "Staff Member Reporting Occurrence",
  "Person Notified of Occurrence",
  "Equipment/Item Affected",
  "Equipment/Item Issue",
  "Impact On Operations",
  "Date New Equipment/Item Ordered (if any)",
  "Date New Equipment/Item Received at Clinic",
  "Date New Equipment/Item Replaced and In Use (Issue Resolved)",
  "Additional Comments",
  "Logged At"
];

function doGet(e) {
  return HtmlService.createHtmlOutput(getHtml())
    .setTitle(TITLE)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  // WARNING: Do NOT add authentication, secret checks, or any guards to the deploy action.
  // The GitHub Actions workflow calls doPost(action=deploy) via webhook to trigger GAS self-update.
  // Adding auth here will silently break auto-updates.
  var action = (e && e.parameter && e.parameter.action) || "";
  if (action === "deploy") {
    return ContentService.createTextOutput(pullAndDeployFromGitHub());
  }
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function pullAndDeployFromGitHub() {
  var GITHUB_TOKEN = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN");

  var apiUrl = "https://api.github.com/repos/"
    + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + FILE_PATH
    + "?ref=" + GITHUB_BRANCH + "&t=" + new Date().getTime();
  var fetchHeaders = { "Accept": "application/vnd.github.v3.raw" };
  if (GITHUB_TOKEN) fetchHeaders["Authorization"] = "token " + GITHUB_TOKEN;
  var newCode = UrlFetchApp.fetch(apiUrl, { headers: fetchHeaders }).getContentText('UTF-8');

  var versionMatch  = newCode.match(/var VERSION\s*=\s*"([^"]+)"/);
  var pulledVersion = versionMatch ? versionMatch[1] : null;
  if (pulledVersion && pulledVersion === VERSION) {
    return "Already up to date (" + VERSION + ")";
  }

  var scriptId   = ScriptApp.getScriptId();
  var contentUrl = "https://script.googleapis.com/v1/projects/" + scriptId + "/content";
  var current    = UrlFetchApp.fetch(contentUrl, {
    headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() }
  });
  var currentFiles = JSON.parse(current.getContentText()).files;
  var manifest = currentFiles.find(function(f) { return f.name === "appsscript"; });

  UrlFetchApp.fetch(contentUrl, {
    method: "put",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({
      files: [ { name: "Code", type: "SERVER_JS", source: newCode }, manifest ]
    })
  });

  var versionUrl      = "https://script.googleapis.com/v1/projects/" + scriptId + "/versions";
  var versionResponse = UrlFetchApp.fetch(versionUrl, {
    method: "post",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({
      description: pulledVersion + " - from GitHub " + new Date().toLocaleString()
    })
  });
  var newVersion = JSON.parse(versionResponse.getContentText()).versionNumber;

  var deployUrl = "https://script.googleapis.com/v1/projects/" + scriptId
                + "/deployments/" + DEPLOYMENT_ID;
  UrlFetchApp.fetch(deployUrl, {
    method: "put",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({
      deploymentConfig: {
        scriptId: scriptId,
        versionNumber: newVersion,
        description: pulledVersion + " (deployment " + newVersion + ")"
      }
    })
  });

  return "Updated to " + pulledVersion + " (deployment " + newVersion + ")";
}

// ── Data layer ──────────────────────────────────────────────────────────

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

// Map a sheet row (array) to a record object the client understands.
function rowToRecord_(row) {
  // An occurrence is "resolved" once the replacement is in use — i.e. once the
  // "Replaced and In Use (Issue Resolved)" date is filled in. There is no
  // separate Resolved column; the status is derived from that date.
  var dateReplaced = fmtVal_(row[10]);
  return {
    id:                 row[0]  || "",
    dateOccurred:       fmtVal_(row[1]),
    timeOccurred:       fmtVal_(row[2]),
    staffReporting:     row[3]  || "",
    personNotified:     row[4]  || "",
    equipmentAffected:  row[5]  || "",
    equipmentIssue:     row[6]  || "",
    impact:             row[7]  || "",
    dateOrdered:        fmtVal_(row[8]),
    dateReceived:       fmtVal_(row[9]),
    dateReplaced:       dateReplaced,
    resolved:           !!dateReplaced,
    comments:           row[11] || "",
    loggedAt:           fmtVal_(row[12])
  };
}

// Dates stored as real Date objects come back as objects over google.script.run;
// normalize everything to a plain string so the client renders consistently.
function fmtVal_(v) {
  if (v === null || v === undefined || v === "") return "";
  if (Object.prototype.toString.call(v) === "[object Date]") {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(v);
}

function getDowntimes() {
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  var out = [];
  for (var i = values.length - 1; i >= 0; i--) {           // newest first
    if (!values[i][0] && !values[i][5]) continue;          // skip blank rows
    out.push(rowToRecord_(values[i]));
  }
  return out;
}

function logDowntime(entry) {
  var sheet = getSheet_();
  var id = "ED" + Date.now() + Math.floor(Math.random() * 1000);
  var loggedAt = new Date().toLocaleString();
  sheet.appendRow([
    id,
    entry.dateOccurred      || "",
    entry.timeOccurred      || "",
    entry.staffReporting    || "",
    entry.personNotified    || "",
    entry.equipmentAffected || "",
    entry.equipmentIssue    || "",
    entry.impact            || "",
    entry.dateOrdered       || "",
    entry.dateReceived      || "",
    entry.dateReplaced      || "",
    entry.comments          || "",
    loggedAt
  ]);

  try {
    sendNewDowntimeEmail_(entry, loggedAt);
  } catch (mailErr) {
    Logger.log("Email notification failed: " + mailErr.message);
  }

  return { success: true, id: id, loggedAt: loggedAt };
}

// Update the follow-up / resolution fields on an existing row, found by ID.
function updateDowntime(id, fields) {
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { success: false, error: "No records" };
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      var rowNum = i + 2;
      // Columns 9-12: Ordered, Received, Replaced & In Use (Issue Resolved), Comments
      sheet.getRange(rowNum, 9,  1, 1).setValue(fields.dateOrdered  || "");
      sheet.getRange(rowNum, 10, 1, 1).setValue(fields.dateReceived || "");
      sheet.getRange(rowNum, 11, 1, 1).setValue(fields.dateReplaced || "");
      sheet.getRange(rowNum, 12, 1, 1).setValue(fields.comments     || "");
      return { success: true };
    }
  }
  return { success: false, error: "Record not found" };
}

function sendNewDowntimeEmail_(entry, loggedAt) {
  if (!NOTIFY_EMAIL_TO) return;
  var esc = function(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/\n/g, "<br>");
  };
  var rowsHtml = [
    ["Date of downtime",     entry.dateOccurred],
    ["Time of downtime",     entry.timeOccurred],
    ["Reported by",          entry.staffReporting],
    ["Person notified",      entry.personNotified],
    ["Equipment affected",   entry.equipmentAffected],
    ["Equipment issue",      entry.equipmentIssue],
    ["Impact on operations", entry.impact],
    ["Additional comments",  entry.comments]
  ].map(function(p) {
    if (!p[1]) return "";
    return '<tr><td style="padding:4px 14px 4px 0;color:#888;vertical-align:top;">' + esc(p[0]) +
           '</td><td style="padding:4px 0;">' + esc(p[1]) + '</td></tr>';
  }).join("");

  var html =
    '<div style="font-family:Arial,sans-serif;color:#1a1a18;max-width:640px;">' +
      '<h2 style="margin:0 0 4px;">New Equipment Downtime Logged</h2>' +
      '<div style="color:#666;font-size:13px;margin-bottom:16px;">Logged ' + esc(loggedAt) + '</div>' +
      '<table style="border-collapse:collapse;font-size:13px;">' + rowsHtml + '</table>' +
    '</div>';

  MailApp.sendEmail({
    to: NOTIFY_EMAIL_TO,
    subject: "Equipment Downtime: " + (entry.equipmentAffected || "Unspecified") + " — " + (entry.dateOccurred || ""),
    htmlBody: html
  });
}

// ── UI ──────────────────────────────────────────────────────────────────

function getHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Equipment Downtime Tracker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #1a1a18; --ink-muted: #6b6b65; --ink-faint: #b0afa8;
    --paper: #f7f5f0; --paper-mid: #eeecea; --paper-dark: #e2dfda;
    --accent: #1e3a6e; --accent-soft: #e8eef7;
    --green: #1a7340; --green-soft: #e8f5ee;
    --amber: #b07a00; --amber-soft: #fff4d6;
    --red: #c0392b; --red-soft: #fdecea;
    --line: rgba(26,26,24,0.12);
    --radius: 6px; --shadow: 0 2px 12px rgba(26,26,24,0.08), 0 1px 3px rgba(26,26,24,0.06);
  }
  html { background: var(--paper); min-height: 100%; }
  body { font-family: 'DM Sans', sans-serif; color: var(--ink); background: var(--paper); min-height: 100vh; }
  .topbar { background: var(--accent); color: #fff; padding: 0 28px; height: 54px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
  .topbar-brand { font-family: 'DM Serif Display', serif; font-size: 18px; }
  .topbar-actions { display: flex; gap: 10px; }
  .btn-ghost { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.22); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 7px 16px; border-radius: var(--radius); cursor: pointer; transition: background 0.15s; }
  .btn-ghost:hover { background: rgba(255,255,255,0.22); }
  .page { max-width: 1080px; margin: 0 auto; padding: 28px 22px 80px; }

  /* Stat strip */
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
  .stat { background: #fff; border-radius: 10px; box-shadow: var(--shadow); padding: 16px 20px; }
  .stat-num { font-family: 'DM Serif Display', serif; font-size: 30px; line-height: 1; }
  .stat-label { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); margin-top: 8px; }
  .stat.open .stat-num { color: var(--red); }
  .stat.resolved .stat-num { color: var(--green); }
  .stat.total .stat-num { color: var(--accent); }

  .card { background: #fff; border-radius: 10px; box-shadow: var(--shadow); overflow: hidden; margin-bottom: 24px; }
  .card-head { padding: 16px 24px; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .card-title { font-family: 'DM Serif Display', serif; font-size: 18px; }
  .card-sub { font-size: 12px; color: var(--ink-muted); }

  /* Form */
  form { padding: 22px 24px 26px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
  .field { display: flex; flex-direction: column; gap: 5px; }
  .field.full { grid-column: 1 / -1; }
  .field-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint); }
  .field-label .req { color: var(--red); }
  input, textarea, select { font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--ink); background: var(--paper); border: 1px solid var(--paper-dark); border-radius: var(--radius); padding: 9px 11px; outline: none; transition: border-color 0.15s, background 0.15s; width: 100%; }
  input:focus, textarea:focus, select:focus { border-color: var(--accent); background: #fff; }
  textarea { resize: vertical; min-height: 64px; }
  .followup { margin-top: 4px; border: 1px dashed var(--paper-dark); border-radius: var(--radius); overflow: hidden; }
  .followup > summary { cursor: pointer; list-style: none; padding: 11px 16px; font-size: 13px; font-weight: 500; color: var(--accent); background: var(--paper); user-select: none; }
  .followup > summary::-webkit-details-marker { display: none; }
  .followup > summary::before { content: '+ '; }
  .followup[open] > summary::before { content: '– '; }
  .followup-body { padding: 18px 16px 6px; }
  .resolved-toggle { display: flex; align-items: center; gap: 10px; padding: 10px 0 2px; font-size: 14px; }
  .resolved-toggle input { width: 18px; height: 18px; accent-color: var(--green); }
  .form-actions { display: flex; align-items: center; gap: 14px; margin-top: 22px; }
  .btn-primary { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; padding: 11px 36px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(30,58,110,0.25); transition: opacity 0.15s; }
  .btn-primary:hover:not(:disabled) { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn-text { background: none; border: none; color: var(--ink-muted); font-size: 13px; cursor: pointer; text-decoration: underline; }
  .form-status { font-size: 13px; padding: 8px 14px; border-radius: var(--radius); display: none; }
  .form-status.ok { background: var(--green-soft); color: var(--green); display: inline-block; }
  .form-status.err { background: var(--red-soft); color: var(--red); display: inline-block; }
  .spinner { display: inline-block; width: 11px; height: 11px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 6px; vertical-align: middle; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Monitor */
  .filters { display: flex; gap: 6px; }
  .filter-tab { font-size: 13px; padding: 6px 14px; border-radius: 999px; border: 1px solid var(--paper-dark); background: var(--paper); color: var(--ink-muted); cursor: pointer; transition: all 0.15s; }
  .filter-tab.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .search-row { padding: 14px 24px 0; }
  .search-row input { max-width: 320px; }
  .table-wrap { padding: 14px 24px 22px; overflow-x: auto; }
  table.log { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 760px; }
  table.log th { text-align: left; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint); padding: 8px 10px; border-bottom: 2px solid var(--line); white-space: nowrap; }
  table.log td { padding: 11px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
  table.log tr:hover td { background: var(--paper); }
  .status-pill { display: inline-block; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 999px; white-space: nowrap; }
  .status-pill.open { background: var(--red-soft); color: var(--red); }
  .status-pill.resolved { background: var(--green-soft); color: var(--green); }
  .eq-name { font-weight: 500; }
  .muted { color: var(--ink-faint); }
  .row-update { font-size: 12px; color: var(--accent); background: none; border: 1px solid var(--accent-soft); border-radius: var(--radius); padding: 5px 12px; cursor: pointer; white-space: nowrap; }
  .row-update:hover { background: var(--accent-soft); }
  .empty { text-align: center; padding: 40px 20px; color: var(--ink-faint); font-size: 14px; }

  /* Update modal */
  .overlay { display: none; position: fixed; inset: 0; background: rgba(26,26,24,0.5); z-index: 300; align-items: center; justify-content: center; padding: 20px; }
  .overlay.open { display: flex; }
  .modal { background: #fff; border-radius: 12px; width: 100%; max-width: 540px; max-height: 92vh; display: flex; flex-direction: column; box-shadow: 0 12px 60px rgba(26,26,24,0.25); overflow: hidden; animation: rise 0.2s ease both; }
  @keyframes rise { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: none; } }
  .modal-head { padding: 18px 24px; border-bottom: 1px solid var(--line); background: var(--accent); color: #fff; }
  .modal-head h3 { font-family: 'DM Serif Display', serif; font-size: 18px; margin: 0; }
  .modal-head .modal-sub { font-size: 12px; opacity: 0.85; margin-top: 3px; }
  .modal-body { padding: 20px 24px; overflow-y: auto; }
  .modal-foot { padding: 14px 24px; border-top: 1px solid var(--line); display: flex; justify-content: flex-end; gap: 10px; background: var(--paper); }
  .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
  .modal-grid .full { grid-column: 1 / -1; }
  .btn-cancel { font-size: 13px; padding: 9px 18px; border: 1px solid var(--paper-dark); background: #fff; border-radius: var(--radius); cursor: pointer; color: var(--ink-muted); }
  .btn-cancel:hover { background: var(--paper-mid); }
  .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--ink); color: #fff; font-size: 13px; padding: 10px 20px; border-radius: 999px; opacity: 0; pointer-events: none; transition: opacity 0.3s, transform 0.3s; z-index: 400; }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

  @media (max-width: 680px) {
    .form-grid, .modal-grid { grid-template-columns: 1fr; }
    .stats { grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .stat { padding: 12px 12px; }
    .stat-num { font-size: 22px; }
    .page { padding: 18px 12px 60px; }
    .card-head, form, .table-wrap { padding-left: 16px; padding-right: 16px; }
  }
  .gas-version-pill { position: fixed; bottom: 8px; left: 8px; z-index: 9999; background: rgba(26,26,24,0.55); color: #f7f5f0; padding: 3px 9px; border-radius: 10px; font: 10px/1 monospace; letter-spacing: 0.04em; pointer-events: none; user-select: none; }
</style>
</head>
<body>

<div class="topbar">
  <span class="topbar-brand">Equipment Downtime Tracker</span>
  <div class="topbar-actions">
    <button class="btn-ghost" onclick="loadRecords()">Refresh</button>
  </div>
</div>

<div class="page">

  <div class="stats">
    <div class="stat open"><div class="stat-num" id="stat-open">–</div><div class="stat-label">Open</div></div>
    <div class="stat resolved"><div class="stat-num" id="stat-resolved">–</div><div class="stat-label">Resolved</div></div>
    <div class="stat total"><div class="stat-num" id="stat-total">–</div><div class="stat-label">Total Logged</div></div>
  </div>

  <!-- Log form -->
  <div class="card">
    <div class="card-head">
      <span class="card-title">Log a Downtime Occurrence</span>
    </div>
    <form id="downtime-form" onsubmit="return false;">
      <div class="form-grid">
        <div class="field">
          <label class="field-label" for="f-date">Date of Initial Downtime Occurrence <span class="req">*</span></label>
          <input type="date" id="f-date" required />
        </div>
        <div class="field">
          <label class="field-label" for="f-time">Time of Initial Downtime Occurrence <span class="req">*</span></label>
          <input type="time" id="f-time" required />
        </div>
        <div class="field">
          <label class="field-label" for="f-staff">Staff Member Reporting Occurrence <span class="req">*</span></label>
          <input type="text" id="f-staff" placeholder="Name of reporter" />
        </div>
        <div class="field">
          <label class="field-label" for="f-notified">Person Notified of Occurrence</label>
          <input type="text" id="f-notified" placeholder="Who was notified" />
        </div>
        <div class="field">
          <label class="field-label" for="f-equipment">Equipment/Item Affected <span class="req">*</span></label>
          <input type="text" id="f-equipment" placeholder="e.g. Centrifuge #2" />
        </div>
        <div class="field">
          <label class="field-label" for="f-issue">Equipment/Item Issue <span class="req">*</span></label>
          <input type="text" id="f-issue" placeholder="What went wrong" />
        </div>
        <div class="field full">
          <label class="field-label" for="f-impact">Impact On Operations</label>
          <textarea id="f-impact" placeholder="How did this affect clinic operations?"></textarea>
        </div>
      </div>

      <details class="followup">
        <summary>Replacement &amp; resolution details (optional — can be added later)</summary>
        <div class="followup-body">
          <div class="form-grid">
            <div class="field">
              <label class="field-label" for="f-ordered">Date New Equipment/Item Ordered (if any)</label>
              <input type="date" id="f-ordered" />
            </div>
            <div class="field">
              <label class="field-label" for="f-received">Date New Equipment/Item Received at Clinic</label>
              <input type="date" id="f-received" />
            </div>
            <div class="field full">
              <label class="field-label" for="f-replaced">Date New Equipment/Item Replaced and In Use <span class="muted">(filling this marks the issue resolved)</span></label>
              <input type="date" id="f-replaced" />
            </div>
            <div class="field full">
              <label class="field-label" for="f-comments">Additional Comments</label>
              <input type="text" id="f-comments" placeholder="Notes" />
            </div>
          </div>
        </div>
      </details>

      <div class="form-actions">
        <button class="btn-primary" id="submit-btn" onclick="submitForm()">Log Downtime</button>
        <button class="btn-text" type="button" onclick="resetForm()">Clear form</button>
        <span class="form-status" id="form-status"></span>
      </div>
    </form>
  </div>

  <!-- Monitor -->
  <div class="card">
    <div class="card-head">
      <span class="card-title">Downtime Monitor</span>
      <div class="filters">
        <button class="filter-tab active" data-filter="all" onclick="setFilter('all')">All</button>
        <button class="filter-tab" data-filter="open" onclick="setFilter('open')">Open</button>
        <button class="filter-tab" data-filter="resolved" onclick="setFilter('resolved')">Resolved</button>
      </div>
    </div>
    <div class="search-row">
      <input type="text" id="search" placeholder="Search equipment, issue, reporter&hellip;" oninput="renderTable()" />
    </div>
    <div class="table-wrap">
      <table class="log">
        <thead>
          <tr>
            <th>Status</th>
            <th>Date / Time</th>
            <th>Equipment &amp; Issue</th>
            <th>Reported / Notified</th>
            <th>Impact</th>
            <th>Replacement</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="log-body">
          <tr><td colspan="7" class="empty">Loading&hellip;</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Update modal -->
<div class="overlay" id="update-overlay">
  <div class="modal">
    <div class="modal-head">
      <h3>Update Downtime</h3>
      <div class="modal-sub" id="modal-sub"></div>
    </div>
    <div class="modal-body">
      <div class="modal-grid">
        <div class="field">
          <label class="field-label" for="m-ordered">Date New Equipment/Item Ordered (if any)</label>
          <input type="date" id="m-ordered" />
        </div>
        <div class="field">
          <label class="field-label" for="m-received">Date New Equipment/Item Received at Clinic</label>
          <input type="date" id="m-received" />
        </div>
        <div class="field full">
          <label class="field-label" for="m-replaced">Date New Equipment/Item Replaced and In Use <span class="muted">(filling this resolves the issue)</span></label>
          <input type="date" id="m-replaced" />
        </div>
        <div class="field full">
          <label class="field-label" for="m-comments">Additional Comments</label>
          <textarea id="m-comments" placeholder="Notes"></textarea>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" id="modal-save" onclick="saveUpdate()">Save changes</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
var _records = [];
var _filter = 'all';
var _editingId = null;

document.getElementById('f-date').value = new Date().toISOString().split('T')[0];

function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function showToast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2400);}

function showFormStatus(type,msg){var el=document.getElementById('form-status');el.className='form-status '+type;el.textContent=msg;}

function loadRecords(){
  google.script.run.withSuccessHandler(function(list){
    _records = list || [];
    renderStats();
    renderTable();
  }).withFailureHandler(function(err){
    document.getElementById('log-body').innerHTML='<tr><td colspan="7" class="empty">Unable to load records.</td></tr>';
  }).getDowntimes();
}

function renderStats(){
  var open=0, resolved=0;
  for(var i=0;i<_records.length;i++){ if(_records[i].resolved) resolved++; else open++; }
  document.getElementById('stat-open').textContent=open;
  document.getElementById('stat-resolved').textContent=resolved;
  document.getElementById('stat-total').textContent=_records.length;
}

function setFilter(f){
  _filter=f;
  var tabs=document.querySelectorAll('.filter-tab');
  for(var i=0;i<tabs.length;i++){tabs[i].classList.toggle('active',tabs[i].getAttribute('data-filter')===f);}
  renderTable();
}

function dateTimeCell(r){
  var d=r.dateOccurred||'<span class="muted">—</span>';
  var t=r.timeOccurred?('<div class="muted">'+esc(r.timeOccurred)+'</div>'):'';
  return d+t;
}

function replacementCell(r){
  var parts=[];
  if(r.dateOrdered)  parts.push('Ordered: '+esc(r.dateOrdered));
  if(r.dateReceived) parts.push('Received: '+esc(r.dateReceived));
  if(r.dateReplaced) parts.push('In use: '+esc(r.dateReplaced));
  if(!parts.length) return '<span class="muted">—</span>';
  return parts.join('<br>');
}

function renderTable(){
  var q=(document.getElementById('search').value||'').trim().toLowerCase();
  var body=document.getElementById('log-body');
  var rows=_records.filter(function(r){
    if(_filter==='open' && r.resolved) return false;
    if(_filter==='resolved' && !r.resolved) return false;
    if(q){
      var hay=(r.equipmentAffected+' '+r.equipmentIssue+' '+r.staffReporting+' '+r.personNotified+' '+r.impact+' '+r.comments).toLowerCase();
      if(hay.indexOf(q)===-1) return false;
    }
    return true;
  });
  if(!rows.length){
    body.innerHTML='<tr><td colspan="7" class="empty">No matching records.</td></tr>';
    return;
  }
  var html='';
  for(var i=0;i<rows.length;i++){
    var r=rows[i];
    var pill=r.resolved?'<span class="status-pill resolved">Resolved</span>':'<span class="status-pill open">Open</span>';
    html+='<tr>'+
      '<td>'+pill+'</td>'+
      '<td>'+dateTimeCell(r)+'</td>'+
      '<td><div class="eq-name">'+(esc(r.equipmentAffected)||'<span class="muted">—</span>')+'</div><div class="muted">'+esc(r.equipmentIssue)+'</div></td>'+
      '<td>'+(esc(r.staffReporting)||'<span class="muted">—</span>')+(r.personNotified?'<div class="muted">&rarr; '+esc(r.personNotified)+'</div>':'')+'</td>'+
      '<td>'+(esc(r.impact)||'<span class="muted">—</span>')+'</td>'+
      '<td>'+replacementCell(r)+'</td>'+
      '<td><button class="row-update" onclick="openModal(\\''+r.id+'\\')">Update</button></td>'+
    '</tr>';
  }
  body.innerHTML=html;
}

function collectForm(){
  return {
    dateOccurred:      document.getElementById('f-date').value,
    timeOccurred:      document.getElementById('f-time').value,
    staffReporting:    document.getElementById('f-staff').value.trim(),
    personNotified:    document.getElementById('f-notified').value.trim(),
    equipmentAffected: document.getElementById('f-equipment').value.trim(),
    equipmentIssue:    document.getElementById('f-issue').value.trim(),
    impact:            document.getElementById('f-impact').value.trim(),
    dateOrdered:       document.getElementById('f-ordered').value,
    dateReceived:      document.getElementById('f-received').value,
    dateReplaced:      document.getElementById('f-replaced').value,
    comments:          document.getElementById('f-comments').value.trim()
  };
}

function submitForm(){
  var entry=collectForm();
  if(!entry.dateOccurred || !entry.timeOccurred){ showFormStatus('err','Date and time of the occurrence are required.'); return; }
  if(!entry.staffReporting){ showFormStatus('err','Please enter the staff member reporting.'); return; }
  if(!entry.equipmentAffected || !entry.equipmentIssue){ showFormStatus('err','Equipment affected and the issue are required.'); return; }
  var btn=document.getElementById('submit-btn');
  btn.disabled=true; btn.innerHTML='<span class="spinner"></span>Logging&hellip;';
  document.getElementById('form-status').className='form-status';
  google.script.run.withSuccessHandler(function(res){
    btn.disabled=false; btn.textContent='Log Downtime';
    if(res && res.success){ showFormStatus('ok','Downtime logged.'); resetForm(true); loadRecords(); }
    else { showFormStatus('err',(res&&res.error)||'Unable to log. Try again.'); }
  }).withFailureHandler(function(){
    btn.disabled=false; btn.textContent='Log Downtime';
    showFormStatus('err','Unable to log. Try again.');
  }).logDowntime(entry);
}

function resetForm(keepStatus){
  ['f-staff','f-notified','f-equipment','f-issue','f-impact','f-comments'].forEach(function(id){document.getElementById(id).value='';});
  ['f-time','f-ordered','f-received','f-replaced'].forEach(function(id){document.getElementById(id).value='';});
  document.getElementById('f-date').value=new Date().toISOString().split('T')[0];
  var det=document.querySelector('.followup'); if(det) det.open=false;
  if(!keepStatus) document.getElementById('form-status').className='form-status';
}

function openModal(id){
  var r=null;
  for(var i=0;i<_records.length;i++){ if(String(_records[i].id)===String(id)){ r=_records[i]; break; } }
  if(!r) return;
  _editingId=id;
  document.getElementById('modal-sub').textContent=(r.equipmentAffected||'Equipment')+' — '+(r.equipmentIssue||'');
  document.getElementById('m-ordered').value=r.dateOrdered||'';
  document.getElementById('m-received').value=r.dateReceived||'';
  document.getElementById('m-replaced').value=r.dateReplaced||'';
  document.getElementById('m-comments').value=r.comments||'';
  document.getElementById('update-overlay').classList.add('open');
}

function closeModal(){ document.getElementById('update-overlay').classList.remove('open'); _editingId=null; }

function saveUpdate(){
  if(!_editingId) return;
  var fields={
    dateOrdered:  document.getElementById('m-ordered').value,
    dateReceived: document.getElementById('m-received').value,
    dateReplaced: document.getElementById('m-replaced').value,
    comments:     document.getElementById('m-comments').value.trim()
  };
  var btn=document.getElementById('modal-save');
  btn.disabled=true; btn.innerHTML='<span class="spinner"></span>Saving&hellip;';
  google.script.run.withSuccessHandler(function(res){
    btn.disabled=false; btn.textContent='Save changes';
    if(res && res.success){ closeModal(); showToast('Record updated'); loadRecords(); }
    else { showToast((res&&res.error)||'Update failed'); }
  }).withFailureHandler(function(){
    btn.disabled=false; btn.textContent='Save changes';
    showToast('Update failed');
  }).updateDowntime(_editingId, fields);
}

document.getElementById('update-overlay').addEventListener('click',function(e){ if(e.target===this) closeModal(); });

loadRecords();
</script>
<div class="gas-version-pill">v${VERSION}</div>
</body>
</html>`;
}
