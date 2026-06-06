// World Cup 2026 Pool — Google Apps Script
// Run createWorldCupPool() once to generate the spreadsheet.
// Then use Pool > Agregar Participante to add each player.
var VERSION = "01.00g";
var POOL_NAME = "World Cup 2026 Pool";

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
var COLOR_HEADER    = "#1a3a5c";
var COLOR_SUBHDR    = "#2c5f8a";
var COLOR_INPUT     = "#fffde7";
var COLOR_AUTO      = "#f0f0f0";
var GROUP_COLORS = {
  "A":"#e3f2fd","B":"#fef9e7","C":"#e8f5e9","D":"#fce4ec",
  "E":"#e0f2f1","F":"#fff3e0","G":"#f3e5f5","H":"#eceff1",
  "I":"#ffebee","J":"#e8f5e9","K":"#fff8e1","L":"#e8eaf6"
};
var SYSTEM_SHEETS = ["RESULTADOS","TABLA","BRACKET"];
var TOT_ROW = 3 + 72; // row 75 — totals in participant sheets

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN SETUP  —  run this once
// ═════════════════════════════════════════════════════════════════════════════
function createWorldCupPool() {
  var ss  = SpreadsheetApp.create(POOL_NAME);
  var def = ss.getActiveSheet();

  var resultsSheet = ss.insertSheet("RESULTADOS", 0);
  var leaderSheet  = ss.insertSheet("TABLA",      1);
  var bracketSheet = ss.insertSheet("BRACKET",    2);
  ss.deleteSheet(def);

  _setupResultsSheet(resultsSheet);
  _setupLeaderboardSheet(leaderSheet);
  _setupBracketSheet(bracketSheet);
  ss.setActiveSheet(leaderSheet);

  var url = ss.getUrl();
  Logger.log("Pool created: " + url);
  SpreadsheetApp.getUi().alert("Pool creado exitosamente!\n\n" + url + "\n\nUsa el menu Pool > Agregar Participante para agregar jugadores.");
}

// ═════════════════════════════════════════════════════════════════════════════
//  RESULTADOS SHEET
// ═════════════════════════════════════════════════════════════════════════════
function _setupResultsSheet(sheet) {
  // Title
  sheet.getRange(1,1,1,9).merge()
    .setValue("RESULTADOS — World Cup 2026 Pool")
    .setBackground(COLOR_HEADER).setFontColor("#ffffff")
    .setFontSize(13).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1, 36);

  // Headers
  sheet.getRange(2,1,1,9).setValues([["#","Fecha","Grupo","MD","Equipo 1","Goles 1","Goles 2","Equipo 2","Resultado"]])
    .setBackground(COLOR_SUBHDR).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  // Data
  var rows = FIXTURES.map(function(f){ return [f[0],f[1],f[2],f[3],f[4],"","",f[5],""]; });
  sheet.getRange(3,1,rows.length,9).setValues(rows);

  // Formulas + coloring
  for (var i = 0; i < FIXTURES.length; i++) {
    var r   = i + 3;
    var gc  = GROUP_COLORS[FIXTURES[i][2]] || "#ffffff";
    sheet.getRange(r,1,1,9).setBackground(gc);
    sheet.getRange(r,6,1,2).setBackground(COLOR_INPUT);
    sheet.getRange(r,9).setBackground(COLOR_AUTO)
      .setFormula('=IF(F'+r+'="","",IF(F'+r+'>G'+r+',E'+r+',IF(G'+r+'>F'+r+',H'+r+',"Empate")))');
  }

  [40,65,55,40,150,60,60,150,120].forEach(function(w,c){ sheet.setColumnWidth(c+1,w); });
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(4);
  sheet.getRange(76,1).setValue("Ingresa los goles en columnas F y G. El Resultado se calcula automaticamente.")
    .setFontStyle("italic").setFontColor("#888888");
}

