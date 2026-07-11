const t0=Date.now(); const ts=()=>`[+${((Date.now()-t0)/1000).toFixed(0)}s]`;
const CREDS=process.env.HF_CREDENTIALS; const [k,s]=CREDS.split(":");
const v1mod=await import("@higgsfield/client");
const v2mod=await import("@higgsfield/client/v2");
const v1=new v1mod.HiggsfieldClient({apiKey:k,apiSecret:s,maxPollTime:900000,pollInterval:5000});
const v2=v2mod.createHiggsfieldClient({credentials:CREDS,maxPollTime:900000,pollInterval:5000});
console.log(`${ts()} uploading...`);
const r=await fetch("https://picsum.photos/seed/dopcheck2/768/1365");
const url=await v1.uploadImage(Buffer.from(await r.arrayBuffer()),"jpeg");
console.log(`${ts()} input ->`, url);
try{
  console.log(`${ts()} dop/turbo generating (이건 끝까지 기다림)...`);
  const res=await v2.subscribe("higgsfield-ai/dop/turbo",{ input:{ image_url:url, prompt:"slow cinematic dolly-in, subtle motion" }, withPolling:true });
  console.log(`${ts()} DOP status=${res.status}`);
  console.log(`${ts()} VIDEO URL -> ${res.video?.url ?? "(none) "+JSON.stringify(res).slice(0,200)}`);
}catch(e){ console.log(`${ts()} DOP ERR ->`, e?.response?.status??"", e?.response?.data?JSON.stringify(e.response.data):(e?.message??e)); }
console.log(`${ts()} DONE`);
