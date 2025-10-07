

/* ===== Utilities for Zodiac handling ===== */
const SIGNS = [
  '白羊座','金牛座','雙子座','巨蟹座','獅子座','處女座',
  '天秤座','天蠍座','射手座','摩羯座','水瓶座','雙魚座'
];

function degreeToSign(deg) {
  const norm = ((deg % 360) + 360) % 360;      // 0‑360
  return SIGNS[Math.floor(norm / 30)];
}

function degToDMS(deg) {
  const d   = Math.floor(deg);
  const mF  = (deg - d) * 60;
  const m   = Math.floor(mF);
  const s   = ((mF - m) * 60).toFixed(1);
  return `${d}°${m}′${s}″`;
}

function calc() {
  const dateStr = document.getElementById('date').value;   // YYYY‑MM‑DD
  const timeStr = document.getElementById('time').value;   // HH:MM:SS

  if (!dateStr || !timeStr) {
    document.getElementById('result').textContent = '⚠️ 請完整輸入日期與時間';
    return;
  }

  // Ensure the WASM runtime is ready
  if (typeof Module === 'undefined' || !Module.ccall) {
    document.getElementById('result').textContent = '⏳ Swiss Ephemeris WASM 尚未載入…';
    return;
  }

  /* === 將輸入轉成 UTC Julian Day (UT) === */
  const dtLocal = new Date(`${dateStr}T${timeStr}`);       // 使用瀏覽器的本地時區
  const year  = dtLocal.getUTCFullYear();
  const month = dtLocal.getUTCMonth() + 1;                 // JS 月份 0‑11
  const day   = dtLocal.getUTCDate();
  const decHr = dtLocal.getUTCHours() +
                dtLocal.getUTCMinutes() / 60 +
                dtLocal.getUTCSeconds() / 3600;

  const jdUt = Module.ccall(
    'swe_julday', 'number',
    ['number','number','number','number','number'],
    [year, month, day, decHr, Module.FLAGS.GREG_CAL]        // Gregorian
  );

  /* === 計算太陽黃道經度 === */
  const SE_SUN          = 0;   // 內定行星索引：太陽
  const SEFLG_SWIEPH    = 2;   // 計算旗標：Swiss Ephemeris
  const sunArr = new Float64Array(6);                       // 接收向量
  Module.ccall(
    'swe_calc_ut', 'number',
    ['number','number','number','number'],
    [jdUt, SE_SUN, SEFLG_SWIEPH, sunArr.byteOffset]
  );
  const sunLon = sunArr[0];                                // 真黃經（度）

  /* === 產出結果表格（僅太陽） === */
  const rows = `
    <tr>
      <td>☉ 太陽</td>
      <td>${degreeToSign(sunLon)} ${degToDMS(((sunLon % 30) + 30) % 30)}</td>
      <td>${sunLon.toFixed(2)}°</td>
    </tr>
  `;

  document.getElementById('result').innerHTML = `
    <table>
      <tr><th>天體</th><th>星座（度分秒）</th><th>真黃經</th></tr>
      ${rows}
    </table>
  `;
}

/* ===== Event bindings ===== */
window.addEventListener('load', () => {
  // Execute once on page load if input fields have defaults
  calc();

  // If a button with id="calc-btn" exists, bind click
  const calcBtn = document.getElementById('calc-btn');
  if (calcBtn) calcBtn.addEventListener('click', calc);
});