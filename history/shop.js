// 꾸미기 장신구 목록
// 박물관 기념품점에서 사랑받는 우리 문화유산(반가사유상·달항아리·청자·까치호랑이·일월오봉도·신라 금관 등)에서 디자인을 따왔어요.
// premium: 나중에 유료로 팔 수 있는 아이템이에요.
//   config.js 의 shop.lockPremium 을 true 로 바꾸면 산 사람(localStorage "dalbit-owned")만 쓸 수 있게 잠겨요.
//   지금은 "오픈 기념 무료 체험"으로 모두 쓸 수 있어요.
// price: 앞으로 정할 판매 가격(원). 비워 두면 화면에 가격을 보여 주지 않아요.
const ACC_SLOTS = {
  hand: { ko: "손에 들기", en: "In hand" },
  waist: { ko: "허리에 달기", en: "On the waist" },
  chest: { ko: "가슴에 달기", en: "On the chest" },
  back: { ko: "등에 업기", en: "On the back" },
};
const ACCESSORIES = [
  { id: "norigae", slot: "waist", emoji: "🎐", premium: false, ko: { name: "노리개", from: "조선 여인들이 저고리 고름에 달던 장신구예요." }, en: { name: "Norigae tassel", from: "An ornament Joseon women hung from their jacket ties." } },
  { id: "bokjumeoni", slot: "waist", emoji: "👛", premium: false, ko: { name: "복주머니", from: "설날에 복을 담아 차던 주머니예요." }, en: { name: "Lucky pouch", from: "A pouch worn at New Year to hold good fortune." } },
  { id: "hyangnang", slot: "waist", emoji: "🪻", premium: false, ko: { name: "향낭", from: "향을 넣어 몸에 지니던 향주머니예요." }, en: { name: "Scent sachet", from: "A small bag of fragrance carried on the body." } },
  { id: "taegeukseon", slot: "hand", emoji: "🪭", premium: false, ko: { name: "태극선", from: "태극 무늬를 넣은 둥근 부채예요. 단오에 서로 선물했어요." }, en: { name: "Taegeuk fan", from: "A round fan with the taegeuk pattern, gifted at Dano." } },
  { id: "chorong", slot: "hand", emoji: "🏮", premium: false, ko: { name: "청사초롱", from: "푸른 비단과 붉은 비단으로 만든 등불이에요. 밤 궁궐에서 빛나요." }, en: { name: "Cheongsa lantern", from: "A blue-and-red silk lantern that glows in the night palace." } },
  { id: "pensive", slot: "hand", emoji: "🧘", premium: true, price: null, ko: { name: "반가사유상 미니어처", from: "국보 금동 미륵보살 반가사유상의 생각에 잠긴 모습을 작게 담았어요." }, en: { name: "Pensive Bodhisattva mini", from: "A tiny version of the National Treasure Pensive Bodhisattva." } },
  { id: "moonjar", slot: "hand", emoji: "🌕", premium: true, price: null, ko: { name: "백자 달항아리", from: "보름달처럼 둥글고 하얀 조선 백자 항아리예요." }, en: { name: "Moon jar", from: "A round white Joseon porcelain jar, like a full moon." } },
  { id: "celadon", slot: "hand", emoji: "🏺", premium: true, price: null, ko: { name: "청자 매병", from: "비색으로 이름난 고려청자의 매병을 본떴어요." }, en: { name: "Celadon vase", from: "Modeled on a Goryeo celadon maebyeong, famed for its jade color." } },
  { id: "kkachifan", slot: "hand", emoji: "🐯", premium: true, price: null, ko: { name: "까치호랑이 부채", from: "민화 '까치호랑이'의 익살스러운 호랑이와 까치를 담은 부채예요." }, en: { name: "Magpie & tiger fan", from: "A fan with the playful tiger and magpie of the folk painting." } },
  { id: "parasol", slot: "hand", emoji: "⛱️", premium: true, price: null, ko: { name: "일월오봉도 양산", from: "임금 뒤에 펼치던 그림 '일월오봉도'의 해·달·다섯 봉우리를 담았어요." }, en: { name: "Irworobongdo parasol", from: "The sun, moon and five peaks painted behind the king's throne." } },
  { id: "crownpin", slot: "chest", emoji: "👑", premium: true, price: null, ko: { name: "신라 금관 브로치", from: "出자 모양 세움장식이 있는 신라 금관을 브로치로 만들었어요." }, en: { name: "Silla gold crown brooch", from: "A brooch of the Silla gold crown with its tree-shaped uprights." } },
  { id: "tigerdoll", slot: "back", emoji: "🐅", premium: true, price: null, ko: { name: "호랑이 인형", from: "우리 그림 속 친근한 호랑이를 인형으로 업고 다녀요." }, en: { name: "Tiger plush", from: "Carry the friendly tiger of Korean folk paintings on your back." } },
];
const accItem = (id) => ACCESSORIES.find((a) => a.id === id);
// 예전 저장값(true = 노리개)도 읽고, 허락된 아이템만, 칸마다 하나씩만 남겨요
function accList(acc) {
  const ids = acc === true ? ["norigae"] : Array.isArray(acc) ? acc : [];
  const seen = new Set();
  return ids.filter((id) => {
    const it = accItem(id);
    if (!it || seen.has(it.slot)) return false;
    seen.add(it.slot);
    return true;
  });
}
function ownedItems() {
  try {
    return JSON.parse(localStorage.getItem("dalbit-owned") || "[]");
  } catch {
    return [];
  }
}
function accLocked(it) {
  return !!(it.premium && window.DALBIT_CONFIG?.shop?.lockPremium && !ownedItems().includes(it.id));
}

