var VERSION       = "01.28g";
var TITLE         = "Toolbox Talk Sign-In";
var GITHUB_OWNER  = "taloccomanuel";
var GITHUB_REPO   = "Website";
var GITHUB_BRANCH = "main";
var FILE_PATH     = "googleAppsScripts/signin-sheet/Code.gs";
var DEPLOYMENT_ID = "AKfycbyaTG137tcJUigFikTtHTJt2j3IXmKvvWnwn8_y9eqr9PKb5AYCzPU6hkjyGjMFrNZD";

var SPREADSHEET_ID = "1o0EHsjkh7NJCpcvTPjVU8zUtKSwwOs2aolfnfOkrbwg";
// Google Drive folder ID where signature images are saved.
// Leave empty ("") to save to the root of My Drive.
var SIGNATURE_FOLDER_ID = "";

// Static hazard-spotting image shown at the bottom of the sign-in sheet.
// File lives at live-site-pages/images/ in the repo.
var STATIC_QUIZ_IMAGE_URL = "https://pfcassociates.github.io/images/C8image1.png";

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

  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName("Data") || ss.getSheets()[0];
    var data = JSON.parse(e.postData.contents);
    data.names.forEach(function(name) {
      sheet.appendRow([data.date, data.topic, name, new Date().toLocaleString()]);
    });
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
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

function saveData(topic, date, location, entries, quizAnswers) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName("Data") || ss.getSheets()[0];

  var sigErrors = [];
  entries.forEach(function(entry) {
    var name = (typeof entry === 'string') ? entry : entry.name;
    var rawSig = (typeof entry === 'object' && entry.sig) ? entry.sig : '';
    var sigLink = '';
    if (rawSig) {
      try {
        var base64 = rawSig.replace(/^data:image\/png;base64,/, '');
        var safeName = name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'signature';
        var fileName = safeName + ' - ' + date + '.png';
        var blob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/png', fileName);
        var meta = { name: fileName };
        if (SIGNATURE_FOLDER_ID) meta.parents = [SIGNATURE_FOLDER_ID];
        var created = Drive.Files.create(meta, blob, { fields: 'id,webViewLink' });
        sigLink = created.webViewLink || ('https://drive.google.com/file/d/' + created.id + '/view');
        try {
          Drive.Permissions.create({ role: 'reader', type: 'anyone' }, created.id);
        } catch (shareErr) {
          Logger.log('Permissions.create failed for ' + name + ': ' + shareErr.message);
        }
      } catch (sigErr) {
        Logger.log('Signature upload failed for ' + name + ': ' + sigErr.message + '\n' + (sigErr.stack || '(no stack)'));
        sigErrors.push(name + ': ' + sigErr.message);
      }
    }
    sheet.appendRow([date, topic, location, name, new Date().toLocaleString(), sigLink]);
  });

  if (quizAnswers && quizAnswers.length) {
    var quizSheet = ss.getSheetByName("Hazard Quiz");
    if (!quizSheet) {
      quizSheet = ss.insertSheet("Hazard Quiz");
      quizSheet.appendRow(["Date", "Topic", "Location", "Photo #", "Caption", "Observation", "Submitted At"]);
    }
    var submittedAt = new Date().toLocaleString();
    quizAnswers.forEach(function(a, i) {
      quizSheet.appendRow([date, topic, location, i + 1, a.caption || '', a.observation || '', submittedAt]);
    });
  }

  var savedAt = new Date().toLocaleString();
  PropertiesService.getScriptProperties().setProperties({
    lastSavedAt: savedAt,
    lastTopic: topic,
    lastLocation: location,
    lastDate: date,
    lastCount: entries.length.toString()
  });
  return { savedAt: savedAt, sigErrors: sigErrors };
}

function getHazardPhotos() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName("Hazard Photos");
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var photos = [];
  data.forEach(function(row, i) {
    if (i === 0) return;
    var url = (row[0] || '').toString().trim();
    var caption = (row[1] || '').toString().trim();
    if (url) photos.push({ url: url, caption: caption });
  });
  return photos;
}

function getLastSaved() {
  var props = PropertiesService.getScriptProperties().getProperties();
  return {
    savedAt: props.lastSavedAt || null,
    topic: props.lastTopic || null,
    location: props.lastLocation || null,
    date: props.lastDate || null,
    count: props.lastCount || null
  };
}

function getHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Toolbox Talk Sign-In Sheet</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #1a1a18; --ink-muted: #6b6b65; --ink-faint: #b0afa8;
    --paper: #f7f5f0; --paper-mid: #eeecea; --paper-dark: #e2dfda;
    --accent: #1e3a6e; --line: rgba(26,26,24,0.12);
    --radius: 6px; --shadow: 0 2px 12px rgba(26,26,24,0.08), 0 1px 3px rgba(26,26,24,0.06);
  }
  html { background: var(--paper); min-height: 100%; }
  body { font-family: 'DM Sans', sans-serif; color: var(--ink); background: var(--paper); min-height: 100vh; }
  .topbar { background: var(--accent); color: #fff; padding: 0 32px; height: 52px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
  .topbar-brand { font-family: 'DM Serif Display', serif; font-size: 17px; color: #fff; opacity: 0.9; }
  .btn-ghost { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.22); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 6px 16px; border-radius: var(--radius); cursor: pointer; transition: background 0.15s; }
  .btn-ghost:hover { background: rgba(255,255,255,0.22); }
  .page { max-width: 700px; margin: 0 auto; padding: 40px 24px 80px; }
  .sheet { background: #fff; border-radius: 10px; box-shadow: var(--shadow); overflow: hidden; animation: rise 0.4s ease both; }
  @keyframes rise { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: none; } }
  .logo-area { display: flex; justify-content: center; align-items: center; padding: 24px 32px 18px; border-bottom: 1px solid var(--line); background: #fff; }
  .logo-area img { height: 72px; max-width: 260px; object-fit: contain; }
  .sheet-header { padding: 20px 32px 20px; border-bottom: 1px solid var(--line); background: #fff; }
  .toolbox-label { font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; }
  .header-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; }
  .header-left { flex: 1; }
  .field-label { font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 5px; }
  .topic-input { font-family: 'DM Serif Display', serif; font-size: 24px; border: none; outline: none; color: var(--ink); background: transparent; width: 100%; border-bottom: 1.5px solid transparent; padding-bottom: 2px; transition: border-color 0.2s; }
  .topic-input:focus { border-bottom-color: var(--accent); }
  .topic-input::placeholder { color: var(--ink-faint); }
  .topic-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .header-right { flex-shrink: 0; text-align: right; }
  .date-input { font-family: 'DM Sans', sans-serif; font-size: 14px; border: none; outline: none; color: var(--ink-muted); background: transparent; text-align: right; cursor: pointer; }
  .date-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .location-row { margin-top: 14px; }
  .location-input { font-family: 'DM Sans', sans-serif; font-size: 15px; border: none; border-bottom: 1px solid var(--paper-dark); outline: none; color: var(--ink); background: transparent; width: 100%; padding: 4px 0; transition: border-color 0.2s; }
  .location-input:focus { border-bottom-color: var(--accent); }
  .location-input::placeholder { color: var(--ink-faint); }
  .location-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .table-head { display: grid; grid-template-columns: 40px 1fr 36px; gap: 12px; padding: 10px 32px; background: var(--paper-mid); border-bottom: 1px solid var(--line); }
  .col-label { font-size: 11px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ink-muted); }
  .entries { padding: 0 32px; }
  .entry-row { display: grid; grid-template-columns: 40px 1fr 36px; gap: 12px; align-items: start; padding: 13px 0; border-bottom: 1px solid var(--line); }
  .entry-content { display: flex; flex-direction: column; gap: 8px; }
  .sig-canvas { display: block; width: 100%; height: 52px; border: 1px solid var(--line); border-radius: 4px; background: #fff; cursor: crosshair; touch-action: none; }
  .sig-canvas.signed { border-color: var(--accent); }
  .sig-row { display: flex; align-items: center; gap: 8px; }
  .clear-sig { background: none; border: none; font-size: 11px; color: var(--ink-faint); cursor: pointer; text-decoration: underline; padding: 0; flex-shrink: 0; }
  .clear-sig:hover { color: var(--ink-muted); }
  .clear-sig:disabled { opacity: 0.4; cursor: not-allowed; }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .entry-row:last-child { border-bottom: none; }
  .row-num { font-size: 12px; color: var(--ink-faint); font-weight: 300; text-align: center; }
  .name-input { font-family: 'DM Sans', sans-serif; font-size: 15px; border: none; border-bottom: 1px solid var(--paper-dark); outline: none; background: transparent; color: var(--ink); padding: 4px 0; width: 100%; transition: border-color 0.2s; }
  .name-input:focus { border-bottom-color: var(--accent); }
  .name-input::placeholder { color: var(--ink-faint); }
  .name-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .remove-btn { background: none; border: none; cursor: pointer; color: var(--ink-faint); font-size: 18px; line-height: 1; padding: 0; text-align: center; transition: color 0.15s; }
  .remove-btn:hover { color: #c0392b; }
  .remove-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .sheet-footer { padding: 14px 32px; background: var(--paper-mid); border-top: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; }
  .count-text { font-size: 12px; color: var(--ink-muted); font-weight: 300; }
  .save-wrap { display: flex; flex-direction: column; align-items: center; margin-top: 28px; gap: 10px; }
  .save-btn { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; padding: 12px 48px; background: #1a7340; color: #fff; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(26,115,64,0.25); transition: opacity 0.15s; }
  .save-btn:hover:not(:disabled) { opacity: 0.88; }
  .save-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .submit-status { font-size: 13px; padding: 10px 16px; border-radius: var(--radius); display: none; text-align: center; }
  .submit-status.ok { background: #e8f5ee; color: #1a7340; display: block; }
  .submit-status.err { background: #fdecea; color: #b03030; display: block; }
  .submit-status.warn { background: #fff8e1; color: #7a5c00; display: block; }
  .last-saved { font-size: 12px; color: var(--ink-faint); text-align: center; line-height: 1.6; }
  .spinner { display: inline-block; width: 11px; height: 11px; border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 6px; vertical-align: middle; }
  @keyframes spin { to { transform: rotate(360deg); } }
  /* Confirm modal */
  .confirm-overlay { display: none; position: fixed; inset: 0; background: rgba(26,26,24,0.45); z-index: 200; align-items: center; justify-content: center; }
  .confirm-overlay.open { display: flex; }
  .confirm-box { background: #fff; border-radius: 10px; padding: 28px 28px 22px; width: 340px; box-shadow: 0 8px 40px rgba(26,26,24,0.18); animation: rise 0.2s ease both; }
  .confirm-box h3 { font-family: 'DM Serif Display', serif; font-size: 19px; margin-bottom: 8px; }
  .confirm-box p { font-size: 13px; color: var(--ink-muted); margin-bottom: 22px; line-height: 1.5; }
  .confirm-btns { display: flex; gap: 10px; justify-content: flex-end; }
  .confirm-cancel { font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 7px 16px; border: 1px solid var(--paper-dark); background: none; border-radius: var(--radius); cursor: pointer; color: var(--ink-muted); }
  .confirm-cancel:hover { background: var(--paper-mid); }
  .confirm-ok { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; padding: 7px 18px; border: none; background: #c0392b; color: #fff; border-radius: var(--radius); cursor: pointer; }
  .confirm-ok:hover { opacity: 0.88; }
  .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--ink); color: #fff; font-size: 13px; padding: 10px 20px; border-radius: 999px; opacity: 0; pointer-events: none; transition: opacity 0.3s, transform 0.3s; z-index: 300; }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  /* Hazard quiz card */
  .quiz-card { background: #fff; border-radius: 10px; box-shadow: var(--shadow); overflow: hidden; margin-top: 16px; animation: rise 0.4s ease both; }
  .quiz-card-header { padding: 16px 32px; border-bottom: 1px solid var(--line); background: #fff3f2; display: flex; align-items: center; gap: 10px; }
  .quiz-card-icon { color: #c0392b; flex-shrink: 0; }
  .quiz-card-title { font-family: 'DM Serif Display', serif; font-size: 16px; color: #1a1a18; }
  .quiz-card-sub { font-size: 12px; color: var(--ink-muted); margin-left: auto; flex-shrink: 0; }
  .quiz-loading { padding: 28px 32px; text-align: center; font-size: 13px; color: var(--ink-faint); }
  .quiz-items { padding: 20px 32px 28px; display: flex; flex-direction: column; gap: 28px; }
  .quiz-item { display: flex; flex-direction: column; gap: 10px; }
  .quiz-item-top { display: flex; gap: 14px; align-items: flex-start; }
  .quiz-photo-num { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: #c0392b; color: #fff; font-size: 13px; font-weight: 500; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
  .quiz-photo-wrap { flex: 1; border-radius: var(--radius); overflow: hidden; cursor: pointer; position: relative; background: var(--paper-mid); }
  .quiz-photo-wrap img { width: 100%; max-height: 260px; object-fit: cover; display: block; transition: opacity 0.15s; }
  .quiz-photo-wrap:hover img { opacity: 0.88; }
  .quiz-expand-hint { position: absolute; bottom: 6px; right: 8px; background: rgba(0,0,0,0.5); color: #fff; font-size: 10px; padding: 2px 7px; border-radius: 10px; pointer-events: none; }
  .quiz-caption { font-size: 12px; color: var(--ink-muted); margin-left: 42px; font-style: italic; }
  .quiz-obs-label { font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); margin-left: 42px; margin-bottom: 4px; }
  .quiz-obs { width: 100%; margin-left: 0; font-family: 'DM Sans', sans-serif; font-size: 14px; border: 1px solid var(--paper-dark); border-radius: var(--radius); padding: 10px 12px; background: var(--paper); color: var(--ink); resize: vertical; min-height: 80px; outline: none; transition: border-color 0.2s; }
  .quiz-obs:focus { border-color: var(--accent); background: #fff; }
  .quiz-obs:disabled { opacity: 0.5; cursor: not-allowed; }
  .quiz-obs::placeholder { color: var(--ink-faint); }
  /* Static hazard image + questions */
  .static-quiz-card { background: #fff; border-radius: 10px; box-shadow: var(--shadow); overflow: hidden; margin-top: 16px; animation: rise 0.4s ease both; }
  .static-quiz-header { padding: 16px 32px; border-bottom: 1px solid var(--line); background: #fff3f2; display: flex; align-items: center; gap: 10px; }
  .static-quiz-title { font-family: 'DM Serif Display', serif; font-size: 16px; color: #1a1a18; }
  .static-quiz-body { padding: 20px 32px 28px; display: flex; flex-direction: column; gap: 20px; }
  .static-quiz-image-wrap { border-radius: var(--radius); overflow: hidden; background: var(--paper-mid); cursor: pointer; position: relative; }
  .static-quiz-image-wrap img { width: 100%; max-height: 360px; object-fit: contain; display: block; background: var(--paper-mid); }
  .static-quiz-image-missing { padding: 60px 20px; text-align: center; font-size: 13px; color: var(--ink-faint); }
  .static-quiz-q { display: flex; flex-direction: column; gap: 6px; }
  .static-quiz-q-label { font-size: 13px; font-weight: 500; color: var(--ink); }
  .static-quiz-q-num { display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: #c0392b; color: #fff; font-size: 12px; font-weight: 500; text-align: center; line-height: 22px; margin-right: 8px; }
  /* Lightbox */
  .lb-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 500; align-items: center; justify-content: center; padding: 20px; }
  .lb-overlay.open { display: flex; }
  .lb-inner { position: relative; max-width: min(92vw, 900px); display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .lb-img { max-width: 100%; max-height: calc(90vh - 60px); border-radius: var(--radius); object-fit: contain; display: block; }
  .lb-caption { color: rgba(255,255,255,0.72); font-size: 13px; text-align: center; max-width: 600px; }
  .lb-close { position: absolute; top: -40px; right: 0; background: none; border: none; color: rgba(255,255,255,0.7); font-size: 32px; cursor: pointer; line-height: 1; padding: 0; }
  .lb-close:hover { color: #fff; }
  .lb-counter { position: absolute; top: -38px; left: 0; color: rgba(255,255,255,0.5); font-size: 12px; }
  .lb-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.15); border: none; color: #fff; font-size: 26px; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
  .lb-nav:hover { background: rgba(255,255,255,0.28); }
  .lb-prev { left: -58px; }
  .lb-next { right: -58px; }
  @media (max-width: 560px) {
    .page { padding: 20px 10px 60px; }
    .sheet-header, .logo-area { padding-left: 18px; padding-right: 18px; }
    .table-head, .entries, .sheet-footer { padding-left: 18px; padding-right: 18px; }
    .topbar { padding: 0 16px; }
    .topic-input { font-size: 20px; }
    .confirm-box { width: 92vw; padding: 22px 18px 18px; }
    .quiz-card-header, .quiz-items { padding-left: 18px; padding-right: 18px; }
    .lb-prev { left: -46px; }
    .lb-next { right: -46px; }
  }
  .gas-version-pill {
    position: fixed; bottom: 8px; left: 8px; z-index: 9999;
    background: rgba(26,26,24,0.55); color: #f7f5f0;
    padding: 3px 9px; border-radius: 10px;
    font: 10px/1 monospace; letter-spacing: 0.04em;
    pointer-events: none; user-select: none;
  }
</style>
</head>
<body>

<div class="topbar">
  <span class="topbar-brand">Toolbox Talk Sign-In</span>
  <div><button class="btn-ghost" onclick="openClearConfirm()">Clear all</button></div>
</div>

<div class="page">
  <div class="sheet">
    <div class="logo-area">
      <img src="data:image/png;base64,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" alt="Clark Foundations" />
    </div>
    <div class="sheet-header">
      <div class="toolbox-label">Toolbox Talk</div>
      <div class="header-row">
        <div class="header-left">
          <div class="field-label">Topic</div>
          <input class="topic-input" id="topic" type="text" placeholder="Enter topic&hellip;" />
        </div>
        <div class="header-right">
          <div class="field-label">Date</div>
          <input class="date-input" id="sheet-date" type="date" />
        </div>
      </div>
      <div class="location-row">
        <div class="field-label">Location</div>
        <input class="location-input" id="location" type="text" placeholder="Enter location&hellip;" />
      </div>
    </div>
    <div class="table-head">
      <div class="col-label">#</div>
      <div class="col-label">Name &amp; Signature</div>
      <div></div>
    </div>
    <div id="js-error-banner" style="display:block;color:#c0392b;padding:8px 16px;font-size:12px;">JS NOT LOADED</div>
    <div class="entries" id="entries"></div>
    <div class="sheet-footer">
      <span class="count-text" id="count">0 attendees</span>
    </div>
  </div>

  <div class="static-quiz-card">
    <div class="static-quiz-header">
      <span class="static-quiz-title">Hazard Spotting</span>
    </div>
    <div class="static-quiz-body">
      <div class="static-quiz-image-wrap" id="static-quiz-image-wrap">
        <img id="static-quiz-image" src="${STATIC_QUIZ_IMAGE_URL}" alt="Hazard spotting image" onerror="this.style.display='none';document.getElementById('static-quiz-missing').style.display='block';" />
        <div class="static-quiz-image-missing" id="static-quiz-missing" style="display:none;">Image unavailable</div>
      </div>
      <div class="static-quiz-q">
        <label class="static-quiz-q-label" for="static-quiz-q1"><span class="static-quiz-q-num">1</span>What Critical 8 do you see in the image?</label>
        <textarea class="quiz-obs" id="static-quiz-q1" placeholder="Your answer&hellip;"></textarea>
      </div>
      <div class="static-quiz-q">
        <label class="static-quiz-q-label" for="static-quiz-q2"><span class="static-quiz-q-num">2</span>What hazards do you see in those images?</label>
        <textarea class="quiz-obs" id="static-quiz-q2" placeholder="Your answer&hellip;"></textarea>
      </div>
    </div>
  </div>

    <div class="save-wrap">
    <button class="save-btn" id="save-btn" onclick="sendToSheets()">Save</button>
    <div class="submit-status" id="submit-status"></div>
    <div class="last-saved" id="last-saved"></div>
  </div>
</div>

<!-- Clear All Confirmation -->
<div class="confirm-overlay" id="confirm-overlay">
  <div class="confirm-box">
    <h3>Clear all entries?</h3>
    <p>This will remove all names from the current list. This cannot be undone.</p>
    <div class="confirm-btns">
      <button class="confirm-cancel" onclick="closeClearConfirm()">Cancel</button>
      <button class="confirm-ok" onclick="doClearAll()">Clear all</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<!-- s1: diagnostic + globals -->
<script>
var _b=document.getElementById('js-error-banner');if(_b)_b.textContent='s1-ok';
var rows=[],rid=0;
document.getElementById('sheet-date').value=new Date().toISOString().split('T')[0];
</script>
<!-- s2: hasBlankRow onNameInput removeRow -->
<script>
function hasBlankRow(){return rows.some(function(id){return!((document.getElementById('name-'+id)||{}).value||'').trim();});}
function onNameInput(id){updateCount();var v=((document.getElementById('name-'+id)||{}).value||'').trim();if(v&&!hasBlankRow())addRow(false);}
function removeRow(id){var r=document.getElementById('row-'+id);if(r)r.remove();rows=rows.filter(function(r){return r!==id;});reNumber();updateCount();if(!hasBlankRow())addRow(false);}
</script>
<!-- s3: reNumber updateCount getFilledEntries -->
<script>
function reNumber(){rows.forEach(function(id,i){var e=document.getElementById('num-'+id);if(e)e.textContent=i+1;});}
function updateCount(){var n=rows.filter(function(id){return((document.getElementById('name-'+id)||{}).value||'').trim();}).length;document.getElementById('count').textContent=n+(n===1?' attendee':' attendees');}
function getFilledEntries(){return rows.map(function(id){var name=((document.getElementById('name-'+id)||{}).value||'').trim();if(!name)return null;var canvas=document.getElementById('canvas-'+id);var sig=(canvas&&canvas.classList.contains('signed'))?canvas.toDataURL('image/png'):'';return{name:name,sig:sig};}).filter(Boolean);}
function getStaticQuizAnswers(){var q1=(document.getElementById('static-quiz-q1')||{}).value||'';var q2=(document.getElementById('static-quiz-q2')||{}).value||'';var out=[];if(q1.trim())out.push({caption:'What Critical 8 do you see in the image?',observation:q1.trim()});if(q2.trim())out.push({caption:'What hazards do you see in those images?',observation:q2.trim()});return out;}
</script>
<!-- s4: addRow -->
<script>
function addRow(focus){
var id=++rid;rows.push(id);
var el=document.createElement('div');el.className='entry-row';el.id='row-'+id;
el.innerHTML='<div class="row-num" id="num-'+id+'"></div><div class="entry-content"><input class="name-input" id="name-'+id+'" type="text" placeholder="Full name" autocomplete="off" oninput="onNameInput('+id+')" /><div class="sig-row"><canvas class="sig-canvas" id="canvas-'+id+'" height="52"></canvas><button class="clear-sig" id="clr-'+id+'" onclick="clearCanvas('+id+')" type="button">Clear</button></div></div><button class="remove-btn" id="rm-'+id+'" onclick="removeRow('+id+')" title="Remove">&#215;</button>';
document.getElementById('entries').appendChild(el);
initCanvas(id);reNumber();updateCount();
if(focus)setTimeout(function(){var fe=document.getElementById('name-'+id);if(fe)fe.focus();},50);
}
</script>
<!-- s5: initCanvas -->
<script>
function initCanvas(id){
var canvas=document.getElementById('canvas-'+id);
var rect=canvas.getBoundingClientRect();
canvas.width=Math.round(rect.width)||280;canvas.height=52;
var ctx=canvas.getContext('2d');var drawing=false;
function getPos(e){var r=canvas.getBoundingClientRect();var s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*(canvas.width/r.width),y:(s.clientY-r.top)*(canvas.height/r.height)};}
function start(e){e.preventDefault();drawing=true;var p=getPos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);}
function draw(e){if(!drawing)return;e.preventDefault();var p=getPos(e);ctx.lineWidth=1.8;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#1a1a18';ctx.lineTo(p.x,p.y);ctx.stroke();canvas.classList.add('signed');}
function stop(){drawing=false;}
canvas.addEventListener('mousedown',start);canvas.addEventListener('mousemove',draw);canvas.addEventListener('mouseup',stop);canvas.addEventListener('mouseleave',stop);canvas.addEventListener('touchstart',start,{passive:false});canvas.addEventListener('touchmove',draw,{passive:false});canvas.addEventListener('touchend',stop);
}
</script>
<!-- s6: clearCanvas setFieldsDisabled -->
<script>
function clearCanvas(id){var c=document.getElementById('canvas-'+id);if(!c)return;var ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);c.classList.remove('signed');}
function setFieldsDisabled(disabled){
document.getElementById('topic').disabled=disabled;
document.getElementById('sheet-date').disabled=disabled;
document.getElementById('location').disabled=disabled;
var q1=document.getElementById('static-quiz-q1');if(q1)q1.disabled=disabled;
var q2=document.getElementById('static-quiz-q2');if(q2)q2.disabled=disabled;
rows.forEach(function(id){var a=document.getElementById('name-'+id),b=document.getElementById('rm-'+id),c=document.getElementById('clr-'+id),d=document.getElementById('canvas-'+id);if(a)a.disabled=disabled;if(b)b.disabled=disabled;if(c)c.disabled=disabled;if(d)d.style.pointerEvents=disabled?'none':'';});
}
</script>
<!-- s7: confirm dialogs -->
<script>
function openClearConfirm(){document.getElementById('confirm-overlay').classList.add('open');}
function closeClearConfirm(){document.getElementById('confirm-overlay').classList.remove('open');}
function doClearAll(){closeClearConfirm();document.getElementById('entries').innerHTML='';rows=[];rid=0;addRow(false);addRow(false);addRow(false);updateCount();document.getElementById('submit-status').className='submit-status';var q1=document.getElementById('static-quiz-q1');if(q1)q1.value='';var q2=document.getElementById('static-quiz-q2');if(q2)q2.value='';showToast('Sheet cleared');}
document.getElementById('confirm-overlay').addEventListener('click',function(e){if(e.target===this)closeClearConfirm();});
</script>
<!-- s8: showStatus setLastSaved loadLastSaved showToast -->
<script>
function showStatus(t,m){var el=document.getElementById('submit-status');el.className='submit-status '+t;el.textContent=m;}
function setLastSaved(at,topic,count){var el=document.getElementById('last-saved');if(!el||!at)return;el.innerHTML='Last saved: <strong>'+at+'</strong> &nbsp;&middot;&nbsp; '+count+' record'+(Number(count)!==1?'s':'')+' &nbsp;&middot;&nbsp; Topic: <strong>'+topic+'</strong>';}
function loadLastSaved(){google.script.run.withSuccessHandler(function(info){if(info&&info.savedAt)setLastSaved(info.savedAt,info.topic,info.count);}).getLastSaved();}
function showToast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2400);}
</script>
<!-- s9: sendToSheets -->
<script>
function sendToSheets(){
var entries=getFilledEntries();
if(!entries.length){showStatus('err','Please add at least one name before saving.');return;}
var topic=document.getElementById('topic').value.trim()||'Untitled';
var date=document.getElementById('sheet-date').value;
var location=document.getElementById('location').value.trim();
var btn=document.getElementById('save-btn');
btn.disabled=true;btn.innerHTML='<span class="spinner"></span>Saving&hellip;';
setFieldsDisabled(true);document.getElementById('submit-status').className='submit-status';
google.script.run
.withSuccessHandler(function(r){var at=r.savedAt||r;var sigErr=r.sigErrors||[];btn.innerHTML='&#10003; Saved!';if(sigErr.length){showStatus('warn',entries.length+' record'+(entries.length>1?'s':'')+' saved. Sig error: '+sigErr[0]);}else{showStatus('ok',entries.length+' record'+(entries.length>1?'s':'')+' saved.');}setLastSaved(at,topic,entries.length);setTimeout(function(){doClearAll();document.getElementById('topic').value='';document.getElementById('location').value='';btn.disabled=false;btn.textContent='Save';setFieldsDisabled(false);},1800);})
.withFailureHandler(function(){setFieldsDisabled(false);btn.disabled=false;btn.textContent='Save';showStatus('err','Unable to save. Try again.');})
.saveData(topic,date,location,entries,getStaticQuizAnswers());
}
</script>
<!-- s10: init -->
<script>
addRow(false);addRow(false);addRow(false);loadLastSaved();
if(_b)_b.textContent='ready-'+rows.length+'rows';
</script>
<div class="gas-version-pill">v${VERSION}</div>
</body>
</html>`;
}
