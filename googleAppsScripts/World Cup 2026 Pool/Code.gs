// ─── PROJECT CONFIG ──────────────────────────────────────────────────────────
var VERSION        = "01.04g";
var GITHUB_OWNER   = "taloccomanuel";
var GITHUB_REPO    = "Website";
var GITHUB_BRANCH  = "main";
var FILE_PATH      = "googleAppsScripts/World Cup 2026 Pool/Code.gs";
var DEPLOYMENT_ID  = "AKfycbw3y-qIJwrNNSFmReBQqd5C4ifjMPoY9tMjJkexXwoMNfhQetTprGL5jz_3dqCqSt1v";
var SPREADSHEET_ID = "1r8yXn6--lAnVXyCybOOiAzrujm2QXyVzsknGg8YHhNQ";

// ─── All 72 Group Stage Fixtures ──────────────────────────────────────────────
// [match#, date, group, matchday, team1, team2]
var FIXTURES = [
  // Group A
  [1,  "Jun 11","A",1,"Mexico","South Africa"],
  [2,  "Jun 11","A",1,"South Korea","Czech Republic"],
  [3,  "Jun 18","A",2,"Czech Republic","South Africa"],
  [4,  "Jun 18","A",2,"Mexico","South Korea"],
  [5,  "Jun 24","A",3,"Czech Republic","Mexico"],
  [6,  "Jun 24","A",3,"South Africa","South Korea"],
  // Group B
  [7,  "Jun 12","B",1,"Canada","Bosnia-Herzegovina"],
  [8,  "Jun 12","B",1,"Qatar","Switzerland"],
  [9,  "Jun 18","B",2,"Switzerland","Bosnia-Herzegovina"],
  [10, "Jun 18","B",2,"Canada","Qatar"],
  [11, "Jun 24","B",3,"Switzerland","Canada"],
  [12, "Jun 24","B",3,"Bosnia-Herzegovina","Qatar"],
  // Group C
  [13, "Jun 13","C",1,"Brazil","Morocco"],
  [14, "Jun 13","C",1,"Haiti","Scotland"],
  [15, "Jun 19","C",2,"Scotland","Morocco"],
  [16, "Jun 19","C",2,"Brazil","Haiti"],
  [17, "Jun 24","C",3,"Scotland","Brazil"],
  [18, "Jun 24","C",3,"Morocco","Haiti"],
  // Group D
  [19, "Jun 12","D",1,"USA","Paraguay"],
  [20, "Jun 13","D",1,"Australia","Turkey"],
  [21, "Jun 19","D",2,"USA","Australia"],
  [22, "Jun 19","D",2,"Turkey","Paraguay"],
  [23, "Jun 25","D",3,"USA","Turkey"],
  [24, "Jun 25","D",3,"Paraguay","Australia"],
  // Group E
  [25, "Jun 14","E",1,"Germany","Curacao"],
  [26, "Jun 14","E",1,"Ivory Coast","Ecuador"],
  [27, "Jun 20","E",2,"Germany","Ivory Coast"],
  [28, "Jun 20","E",2,"Ecuador","Curacao"],
  [29, "Jun 25","E",3,"Curacao","Ivory Coast"],
  [30, "Jun 25","E",3,"Ecuador","Germany"],
  // Group F
  [31, "Jun 14","F",1,"Netherlands","Japan"],
  [32, "Jun 14","F",1,"Sweden","Tunisia"],
  [33, "Jun 20","F",2,"Netherlands","Sweden"],
  [34, "Jun 20","F",2,"Tunisia","Japan"],
  [35, "Jun 25","F",3,"Japan","Sweden"],
  [36, "Jun 25","F",3,"Tunisia","Netherlands"],
  // Group G
  [37, "Jun 15","G",1,"Belgium","Egypt"],
  [38, "Jun 15","G",1,"Iran","New Zealand"],
  [39, "Jun 21","G",2,"Belgium","Iran"],
  [40, "Jun 21","G",2,"New Zealand","Egypt"],
  [41, "Jun 26","G",3,"Egypt","Iran"],
  [42, "Jun 26","G",3,"New Zealand","Belgium"],
  // Group H
  [43, "Jun 15","H",1,"Spain","Cape Verde"],
  [44, "Jun 15","H",1,"Saudi Arabia","Uruguay"],
  [45, "Jun 21","H",2,"Spain","Saudi Arabia"],
  [46, "Jun 21","H",2,"Uruguay","Cape Verde"],
  [47, "Jun 26","H",3,"Cape Verde","Saudi Arabia"],
  [48, "Jun 26","H",3,"Uruguay","Spain"],
  // Group I
  [49, "Jun 16","I",1,"France","Senegal"],
  [50, "Jun 16","I",1,"Iraq","Norway"],
  [51, "Jun 22","I",2,"France","Iraq"],
  [52, "Jun 22","I",2,"Norway","Senegal"],
  [53, "Jun 26","I",3,"Norway","France"],
  [54, "Jun 26","I",3,"Senegal","Iraq"],
  // Group J
  [55, "Jun 16","J",1,"Argentina","Algeria"],
  [56, "Jun 16","J",1,"Austria","Jordan"],
  [57, "Jun 22","J",2,"Argentina","Austria"],
  [58, "Jun 22","J",2,"Jordan","Algeria"],
  [59, "Jun 27","J",3,"Algeria","Austria"],
  [60, "Jun 27","J",3,"Jordan","Argentina"],
  // Group K
  [61, "Jun 17","K",1,"Portugal","DR Congo"],
  [62, "Jun 17","K",1,"Uzbekistan","Colombia"],
  [63, "Jun 23","K",2,"Portugal","Uzbekistan"],
  [64, "Jun 23","K",2,"Colombia","DR Congo"],
  [65, "Jun 28","K",3,"Portugal","Colombia"],
  [66, "Jun 28","K",3,"Uzbekistan","DR Congo"],
  // Group L
  [67, "Jun 17","L",1,"England","Croatia"],
  [68, "Jun 17","L",1,"Ghana","Panama"],
  [69, "Jun 23","L",2,"England","Ghana"],
  [70, "Jun 23","L",2,"Panama","Croatia"],
  [71, "Jun 27","L",3,"England","Panama"],
  [72, "Jun 27","L",3,"Croatia","Ghana"],
];

// ─── Colors ───────────────────────────────────────────────────────────────────
var COLOR_HEADER = "#1a3a5c";
var COLOR_SUBHDR = "#2c5f8a";
var COLOR_INPUT  = "#fffde7";
var COLOR_AUTO   = "#f0f0f0";
var GROUP_COLORS = {
  "A":"#e3f2fd","B":"#fef9e7","C":"#e8f5e9","D":"#fce4ec",
  "E":"#e0f2f1","F":"#fff3e0","G":"#f3e5f5","H":"#eceff1",
  "I":"#ffebee","J":"#e8f5e9","K":"#fff8e1","L":"#e8eaf6"
};
var SYSTEM_SHEETS = ["RESULTADOS","TABLA","BRACKET"];
var TOT_ROW = 3 + 72; // row 75 — totals row in participant sheets