// ═════════════════════════════════════════════════════════════════════════════
//  PARTICIPANT SHEET
// ═════════════════════════════════════════════════════════════════════════════
function addParticipant() {
  var ss  = SpreadsheetApp.getActiveSpreadsheet();
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
  // Title
  sheet.getRange(1,1,1,11).merge()
    .setValue(name + " — Pronosticos World Cup 2026")
    .setBackground(COLOR_HEADER).setFontColor("#ffffff")
    .setFontSize(13).setFontWeight("bold").setHorizontalAlignment("center");
  sheet.setRowHeight(1,36);

  // Headers
  sheet.getRange(2,1,1,11).setValues([["#","Fecha","Grupo","Equipo 1","Gol 1","Gol 2","Equipo 2","Mi Pronostico","Pts Result.","Pts Exacto","TOTAL"]])
    .setBackground(COLOR_SUBHDR).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  // Fixture rows
  var rows = FIXTURES.map(function(f){ return [f[0],f[1],f[2],f[4],"","",f[5],"","","",""]; });
  sheet.getRange(3,1,rows.length,11).setValues(rows);

  // Formulas per row
  for (var i = 0; i < FIXTURES.length; i++) {
    var r  = i + 3;
    var gc = GROUP_COLORS[FIXTURES[i][2]] || "#ffffff";
    sheet.getRange(r,1,1,11).setBackground(gc);
    sheet.getRange(r,5,1,2).setBackground(COLOR_INPUT);

    // Col H: predicted winner (derived from score inputs)
    sheet.getRange(r,8).setBackground(COLOR_AUTO)
      .setFormula('=IF(E'+r+'="","",IF(E'+r+'>F'+r+',D'+r+',IF(F'+r+'>E'+r+',G'+r+',"Empate")))');

    // Col I: result pts (2 if predicted winner = actual winner)
    sheet.getRange(r,9).setBackground(COLOR_AUTO)
      .setFormula('=IF(VLOOKUP(A'+r+',RESULTADOS!$A:$I,9,0)="","",IF(H'+r+'=VLOOKUP(A'+r+',RESULTADOS!$A:$I,9,0),2,0))');

    // Col J: exact score pts (+3 if both goals match)
    sheet.getRange(r,10).setBackground(COLOR_AUTO)
      .setFormula('=IF(VLOOKUP(A'+r+',RESULTADOS!$A:$G,6,0)="","",IF(AND(E'+r+'=VLOOKUP(A'+r+',RESULTADOS!$A:$G,6,0),F'+r+'=VLOOKUP(A'+r+',RESULTADOS!$A:$G,7,0)),3,0))');

    // Col K: total
    sheet.getRange(r,11).setBackground(COLOR_AUTO)
      .setFormula('=IF(AND(I'+r+'="",J'+r+'=""),"",I'+r+'+J'+r+')');
  }

  // Totals row
  sheet.getRange(TOT_ROW,4).setValue("TOTAL").setFontWeight("bold").setBackground("#d5e8d4");
  sheet.getRange(TOT_ROW,9).setFormula("=SUM(I3:I74)").setFontWeight("bold").setBackground("#d5e8d4");
  sheet.getRange(TOT_ROW,10).setFormula("=SUM(J3:J74)").setFontWeight("bold").setBackground("#d5e8d4");
  sheet.getRange(TOT_ROW,11).setFormula("=SUM(K3:K74)").setFontWeight("bold").setBackground("#d5e8d4").setFontSize(12);

  [40,65,55,145,55,55,145,115,90,90,70].forEach(function(w,c){ sheet.setColumnWidth(c+1,w); });
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

  [50,200,120,100,90].forEach(function(w,c){ sheet.setColumnWidth(c+1,w); });
  sheet.setFrozenRows(2);
}

function _updateLeaderboard(ss) {
  var sheet = ss.getSheetByName("TABLA");
  if (!sheet) return;

  var participants = ss.getSheets().filter(function(s){
    return SYSTEM_SHEETS.indexOf(s.getName()) === -1;
  }).map(function(s){ return s.getName(); });

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

  // Rank formula
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
    .setValue("Disponible al concluir la fase de grupos (28 Jun). Llena la columna 'Tu Pick' con el equipo que crees ganara cada partido.")
    .setFontStyle("italic").setFontColor("#c0392b").setBackground("#fdf2f2");

  sheet.getRange(3,1,1,6).setValues([["Partido","Equipo A","vs","Equipo B","Tu Pick (ganador)","Ptos si aciertas"]])
    .setBackground(COLOR_SUBHDR).setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");

  var rounds = [
    {name:"Ronda de 32  (16 partidos)",  count:16, pts:2,  hdr:"Ronda de 32"},
    {name:"Octavos de Final  (8 partidos)", count:8, pts:4,  hdr:"Octavos"},
    {name:"Cuartos de Final  (4 partidos)", count:4, pts:6,  hdr:"Cuartos"},
    {name:"Semifinales  (2 partidos)",    count:2, pts:8,  hdr:"Semis"},
    {name:"Tercer Lugar  (1 partido)",    count:1, pts:5,  hdr:"3er Lugar"},
    {name:"FINAL",                        count:1, pts:15, hdr:"FINAL"},
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

  [100,160,35,160,165,120].forEach(function(w,c){ sheet.setColumnWidth(c+1,w); });
  sheet.setFrozenRows(3);
}

// ═════════════════════════════════════════════════════════════════════════════
//  CUSTOM MENU + UTILITIES
// ═════════════════════════════════════════════════════════════════════════════
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Pool")
    .addItem("Agregar Participante", "addParticipant")
    .addItem("Actualizar Tabla", "refreshLeaderboard")
    .addSeparator()
    .addItem("Ver Reglas", "showRules")
    .addToUi();
}

function refreshLeaderboard() {
  _updateLeaderboard(SpreadsheetApp.getActiveSpreadsheet());
  SpreadsheetApp.getUi().alert("Tabla actualizada!");
}

function showRules() {
  SpreadsheetApp.getUi().alert(
    "REGLAS — World Cup 2026 Pool  v" + VERSION + "\n\n" +
    "FASE DE GRUPOS (72 partidos):\n" +
    "  Resultado correcto (quien gana o empate): 2 puntos\n" +
    "  Marcador exacto: +3 puntos adicionales\n" +
    "  Maximo por partido: 5 puntos\n" +
    "  Maximo fase de grupos: 360 puntos\n\n" +
    "FASE ELIMINATORIA:\n" +
    "  Ronda de 32: 2 pts por acierto\n" +
    "  Octavos de Final: 4 pts por acierto\n" +
    "  Cuartos de Final: 6 pts por acierto\n" +
    "  Semifinales: 8 pts por acierto\n" +
    "  Tercer lugar: 5 pts\n" +
    "  Campeon: 15 pts\n\n" +
    "Gana quien acumule mas puntos al final del torneo."
  );
}
