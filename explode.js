import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// 휴롬 펄프 도크(가칭) · 구조 3D v1 첫판 (2026-11-16, 두팔 msg_948835bd 지시 · 준보 「시작해볼까」)
//   원액기 배출구 → 실리콘 깔때기(끼움식) → 도크 투입구. 도크 안: 펴 주는 날개(천천히) → 열판·바람·휘젓기로 말리기(약 55°C) → 분쇄날(빨리)로 가루.
//   흰 몸체 · 앞 윗면 버튼 1 + 불빛 3 · 앱 없음. 치수는 두팔이 채울 「추정 예정」이라 3D는 가정 치수(바깥 20 × 23 × 11cm, 건조통 Ø16 × 깊이 7cm ≈ 1.4L). 단위 10cm.
//   원액기는 자리 설명용 간략 모형(휴롬 세로형 원액기의 비례만). 쿼리: ?p=0~1 진행도 · ?c=white|graphite|black · ?ang=<도> · ?cy= · ?nojuicer ?nopulp ?nojar ?noairg ?noadapter
const sec = document.getElementById('structure');
const canvas = document.getElementById('xv-canvas');
const labelLayer = document.getElementById('xv-labels');
const stepEls = [...document.querySelectorAll('.xv-step')];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xffffff, 0xe6ddcf, 1.0));
const sun = new THREE.DirectionalLight(0xfffaf2, 1.5); sun.position.set(-2, 9, 5); scene.add(sun);
const fill = new THREE.DirectionalLight(0xffffff, 0.55); fill.position.set(6, 2, 3); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 1.0); rim.position.set(1, 4, -7); scene.add(rim);
const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

/* ---------- 글자 텍스처 (로고) ---------- */
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const logoTex = canvasTex(512, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.fillStyle = '#8b8e93'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '600 70px "Segoe UI", Helvetica, Arial, sans-serif'; g.fillText('Hurom', w / 2, h / 2 + 2);
});

/* ---------- 재질 ---------- */
const M = {
  case: new THREE.MeshPhysicalMaterial({ color: 0xf4f4f1, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35, transparent: true, opacity: 1 }),
  juicer: new THREE.MeshPhysicalMaterial({ color: 0xf1f1ee, roughness: 0.4, clearcoat: 0.3, clearcoatRoughness: 0.4, transparent: true, opacity: 1 }),
  juicerDark: new THREE.MeshStandardMaterial({ color: 0x5a5e63, roughness: 0.5, transparent: true, opacity: 1 }),
  drum: new THREE.MeshPhysicalMaterial({ color: 0xd9dde2, roughness: 0.08, transparent: true, opacity: 0.55, envMapIntensity: 1.0, depthWrite: false }),
  smoke: new THREE.MeshPhysicalMaterial({ color: 0x3a3f46, roughness: 0.3, transparent: true, opacity: 0.55, envMapIntensity: 0.6, depthWrite: false, side: THREE.DoubleSide }),
  silicone: new THREE.MeshPhysicalMaterial({ color: 0xeef0ee, roughness: 0.55, transparent: true, opacity: 0.92, clearcoat: 0.1 }),
  logo: new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false }),
  alu: new THREE.MeshStandardMaterial({ color: 0xb8bcc0, metalness: 0.6, roughness: 0.55, transparent: true, opacity: 1 }),   // 건조통: 무광 회색 알루미늄(아노다이징)
  heater: new THREE.MeshStandardMaterial({ color: 0xc9ced4, metalness: 0.85, roughness: 0.35 }),
  steelBlade: new THREE.MeshStandardMaterial({ color: 0xd4d7da, metalness: 0.9, roughness: 0.25 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.6 }),
  pcb: new THREE.MeshStandardMaterial({ color: 0x1f6b3a, roughness: 0.7 }),
  chip: new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.5 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.75, roughness: 0.35 }),
  wireB: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }),
  vent: new THREE.MeshStandardMaterial({ color: 0x55575c, roughness: 0.7 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.9 }),
  magnet: new THREE.MeshStandardMaterial({ color: 0x4a4f58, metalness: 0.6, roughness: 0.4 }),
  pulp: new THREE.MeshStandardMaterial({ color: 0xe08a3c, roughness: 0.95 }),        // 당근·사과 펄프
  powder: new THREE.MeshStandardMaterial({ color: 0xf0b06a, roughness: 1 }),
  jar: new THREE.MeshPhysicalMaterial({ color: 0xdfe6ea, roughness: 0.05, transparent: true, opacity: 0.4, envMapIntensity: 1.0, depthWrite: false }),
  led: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffe2b0, emissiveIntensity: 1.6 }),
  air: new THREE.MeshBasicMaterial({ color: 0xf0a050, transparent: true, opacity: 0 }),
  mesh: new THREE.MeshStandardMaterial({ color: 0x8a8d92, roughness: 0.6, transparent: true, opacity: 0.85 }),
};