// ═════════════════════════════════════════════════════════════════════════════
//  AUTO-DEPLOY  —  GitHub Actions POSTs action=deploy to trigger updates
// ═════════════════════════════════════════════════════════════════════════════
function doGet(e) {
  return HtmlService.createHtmlOutput(getHtml())
    .setTitle("FIFA World Cup 2026 Pool")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ═════════════════════════════════════════════════════════════════════════════
//  PAGE HTML  —  full bracket form served to participants
// ═════════════════════════════════════════════════════════════════════════════
function getHtml() {
  var GAS_URL = "https://script.google.com/macros/s/" + DEPLOYMENT_ID + "/exec";
  return '<!DOCTYPE html>\n'
+ '<html lang="en">\n'
+ '<head>\n'
+ '<meta charset="UTF-8" />\n'
+ '<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
+ '<title>FIFA World Cup 2026 Pool</title>\n'
+ '<style>\n'
+ '  :root{\n'
+ '    --blue:#003DA5; --blue2:#0a52c9; --red:#c8102e; --gold:#d4af37;\n'
+ '    --ink:#1a2330; --muted:#6b7785; --line:#e2e6ec; --bg:#eef1f5;\n'
+ '    --input:#fffdf2; --ok:#1e8e3e;\n'
+ '  }\n'
+ '  *{box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent;}\n'
+ '  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;\n'
+ '       background:var(--bg); color:var(--ink); line-height:1.4; padding-bottom:90px;}\n'
+ '  .wrap{max-width:760px; margin:0 auto; padding:0 12px;}\n'
+ '  header{background:linear-gradient(135deg,var(--blue),var(--blue2)); color:#fff;\n'
+ '         text-align:center; padding:22px 14px 18px; border-bottom:5px solid var(--gold);}\n'
+ '  header h1{font-size:22px; letter-spacing:.5px; line-height:1.15;}\n'
+ '  header .sub{font-size:13px; opacity:.92; margin-top:5px;}\n'
+ '  header .flag{font-size:24px; letter-spacing:3px; margin-bottom:6px;}\n'
+ '  .card{background:#fff; border:1px solid var(--line); border-radius:12px;\n'
+ '        margin:14px 0; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.05);}\n'
+ '  .card h2{background:var(--blue); color:#fff; font-size:15px; padding:11px 14px;\n'
+ '           display:flex; align-items:center; gap:8px;}\n'
+ '  .card .body{padding:14px;}\n'
+ '  label.fld{display:block; font-size:12px; font-weight:600; color:var(--muted);\n'
+ '            margin:10px 0 4px; text-transform:uppercase; letter-spacing:.4px;}\n'
+ '  input[type=text], input[type=email], input[type=tel], select{\n'
+ '    width:100%; padding:11px 12px; font-size:16px; border:1px solid #c4ccd6;\n'
+ '    border-radius:8px; background:#fff; color:var(--ink);}\n'
+ '  input:focus, select:focus{outline:none; border-color:var(--blue2); box-shadow:0 0 0 3px rgba(10,82,201,.12);}\n'
+ '  .legend{display:grid; grid-template-columns:1fr; gap:8px;}\n'
+ '  .lg{display:flex; align-items:center; gap:10px; font-size:13.5px; padding:9px 11px;\n'
+ '      background:#f7f9fc; border:1px solid var(--line); border-radius:8px;}\n'
+ '  .lg .pts{margin-left:auto; font-weight:800; color:var(--blue); white-space:nowrap;}\n'
+ '  .lg .ic{font-size:18px;}\n'
+ '  .grp-letter{display:inline-flex; align-items:center; justify-content:center;\n'
+ '              width:26px; height:26px; border-radius:6px; background:var(--gold);\n'
+ '              color:#1a2330; font-weight:800; font-size:15px;}\n'
+ '  .match{display:flex; align-items:center; gap:6px; padding:9px 0; border-bottom:1px dashed var(--line);}\n'
+ '  .match:last-of-type{border-bottom:none;}\n'
+ '  .match .t{flex:1 1 0; min-width:0; font-size:14px; font-weight:600; display:flex; align-items:center; gap:5px;}\n'
+ '  .match .t.home{justify-content:flex-end; text-align:right;}\n'
+ '  .match .t.away{justify-content:flex-start; text-align:left;}\n'
+ '  .match .t .fl{font-size:16px;}\n'
+ '  .score{width:42px; flex:0 0 42px; text-align:center; padding:9px 2px; font-size:17px;\n'
+ '         font-weight:700; background:var(--input); border:1px solid #d8c98a;}\n'
+ '  .dash{flex:0 0 auto; color:var(--muted); font-weight:700;}\n'
+ '  .md-tag{font-size:10px; color:var(--muted); text-align:center; margin:6px 0 2px;\n'
+ '          text-transform:uppercase; letter-spacing:.5px; font-weight:700;}\n'
+ '  .qualifiers{border-top:2px solid var(--gold); background:#fffdf3; margin:12px -14px -14px; padding:12px 14px;}\n'
+ '  .qualifiers .qt{font-size:12px; font-weight:700; color:var(--red); margin-bottom:8px;\n'
+ '                  text-transform:uppercase; letter-spacing:.3px;}\n'
+ '  .qrow{display:grid; grid-template-columns:1fr 1fr; gap:10px;}\n'
+ '  .qrow label{font-size:11px; font-weight:700; color:var(--muted); display:block; margin-bottom:3px;}\n'
+ '  .ko-note{font-size:12.5px; color:var(--muted); padding:10px 14px; background:#f7f9fc;\n'
+ '           border-bottom:1px solid var(--line);}\n'
+ '  .ko-round{padding:12px 14px; border-bottom:1px solid var(--line);}\n'
+ '  .ko-round:last-child{border-bottom:none;}\n'
+ '  .ko-round h3{font-size:13px; color:var(--blue); margin-bottom:2px; display:flex; align-items:center; gap:8px;}\n'
+ '  .ko-round .bonus{margin-left:auto; font-size:11px; font-weight:800; color:#fff;\n'
+ '                   background:var(--red); padding:2px 8px; border-radius:20px;}\n'
+ '  .ko-round.final h3{color:var(--gold);}\n'
+ '  .ko-match{display:flex; align-items:center; gap:6px; margin-top:9px;}\n'
+ '  .ko-match .tn{flex:1 1 0; min-width:0;}\n'
+ '  .ko-match .tn input{padding:9px 10px; font-size:14px;}\n'
+ '  .ko-match .sc{width:40px; flex:0 0 40px;}\n'
+ '  .ko-num{flex:0 0 30px; font-size:10px; color:var(--muted); font-weight:700; text-align:center;}\n'
+ '  .champ{background:linear-gradient(135deg,#fff8e1,#fff); border:2px solid var(--gold);\n'
+ '         border-radius:10px; padding:14px; margin-top:6px; text-align:center;}\n'
+ '  .champ label{font-size:13px; font-weight:800; color:var(--red); display:block; margin-bottom:8px;\n'
+ '               text-transform:uppercase; letter-spacing:.5px;}\n'
+ '  .subbar{position:fixed; left:0; right:0; bottom:0; background:#fff; border-top:1px solid var(--line);\n'
+ '          padding:12px; box-shadow:0 -3px 12px rgba(0,0,0,.08); z-index:50;}\n'
+ '  .subbar .inner{max-width:760px; margin:0 auto; display:flex; gap:10px; align-items:center;}\n'
+ '  #progress{font-size:12px; color:var(--muted); flex:1 1 auto;}\n'
+ '  #progress b{color:var(--blue);}\n'
+ '  button.submit{flex:0 0 auto; background:linear-gradient(135deg,var(--gold),#b8941f); color:#1a2330;\n'
+ '                font-weight:800; font-size:15px; border:none; border-radius:10px; padding:13px 22px;\n'
+ '                letter-spacing:.4px; cursor:pointer;}\n'
+ '  .overlay{position:fixed; inset:0; background:rgba(10,20,40,.72); display:none;\n'
+ '           align-items:center; justify-content:center; z-index:100; padding:24px;}\n'
+ '  .overlay.show{display:flex;}\n'
+ '  .modal{background:#fff; border-radius:16px; max-width:380px; width:100%; padding:26px 22px; text-align:center;}\n'
+ '  .modal .big{font-size:46px; margin-bottom:8px;}\n'
+ '  .modal h3{font-size:20px; margin-bottom:8px;}\n'
+ '  .modal p{font-size:14px; color:var(--muted); margin-bottom:6px;}\n'
+ '  .modal button{margin-top:14px; background:var(--blue); color:#fff; border:none; border-radius:9px;\n'
+ '                padding:11px 20px; font-size:14px; font-weight:700; cursor:pointer;}\n'
+ '  .spinner{width:42px; height:42px; border:4px solid var(--line); border-top-color:var(--blue);\n'
+ '           border-radius:50%; animation:spin .8s linear infinite; margin:0 auto 14px;}\n'
+ '  @keyframes spin{to{transform:rotate(360deg);}}\n'
+ '  .footnote{text-align:center; font-size:11px; color:var(--muted); padding:6px 0 14px;}\n'
+ '</style>\n'
+ '</head>\n'
+ '<body>\n'
+ '<header>\n'
+ '  <div class="flag">🇨🇦 🇲🇽 🇺🇸</div>\n'
+ '  <h1>FIFA WORLD CUP 2026 POOL</h1>\n'
+ '  <div class="sub">Predict every match · Fill out the full bracket · Win the pool</div>\n'
+ '</header>\n'
+ '<div class="wrap">\n'
+ '  <div class="card">\n'
+ '    <h2>👤 Your Info</h2>\n'
+ '    <div class="body">\n'
+ '      <label class="fld">Full Name *</label>\n'
+ '      <input type="text" data-key="Name" id="f_name" placeholder="Your full name" />\n'
+ '      <label class="fld">Email</label>\n'
+ '      <input type="email" data-key="Email" placeholder="optional" />\n'
+ '      <label class="fld">Phone / WhatsApp</label>\n'
+ '      <input type="tel" data-key="Phone" placeholder="optional" />\n'
+ '    </div>\n'
+ '  </div>\n'
+ '  <div class="card">\n'
+ '    <h2>🏅 How Scoring Works</h2>\n'
+ '    <div class="body legend">\n'
+ '      <div class="lg"><span class="ic">✅</span><span>Correct winner <em>or</em> correct draw prediction</span><span class="pts">3 pts</span></div>\n'
+ '      <div class="lg"><span class="ic">🎯</span><span>Correct outcome + exact score</span><span class="pts">5 pts</span></div>\n'
+ '      <div class="lg"><span class="ic">🟢</span><span>Each team you correctly predict advances from their group</span><span class="pts">+5 pts</span></div>\n'
+ '      <div class="lg"><span class="ic">🔵</span><span>Each team you correctly predict reaches Round of 16</span><span class="pts">+10 pts</span></div>\n'
+ '      <div class="lg"><span class="ic">🟣</span><span>Each team you correctly predict reaches Quarterfinals</span><span class="pts">+15 pts</span></div>\n'
+ '      <div class="lg"><span class="ic">🔴</span><span>Each team you correctly predict reaches Semifinals</span><span class="pts">+20 pts</span></div>\n'
+ '      <div class="lg"><span class="ic">🏆</span><span>Each team you correctly predict reaches the Final</span><span class="pts">+25 pts</span></div>\n'
+ '    </div>\n'
+ '  </div>\n'
+ '  <div id="groups"></div>\n'
+ '  <div class="card">\n'
+ '    <h2>🏆 Knockout Stage</h2>\n'
+ '    <div class="ko-note">Fill in the teams you predict for every knockout match, from the Round of 32 all the way to the Final. You earn bonus points for each team that actually makes it to that round.</div>\n'
+ '    <div id="knockout"></div>\n'
+ '    <div style="padding:14px;">\n'
+ '      <div class="champ">\n'
+ '        <label>🏆 My 2026 World Cup Champion</label>\n'
+ '        <input type="text" data-key="CHAMPION" placeholder="Write your champion pick" />\n'
+ '      </div>\n'
+ '    </div>\n'
+ '  </div>\n'
+ '  <div class="footnote">FIFA World Cup 2026™ · Jun 11 – Jul 19 · Unofficial pool</div>\n'
+ '</div>\n'
+ '<div class="subbar">\n'
+ '  <div class="inner">\n'
+ '    <div id="progress">Matches filled: <b id="filled">0</b> / 72</div>\n'
+ '    <button class="submit" id="submitBtn" type="button">SUBMIT ▸</button>\n'
+ '  </div>\n'
+ '</div>\n'
+ '<div class="overlay" id="overlay"><div class="modal" id="modal"></div></div>\n'
+ '<form id="poolForm" method="POST" action="' + GAS_URL + '" target="hiddenFrame" style="display:none;">\n'
+ '  <textarea name="payload" id="payload"></textarea>\n'
+ '</form>\n'
+ '<iframe name="hiddenFrame" id="hiddenFrame" style="display:none;"></iframe>\n'
+ '<script>\n'
+ 'var FL={"Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿","Canada":"🇨🇦","Bosnia-Herzegovina":"🇧🇦","Qatar":"🇶🇦","Switzerland":"🇨🇭","Brazil":"🇧🇷","Morocco":"🇲🇦","Haiti":"🇭🇹","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","USA":"🇺🇸","Paraguay":"🇵🇾","Australia":"🇦🇺","Türkiye":"🇹🇷","Germany":"🇩🇪","Curaçao":"🇨🇼","Ivory Coast":"🇨🇮","Ecuador":"🇪🇨","Netherlands":"🇳🇱","Japan":"🇯🇵","Sweden":"🇸🇪","Tunisia":"🇹🇳","Belgium":"🇧🇪","Egypt":"🇪🇬","Iran":"🇮🇷","New Zealand":"🇳🇿","Spain":"🇪🇸","Cape Verde":"🇨🇻","Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾","France":"🇫🇷","Senegal":"🇸🇳","Iraq":"🇮🇶","Norway":"🇳🇴","Argentina":"🇦🇷","Algeria":"🇩🇿","Austria":"🇦🇹","Jordan":"🇯🇴","Portugal":"🇵🇹","DR Congo":"🇨🇩","Uzbekistan":"🇺🇿","Colombia":"🇨🇴","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷","Ghana":"🇬🇭","Panama":"🇵🇦"};\n'
+ 'function fl(t){return FL[t]||"⚽";}\n'
+ 'var GROUPS={"A":["Mexico","South Africa","South Korea","Czechia"],"B":["Canada","Bosnia-Herzegovina","Qatar","Switzerland"],"C":["Brazil","Morocco","Haiti","Scotland"],"D":["USA","Paraguay","Australia","Türkiye"],"E":["Germany","Curaçao","Ivory Coast","Ecuador"],"F":["Netherlands","Japan","Sweden","Tunisia"],"G":["Belgium","Egypt","Iran","New Zealand"],"H":["Spain","Cape Verde","Saudi Arabia","Uruguay"],"I":["France","Senegal","Iraq","Norway"],"J":["Argentina","Algeria","Austria","Jordan"],"K":["Portugal","DR Congo","Uzbekistan","Colombia"],"L":["England","Croatia","Ghana","Panama"]};\n'
+ 'var FIXTURES=[[1,"Jun 11","A",1,"Mexico","South Africa"],[2,"Jun 11","A",1,"South Korea","Czechia"],[3,"Jun 18","A",2,"Czechia","South Africa"],[4,"Jun 18","A",2,"Mexico","South Korea"],[5,"Jun 24","A",3,"Mexico","Czechia"],[6,"Jun 24","A",3,"South Korea","South Africa"],[7,"Jun 12","B",1,"Canada","Bosnia-Herzegovina"],[8,"Jun 13","B",1,"Qatar","Switzerland"],[9,"Jun 18","B",2,"Switzerland","Bosnia-Herzegovina"],[10,"Jun 18","B",2,"Canada","Qatar"],[11,"Jun 24","B",3,"Switzerland","Canada"],[12,"Jun 24","B",3,"Bosnia-Herzegovina","Qatar"],[13,"Jun 13","C",1,"Brazil","Morocco"],[14,"Jun 13","C",1,"Haiti","Scotland"],[15,"Jun 19","C",2,"Scotland","Morocco"],[16,"Jun 19","C",2,"Brazil","Haiti"],[17,"Jun 24","C",3,"Brazil","Scotland"],[18,"Jun 24","C",3,"Morocco","Haiti"],[19,"Jun 12","D",1,"USA","Paraguay"],[20,"Jun 13","D",1,"Australia","Türkiye"],[21,"Jun 19","D",2,"USA","Australia"],[22,"Jun 19","D",2,"Türkiye","Paraguay"],[23,"Jun 25","D",3,"USA","Türkiye"],[24,"Jun 25","D",3,"Paraguay","Australia"],[25,"Jun 14","E",1,"Germany","Curaçao"],[26,"Jun 14","E",1,"Ivory Coast","Ecuador"],[27,"Jun 20","E",2,"Germany","Ivory Coast"],[28,"Jun 20","E",2,"Ecuador","Curaçao"],[29,"Jun 25","E",3,"Ecuador","Germany"],[30,"Jun 25","E",3,"Curaçao","Ivory Coast"],[31,"Jun 14","F",1,"Netherlands","Japan"],[32,"Jun 14","F",1,"Tunisia","Sweden"],[33,"Jun 20","F",2,"Netherlands","Sweden"],[34,"Jun 20","F",2,"Tunisia","Japan"],[35,"Jun 25","F",3,"Tunisia","Netherlands"],[36,"Jun 25","F",3,"Japan","Sweden"],[37,"Jun 15","G",1,"Belgium","Egypt"],[38,"Jun 15","G",1,"Iran","New Zealand"],[39,"Jun 21","G",2,"Belgium","Iran"],[40,"Jun 21","G",2,"New Zealand","Egypt"],[41,"Jun 26","G",3,"New Zealand","Belgium"],[42,"Jun 26","G",3,"Egypt","Iran"],[43,"Jun 15","H",1,"Spain","Cape Verde"],[44,"Jun 15","H",1,"Saudi Arabia","Uruguay"],[45,"Jun 21","H",2,"Spain","Saudi Arabia"],[46,"Jun 21","H",2,"Uruguay","Cape Verde"],[47,"Jun 26","H",3,"Uruguay","Spain"],[48,"Jun 26","H",3,"Cape Verde","Saudi Arabia"],[49,"Jun 16","I",1,"France","Senegal"],[50,"Jun 16","I",1,"Iraq","Norway"],[51,"Jun 22","I",2,"France","Iraq"],[52,"Jun 22","I",2,"Norway","Senegal"],[53,"Jun 26","I",3,"Norway","France"],[54,"Jun 26","I",3,"Senegal","Iraq"],[55,"Jun 16","J",1,"Argentina","Algeria"],[56,"Jun 16","J",1,"Austria","Jordan"],[57,"Jun 22","J",2,"Argentina","Austria"],[58,"Jun 22","J",2,"Jordan","Algeria"],[59,"Jun 27","J",3,"Algeria","Austria"],[60,"Jun 27","J",3,"Jordan","Argentina"],[61,"Jun 17","K",1,"Portugal","DR Congo"],[62,"Jun 17","K",1,"Uzbekistan","Colombia"],[63,"Jun 23","K",2,"Portugal","Uzbekistan"],[64,"Jun 23","K",2,"Colombia","DR Congo"],[65,"Jun 27","K",3,"Colombia","Portugal"],[66,"Jun 27","K",3,"DR Congo","Uzbekistan"],[67,"Jun 17","L",1,"England","Croatia"],[68,"Jun 17","L",1,"Ghana","Panama"],[69,"Jun 23","L",2,"England","Ghana"],[70,"Jun 23","L",2,"Panama","Croatia"],[71,"Jun 27","L",3,"Panama","England"],[72,"Jun 27","L",3,"Croatia","Ghana"]];\n'
+ 'var GC={"A":"#003DA5","B":"#0a7e3f","C":"#c8102e","D":"#7b1fa2","E":"#00838f","F":"#e65100","G":"#283593","H":"#5d4037","I":"#ad1457","J":"#2e7d32","K":"#9e6f00","L":"#1565c0"};\n'
+ 'var gEl=document.getElementById("groups");\n'
+ 'Object.keys(GROUPS).forEach(function(g){\n'
+ '  var ms=FIXTURES.filter(function(f){return f[2]===g;});\n'
+ '  var card=document.createElement("div"); card.className="card";\n'
+ '  var tl=GROUPS[g].map(function(t){return fl(t)+" "+t;}).join("  ·  ");\n'
+ '  var h=\'<h2><span class="grp-letter" style="background:\'+GC[g]+\';color:#fff">\'+g+\'</span> Group \'+g+\'</h2>\';\n'
+ '  h+=\'<div class="body"><div style="font-size:12px;color:var(--muted);margin-bottom:6px">\'+tl+\'</div>\';\n'
+ '  var lm=0;\n'
+ '  ms.forEach(function(m){\n'
+ '    if(m[3]!==lm){h+=\'<div class="md-tag">Matchday \'+m[3]+\' · \'+m[1]+\'</div>\'; lm=m[3];}\n'
+ '    h+=\'<div class="match">\'\n'
+ '      +\'<span class="t home">\'+m[4]+\' <span class="fl">\'+fl(m[4])+\'</span></span>\'\n'
+ '      +\'<input class="score gscore" inputmode="numeric" maxlength="2" data-key="P\'+m[0]+\'_H" />\'\n'
+ '      +\'<span class="dash">–</span>\'\n'
+ '      +\'<input class="score gscore" inputmode="numeric" maxlength="2" data-key="P\'+m[0]+\'_A" />\'\n'
+ '      +\'<span class="t away"><span class="fl">\'+fl(m[5])+\'</span> \'+m[5]+\'</span>\'\n'
+ '      +\'</div>\';\n'
+ '  });\n'
+ '  var opts=\'<option value="">— select —</option>\'+GROUPS[g].map(function(t){return \'<option value="\'+t+\'">\'+t+\'</option>\';}).join("");\n'
+ '  h+=\'<div class="qualifiers"><div class="qt">Who advances from this group? (+5 pts per correct team)</div>\'\n'
+ '     +\'<div class="qrow">\'\n'
+ '     +\'<div><label>🥇 1st Place</label><select data-key="G\'+g+\'_1">\'+opts+\'</select></div>\'\n'
+ '     +\'<div><label>🥈 2nd Place</label><select data-key="G\'+g+\'_2">\'+opts+\'</select></div>\'\n'
+ '     +\'</div></div>\';\n'
+ '  h+=\'</div>\';\n'
+ '  card.innerHTML=h; gEl.appendChild(card);\n'
+ '});\n'
+ 'var KO=[{key:"R32",name:"Round of 32",count:16,bonus:"+5 pts/team",cls:""},{key:"R16",name:"Round of 16",count:8,bonus:"+10 pts/team",cls:""},{key:"QF",name:"Quarterfinals",count:4,bonus:"+15 pts/team",cls:""},{key:"SF",name:"Semifinals",count:2,bonus:"+20 pts/team",cls:""},{key:"3RD",name:"Third Place",count:1,bonus:"3 / 5 pts",cls:""},{key:"FIN",name:"FINAL",count:1,bonus:"+25 pts/team",cls:"final"}];\n'
+ 'var koEl=document.getElementById("knockout");\n'
+ 'KO.forEach(function(r){\n'
+ '  var d=document.createElement("div"); d.className="ko-round "+r.cls;\n'
+ '  var h=\'<h3>\'+(r.cls==="final"?"🏆 ":"")+r.name+\'<span class="bonus">\'+r.bonus+\'</span></h3>\';\n'
+ '  for(var i=1;i<=r.count;i++){\n'
+ '    h+=\'<div class="ko-match">\'\n'
+ '      +\'<span class="ko-num">\'+i+\'</span>\'\n'
+ '      +\'<span class="tn"><input type="text" data-key="\'+r.key+\'_\'+i+\'_A" placeholder="Team" /></span>\'\n'
+ '      +\'<input class="score sc" inputmode="numeric" maxlength="2" data-key="\'+r.key+\'_\'+i+\'_SA" />\'\n'
+ '      +\'<span class="dash">–</span>\'\n'
+ '      +\'<input class="score sc" inputmode="numeric" maxlength="2" data-key="\'+r.key+\'_\'+i+\'_SB" />\'\n'
+ '      +\'<span class="tn"><input type="text" data-key="\'+r.key+\'_\'+i+\'_B" placeholder="Team" /></span>\'\n'
+ '      +\'</div>\';\n'
+ '  }\n'
+ '  d.innerHTML=h; koEl.appendChild(d);\n'
+ '});\n'
+ 'var filledEl=document.getElementById("filled");\n'
+ 'function upd(){var n=0; for(var i=1;i<=72;i++){var a=document.querySelector(\'[data-key="P\'+i+\'_H"]\');var b=document.querySelector(\'[data-key="P\'+i+\'_A"]\');if(a&&b&&a.value!==""&&b.value!=="")n++;} filledEl.textContent=n;}\n'
+ 'document.addEventListener("input",function(e){if(e.target.classList.contains("gscore"))upd();});\n'
+ 'var submitting=false;\n'
+ 'function showModal(h){document.getElementById("modal").innerHTML=h;document.getElementById("overlay").classList.add("show");}\n'
+ 'document.getElementById("submitBtn").addEventListener("click",function(){\n'
+ '  var name=document.getElementById("f_name").value.trim();\n'
+ '  if(!name){showModal(\'<div class="big">✋</div><h3>Name required</h3><p>Please enter your full name before submitting.</p><button onclick="document.getElementById(\\\'overlay\\\').classList.remove(\\\'show\\\')">OK</button>\');return;}\n'
+ '  if(submitting)return; submitting=true;\n'
+ '  var data={};\n'
+ '  document.querySelectorAll("[data-key]").forEach(function(el){data[el.getAttribute("data-key")]=el.value.trim();});\n'
+ '  document.getElementById("payload").value=JSON.stringify(data);\n'
+ '  showModal(\'<div class="spinner"></div><h3>Submitting…</h3><p>Saving your predictions</p>\');\n'
+ '  var frame=document.getElementById("hiddenFrame"); var done=false;\n'
+ '  frame.onload=function(){if(done)return;done=true;\n'
+ '    showModal(\'<div class="big">✅</div><h3>You\\\'re in, \'+name.split(" ")[0]+\'!</h3><p>Your predictions have been sent to the organizer.</p><p style="margin-top:8px;font-size:12px">Take a screenshot as backup. Good luck! 🍀</p><button onclick="document.getElementById(\\\'overlay\\\').classList.remove(\\\'show\\\')">Close</button>\');\n'
+ '  };\n'
+ '  setTimeout(function(){if(done)return;done=true;showModal(\'<div class="big">✅</div><h3>Submitted!</h3><p>If unsure, take a screenshot and let the organizer know.</p><button onclick="document.getElementById(\\\'overlay\\\').classList.remove(\\\'show\\\')">Close</button>\');},6000);\n'
+ '  document.getElementById("poolForm").submit();\n'
+ '  setTimeout(function(){submitting=false;},8000);\n'
+ '});\n'
+ '</script>\n'
+ '</body>\n'
+ '</html>';
}

function doPost(e) {
  // WARNING: Do NOT add authentication or guards to the deploy action.
  // GitHub Actions calls doPost(action=deploy) to trigger GAS self-update.
  var action = (e && e.parameter && e.parameter.action) || "";
  if (action === "deploy") {
    return ContentService.createTextOutput(pullAndDeployFromGitHub());
  }

  // Bracket submission from the public web form (world-cup-pool.html).
  // The form posts a single "payload" field (JSON) to a hidden iframe.
  if (e && e.parameter && e.parameter.payload) {
    return _saveSubmission(e.parameter.payload);
  }
  if (e && e.postData && e.postData.contents) {
    return _saveSubmission(e.postData.contents);
  }

  return ContentService.createTextOutput("ok");
}

// ═════════════════════════════════════════════════════════════════════════════
//  PUBLIC FORM SUBMISSIONS  —  each participant's picks land in "Predicciones"
// ═════════════════════════════════════════════════════════════════════════════
function _saveSubmission(jsonStr) {
  try {
    var data  = JSON.parse(jsonStr);
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName("Predicciones") || ss.insertSheet("Predicciones");
    var keys  = Object.keys(data);

    // First submission: write a header row (Timestamp + every payload key).
    if (sheet.getLastRow() === 0) {
      var headers = ["Timestamp"].concat(keys);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers])
        .setBackground(COLOR_HEADER).setFontColor("#ffffff").setFontWeight("bold");
      sheet.setFrozenRows(1);
      sheet.setFrozenColumns(2);
    }

    // Reconcile against existing headers; append any new keys as new columns.
    var existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    keys.forEach(function(k) {
      if (existing.indexOf(k) === -1) {
        existing.push(k);
        sheet.getRange(1, existing.length).setValue(k)
          .setBackground(COLOR_HEADER).setFontColor("#ffffff").setFontWeight("bold");
      }
    });

    var row = existing.map(function(h) {
      if (h === "Timestamp") return new Date();
      return data.hasOwnProperty(h) ? data[h] : "";
    });
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
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
  var newCode = UrlFetchApp.fetch(apiUrl, { headers: fetchHeaders }).getContentText("UTF-8");

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

// ═════════════════════════════════════════════════════════════════════════════
//  TRIGGER SETUP  —  run once from the script editor
// ═════════════════════════════════════════════════════════════════════════════
function installOnOpenTrigger() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ScriptApp.getUserTriggers(ss).forEach(function(t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("onOpen").forSpreadsheet(ss).onOpen().create();
  Logger.log("onOpen trigger installed. The Pool menu will appear next time you open the spreadsheet.");
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN SETUP  —  run once from the script editor to build the spreadsheet
// ═════════════════════════════════════════════════════════════════════════════
function createWorldCupPool() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  if (ss.getSheetByName("RESULTADOS")) {
    Logger.log("Pool already configured: " + ss.getUrl());
    Logger.log("Use Pool > Agregar Participante to add players.");
    return;
  }

  var resultsSheet = ss.insertSheet("RESULTADOS", 0);
  var leaderSheet  = ss.insertSheet("TABLA",      1);
  var bracketSheet = ss.insertSheet("BRACKET",    2);

  // Delete any pre-existing default sheets (e.g. "Sheet1")
  ss.getSheets().forEach(function(s) {
    if (SYSTEM_SHEETS.indexOf(s.getName()) === -1) ss.deleteSheet(s);
  });

  _setupResultsSheet(resultsSheet);
  _setupLeaderboardSheet(leaderSheet);
  _setupBracketSheet(bracketSheet);
  ss.setActiveSheet(leaderSheet);

  Logger.log("Pool configured successfully: " + ss.getUrl());
  Logger.log("Next step: Run installOnOpenTrigger() to enable the Pool menu in the spreadsheet.");
}

// ═════════════════════════════════════════════════════════════════════════════
//  RESULTADOS SHEET
// ═════════════════════════════════════════════════════════════════════════════
function _setupResultsSheet(sheet) {
  sheet.getRange(1,1,1,9).merge()
    .setValue("RESULTADOS — World Cup 2026 Pool")
    .setBackground(COLOR_HEADER).setFontColor("#ffffff")
    .setFontSize(13).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1, 36);

  sheet.getRange(2,1,1,9).setValues([["#","Fecha","Grupo","MD","Equipo 1","Goles 1","Goles 2","Equipo 2","Resultado"]])
    .setBackground(COLOR_SUBHDR).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  var rows = FIXTURES.map(function(f) { return [f[0],f[1],f[2],f[3],f[4],"","",f[5],""]; });
  sheet.getRange(3,1,rows.length,9).setValues(rows);

  for (var i = 0; i < FIXTURES.length; i++) {
    var r  = i + 3;
    var gc = GROUP_COLORS[FIXTURES[i][2]] || "#ffffff";
    sheet.getRange(r,1,1,9).setBackground(gc);
    sheet.getRange(r,6,1,2).setBackground(COLOR_INPUT);
    sheet.getRange(r,9).setBackground(COLOR_AUTO)
      .setFormula('=IF(F'+r+'="","",IF(F'+r+'>G'+r+',E'+r+',IF(G'+r+'>F'+r+',H'+r+',"Empate")))');
  }

  [40,65,55,40,150,60,60,150,120].forEach(function(w,c) { sheet.setColumnWidth(c+1,w); });
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(4);
  sheet.getRange(76,1).setValue("Ingresa los goles en columnas F y G. El Resultado se calcula automaticamente.")
    .setFontStyle("italic").setFontColor("#888888");
}

// ═════════════════════════════════════════════════════════════════════════════
//  PARTICIPANT SHEET
// ═════════════════════════════════════════════════════════════════════════════
function addParticipant() {
  var ss  = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ui  = SpreadsheetApp.getUi();
  var res = ui.prompt("Agregar Participante", "Nombre del participante:", ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;
  var name = res.getResponseText().trim();
  if (!name) { ui.alert("Nombre vacio."); return; }
  if (ss.getSheetByName(name)) { ui.alert("Ya existe un participante con ese nombre."); return; }

  _buildParticipantSheet(ss.insertSheet(name, ss.getNumSheets()), name);
  _updateLeaderboard(ss);
  ui.alert("'" + name + "' agregado correctamente.\n\nPide al participante que llene sus pronosticos en la pestana '" + name + "'.");
}

function _buildParticipantSheet(sheet, name) {
  sheet.getRange(1,1,1,11).merge()
    .setValue(name + " — Pronosticos World Cup 2026")
    .setBackground(COLOR_HEADER).setFontColor("#ffffff")
    .setFontSize(13).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1,36);

  sheet.getRange(2,1,1,11).setValues([["#","Fecha","Grupo","Equipo 1","Gol 1","Gol 2","Equipo 2","Mi Pronostico","Pts Result.","Pts Exacto","TOTAL"]])
    .setBackground(COLOR_SUBHDR).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  var rows = FIXTURES.map(function(f) { return [f[0],f[1],f[2],f[4],"","",f[5],"","","",""]; });
  sheet.getRange(3,1,rows.length,11).setValues(rows);

  for (var i = 0; i < FIXTURES.length; i++) {
    var r  = i + 3;
    var gc = GROUP_COLORS[FIXTURES[i][2]] || "#ffffff";
    sheet.getRange(r,1,1,11).setBackground(gc);
    sheet.getRange(r,5,1,2).setBackground(COLOR_INPUT);

    // Col H: predicted winner derived from score inputs
    sheet.getRange(r,8).setBackground(COLOR_AUTO)
      .setFormula('=IF(E'+r+'="","",IF(E'+r+'>F'+r+',D'+r+',IF(F'+r+'>E'+r+',G'+r+',"Empate")))');

    // Col I: 2 pts if predicted winner matches actual winner
    sheet.getRange(r,9).setBackground(COLOR_AUTO)
      .setFormula('=IF(VLOOKUP(A'+r+',RESULTADOS!$A:$I,9,0)="","",IF(H'+r+'=VLOOKUP(A'+r+',RESULTADOS!$A:$I,9,0),2,0))');

    // Col J: 3 pts if exact score matches
    sheet.getRange(r,10).setBackground(COLOR_AUTO)
      .setFormula('=IF(VLOOKUP(A'+r+',RESULTADOS!$A:$G,6,0)="","",IF(AND(E'+r+'=VLOOKUP(A'+r+',RESULTADOS!$A:$G,6,0),F'+r+'=VLOOKUP(A'+r+',RESULTADOS!$A:$G,7,0)),3,0))');

    // Col K: total points
    sheet.getRange(r,11).setBackground(COLOR_AUTO)
      .setFormula('=IF(AND(I'+r+'="",J'+r+'=""),"",I'+r+'+J'+r+')');
  }

  sheet.getRange(TOT_ROW,4).setValue("TOTAL").setFontWeight("bold").setBackground("#d5e8d4");
  sheet.getRange(TOT_ROW,9).setFormula("=SUM(I3:I74)").setFontWeight("bold").setBackground("#d5e8d4");
  sheet.getRange(TOT_ROW,10).setFormula("=SUM(J3:J74)").setFontWeight("bold").setBackground("#d5e8d4");
  sheet.getRange(TOT_ROW,11).setFormula("=SUM(K3:K74)").setFontWeight("bold").setBackground("#d5e8d4").setFontSize(12);

  [40,65,55,145,55,55,145,115,90,90,70].forEach(function(w,c) { sheet.setColumnWidth(c+1,w); });
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(3);
  sheet.getRange(TOT_ROW+2,1)
    .setValue("Reglas: Resultado correcto = 2 pts  |  Marcador exacto = +3 pts adicionales  |  Maximo por partido: 5 pts")
    .setFontStyle("italic").setFontColor("#666666");
}

// ═════════════════════════════════════════════════════════════════════════════
//  LEADERBOARD (TABLA)
// ═════════════════════════════════════════════════════════════════════════════
function _setupLeaderboardSheet(sheet) {
  sheet.getRange(1,1,1,5).merge()
    .setValue("TABLA DE POSICIONES — World Cup 2026 Pool")
    .setBackground(COLOR_HEADER).setFontColor("#ffffff")
    .setFontSize(13).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1,36);

  sheet.getRange(2,1,1,5).setValues([["Pos","Participante","Pts Resultado","Pts Exacto","TOTAL"]])
    .setBackground(COLOR_SUBHDR).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  sheet.getRange(3,1).setValue("(Usa el menu Pool > Agregar Participante para agregar jugadores)")
    .setFontStyle("italic").setFontColor("#aaaaaa");

  [50,200,120,100,90].forEach(function(w,c) { sheet.setColumnWidth(c+1,w); });
  sheet.setFrozenRows(2);
}

