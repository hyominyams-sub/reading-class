/**
 * reading-class 학생 기록 API — 이 스프레드시트를 앱의 데이터베이스로 쓴다.
 *
 * 처음 붙이는 법
 *   1. 시트에서 [확장 프로그램 > Apps Script]를 열고 이 파일 내용을 통째로 붙여넣는다.
 *   2. [프로젝트 설정(⚙️) > 스크립트 속성 > 속성 추가]에서 `API_TOKEN`을 아무도 모르는
 *      문자열로 넣는다 (앱의 SHEETS_API_TOKEN과 같아야 한다). 딱 한 번만 하면 된다.
 *   3. [배포 > 새 배포 > 웹 앱] — 실행 계정 '나', 액세스 권한 '모든 사용자' — 배포하고 권한을 승인한다.
 *   4. 나오는 /exec 주소를 앱의 SHEETS_API_URL에 넣는다.
 *
 * 고친 뒤 다시 붙일 때는 1번과 3번만 하면 된다. 토큰은 코드가 아니라 스크립트 속성에
 * 들어 있어서 붙여넣기로 지워지지 않는다. (이 저장소는 공개라 코드에 토큰을 둘 수 없다.)
 *
 * 액세스를 '모든 사용자'로 두는 이유는 로그인하지 않은 앱 서버가 부르기 때문이고,
 * 그래서 토큰이 맞지 않는 요청은 전부 거절한다. 스크립트가 시트 주인 권한으로 돌기 때문에
 * 시트 자체의 공유 설정은 '제한됨'으로 잠가 두는 편이 안전하다(학생 이름·일기가 들어간다).
 */

const SHEET_NAME = '기록';

/** 토큰은 [프로젝트 설정 > 스크립트 속성]의 API_TOKEN에서 읽는다 */
function apiToken_() {
  return PropertiesService.getScriptProperties().getProperty('API_TOKEN') || '';
}

/** A~J열. 앱이 실제로 읽는 값은 마지막 '기록(JSON)'이고 나머지는 사람이 보는 칸이다. */
const HEADERS = [
  'id',
  '이름',
  '등록시각',
  '미션1 점수',
  '미션1 정답',
  '미션2 점수',
  '미션3 글자수',
  '미션3 일기',
  '완료',
  '기록(JSON)',
];
const COL_ID = 1;
const COL_NAME = 2;
const COL_JSON = 10;

/* ------------------------------------------------------------------ 진입점 */

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const expected = apiToken_();
    if (!expected) {
      return json_({ ok: false, error: '스크립트 속성 API_TOKEN이 비어 있습니다. 프로젝트 설정에서 넣어 주세요.' });
    }
    if (body.token !== expected) return json_({ ok: false, error: 'unauthorized' });

    switch (body.action) {
      case 'list':
        return json_({ ok: true, students: listStudents_() });
      case 'get':
        return json_({ ok: true, student: getStudent_(String(body.id || '')) });
      case 'create':
        return json_(createStudent_(String(body.id || ''), String(body.name || '')));
      case 'record':
        return json_(recordMission_(String(body.id || ''), String(body.mission || ''), body.score, body.details));
      case 'reset':
        return json_(resetAll_());
      default:
        return json_({ ok: false, error: 'unknown action: ' + body.action });
    }
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

/** 브라우저로 열었을 때 배포가 살아 있는지만 알려 준다 */
function doGet() {
  return json_({ ok: true, service: 'reading-class sheets api' });
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

/* -------------------------------------------------------------------- 시트 */

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() < 1) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(8, 420); // 일기 칸은 넓게
  }
  return sh;
}

/** 헤더를 뺀 데이터 행 전체 */
function rows_(sh) {
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
}

function toRecord_(row) {
  let stored = {};
  try {
    stored = row[COL_JSON - 1] ? JSON.parse(row[COL_JSON - 1]) : {};
  } catch (err) {
    stored = {};
  }
  return {
    id: String(row[COL_ID - 1]),
    // 이름은 사람이 고칠 수 있게 B열을 그대로 믿는다
    name: String(row[COL_NAME - 1]),
    createdAt: stored.createdAt || '',
    missions: stored.missions || {},
  };
}

