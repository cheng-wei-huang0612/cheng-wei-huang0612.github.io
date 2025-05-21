// ===== 星盤計算核心 =====

// 12 星座對照表（每 30° 為一區間）
const SIGNS = [
  '白羊座', '金牛座', '雙子座', '巨蟹座', '獅子座', '處女座',
  '天秤座', '天蠍座', '射手座', '摩羯座', '水瓶座', '雙魚座'
];

function degreeToSign(deg) {
  // robust-mod 0–360，再對 30° 取整
  return SIGNS[Math.floor(((deg % 360) + 360) % 360 / 30)];
}

// 將小數度數轉成「度°分′秒″」字串（四捨五入到 0.1″）
function degToDMS(deg) {
  const d = Math.floor(deg);
  const mF = (deg - d) * 60;
  const m = Math.floor(mF);
  const s = ((mF - m) * 60).toFixed(1);
  return `${d}°${m}′${s}″`;
}

// 產生統一格式的行星／點位物件
function planetObj(lon) {
  return {
    sign: degreeToSign(lon),
    degree: degToDMS(((lon % 30) + 30) % 30),
    longitude: parseFloat(lon.toFixed(2))
  };
}

/**
 * 主計算函式：讀取日期 / 時間、計算星體與上升點，
 * 並把結果輸出到 #result（HTML 表格）。
 * 之後我們會擴充：額外產生 JSON ➜ collapsible panel。
 */