function _updateLeaderboard(ss) {
  var sheet = ss.getSheetByName("TABLA");
  if (!sheet) return;

  var participants = ss.getSheets().filter(function(s) {
    return SYSTEM_SHEETS.indexOf(s.getName()) === -1;
  }).map(function(s) { return s.getName(); });

  var last = sheet.getLastRow();
  if (last > 2) sheet.getRange(3,1,last-2,5).clearContent().setBackground("#ffffff");
  if (participants.length === 0) return;

  participants.forEach(function(name, idx) {
    var r  = idx + 3;
    var sn = "'" + name + "'";
    sheet.getRange(r,2).setValue(name);
    sheet.getRange(r,3).setFormula("="+sn+"!I"+TOT_ROW);
    sheet.getRange(r,4).setFormula("="+sn+"!J"+TOT_ROW);
    sheet.getRange(r,5).setFormula("="+sn+"!K"+TOT_ROW).setFontWeight("bold");
  });

  var lastData = 2 + participants.length;
  for (var i = 0; i < participants.length; i++) {
    var r = i + 3;
    sheet.getRange(r,1).setFormula('=IFERROR(RANK(E'+r+',E$3:E'+lastData+',0),1)').setFontWeight("bold");
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  BRACKET SHEET
// ═════════════════════════════════════════════════════════════════════════════
function _setupBracketSheet(sheet) {
  sheet.getRange(1,1,1,6).merge()
    .setValue("BRACKET ELIMINATORIO — World Cup 2026")
    .setBackground(COLOR_HEADER).setFontColor("#ffffff")
    .setFontSize(13).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1,36);

  sheet.getRange(2,1,1,6).merge()
    .setValue("Disponible al concluir la fase de grupos (28 Jun). Llena la columna Tu Pick con el equipo que crees ganara cada partido.")
    .setFontStyle("italic").setFontColor("#c0392b").setBackground("#fdf2f2");

  sheet.getRange(3,1,1,6).setValues([["Partido","Equipo A","vs","Equipo B","Tu Pick (ganador)","Ptos si aciertas"]])
    .setBackground(COLOR_SUBHDR).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  var rounds = [
    {name:"Ronda de 32  (16 partidos)",     count:16, pts:2,  hdr:"Ronda de 32"},
    {name:"Octavos de Final  (8 partidos)", count:8,  pts:4,  hdr:"Octavos"},
    {name:"Cuartos de Final  (4 partidos)", count:4,  pts:6,  hdr:"Cuartos"},
    {name:"Semifinales  (2 partidos)",      count:2,  pts:8,  hdr:"Semis"},
    {name:"Tercer Lugar  (1 partido)",      count:1,  pts:5,  hdr:"3er Lugar"},
    {name:"FINAL",                          count:1,  pts:15, hdr:"FINAL"},
  ];

  var row = 4;
  rounds.forEach(function(round) {
    sheet.getRange(row,1,1,6).merge()
      .setValue("-- " + round.name + "   |   " + round.pts + " puntos si aciertas el ganador --")
      .setBackground("#d5e8d4").setFontWeight("bold");
    row++;
    for (var m = 1; m <= round.count; m++) {
      sheet.getRange(row,1).setValue(round.hdr + " " + m).setBackground("#f5f5f5");
      sheet.getRange(row,2).setValue("Por definir").setFontStyle("italic").setFontColor("#aaaaaa");
      sheet.getRange(row,3).setValue("vs").setHorizontalAlignment("center");
      sheet.getRange(row,4).setValue("Por definir").setFontStyle("italic").setFontColor("#aaaaaa");
      sheet.getRange(row,5).setBackground(COLOR_INPUT);
      sheet.getRange(row,6).setValue(round.pts).setHorizontalAlignment("center");
      row++;
    }
    row++;
  });

  [100,160,35,160,165,120].forEach(function(w,c) { sheet.setColumnWidth(c+1,w); });
  sheet.setFrozenRows(3);
}

// ═════════════════════════════════════════════════════════════════════════════
//  LEADERBOARD SYSTEM  —  scores web-form submissions ("Predicciones")
//  against the organizer-entered "Results" tab.
//
//  Scoring:
//    Group match  : exact score = 5 pts · correct outcome (incl. draw) = 3 pts
//    Advancement  : +5  per correct group qualifier (team reaches Round of 32)
//                   +10 per team correctly predicted to reach Round of 16
//                   +15 per team correctly predicted to reach Quarterfinals
//                   +20 per team correctly predicted to reach Semifinals
//                   +25 per team correctly predicted to reach the Final
// ═════════════════════════════════════════════════════════════════════════════

// Canonical teams (must match the spellings used in the web form / Predicciones)
var WC_GROUPS = {
  "A":["Mexico","South Africa","South Korea","Czechia"],
  "B":["Canada","Bosnia-Herzegovina","Qatar","Switzerland"],
  "C":["Brazil","Morocco","Haiti","Scotland"],
  "D":["USA","Paraguay","Australia","Türkiye"],
  "E":["Germany","Curaçao","Ivory Coast","Ecuador"],
  "F":["Netherlands","Japan","Sweden","Tunisia"],
  "G":["Belgium","Egypt","Iran","New Zealand"],
  "H":["Spain","Cape Verde","Saudi Arabia","Uruguay"],
  "I":["France","Senegal","Iraq","Norway"],
  "J":["Argentina","Algeria","Austria","Jordan"],
  "K":["Portugal","DR Congo","Uzbekistan","Colombia"],
  "L":["England","Croatia","Ghana","Panama"]
};

// [match#, date, group, matchday, home, away]
var WC_FIXTURES = [
  [1,"Jun 11","A",1,"Mexico","South Africa"],[2,"Jun 11","A",1,"South Korea","Czechia"],
  [3,"Jun 18","A",2,"Czechia","South Africa"],[4,"Jun 18","A",2,"Mexico","South Korea"],
  [5,"Jun 24","A",3,"Mexico","Czechia"],[6,"Jun 24","A",3,"South Korea","South Africa"],
  [7,"Jun 12","B",1,"Canada","Bosnia-Herzegovina"],[8,"Jun 13","B",1,"Qatar","Switzerland"],
  [9,"Jun 18","B",2,"Switzerland","Bosnia-Herzegovina"],[10,"Jun 18","B",2,"Canada","Qatar"],
  [11,"Jun 24","B",3,"Switzerland","Canada"],[12,"Jun 24","B",3,"Bosnia-Herzegovina","Qatar"],
  [13,"Jun 13","C",1,"Brazil","Morocco"],[14,"Jun 13","C",1,"Haiti","Scotland"],
  [15,"Jun 19","C",2,"Scotland","Morocco"],[16,"Jun 19","C",2,"Brazil","Haiti"],
  [17,"Jun 24","C",3,"Brazil","Scotland"],[18,"Jun 24","C",3,"Morocco","Haiti"],
  [19,"Jun 12","D",1,"USA","Paraguay"],[20,"Jun 13","D",1,"Australia","Türkiye"],
  [21,"Jun 19","D",2,"USA","Australia"],[22,"Jun 19","D",2,"Türkiye","Paraguay"],
  [23,"Jun 25","D",3,"USA","Türkiye"],[24,"Jun 25","D",3,"Paraguay","Australia"],
  [25,"Jun 14","E",1,"Germany","Curaçao"],[26,"Jun 14","E",1,"Ivory Coast","Ecuador"],
  [27,"Jun 20","E",2,"Germany","Ivory Coast"],[28,"Jun 20","E",2,"Ecuador","Curaçao"],
  [29,"Jun 25","E",3,"Ecuador","Germany"],[30,"Jun 25","E",3,"Curaçao","Ivory Coast"],
  [31,"Jun 14","F",1,"Netherlands","Japan"],[32,"Jun 14","F",1,"Tunisia","Sweden"],
  [33,"Jun 20","F",2,"Netherlands","Sweden"],[34,"Jun 20","F",2,"Tunisia","Japan"],
  [35,"Jun 25","F",3,"Tunisia","Netherlands"],[36,"Jun 25","F",3,"Japan","Sweden"],
  [37,"Jun 15","G",1,"Belgium","Egypt"],[38,"Jun 15","G",1,"Iran","New Zealand"],
  [39,"Jun 21","G",2,"Belgium","Iran"],[40,"Jun 21","G",2,"New Zealand","Egypt"],
  [41,"Jun 26","G",3,"New Zealand","Belgium"],[42,"Jun 26","G",3,"Egypt","Iran"],
  [43,"Jun 15","H",1,"Spain","Cape Verde"],[44,"Jun 15","H",1,"Saudi Arabia","Uruguay"],
  [45,"Jun 21","H",2,"Spain","Saudi Arabia"],[46,"Jun 21","H",2,"Uruguay","Cape Verde"],
  [47,"Jun 26","H",3,"Uruguay","Spain"],[48,"Jun 26","H",3,"Cape Verde","Saudi Arabia"],
  [49,"Jun 16","I",1,"France","Senegal"],[50,"Jun 16","I",1,"Iraq","Norway"],
  [51,"Jun 22","I",2,"France","Iraq"],[52,"Jun 22","I",2,"Norway","Senegal"],
  [53,"Jun 26","I",3,"Norway","France"],[54,"Jun 26","I",3,"Senegal","Iraq"],
  [55,"Jun 16","J",1,"Argentina","Algeria"],[56,"Jun 16","J",1,"Austria","Jordan"],
  [57,"Jun 22","J",2,"Argentina","Austria"],[58,"Jun 22","J",2,"Jordan","Algeria"],
  [59,"Jun 27","J",3,"Algeria","Austria"],[60,"Jun 27","J",3,"Jordan","Argentina"],
  [61,"Jun 17","K",1,"Portugal","DR Congo"],[62,"Jun 17","K",1,"Uzbekistan","Colombia"],
  [63,"Jun 23","K",2,"Portugal","Uzbekistan"],[64,"Jun 23","K",2,"Colombia","DR Congo"],
  [65,"Jun 27","K",3,"Colombia","Portugal"],[66,"Jun 27","K",3,"DR Congo","Uzbekistan"],
  [67,"Jun 17","L",1,"England","Croatia"],[68,"Jun 17","L",1,"Ghana","Panama"],
  [69,"Jun 23","L",2,"England","Ghana"],[70,"Jun 23","L",2,"Panama","Croatia"],
  [71,"Jun 27","L",3,"Panama","England"],[72,"Jun 27","L",3,"Croatia","Ghana"]
];

var WC_STAGE_LIST = ["Group","R32","R16","QF","SF","Final","Champion"];
var WC_STAGE = {"Group":0,"R32":1,"R16":2,"QF":3,"SF":4,"Final":5,"Champion":6};

// Normalized-name → canonical-name map (built once, includes common aliases)
var WC_CANON = (function() {
  var map = {};
  function norm(s){ return ("" + s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,""); }
  Object.keys(WC_GROUPS).forEach(function(g){
    WC_GROUPS[g].forEach(function(t){ map[norm(t)] = t; });
  });
  var alias = {
    "czechrepublic":"Czechia","czech":"Czechia",
    "turkey":"Türkiye",
    "korea":"South Korea","korearepublic":"South Korea","republicofkorea":"South Korea",
    "unitedstates":"USA","unitedstatesofamerica":"USA","us":"USA",
    "holland":"Netherlands",
    "cotedivoire":"Ivory Coast",
    "caboverde":"Cape Verde",
    "democraticrepublicofcongo":"DR Congo","congodr":"DR Congo","congo":"DR Congo",
    "bosnia":"Bosnia-Herzegovina","bosniaandherzegovina":"Bosnia-Herzegovina",
    "saudi":"Saudi Arabia",
    "uae":"Saudi Arabia"
  };
  Object.keys(alias).forEach(function(k){ if (!map[k]) map[k] = alias[k]; });
  return map;
})();

function _norm(s){ return ("" + s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,""); }
function _canon(s){ var n = _norm(s); return WC_CANON[n] || null; }

function _matchPts(ph, pa, ah, aa) {
  if (ph === "" || pa === "" || ph == null || pa == null) return 0;
  ph = Number(ph); pa = Number(pa);
  if (isNaN(ph) || isNaN(pa)) return 0;
  if (ph === ah && pa === aa) return 5;
  return (Math.sign(ph - pa) === Math.sign(ah - aa)) ? 3 : 0;
}

// Sum bonus points for a list of predicted team names whose actual stage >= minRank
function _tierPts(teams, stage, minRank, pts) {
  var seen = {}, total = 0;
  teams.forEach(function(t) {
    t = ("" + t).trim(); if (!t) return;
    var c = _canon(t); if (!c) return;
    if (seen[c]) return; seen[c] = true;
    if ((stage[c] || 0) >= minRank) total += pts;
  });
  return total;
}

// ═════════════════════════════════════════════════════════════════════════════
//  RESULTS TAB  —  organizer enters actual scores + how far each team got
// ═════════════════════════════════════════════════════════════════════════════
function setupResultsTab() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName("Results");
  if (sh) ss.deleteSheet(sh);
  sh = ss.insertSheet("Results", 0);

  // ── Section 1: group match scores (A:G) ──
  sh.getRange(1,1,1,7).merge()
    .setValue("ACTUAL RESULTS — type each match's final score (Home Goals / Away Goals)")
    .setBackground(COLOR_HEADER).setFontColor("#ffffff").setFontWeight("bold")
    .setHorizontalAlignment("center");
  sh.getRange(2,1,1,7).setValues([["#","Date","Group","Home","Home Goals","Away Goals","Away"]])
    .setBackground(COLOR_SUBHDR).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  var rows = WC_FIXTURES.map(function(f){ return [f[0],f[1],f[2],f[4],"","",f[5]]; });
  sh.getRange(3,1,rows.length,7).setValues(rows);
  for (var i = 0; i < WC_FIXTURES.length; i++) {
    var r  = i + 3;
    var gc = GROUP_COLORS[WC_FIXTURES[i][2]] || "#ffffff";
    sh.getRange(r,1,1,7).setBackground(gc);
    sh.getRange(r,5,1,2).setBackground(COLOR_INPUT);
  }

  // ── Section 2: team progress (I:J) ──
  sh.getRange(1,9,1,2).merge()
    .setValue("TEAM PROGRESS — set how far each team actually got")
    .setBackground(COLOR_HEADER).setFontColor("#ffffff").setFontWeight("bold")
    .setHorizontalAlignment("center");
  sh.getRange(2,9,1,2).setValues([["Team","Furthest Round Reached"]])
    .setBackground(COLOR_SUBHDR).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  var teams = [];
  Object.keys(WC_GROUPS).forEach(function(g){
    WC_GROUPS[g].forEach(function(t){ teams.push([t,"Group"]); });
  });
  sh.getRange(3,9,teams.length,2).setValues(teams);
  sh.getRange(3,10,teams.length,1).setBackground(COLOR_INPUT);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(WC_STAGE_LIST, true).setAllowInvalid(false).build();
  sh.getRange(3,10,teams.length,1).setDataValidation(rule);

  [40,60,55,150,90,90,150,20,150,160].forEach(function(w,c){ sh.setColumnWidth(c+1,w); });
  sh.setFrozenRows(2);
  ss.setActiveSheet(sh);

  var ui = _ui();
  if (ui) ui.alert("'Results' tab is ready.\n\nFill in the match scores (columns E/F) and set each team's furthest round (column J), then run Pool > Update Leaderboard.");
}