/** 사람이 보는 칸(D~I)을 미션 기록에서 다시 만든다 */
function displayCells_(record) {
  const m = record.missions || {};
  const m1 = m['1'] || null;
  const m2 = m['2'] || null;
  const m3 = m['3'] || null;
  const d1 = (m1 && m1.details) || {};
  const d3 = (m3 && m3.details) || {};
  return [
    m1 ? m1.score : '',
    m1 && d1.total ? d1.correct + '/' + d1.total : '',
    m2 ? m2.score : '',
    m3 ? d3.chars || '' : '',
    m3 ? d3.text || '' : '',
    [m1, m2, m3].filter(Boolean).length,
  ];
}

function rowValues_(record) {
  return [record.id, record.name, humanTime_(record.createdAt)]
    .concat(displayCells_(record))
    .concat([JSON.stringify({ createdAt: record.createdAt, missions: record.missions })]);
}

function writeRow_(sh, rowIndex, record) {
  sh.getRange(rowIndex, 1, 1, HEADERS.length).setValues([rowValues_(record)]);
}

function humanTime_(iso) {
  if (!iso) return '';
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() || 'Asia/Seoul';
  return Utilities.formatDate(new Date(iso), tz, 'MM/dd HH:mm');
}

/**
 * 아이디가 이미 있는지만 본다.
 * 등록은 30명이 한꺼번에 몰리므로 잠금 안에서 하는 일을 최대한 줄인다.
 * 행 전체(일기 원문 포함)를 읽는 findRowIndex_와 달리 A열만 읽는다.
 */
function idExists_(sh, id) {
  const last = sh.getLastRow();
  if (last < 2) return false;
  const ids = sh.getRange(2, COL_ID, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) return true;
  }
  return false;
}

function findRowIndex_(sh, id) {
  const data = rows_(sh);
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][COL_ID - 1]) === id) return { index: i + 2, record: toRecord_(data[i]) };
  }
  return null;
}

/* ------------------------------------------------------------------ 동작들 */

function listStudents_() {
  return rows_(sheet_())
    .filter(function (row) {
      return String(row[COL_ID - 1]);
    })
    .map(toRecord_);
}

function getStudent_(id) {
  const sh = sheet_();
  const hit = findRowIndex_(sh, id);
  return hit ? hit.record : null;
}

/**
 * 쓰기는 전부 잠금 안에서 — 30대가 동시에 눌러도 행이 겹치지 않게.
 *
 * flush()가 핵심이다. SpreadsheetApp은 쓰기를 모아 뒀다가 나중에 반영하는데,
 * 그 전에 잠금을 놓으면 다음 실행이 아직 옛날인 시트를 읽고 같은 행에 덮어쓴다.
 * 잠금을 놓기 전에 반드시 시트에 반영해야 한다.
 */
function withLock_(task) {
  const lock = LockService.getScriptLock();
  lock.waitLock(50000);
  try {
    return task();
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

function createStudent_(id, name) {
  if (!id || !name) return { ok: false, error: 'id와 name이 필요합니다.' };
  const record = { id: id, name: name, createdAt: new Date().toISOString(), missions: {} };
  // 셀 값 만들기는 잠금 밖에서 끝낸다. 잠금 안이 길어질수록 뒤에 선 아이들이 밀린다.
  const values = rowValues_(record);
  return withLock_(function () {
    const sh = sheet_();
    if (idExists_(sh, id)) return { ok: false, error: 'duplicate' };
    // 행 번호를 직접 계산하지 않고 appendRow에 맡긴다 — 계산한 번호는 어긋날 수 있다.
    sh.appendRow(values);
    return { ok: true, student: record };
  });
}

function recordMission_(id, mission, score, details) {
  return withLock_(function () {
    const sh = sheet_();
    const hit = findRowIndex_(sh, id);
    if (!hit) return { ok: true, student: null }; // 앱이 404로 바꿔 준다
    const record = hit.record;
    const prev = record.missions[mission] || null;
    record.missions[mission] = {
      completedAt: new Date().toISOString(),
      score: Math.round(Number(score) || 0),
      attempts: ((prev && prev.attempts) || 0) + 1,
      details: details || undefined,
    };
    writeRow_(sh, hit.index, record);
    return { ok: true, student: record };
  });
}

function resetAll_() {
  return withLock_(function () {
    const sh = sheet_();
    const last = sh.getLastRow();
    if (last > 1) sh.deleteRows(2, last - 1);
    return { ok: true };
  });
}