function calc() {
  const dateStr = document.getElementById('date').value;   // YYYY-MM-DD
  const timeStr = document.getElementById('time').value;   // HH:MM:SS

  if (!dateStr || !timeStr) {
    document.getElementById('result').textContent = '⚠️ 請完整輸入日期與時間';
    return;
  }

  // 組合成本地時區的 ISO-8601 字串，再轉成 Date 物件
  const dt = new Date(`${dateStr}T${timeStr}`);

  /* === 行星黃經 === */
  const sunLon = Astronomy.SunPosition(dt).elon;
  const moonLon = Astronomy.EclipticGeoMoon(dt).lon;

  const astroTime = Astronomy.MakeTime(dt);

  const mercLon = Astronomy.Ecliptic(
    Astronomy.GeoVector(Astronomy.Body.Mercury, astroTime, false)
  ).elon;

  const venusLon = Astronomy.Ecliptic(
    Astronomy.GeoVector(Astronomy.Body.Venus, astroTime, false)
  ).elon;

  const marsLon = Astronomy.Ecliptic(
    Astronomy.GeoVector(Astronomy.Body.Mars, astroTime, false)
  ).elon;

  const jupLon = Astronomy.Ecliptic(
    Astronomy.GeoVector(Astronomy.Body.Jupiter, astroTime, false)
  ).elon;

  const satLon = Astronomy.Ecliptic(
    Astronomy.GeoVector(Astronomy.Body.Saturn, astroTime, false)
  ).elon;

  const uraLon = Astronomy.Ecliptic(
    Astronomy.GeoVector(Astronomy.Body.Uranus, astroTime, false)
  ).elon;

  const nepLon = Astronomy.Ecliptic(
    Astronomy.GeoVector(Astronomy.Body.Neptune, astroTime, false)
  ).elon;

  const pluLon = Astronomy.Ecliptic(
    Astronomy.GeoVector(Astronomy.Body.Pluto, astroTime, false)
  ).elon;

  /* === 上升點 (ASC) — 暫以台北 (25.05°N, 121.52°E) 為例 === */
  const lat = 25.05;
  const lon = 121.52;

  const gstHours = Astronomy.SiderealTime(astroTime);
  const lstDeg = ((gstHours * 15 + lon) % 360 + 360) % 360;

  const epsilon = 23.43928 * Math.PI / 180;
  const phi = lat * Math.PI / 180;
  const q = Math.atan(Math.tan(epsilon) * Math.tan(phi));
  const theta = ((lstDeg + 90) * Math.PI / 180) - q;

  const lambdaAsc = Math.atan2(
    Math.sin(theta) * Math.cos(epsilon) - Math.tan(phi) * Math.sin(epsilon),
    Math.cos(theta)
  ) * 180 / Math.PI;

  const ascLon = (lambdaAsc + 360) % 360;

  /* === 將結果組成表格 === */
  const rows = `
    <tr><td>☉ 太陽</td><td>${degreeToSign(sunLon)} ${degToDMS(((sunLon % 30) + 30) % 30)}</td><td>${sunLon.toFixed(2)}°</td></tr>
    <tr><td>☾ 月亮</td><td>${degreeToSign(moonLon)} ${degToDMS(((moonLon % 30) + 30) % 30)}</td><td>${moonLon.toFixed(2)}°</td></tr>
    <tr><td>☿ 水星</td><td>${degreeToSign(mercLon)} ${degToDMS(((mercLon % 30) + 30) % 30)}</td><td>${mercLon.toFixed(2)}°</td></tr>
    <tr><td>♀ 金星</td><td>${degreeToSign(venusLon)} ${degToDMS(((venusLon % 30) + 30) % 30)}</td><td>${venusLon.toFixed(2)}°</td></tr>
    <tr><td>♂ 火星</td><td>${degreeToSign(marsLon)} ${degToDMS(((marsLon % 30) + 30) % 30)}</td><td>${marsLon.toFixed(2)}°</td></tr>
    <tr><td>♃ 木星</td><td>${degreeToSign(jupLon)} ${degToDMS(((jupLon % 30) + 30) % 30)}</td><td>${jupLon.toFixed(2)}°</td></tr>
    <tr><td>♄ 土星</td><td>${degreeToSign(satLon)} ${degToDMS(((satLon % 30) + 30) % 30)}</td><td>${satLon.toFixed(2)}°</td></tr>
    <tr><td>♅ 天王星</td><td>${degreeToSign(uraLon)} ${degToDMS(((uraLon % 30) + 30) % 30)}</td><td>${uraLon.toFixed(2)}°</td></tr>
    <tr><td>♆ 海王星</td><td>${degreeToSign(nepLon)} ${degToDMS(((nepLon % 30) + 30) % 30)}</td><td>${nepLon.toFixed(2)}°</td></tr>
    <tr><td>♇ 冥王星</td><td>${degreeToSign(pluLon)} ${degToDMS(((pluLon % 30) + 30) % 30)}</td><td>${pluLon.toFixed(2)}°</td></tr>
    <tr><td>ASC 上升</td><td>${degreeToSign(ascLon)} ${degToDMS(((ascLon % 30) + 30) % 30)}</td><td>${ascLon.toFixed(2)}°</td></tr>
  `;

  document.getElementById('result').innerHTML = `
    <table>
      <tr><th>天體</th><th>星座（度分秒）</th><th>真黃經</th></tr>
      ${rows}
    </table>
  `;

  // —— DEBUG ——
  console.log(
    'UTC ISO:', dt.toISOString(),
    '\nLST(deg):', lstDeg.toFixed(4),
    '\nascLon  :', ascLon.toFixed(4)
  );
  /* === 產生 LLM-friendly JSON（僅含太陽） === */
  const jsonData = {
    basic_info: {
      birth_date: dateStr,
      birth_time: timeStr,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'
    },
    planets: {
      Sun:      planetObj(sunLon),
      Moon:     planetObj(moonLon),
      Mercury:  planetObj(mercLon),
      Venus:    planetObj(venusLon),
      Mars:     planetObj(marsLon),
      Jupiter:  planetObj(jupLon),
      Saturn:   planetObj(satLon),
      Uranus:   planetObj(uraLon),
      Neptune:  planetObj(nepLon),
      Pluto:    planetObj(pluLon),
      ASC:      planetObj(ascLon)
    }
  };
  // 將 JSON 填入 collapsible <pre>
  const jsonOutputEl = document.getElementById('json-output');
  if (jsonOutputEl) {
    jsonOutputEl.textContent = JSON.stringify(jsonData, null, 2);
  }
}
/* === 共用複製函式 === */


function copyJsonToClipboard(e){
  const pre = document.getElementById('json-output');
  if(!pre) return;

  navigator.clipboard.writeText(pre.textContent)
    .then(()=>{
      // e.target 是觸發 click 的按鈕
      const toast = e.target.nextElementSibling;
      if(toast && toast.classList.contains('copy-toast')){
        toast.style.display = 'inline';
        setTimeout(()=>toast.style.display='none',2000);
      }
    });
}



/* ===== 事件掛載 ===== */
window.addEventListener('load', () => {
  // 1️⃣ 預設算一次範例
  calc();

  // 2️⃣ 綁定複製按鈕
  ['copy-json', 'copy-json-top'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', copyJsonToClipboard);
  });

  // 3️⃣ 綁定「產生星盤」按鈕
  const calcBtn = document.getElementById('calc-btn');
  if (calcBtn) calcBtn.addEventListener('click', calc);
});