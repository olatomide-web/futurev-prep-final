// Futurev Prep — server-side AI endpoint for Vercel
const OPENAI_URL = 'https://api.openai.com/v1/responses';
function json(res,status,body){return res.status(status).setHeader('Content-Type','application/json').json(body)}
module.exports = async function handler(req,res){
  const requestId=`fv_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  console.log(`[Futurev API] ${requestId} ${req.method} /api/chat`);
  if(req.method==='GET') return json(res,200,{ok:true,configured:Boolean(process.env.OPENAI_API_KEY),model:process.env.OPENAI_MODEL||'gpt-5.6-luna',requestId});
  if(req.method!=='POST') return json(res,405,{ok:false,error:'Method not allowed',requestId});
  if(!process.env.OPENAI_API_KEY){
    console.error(`[Futurev API] ${requestId} MISSING OPENAI_API_KEY`);
    return json(res,500,{ok:false,code:'MISSING_API_KEY',error:'OPENAI_API_KEY is not configured on the server.',requestId});
  }
  const body=req.body||{};
  const message=typeof body.message==='string'?body.message.trim():'';
  const subject=typeof body.subject==='string'?body.subject.trim():'';
  const topic=typeof body.topic==='string'?body.topic.trim():'';
  const mode=body.mode==='followup'?'followup':'chat';
  if(!message) return json(res,400,{ok:false,code:'EMPTY_MESSAGE',error:'Message is required.',requestId});
  const system=mode==='followup'
    ? 'You are Futurev Prep, a WAEC exam-prep assistant for senior secondary students in West Africa. Generate exactly 5 fresh multiple-choice questions for the requested subject/topic. Match secondary-school level and WAEC-style wording. Do not repeat supplied seed questions. Return ONLY valid JSON: {"questions":[{"area":"string","q":"string","o":["A","B","C","D"],"a":0,"e":"short explanation"}]}. a is the zero-based correct option index.'
    : 'You are Futurev Coach, a clear and encouraging WAEC study assistant. Explain concepts in simple secondary-school language, focus on understanding rather than shortcuts, and be concise. If ambiguous, ask for the subject/topic. Do not claim access to private WAEC material.';
  const input=mode==='followup'
    ? `${message}\nSubject: ${subject}\nTopic: ${topic}`
    : `Subject: ${subject||'Not specified'}\nTopic: ${topic||'Not specified'}\nStudent question: ${message}`;
  const payload={model:process.env.OPENAI_MODEL||'gpt-5.6-luna',input:[
    {role:'system',content:[{type:'input_text',text:system}]},
    {role:'user',content:[{type:'input_text',text:input}]}
  ],max_output_tokens:mode==='followup'?1800:700};
  console.log(`[Futurev API] ${requestId} CALLING_OPENAI`,JSON.stringify({mode,model:payload.model,input,max_output_tokens:payload.max_output_tokens}));
  let upstream;
  try{upstream=await fetch(OPENAI_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify(payload)})}
  catch(err){console.error(`[Futurev API] ${requestId} NETWORK_ERROR`,err);return json(res,502,{ok:false,code:'UPSTREAM_NETWORK_ERROR',error:'Could not reach the AI provider.',requestId})}
  const raw=await upstream.text();
  console.log(`[Futurev API] ${requestId} OPENAI_RESPONSE status=${upstream.status}`);
  if(!upstream.ok){console.error(`[Futurev API] ${requestId} OPENAI_ERROR`,raw.slice(0,3000));return json(res,502,{ok:false,code:'OPENAI_ERROR',error:`AI provider returned HTTP ${upstream.status}.`,providerStatus:upstream.status,requestId})}
  let data; try{data=JSON.parse(raw)}catch(err){return json(res,502,{ok:false,code:'INVALID_PROVIDER_RESPONSE',error:'AI provider returned invalid JSON.',requestId})}
  const outputText=typeof data.output_text==='string'?data.output_text.trim():'';
  if(!outputText){console.error(`[Futurev API] ${requestId} EMPTY_MODEL_OUTPUT`,JSON.stringify(data).slice(0,3000));return json(res,502,{ok:false,code:'EMPTY_MODEL_OUTPUT',error:'AI provider returned no text output.',requestId})}
  if(mode==='followup'){
    try{const parsed=JSON.parse(outputText.replace(/^```json\s*/i,'').replace(/```$/i,'').trim());if(!Array.isArray(parsed.questions)||!parsed.questions.length)throw new Error('No questions');return json(res,200,{ok:true,mode,questions:parsed.questions.slice(0,5),requestId})}
    catch(err){console.error(`[Futurev API] ${requestId} INVALID_FOLLOWUP_JSON`,outputText.slice(0,3000));return json(res,502,{ok:false,code:'INVALID_FOLLOWUP_JSON',error:'The AI returned an invalid question set.',requestId})}
  }
  return json(res,200,{ok:true,mode,text:outputText,requestId});
};