/* ---------- 치수 (10cm 단위, 모두 가정) ---------- */
const W = 2.0, D = 2.3, R = 0.16;        // 도크 바깥 20 × 23cm · 모서리 1.6cm
const BASE = 0.3;                        // 아래 부품 칸(모터·열판·보드·팬) 3cm
const BOWL_R = 0.8, BOWL_H = 0.7;        // 건조통 Ø16 · 깊이 7cm (약 1.4L, 1회분 1L)
const BZ = -0.1;                         // 건조통 중심 z (뒤 바람길 자리를 남기려고 조금 뒤로)
const TOP = BASE + BOWL_H;               // 몸통 윗면 높이 1.0
const LID = 0.1;                         // 뚜껑 1cm
const H = TOP + LID;                     // 전체 11cm
const INLET = new THREE.Vector3(-0.4, TOP + LID, BZ);   // 투입구(뚜껑 구멍 Ø5cm) 중심 — 원액기 쪽
const product = new THREE.Group(); scene.add(product);
const parts = [];
function part(name, obj, offset, labelAnchor = new THREE.Vector3(), inner = false) {
  obj.userData.home = obj.position.clone();
  obj.userData.off = new THREE.Vector3(...offset);
  obj.userData.inner = inner;
  product.add(obj);
  const el = document.createElement('div'); el.className = 'xv-label'; el.textContent = name; labelLayer.appendChild(el);
  parts.push({ obj, el, anchor: labelAnchor });
  return obj;
}
function rrect(w, h, r, s = new THREE.Shape(), cx = 0, cy = 0) {
  s.moveTo(cx - w / 2 + r, cy - h / 2); s.lineTo(cx + w / 2 - r, cy - h / 2); s.quadraticCurveTo(cx + w / 2, cy - h / 2, cx + w / 2, cy - h / 2 + r);
  s.lineTo(cx + w / 2, cy + h / 2 - r); s.quadraticCurveTo(cx + w / 2, cy + h / 2, cx + w / 2 - r, cy + h / 2); s.lineTo(cx - w / 2 + r, cy + h / 2);
  s.quadraticCurveTo(cx - w / 2, cy + h / 2, cx - w / 2, cy + h / 2 - r); s.lineTo(cx - w / 2, cy - h / 2 + r); s.quadraticCurveTo(cx - w / 2, cy - h / 2, cx - w / 2 + r, cy - h / 2);
  return s;
}
function circleHole(cx, cz, r) { const p = new THREE.Path(); p.absarc(cx, -cz, r, 0, Math.PI * 2, true); return p; }   // 모양 좌표 y = -z
// 세워 뽑기: XY 모양을 바닥(XZ)에 눕혀 위(+Y)로 뽑는다
function extrudeUp(shape, height, mat, y0, bevel = 0.02) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: height - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 32 });
  const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.y = y0 + bevel; return m;
}
function tube(points, r, mat, seg = 40) { return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), seg, r, 10, false), mat); }

/* 몸체 색 — 확정은 흰색. 비교용 그래파이트·블랙 */
const COLORS = {
  white: { case: 0xf4f4f1, rough: 0.42, clear: 0.35 },
  graphite: { case: 0x4b4f55, rough: 0.5, clear: 0.2 },
  black: { case: 0x15171a, rough: 0.14, clear: 1 },
};
function setColor(k) {
  const c = COLORS[k] || COLORS.white;
  M.case.color.set(c.case); M.case.roughness = c.rough; M.case.clearcoat = c.clear;
  document.querySelectorAll('[data-xv-color]').forEach(b => b.classList.toggle('on', b.dataset.xvColor === k));
}
window.xvSetColor = setColor;