// ═════════════════════════════════════════════════════════════════════════════
//  LEADERBOARD  —  computes and ranks every participant
// ═════════════════════════════════════════════════════════════════════════════
function updateLeaderboard() {
  var ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ui   = _ui();
  var pred = ss.getSheetByName("Predicciones");
  var res  = ss.getSheetByName("Results");

  if (!pred || pred.getLastRow() < 2) { if (ui) ui.alert("No submissions yet in the 'Predicciones' tab."); return; }
  if (!res) { if (ui) ui.alert("No 'Results' tab found.\n\nRun Pool > Setup / Reset Results Tab first."); return; }

  // Actual group scores → { matchNum: {h, a} }
  var gvals  = res.getRange(3,1,WC_FIXTURES.length,7).getValues();
  var scores = {};
  gvals.forEach(function(r){
    var n = r[0], h = r[4], a = r[5];
    if (h !== "" && a !== "" && !isNaN(Number(h)) && !isNaN(Number(a))) scores[n] = {h:Number(h), a:Number(a)};
  });

  // Actual team stages → { canonicalTeam: stageRank }
  var tvals = res.getRange(3,9,48,2).getValues();
  var stage = {};
  tvals.forEach(function(r){ if (r[0]) { var c = _canon(r[0]); if (c) stage[c] = WC_STAGE[r[1]] || 0; } });

  // Predictions
  var data = pred.getDataRange().getValues();
  var head = data[0], idx = {};
  head.forEach(function(h,i){ idx[h] = i; });
  function val(row, key){ return idx[key] == null ? "" : row[idx[key]]; }

  var groupLetters = "ABCDEFGHIJKL".split("");
  var out = [];

  for (var i = 1; i < data.length; i++) {
    var row  = data[i];
    var name = ("" + val(row, "Name")).trim();
    if (!name) continue;

    // group-stage match points
    var gp = 0;
    for (var n = 1; n <= 72; n++) {
      var sc = scores[n]; if (!sc) continue;
      gp += _matchPts(val(row, "P"+n+"_H"), val(row, "P"+n+"_A"), sc.h, sc.a);
    }

    // advancement bonuses
    var bp = 0;
    var qual = [];
    groupLetters.forEach(function(g){ qual.push(val(row,"G"+g+"_1")); qual.push(val(row,"G"+g+"_2")); });
    bp += _tierPts(qual, stage, 1, 5);   // reaches Round of 32

    var r16 = []; for (var k=1;k<=8;k++){ r16.push(val(row,"R16_"+k+"_A")); r16.push(val(row,"R16_"+k+"_B")); }
    bp += _tierPts(r16, stage, 2, 10);

    var qf = []; for (var k2=1;k2<=4;k2++){ qf.push(val(row,"QF_"+k2+"_A")); qf.push(val(row,"QF_"+k2+"_B")); }
    bp += _tierPts(qf, stage, 3, 15);

    var sf = []; for (var k3=1;k3<=2;k3++){ sf.push(val(row,"SF_"+k3+"_A")); sf.push(val(row,"SF_"+k3+"_B")); }
    bp += _tierPts(sf, stage, 4, 20);

    var fin = [val(row,"FIN_1_A"), val(row,"FIN_1_B")];
    bp += _tierPts(fin, stage, 5, 25);

    out.push([name, gp, bp, gp + bp]);
  }

  out.sort(function(a,b){ return b[3] - a[3]; });

  // Write Leaderboard sheet
  var lb = ss.getSheetByName("Leaderboard");
  if (lb) ss.deleteSheet(lb);
  lb = ss.insertSheet("Leaderboard", 0);

  lb.getRange(1,1,1,5).merge()
    .setValue("🏆 LEADERBOARD — World Cup 2026 Pool")
    .setBackground(COLOR_HEADER).setFontColor("#ffffff")
    .setFontSize(14).setFontWeight("bold").setHorizontalAlignment("center");
  lb.setRowHeight(1, 38);
  lb.getRange(2,1,1,5).setValues([["Pos","Participant","Group Pts","Bonus Pts","TOTAL"]])
    .setBackground(COLOR_SUBHDR).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  if (out.length) {
    var rows2 = out.map(function(r, i){
      var pos = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1);
      return [pos, r[0], r[1], r[2], r[3]];
    });
    lb.getRange(3,1,rows2.length,5).setValues(rows2);
    lb.getRange(3,5,rows2.length,1).setFontWeight("bold").setBackground("#d5e8d4");
    lb.getRange(3,1,rows2.length,1).setHorizontalAlignment("center").setFontWeight("bold");
  } else {
    lb.getRange(3,1).setValue("No scored participants yet.").setFontStyle("italic").setFontColor("#999999");
  }

  [55,220,110,110,90].forEach(function(w,c){ lb.setColumnWidth(c+1,w); });
  lb.setFrozenRows(2);
  ss.setActiveSheet(lb);

  if (ui) ui.alert("Leaderboard updated — " + out.length + " participant(s) ranked.");
}