// 3D 장신구 만들기 (makeAvatar 안에서 불러요)
function buildAccessory(id, { put, m, inner, armL, body }) {
  const gold = m("#e5b93c");
  const dress = body === "dress";
  const hand = (x = 0, y = -0.55, z = 0.12) => [x, y, z, armL];
  if (id === "norigae") {
    put(new THREE.SphereGeometry(0.05, 8, 8), m("#b3262d"), -0.16, 0.86, 0.33);
    put(new THREE.ConeGeometry(0.06, 0.24, 8), m("#d9a62e"), -0.16, 0.7, 0.33).rotation.x = Math.PI;
  } else if (id === "bokjumeoni") {
    const b = put(new THREE.SphereGeometry(0.1, 12, 10), m("#c0392b"), -0.18, 0.66, 0.34);
    b.scale.set(1, 1.1, 0.7);
    put(new THREE.TorusGeometry(0.06, 0.015, 6, 14), gold, -0.18, 0.76, 0.34).rotation.x = Math.PI / 2;
  } else if (id === "hyangnang") {
    put(new THREE.SphereGeometry(0.07, 10, 8), m("#6a4c93"), -0.17, 0.8, 0.34);
    put(new THREE.ConeGeometry(0.04, 0.18, 8), m("#2f8f83"), -0.17, 0.66, 0.34).rotation.x = Math.PI;
  } else if (id === "taegeukseon") {
    const [x, y, z, p] = hand(0, -0.78, 0.1);
    put(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6), m("#5a3e2b"), 0, -0.6, 0.1, p);
    const red = put(new THREE.CircleGeometry(0.2, 18, 0, Math.PI), new THREE.MeshLambertMaterial({ color: "#c0392b", side: THREE.DoubleSide }), x, y, z, p);
    const blue = put(new THREE.CircleGeometry(0.2, 18, Math.PI, Math.PI), new THREE.MeshLambertMaterial({ color: "#2c5aa0", side: THREE.DoubleSide }), x, y, z, p);
    red.rotation.z = blue.rotation.z = 0.5;
  } else if (id === "chorong") {
    put(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), m("#5a3e2b"), 0, -0.6, 0.1, armL);
    put(new THREE.CylinderGeometry(0.11, 0.11, 0.13, 12), new THREE.MeshLambertMaterial({ color: "#2c5aa0", emissive: 0x16305a, emissiveIntensity: 0.6 }), 0, -0.8, 0.1, armL);
    put(new THREE.CylinderGeometry(0.11, 0.11, 0.13, 12), new THREE.MeshLambertMaterial({ color: "#c0392b", emissive: 0x7a1f12, emissiveIntensity: 0.8 }), 0, -0.93, 0.1, armL);
  } else if (id === "pensive") {
    // 손바닥 위의 작은 금동 반가사유상
    const bronze = m("#b8913e");
    put(new THREE.CylinderGeometry(0.06, 0.07, 0.05, 10), bronze, 0, -0.5, 0.14, armL);
    put(new THREE.ConeGeometry(0.06, 0.13, 10), bronze, 0, -0.42, 0.14, armL);
    put(new THREE.SphereGeometry(0.04, 10, 8), bronze, 0, -0.33, 0.14, armL);
    put(new THREE.ConeGeometry(0.025, 0.05, 8), bronze, 0, -0.28, 0.14, armL);
  } else if (id === "moonjar") {
    const w = m("#f4efe2");
    const j = put(new THREE.SphereGeometry(0.17, 18, 14), w, 0, -0.66, 0.16, armL);
    j.scale.set(1, 0.95, 1);
    put(new THREE.CylinderGeometry(0.07, 0.08, 0.05, 14), w, 0, -0.48, 0.16, armL);
  } else if (id === "celadon") {
    const c = m("#8fc4ad");
    const body2 = put(new THREE.SphereGeometry(0.12, 16, 12), c, 0, -0.6, 0.16, armL);
    body2.scale.set(1, 1.35, 1);
    put(new THREE.CylinderGeometry(0.05, 0.08, 0.1, 12), c, 0, -0.78, 0.16, armL);
    put(new THREE.CylinderGeometry(0.03, 0.045, 0.06, 12), c, 0, -0.42, 0.16, armL);
    [0, 2.1, 4.2].forEach((a) => put(new THREE.SphereGeometry(0.018, 6, 6), m("#ffffff"), Math.sin(a) * 0.12, -0.58, 0.16 + Math.cos(a) * 0.12, armL));
  } else if (id === "kkachifan") {
    put(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 6), m("#5a3e2b"), 0, -0.58, 0.1, armL);
    const fan = put(new THREE.CircleGeometry(0.28, 18, 0, Math.PI), new THREE.MeshLambertMaterial({ color: "#f3e3c0", side: THREE.DoubleSide }), 0, -0.7, 0.1, armL);
    fan.rotation.z = Math.PI;
    put(new THREE.CircleGeometry(0.09, 14), new THREE.MeshLambertMaterial({ color: "#e08a2e", side: THREE.DoubleSide }), 0.06, -0.84, 0.105, armL);
    put(new THREE.CircleGeometry(0.035, 10), new THREE.MeshLambertMaterial({ color: "#1d1d2b", side: THREE.DoubleSide }), -0.13, -0.8, 0.106, armL);
  } else if (id === "parasol") {
    put(new THREE.CylinderGeometry(0.015, 0.015, 1.9, 6), m("#5a3e2b"), 0, 0.42, 0.06, armL);
    put(new THREE.ConeGeometry(0.62, 0.28, 18, 1, true), new THREE.MeshLambertMaterial({ color: "#1f3f6e", side: THREE.DoubleSide }), 0, 1.34, 0.06, armL);
    put(new THREE.SphereGeometry(0.06, 10, 8), m("#c0392b"), 0.22, 1.32, 0.3, armL);
    put(new THREE.SphereGeometry(0.05, 10, 8), m("#f4efe2"), -0.22, 1.32, 0.3, armL);
    [-0.3, -0.1, 0.1, 0.3].forEach((x, i) => put(new THREE.ConeGeometry(0.06, 0.1, 6), m("#3f7a55"), x, 1.28 - (i % 2) * 0.03, 0.42, armL));
  } else if (id === "crownpin") {
    const y = dress ? 1.12 : 0.98, z = dress ? 0.29 : 0.34;
    put(new THREE.BoxGeometry(0.16, 0.03, 0.02), gold, 0.13, y, z);
    [-0.05, 0, 0.05].forEach((x) => put(new THREE.BoxGeometry(0.015, 0.09, 0.02), gold, 0.13 + x, y + 0.055, z));
    put(new THREE.SphereGeometry(0.015, 6, 6), m("#3f7a55"), 0.13, y - 0.03, z + 0.01);
  } else if (id === "tigerdoll") {
    const o = m("#e08a2e"), k = m("#1d1d2b");
    const y = dress ? 1.0 : 0.88;
    const b = put(new THREE.SphereGeometry(0.18, 14, 12), o, 0, y, -0.4);
    b.scale.set(1, 1.1, 0.8);
    put(new THREE.SphereGeometry(0.14, 14, 12), o, 0, y + 0.24, -0.44);
    [-0.08, 0.08].forEach((x) => put(new THREE.SphereGeometry(0.045, 8, 8), o, x, y + 0.37, -0.44));
    [-0.05, 0.05].forEach((x) => put(new THREE.SphereGeometry(0.018, 6, 6), k, x, y + 0.26, -0.57));
    [-0.06, 0.06].forEach((yy) => put(new THREE.BoxGeometry(0.3, 0.03, 0.02), k, 0, y + yy, -0.55));
  }
}