/* ===== 원액기 — 자리 설명용 간략 모형(휴롬 세로형 비례). 도크 왼쪽, 배출구가 도크 투입구 위로 ===== */
const JX = -1.85;   // 원액기 중심 x
const juicer = new THREE.Group(); juicer.name = 'juicer'; product.add(juicer);
{
  const base = extrudeUp(rrect(1.5, 1.8, 0.2, new THREE.Shape(), JX, 0), 1.3, M.juicer, 0, 0.03); juicer.add(base);   // 모터 몸체 15 × 18 × 13cm
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.72, 1.6, 48, 1, true), M.drum); drum.position.set(JX, 1.3 + 0.8, 0); juicer.add(drum);   // 착즙통(투명)
  const drumBot = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 48), M.juicerDark); drumBot.position.set(JX, 1.34, 0); juicer.add(drumBot);
  const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, 1.4, 24), M.juicerDark); screw.position.set(JX, 1.3 + 0.78, 0); juicer.add(screw);   // 스크루
  const hopper = extrudeUp(rrect(1.5, 1.5, 0.75, new THREE.Shape(), JX, 0), 0.5, M.juicer, 2.9, 0.03); juicer.add(hopper);   // 투입구 뚜껑
  const chute = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.4, 32, 1, true), M.juicer); chute.position.set(JX + 0.25, 3.55, -0.2); juicer.add(chute);
  const juiceSpout = tube([new THREE.Vector3(JX, 1.55, 0.6), new THREE.Vector3(JX, 1.5, 0.95), new THREE.Vector3(JX, 1.3, 1.05)], 0.09, M.juicerDark, 16); juicer.add(juiceSpout);   // 앞 주스 배출구
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.36, 0.9, 32, 1, true), M.drum); cup.position.set(JX, 0.45, 1.15); juicer.add(cup);   // 주스 컵
  // 펄프 배출구: 착즙통 옆(도크 쪽, +x)에서 짧게 나와 아래로 꺾임. 끝 높이 약 17cm — 모델마다 다름(두팔 치수 측정)
  const pulpSpout = tube([new THREE.Vector3(JX + 0.6, 1.72, -0.1), new THREE.Vector3(JX + 1.05, 1.72, -0.1), new THREE.Vector3(JX + 1.18, 1.66, -0.1)], 0.13, M.juicerDark, 20); juicer.add(pulpSpout);
  const jl = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), M.logo); jl.position.set(JX, 0.5, 0.9 + 0.017); juicer.add(jl);
}
const SPOUT_END = new THREE.Vector3(JX + 1.18, 1.66, -0.1);   // = (-0.67, 1.66, -0.1)

