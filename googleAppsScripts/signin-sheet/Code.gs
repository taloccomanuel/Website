var VERSION       = "01.35g";
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

// Static hazard-spotting images shown at the bottom of the sign-in sheet.
// Files live at live-site-pages/images/ in the repo. Each image gets its
// own pair of Critical-8 / hazard questions.
var STATIC_QUIZ_IMAGE_URLS = [
  "https://taloccomanuel.github.io/Website/images/C8image1.png",
  "https://taloccomanuel.github.io/Website/images/C8image2.png"
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
    var quizSheet = ss.getSheetByName("Critical 8 Spotting") || ss.insertSheet("Critical 8 Spotting");
    var submittedAt = new Date().toLocaleString();
    var baseHeaders = ["Date", "Topic", "Location", "Submitted At"];
    var answerHeaders = quizAnswers.map(function(a) { return a.caption || ''; });
    var lastCol = quizSheet.getLastColumn();
    var headers = lastCol > 0 ? quizSheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    if (!headers.length || !headers[0]) {
      headers = baseHeaders.concat(answerHeaders);
      quizSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    } else {
      var toAdd = answerHeaders.filter(function(h) { return headers.indexOf(h) === -1; });
      if (toAdd.length) {
        quizSheet.getRange(1, headers.length + 1, 1, toAdd.length).setValues([toAdd]);
        headers = headers.concat(toAdd);
      }
    }
    var row = headers.map(function(h) {
      if (h === 'Date') return date;
      if (h === 'Topic') return topic;
      if (h === 'Location') return location;
      if (h === 'Submitted At') return submittedAt;
      for (var i = 0; i < quizAnswers.length; i++) {
        if (quizAnswers[i].caption === h) return quizAnswers[i].observation || '';
      }
      return '';
    });
    quizSheet.appendRow(row);
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
  .static-quiz-body { padding: 20px 32px 28px; display: flex; flex-direction: column; gap: 32px; }
  .static-quiz-block { display: flex; flex-direction: column; gap: 14px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
  .static-quiz-block:last-child { border-bottom: none; padding-bottom: 0; }
  .static-quiz-image-label { font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faint); }
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
      <img src="https://taloccomanuel.github.io/Website/images/clark-foundations-logo.png" alt="Clark Foundations" />
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
      <span class="static-quiz-title">Critical 8 / Hazard Recognition</span>
    </div>
    <div class="static-quiz-body">
      ${STATIC_QUIZ_IMAGE_URLS.map(function(url, i){ return `
      <div class="static-quiz-block">
        <div class="static-quiz-image-label">Image ${i+1}</div>
        <div class="static-quiz-image-wrap">
          <img src="${url}" alt="Hazard spotting image ${i+1}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
          <div class="static-quiz-image-missing" style="display:none;">Image unavailable</div>
        </div>
        <div class="static-quiz-q">
          <label class="static-quiz-q-label" for="static-quiz-q1-${i}"><span class="static-quiz-q-num">1</span>What Critical 8 do you see in the image?</label>
          <textarea class="quiz-obs static-quiz-textarea" id="static-quiz-q1-${i}" data-img="${i+1}" data-q="1" placeholder="Your answer&hellip;"></textarea>
        </div>
        <div class="static-quiz-q">
          <label class="static-quiz-q-label" for="static-quiz-q2-${i}"><span class="static-quiz-q-num">2</span>What hazards do you see in the image?</label>
          <textarea class="quiz-obs static-quiz-textarea" id="static-quiz-q2-${i}" data-img="${i+1}" data-q="2" placeholder="Your answer&hellip;"></textarea>
        </div>
      </div>`; }).join('')}
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
function reNumber(){rows.forEach(function(id,i){var e=document.getElementById('num-'+id);if(e)e.textContent=i+1;var n=document.getElementById('name-'+id);if(n)n.placeholder=(i===0?'Foreman name':'Full name');});}
function updateCount(){var n=rows.filter(function(id){return((document.getElementById('name-'+id)||{}).value||'').trim();}).length;document.getElementById('count').textContent=n+(n===1?' attendee':' attendees');}
function getFilledEntries(){return rows.map(function(id){var name=((document.getElementById('name-'+id)||{}).value||'').trim();if(!name)return null;var canvas=document.getElementById('canvas-'+id);var sig=(canvas&&canvas.classList.contains('signed'))?canvas.toDataURL('image/png'):'';return{name:name,sig:sig};}).filter(Boolean);}
function getStaticQuizAnswers(){var out=[];var tas=document.querySelectorAll('.static-quiz-textarea');for(var i=0;i<tas.length;i++){var ta=tas[i];var v=(ta.value||'').trim();if(!v)continue;var img=ta.getAttribute('data-img');var q=ta.getAttribute('data-q');var caption='Image '+img+' - '+(q==='1'?'Critical 8':'Hazards');out.push({caption:caption,observation:v});}return out;}
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
var sqts=document.querySelectorAll('.static-quiz-textarea');for(var qi=0;qi<sqts.length;qi++)sqts[qi].disabled=disabled;
rows.forEach(function(id){var a=document.getElementById('name-'+id),b=document.getElementById('rm-'+id),c=document.getElementById('clr-'+id),d=document.getElementById('canvas-'+id);if(a)a.disabled=disabled;if(b)b.disabled=disabled;if(c)c.disabled=disabled;if(d)d.style.pointerEvents=disabled?'none':'';});
}
</script>
<!-- s7: confirm dialogs -->
<script>
function openClearConfirm(){document.getElementById('confirm-overlay').classList.add('open');}
function closeClearConfirm(){document.getElementById('confirm-overlay').classList.remove('open');}
function doClearAll(){closeClearConfirm();document.getElementById('entries').innerHTML='';rows=[];rid=0;addRow(false);addRow(false);addRow(false);updateCount();document.getElementById('submit-status').className='submit-status';var sqts=document.querySelectorAll('.static-quiz-textarea');for(var qi=0;qi<sqts.length;qi++)sqts[qi].value='';showToast('Sheet cleared');}
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
