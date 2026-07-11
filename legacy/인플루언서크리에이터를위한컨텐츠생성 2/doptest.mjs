const t0=Date.now(); const ts=()=>`[+${((Date.now()-t0)/1000).toFixed(0)}s]`;
const CREDS=process.env.HF_CREDENTIALS; const [k,s]=CREDS.split(":");
const v1mod=await import("@higgsfield/client");
const v2mod=await import("@higgsfield/client/v2");
const v1=new v1mod.HiggsfieldClient({apiKey:k,apiSecret:s,maxPollTime:900000,pollInterval:4000});
const v2=v2mod.createHiggsfieldClient({credentials:CREDS,maxPollTime:900000,pollInterval:4000});
const logErr=(l,e)=>console.log(`${ts()} ${l} ERR ->`, e?.response?.status??"", e?.response?.data?JSON.stringify(e.response.data):(e?.message??e));
// 입력 이미지 업로드
console.log(`${ts()} uploading sample image...`);
const r=await fetch("https://picsum.photos/seed/dopcheck/768/1365");
const url=await v1.uploadImage(Buffer.from(await r.arrayBuffer()),"jpeg");
console.log(`${ts()} input image ->`, url);
// DoP turbo 호출 (수정된 형식)
try{
  console.log(`${ts()} subscribe higgsfield-ai/dop/turbo {image_url, prompt}...`);
  const res=await v2.subscribe("higgsfield-ai/dop/turbo",{ input:{ image_url:url, prompt:"slow cinematic dolly-in, subtle motion" }, withPolling:true });
  console.log(`${ts()} DOP status=${res.status}`);
  console.log(`${ts()} VIDEO URL ->`, res.video?.url ?? JSON.stringify(res).slice(0,300));
}catch(e){ logErr("DOP", e); }
console.log(`${ts()} DONE`);