/* 1. 몸통 — 흰 사출. 아래 부품 칸 3cm + 건조통이 들어가는 둥근 구멍 벽 7cm(한 몸). 앞 윗면에 버튼 1 + 불빛 3, 앞면 「Hurom」 */
{
  const g = new THREE.Group();
  g.add(extrudeUp(rrect(W, D, R), BASE, M.case, 0, 0.015));                                                // 아래 칸(속은 따로 부품)
  const ring = rrect(W, D, R); ring.holes.push(circleHole(0, BZ, BOWL_R + 0.02));
  g.add(extrudeUp(ring, BOWL_H, M.case, BASE, 0.012));                                                     // 건조통 둘레 벽
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), M.logo); logo.position.set(0, 0.15, D / 2 + 0.017); g.add(logo);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 32), M.dark); btn.position.set(0.55, TOP + 0.004, 0.92); g.add(btn);   // 버튼 1 (앞 윗면 오른쪽)
  [[-0.05, 0xf0a050], [0.13, 0xef5b4c], [0.31, 0x3cab6e]].forEach(([x, c], i) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 16), i === 0 ? M.led : new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })); l.position.set(x, TOP + 0.002, 0.92); g.add(l); });   // 불빛 3: 받는 중 · 말리는 중 · 가루 완료
  for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.025, 0.015), M.vent); s.position.set(0, 0.08 + i * 0.07, -D / 2 - 0.012); g.add(s); }   // 뒷면 아래 흡기 슬롯
  const notch = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.09), M.vent); notch.position.set(W / 2 + 0.004, 0.15, -0.6); g.add(notch);   // 오른쪽 옆 선 홈
  part('몸통 · 흰 사출 · 아래 부품 칸 3cm + 건조통 벽 7cm · 앞 윗면 버튼 1 + 불빛 3', g, [0, 0, 0], new THREE.Vector3(-0.95, 0.5, 1.1));
}
/* 2. 뚜껑 — 스모크 PC 한 장(속이 보임). 원액기 쪽에 투입구 Ø5cm, 뒤쪽에 습기 배기 슬롯. 들어서 떼어 씻음 */
{
  const g = new THREE.Group();
  const s = rrect(W - 0.02, D - 0.02, R); s.holes.push(circleHole(INLET.x, INLET.z, 0.25));
  g.add(extrudeUp(s, LID, M.smoke, 0, 0.012));
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.14, 32, 1, true), M.case); collar.position.set(INLET.x, LID + 0.02, INLET.z); g.add(collar);   // 투입구 테(깔때기가 끼는 자리)
  for (let i = 0; i < 4; i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.5, LID + 0.004, 0.02), M.vent); v.position.set(0.3, LID / 2, -0.85 + i * 0.06); g.add(v); }   // 습기 배기 슬롯
  g.position.set(0, TOP, 0);
  part('뚜껑 · 스모크 PC · 투입구 Ø5cm(원액기 쪽) · 습기 배기 슬롯 · 떼어 씻음', g, [0, 2.4, 0], new THREE.Vector3(0.9, 0.05, 0.7));
}
/* 3. 실리콘 깔때기 — 식품용 실리콘, 원액기 배출구에 끼우는 소매 + 짧고 넓은 통로 + 도크 투입구에 앉는 테. 소·대 2종(가정). 안쪽 광택, 거의 수직 */
{
  const g = new THREE.Group();
  const p0 = SPOUT_END.clone(), p3 = new THREE.Vector3(INLET.x, INLET.y + 0.02, INLET.z);
  const path = new THREE.CatmullRomCurve3([p0, new THREE.Vector3(p0.x + 0.12, p0.y - 0.08, p0.z), new THREE.Vector3(p3.x - 0.04, p3.y + 0.25, p3.z), p3]);
  // 굵기가 변하는 통로: 위(소매) 좁고 아래(투입구) 넓게 — 짧은 튜브 조각으로
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = i / N, b = (i + 1) / N;
    const r = 0.15 + 0.1 * a;
    const seg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([path.getPointAt(a), path.getPointAt((a + b) / 2), path.getPointAt(b)]), 4, r, 24, false);
    g.add(new THREE.Mesh(seg, M.silicone));
  }
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 32, 1, true), M.silicone); cuff.rotation.z = Math.PI / 2; cuff.position.set(p0.x - 0.12, p0.y + 0.04, p0.z); g.add(cuff);   // 배출구에 끼우는 소매
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 12, 40), M.rubber); ring.rotation.y = Math.PI / 2; ring.position.set(p0.x - 0.2, p0.y + 0.04, p0.z); g.add(ring);         // 고정 고무 링
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.25, 0.06, 32), M.silicone); foot.position.set(p3.x, p3.y + 0.01, p3.z); g.add(foot);   // 투입구에 앉는 테
  g.name = 'funnel';
  part('실리콘 깔때기 · 식품용 · 배출구 소매 + 짧고 넓은 통로 · 소·대 2종 · 떼어 씻음', g, [-0.3, 3.3, 0], new THREE.Vector3(p0.x - 0.05, p0.y + 0.25, p0.z));
}
/* 4. 건조통 — 식품용 알루미늄(아노다이징) Ø16 × 깊이 7cm. 바닥 가운데 자석 커플링 컵, 뒤쪽 벽 위에 바람 들어오는 망 창. 들어서 빼 씻음 */
{
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(BOWL_R, BOWL_R - 0.03, BOWL_H, 64, 1, true), M.alu); wall.position.y = BOWL_H / 2; g.add(wall);
  wall.material = M.alu; wall.material.side = THREE.DoubleSide;
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(BOWL_R - 0.03, BOWL_R - 0.03, 0.025, 64), M.alu); floor.position.y = 0.0125; g.add(floor);
  const cupM = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 32), M.alu); cupM.position.y = 0.04; g.add(cupM);   // 커플링 컵(밀봉, 구멍 없음)
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.16, 0.03), M.mesh); win.position.set(0, BOWL_H - 0.14, -BOWL_R + 0.015); g.add(win);   // 바람 들어오는 망 창(뒤)
  const lip = new THREE.Mesh(new THREE.TorusGeometry(BOWL_R + 0.01, 0.02, 10, 64), M.alu); lip.rotation.x = Math.PI / 2; lip.position.y = BOWL_H; g.add(lip);
  g.position.set(0, BASE, BZ);
  part('건조통 · 식품용 알루미늄 아노다이징 · Ø16 × 7cm(약 1.4L) · 뒤 벽 바람 창 · 바닥에 구멍 없음(자석 커플링)', g, [0, 1.15, 0], new THREE.Vector3(-0.78, 0.45, 0.4));
}
/* 5. 펴 주는 날개 — 실리콘 끝 달린 팔 2개, 축 위쪽. 착즙 중엔 천천히 돌아 떨어진 찌꺼기를 옆으로 밀어 얇게 펴고, 말릴 때는 뒤집어 섞음 */
{
  const g = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 24), M.dark); hub.position.y = 0.06; g.add(hub);
  [0, Math.PI].forEach(a => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 0.06), M.dark); arm.position.set(Math.cos(a) * 0.38, 0.1, Math.sin(a) * 0.38); arm.rotation.y = -a; g.add(arm);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.025), M.silicone); wing.position.set(Math.cos(a) * 0.45, 0.14, Math.sin(a) * 0.45); wing.rotation.y = -a + 0.5; g.add(wing);
  });
  g.userData.slow = true;
  g.position.set(0, BASE + 0.12, BZ);
  part('펴 주는 날개 · 실리콘 끝 · 천천히 돌아 얇게 펴고 뒤집음 · 떼어 씻음', g, [0.7, 2.1, -1.2], new THREE.Vector3(0.62, 0.18, 0.05), true);
}
/* 6. 분쇄날 — 스테인리스 2날, 축 아래쪽(통 바닥 바로 위). 다 마른 뒤에만 빨리 돌아 가루로 */
{
  const g = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 24), M.steelBlade); hub.position.y = 0.03; g.add(hub);
  [0, Math.PI].forEach(a => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.09), M.steelBlade); b.position.set(Math.cos(a) * 0.27, 0.05, Math.sin(a) * 0.27); b.rotation.y = -a; b.rotation.x = a === 0 ? 0.35 : -0.35; g.add(b); });
  g.userData.fast = true;
  g.position.set(0, BASE + 0.045, BZ);
  part('분쇄날 · 스테인리스 2날 · 말린 뒤에만 빨리 돌아 가루로', g, [0.7, 1.6, -1.2], new THREE.Vector3(0.3, 0.05, -0.05), true);
}
/* 7. 찌꺼기 — 건조통 바닥에 얇게 펴진 당근·사과 펄프(설명용). 한 번에 약 1L(원액기 1회분) */
{
  const g = new THREE.Group();
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(BOWL_R - 0.06, BOWL_R - 0.08, 0.16, 48), M.pulp); mound.position.y = 0.08; g.add(mound);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rr = 0.25 + (i % 3) * 0.17; const lump = new THREE.Mesh(new THREE.SphereGeometry(0.07 + (i % 2) * 0.03, 10, 8), M.pulp); lump.position.set(Math.cos(a) * rr, 0.17, Math.sin(a) * rr); lump.scale.y = 0.6; g.add(lump); }
  g.name = 'pulp';
  g.position.set(0, BASE + 0.03, BZ);
  part('찌꺼기 · 얇게 펴진 당근·사과 펄프 · 1회분 약 1L', g, [-0.7, 2.0, 1.2], new THREE.Vector3(-0.3, 0.2, 0.6));
}
/* 8. 열판 — 알루미늄 원판 + PTC 히터(아래). 건조통 바닥에 밀착해 약 55°C. 가운데는 커플링 자리 */
{
  const g = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(BOWL_R - 0.02, BOWL_R - 0.02, 0.04, 64), M.heater); plate.position.y = -0.02; g.add(plate);
  const ptc = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 12, 64), M.dark); ptc.rotation.x = Math.PI / 2; ptc.position.y = -0.07; g.add(ptc);   // PTC 히터 링
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.015, 8, 32), M.dark); ring.rotation.x = Math.PI / 2; ring.position.y = 0; g.add(ring);
  g.position.set(0, BASE, BZ);
  part('열판 · 알루미늄 원판 + PTC 히터 · 약 55°C · 과열 차단 NTC', g, [-0.8, 0.7, 1.4], new THREE.Vector3(-0.7, -0.05, 0.2), true);
}
/* 9. 자석 커플링 + 모터 — 아래 칸 가운데. 통 바닥을 뚫지 않고 자석으로 축을 돌림(천천히·빨리 두 속도). 물·가루가 모터로 못 들어감 */
{
  const g = new THREE.Group();
  const mag = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 32), M.magnet); mag.position.y = BASE - 0.085; g.add(mag);
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.18, 32), M.dark); motor.position.y = 0.11; g.add(motor);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 12), M.steelBlade); shaft.position.y = 0.23; g.add(shaft);
  g.position.set(0, 0, BZ);
  part('자석 커플링 + 모터 · 두 속도 · 통 바닥에 구멍 없음', g, [0, -1.0, 0], new THREE.Vector3(0.2, 0.1, 0.0), true);
}
/* 10. 팬 + 뒤 바람길 — 아래 칸 뒤쪽 40mm 팬이 뒷면 아래 슬롯으로 들이고, 열판 둘레를 지나 더워진 바람을 뒤 벽 속 길로 올려 건조통 뒤 망 창으로 넣는다. 습기는 뚜껑 뒤 슬롯으로 */
function fan(size = 0.4) {
  const g = new THREE.Group();
  const s = rrect(size, size, 0.05); const hole = new THREE.Path(); hole.absarc(0, 0, size * 0.46, 0, Math.PI * 2, true); s.holes.push(hole);
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false, curveSegments: 32 }), M.dark); frame.position.z = -0.05; g.add(frame);
  const rotor = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 24), M.dark); hub.rotation.x = Math.PI / 2; rotor.add(hub);
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.01), M.dark); const a = i / 7 * Math.PI * 2; b.position.set(Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0); b.rotation.z = a; b.rotation.y = 0.45; rotor.add(b); }
  rotor.userData.spin = true; g.add(rotor);
  return g;
}
{
  const g = new THREE.Group();
  const f = fan(0.26); f.rotation.x = -Math.PI / 2; f.position.set(0, BASE / 2, BZ - BOWL_R - 0.17); g.add(f);          // 위를 보는 팬(아래 칸 뒤)
  const duct = new THREE.Mesh(new THREE.BoxGeometry(0.76, BOWL_H - 0.02, 0.1), M.vent); duct.position.set(0, BASE + BOWL_H / 2, BZ - BOWL_R - 0.09); g.add(duct);   // 뒤 벽 속 바람길
  part('팬 40mm + 뒤 바람길 · 열판 둘레로 더워진 바람을 건조통 뒤 망 창으로', g, [0, 0.3, -1.9], new THREE.Vector3(0.45, 0.4, -0.05), true);
}
/* 11. 제어 보드 — 앞 윗면 버튼·불빛 바로 아래 몸통 앞 벽 속. 모터 두 속도 · 히터 · 팬 · 완료 판단(무게 변화 없음 → 통 안 습도/온도 변화로) */
{
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 0.22), M.pcb); g.add(board);
  const mcu = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.16), M.chip); mcu.position.set(-0.35, 0.025, 0); g.add(mcu);
  [[0.1, 0.05], [0.3, -0.05]].forEach(([x, z]) => { const q = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.04, 0.09), M.chip); q.position.set(x, 0.03, z); g.add(q); });
  g.position.set(0.2, TOP - 0.06, 0.92);
  part('제어 보드 · 버튼·불빛 바로 아래 · 모터 두 속도 · 히터 · 팬 · 완료 판단', g, [0.2, 2.6, 1.0], new THREE.Vector3(0.6, 0, 0), true);
}
/* 12. 온도·습도 센서 — NTC ① 열판(55°C 유지·과열 차단) · 습도+온도 ② 배기 슬롯 앞(공기가 더 마르지 않으면 완료) · 뚜껑 열림 자석 스위치(날 정지) */
{
  const g = new THREE.Group();
  const mk = (x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.04), M.chip); m.position.set(x, y, z); g.add(m); g.add(tube([new THREE.Vector3(x, y, z), new THREE.Vector3(x * 0.6, y + 0.1, z * 0.7), new THREE.Vector3(0.2, TOP - 0.06, 0.8)], 0.006, M.wireB, 12)); };
  mk(0.5, BASE - 0.05, BZ - 0.2);                 // ① 열판 아래
  mk(0.3, TOP - 0.05, -0.95);                     // ② 배기 쪽 습도·온도
  const sw = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.05), M.chip); sw.position.set(-0.7, TOP - 0.03, 0.95); g.add(sw);   // 뚜껑 열림 감지
  part('센서 · NTC 열판 · 습도+온도(배기) · 뚜껑 열림 스위치(날 정지)', g, [1.5, 1.1, 0.9], new THREE.Vector3(0.5, BASE - 0.05, BZ - 0.2), true);
}
/* 13. 가루통 — 트라이탄 밀폐 보관병(뚜껑 포함). 다 되면 건조통을 들어 가루를 붓는다. 도크 오른쪽 앞에 둠(가정 · 도크에 끼우는 자리는 없음) */
{
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.4, 1.0, 48, 1, true), M.jar); body.position.y = 0.5; g.add(body);
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.03, 48), M.jar); bottom.position.y = 0.015; g.add(bottom);
  const pow = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.45, 48), M.powder); pow.position.y = 0.25; g.add(pow);   // 가루
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.12, 48), M.case); cap.position.y = 1.06; g.add(cap);
  const seal = new THREE.Mesh(new THREE.TorusGeometry(0.41, 0.02, 8, 48), M.rubber); seal.rotation.x = Math.PI / 2; seal.position.y = 1.0; g.add(seal);
  g.name = 'jar';
  g.position.set(1.65, 0, 0.55);
  part('가루통 · 트라이탄 밀폐 병 · 건조통을 들어 붓는다', g, [1.4, 0.3, 0.8], new THREE.Vector3(0, 1.15, 0));
}
/* 14. 바닥 — 고무발 4 */
{
  const g = new THREE.Group();
  [[-0.85, -1.0], [0.85, -1.0], [-0.85, 1.0], [0.85, 1.0]].forEach(([x, z]) => { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 20), M.rubber); f.position.set(x, -0.015, z); g.add(f); });
  part('바닥 · 고무발 4', g, [0, -1.5, 0], new THREE.Vector3(-0.85, 0, 1.0), true);
}
/* 15. 어댑터 — 바깥 기성품(전압·W는 추정 예정). 선은 오른쪽 옆 홈으로 */
{
  const g = new THREE.Group();
  const brick = new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.26, 0.4, 2, 0.04), M.dark); brick.position.set(1.9, 0.13, -1.7); g.add(brick);
  g.add(tube([new THREE.Vector3(1.5, 0.13, -1.7), new THREE.Vector3(1.25, 0.1, -1.2), new THREE.Vector3(W / 2 + 0.02, 0.15, -0.6)], 0.013, M.wireB, 30));
  g.name = 'adapter';
  part('외장 어댑터 · 기성품(전압·W 추정 예정) · 선은 옆 홈으로', g, [1.2, -0.4, -0.8], new THREE.Vector3(1.9, 0.28, -1.7));
}
/* 공기 흐름(설명용) — 뒷면 아래 슬롯 → 열판 둘레 → 뒤 벽 길 → 건조통 뒤 망 창 → 찌꺼기 위 → 뚜껑 뒤 슬롯(습기) */
const airG = new THREE.Group(); airG.name = 'airg'; product.add(airG);
{
  [[-0.25], [0.25]].forEach(([sx]) => {
    const pts = [new THREE.Vector3(sx, 0.1, -D / 2 - 0.05), new THREE.Vector3(sx, BASE - 0.1, BZ - 0.5), new THREE.Vector3(sx, BASE + 0.1, BZ - BOWL_R - 0.1), new THREE.Vector3(sx, BASE + BOWL_H - 0.14, BZ - BOWL_R - 0.09), new THREE.Vector3(sx, BASE + BOWL_H - 0.16, BZ - BOWL_R + 0.1), new THREE.Vector3(sx * 1.6, BASE + 0.3, BZ + 0.1), new THREE.Vector3(sx * 1.2, BASE + 0.45, BZ + 0.5), new THREE.Vector3(0.3 + sx * 0.3, TOP + LID + 0.1, -0.8)];
    const c = new THREE.CatmullRomCurve3(pts, false);
    airG.add(new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.008, 6, false), M.air));
    for (let i = 0; i < 8; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), M.air); d.userData.t = i / 8; d.userData.c = c; airG.add(d); }
  });
}