// ═════════════════════════════════════════════════════════════════════════════
//  CUSTOM MENU + UTILITIES
// ═════════════════════════════════════════════════════════════════════════════
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Pool")
    .addItem("🔄 Update Leaderboard", "updateLeaderboard")
    .addItem("🧱 Setup / Reset Results Tab", "setupResultsTab")
    .addSeparator()
    .addItem("📖 View Rules", "showRules")
    .addToUi();
}

function _ui() {
  try { return SpreadsheetApp.getUi(); } catch (e) { return null; }
}

function showRules() {
  var ui = _ui(); if (!ui) return;
  ui.alert(
    "RULES — World Cup 2026 Pool  v" + VERSION + "\n\n" +
    "PER MATCH (group stage):\n" +
    "  Correct outcome or draw: 3 pts\n" +
    "  Exact score: 5 pts\n\n" +
    "ADVANCEMENT BONUSES (per correctly predicted team):\n" +
    "  Reaches Round of 32 (advances from group): +5 pts\n" +
    "  Reaches Round of 16: +10 pts\n" +
    "  Reaches Quarterfinals: +15 pts\n" +
    "  Reaches Semifinals: +20 pts\n" +
    "  Reaches the Final: +25 pts\n\n" +
    "Most points at the end of the tournament wins."
  );
}
