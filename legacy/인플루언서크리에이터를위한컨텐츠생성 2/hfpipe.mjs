const t0 = Date.now();
const ts = () => `[+${((Date.now()-t0)/1000).toFixed(0)}s]`;
const CREDS = process.env.HF_CREDENTIALS;
const [apiKey, apiSecret] = CREDS.split(":");

const v1mod = await import("@higgsfield/client");
const v2mod = await import("@higgsfield/client/v2");
const v1 = new v1mod.HiggsfieldClient({ apiKey, apiSecret });
const v2 = v2mod.createHiggsfieldClient({ credentials: CREDS });
const InputImage = v1mod.InputImage;

function logErr(label, e){
  console.log(`${ts()} ${label} ERR ->`, e?.response?.status ?? "", e?.response?.data ? JSON.stringify(e.response.data) : (e?.message ?? e));
}

// 1) 실제 얼굴 이미지 확보
console.log(`${ts()} fetching a real face image...`);
let buf;
try {
  const r = await fetch("https://thispersondoesnotexist.com/", { headers: { "User-Agent": "Mozilla/5.0" }});
  buf = Buffer.from(await r.arrayBuffer());
  console.log(`${ts()} face bytes:`, buf.length, "type:", r.headers.get("content-type"));
} catch(e){ logErr("FETCH FACE", e); process.exit(1); }

// 2) 업로드
let faceUrl;
try { faceUrl = await v1.uploadImage(buf, "jpeg"); console.log(`${ts()} UPLOAD OK ->`, faceUrl); }
catch(e){ logErr("UPLOAD", e); process.exit(1); }

// 3) Soul ID 학습 (폴링)
let soulId = null;
try {
  console.log(`${ts()} createSoulId (training, polling)...`);
  const soul = await v1.createSoulId({ name:"facecast-test", input_images:[InputImage.fromUrl(faceUrl)] }, true);
  soulId = soul.id;
  console.log(`${ts()} SOULID OK ->`, JSON.stringify({id:soul.id,status:soul.status,completed:soul.isCompleted}));
} catch(e){ logErr("SOULID", e); }

// 4) Soul 이미지 생성 (그 얼굴로 장면)
const soulInput = {
  prompt: "cinematic portrait, golden hour beach, white shirt, gentle smile looking at camera",
  width_and_height: "1152x2048", quality: "1080p", batch_size: 1, enhance_prompt: true,
};
if (soulId) { soulInput.custom_reference_id = soulId; soulInput.custom_reference_strength = 1; }
else { soulInput.image_reference = InputImage.fromUrl(faceUrl); }

let sceneUrl = null;
try {
  console.log(`${ts()} soul text2image (model=higgsfield-ai/soul/standard) ref=${soulId?'soulId':'image_reference'}...`);
  const res = await v2.subscribe("higgsfield-ai/soul/standard", { input: soulInput, withPolling: true });
  console.log(`${ts()} SOUL IMG status=${res.status} keys=${Object.keys(res)}`);
  sceneUrl = res.images?.[0]?.url;
  console.log(`${ts()} scene image ->`, sceneUrl);
} catch(e){ logErr("SOUL IMG", e); }

// 5) DoP 영상
if (sceneUrl) {
  try {
    console.log(`${ts()} dop image2video (model=higgsfield-ai/dop/preview, dop-turbo)...`);
    const res = await v2.subscribe("higgsfield-ai/dop/preview", {
      input: { model:"dop-turbo", prompt:"slow cinematic dolly-in, hair moving in the wind", input_images:[InputImage.fromUrl(sceneUrl)] },
      withPolling: true,
    });
    console.log(`${ts()} DOP status=${res.status}`);
    console.log(`${ts()} VIDEO URL ->`, res.video?.url);
  } catch(e){ logErr("DOP", e); }
}
console.log(`${ts()} DONE`);