/* 바닥 그림자 */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.ShadowMaterial({ opacity: 0.1 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.001; scene.add(ground);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 8;
Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 6, bottom: -5, near: 1, far: 24 });
const NOSHADOW = new Set([M.smoke, M.drum, M.jar, M.air, M.logo, M.silicone]);
product.traverse(o => { if (o.isMesh && !NOSHADOW.has(o.material)) o.castShadow = true; });
ground.receiveShadow = true;
product.position.y = -0.9;   // 보기 좋은 높이로 내림
ground.position.y = -0.9 - 0.001;

/* ---------- 스크롤 ---------- */
const Q = new URLSearchParams(location.search);
product.traverse(o => { if (o.name && Q.has('no' + o.name)) o.visible = false; });   // 디버그: ?nojuicer ?nopulp ?nojar ?noairg ?noadapter ?nofunnel
const CY = +(Q.get('cy') || 0);
const ANG = Q.has('ang') ? +Q.get('ang') * Math.PI / 180 : null;   // 카메라 각도 고정(도) — 최종 이미지용
const NOAIR = Q.has('noair');
const forced = Q.get('p');
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
function progress() {
  if (forced !== null) return +forced;
  const r = sec.getBoundingClientRect();
  return clamp(-r.top / (r.height - innerHeight));
}
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

const tmp = new THREE.Vector3();
let t0 = performance.now();
const juicerVisibleByQuery = juicer.visible;
function frame(now) {
  const dt = Math.min(0.1, Math.max(0, (now - t0) / 1000)); t0 = now;
  const p = progress();
  // 0~.1 원액기 옆 앞모습 · .1~.26 돌아 뒷모습 · .26~.4 몸체 투명 + 바람 · .4~.58 분해 · .58~.76 분해 유지 · .76~.95 조립하며 앞으로
  const e = p < 0.4 ? 0 : p < 0.58 ? ease((p - 0.4) / 0.18) : p < 0.76 ? 1 : p < 0.95 ? 1 - ease((p - 0.76) / 0.19) : 0;
  parts.forEach(({ obj }) => obj.position.copy(obj.userData.home).addScaledVector(obj.userData.off, e));
  const ghost = p < 0.24 ? 0 : p < 0.32 ? (p - 0.24) / 0.08 : p < 0.82 ? 1 : p < 0.94 ? 1 - (p - 0.82) / 0.12 : 0;
  M.case.opacity = 1 - 0.86 * ghost; M.case.depthWrite = ghost < 0.01;
  M.smoke.opacity = 0.55 - 0.3 * ghost;
  M.logo.opacity = 1 - 0.7 * ghost;
  const jg = ghost * (1 - e);
  M.alu.opacity = 1 - 0.7 * jg; M.alu.depthWrite = jg < 0.01;
  // 원액기는 분해할수록 옅어져 사라짐
  const jv = 1 - clamp(e * 1.6) ; M.juicer.opacity = jv * (1 - 0.5 * ghost); M.juicerDark.opacity = jv; M.drum.opacity = 0.55 * jv;
  juicer.visible = juicerVisibleByQuery && jv > 0.02;
  parts.forEach(({ obj }) => { if (obj.userData.inner) obj.visible = ghost > 0.02; });

  const FRONT = 0.55, BACK = Math.PI + 0.5, XA = 0.8, XB = 1.2;
  const ang = p < 0.1 ? FRONT
    : p < 0.26 ? FRONT + (BACK - FRONT) * ease((p - 0.1) / 0.16)
    : p < 0.4 ? BACK + (XA - BACK) * ease((p - 0.26) / 0.14)
    : p < 0.58 ? XA
    : p < 0.76 ? XA + (XB - XA) * ((p - 0.58) / 0.18)
    : p < 0.95 ? XB + (FRONT - XB) * ease((p - 0.76) / 0.19) : FRONT;
  ground.material.opacity = 0.1 * (1 - e);
  const dist = 11.5 - 1.2 * (1 - jv) + e * 5.0;
  const camY = p < 0.26 ? 2.4 : p < 0.4 ? 2.4 + 1.8 * ease((p - 0.26) / 0.14) : 4.2;
  const angF = ANG === null ? ang : ANG;
  // 원액기가 보일 때는 가운데를 왼쪽(원액기와 도크 사이)으로
  const cx = -0.9 * jv, cy0 = 0.7 * jv + 0.1;
  camera.position.set(cx + Math.sin(angF) * dist, camY + CY + e * 2.4, Math.cos(angF) * dist);
  camera.lookAt(cx, cy0 + e * 1.3, 0);
  const fk = Q.get('focus');
  if (fk) { const pt = parts.find(q => q.el.textContent.includes(fk)); if (pt) { const c = new THREE.Box3().setFromObject(pt.obj).getCenter(new THREE.Vector3()); camera.position.set(c.x + 1.0, c.y + 1.2, c.z + 1.0); camera.lookAt(c); } }

  product.traverse(o => {
    if (o.userData.spin) o.rotation.z += dt * (3 + 10 * (1 - e));
    if (o.userData.slow) o.rotation.y += dt * 0.6 * (1 - e);
    if (o.userData.fast) o.rotation.y -= dt * (0.6 + 8 * ghost) * (1 - e);
  });
  const airOn = NOAIR ? 0 : (p < 0.1 || p > 0.96) ? 0 : (ghost > 0.3 && e < 0.4) ? 0.85 * (1 - e / 0.4) : 0;
  M.air.opacity += (airOn - M.air.opacity) * 0.1;
  airG.children.forEach(ch => { if (ch.userData.c) { ch.userData.t = (ch.userData.t + dt * 0.12) % 1; ch.position.copy(ch.userData.c.getPointAt(ch.userData.t)); } });

  renderer.render(scene, camera);

  // 이름표
  const w = canvas.clientWidth, h = canvas.clientHeight, lab = [];
  parts.forEach(({ obj, el, anchor }) => {
    tmp.copy(anchor); obj.localToWorld(tmp); tmp.project(camera);
    const sx = (tmp.x * 0.5 + 0.5) * w, sy = (-tmp.y * 0.5 + 0.5) * h;
    lab.push({ el, sx, sy, w: el.offsetWidth || 160, h: el.offsetHeight || 30 });
    el.style.opacity = clamp((e - 0.7) / 0.3) * (obj.visible ? 1 : 0);
  });
  lab.sort((a, b) => a.sy - b.sy);
  for (let i = 0; i < lab.length; i++) for (let j = 0; j < i; j++) {
    const a = lab[j], b = lab[i];
    if (Math.abs(a.sx - b.sx) < (a.w + b.w) / 2 + 6 && Math.abs(a.sy - b.sy) < (a.h + b.h) / 2 + 4) b.sy = a.sy + (a.h + b.h) / 2 + 4;
  }
  lab.forEach(({ el, sx, sy }) => { el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%,-50%)`; });

  const idx = p < 0.1 ? 0 : p < 0.26 ? 1 : p < 0.42 ? 2 : 3;
  stepEls.forEach((s, i) => s.classList.toggle('on', i === idx));
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
setColor(Q.get('c') || 'white');
document.querySelectorAll('[data-xv-color]').forEach(b => b.addEventListener('click', () => setColor(b.dataset.xvColor)));
document.documentElement.classList.add('xv-ready');
