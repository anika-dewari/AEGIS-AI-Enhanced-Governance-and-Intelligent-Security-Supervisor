import axios from 'axios';import {ALERTS,HEALTH} from '../data/mock.js';
// Set USE_MOCK=false when the Flask/FastAPI backend exists. Proposed contracts (not existing endpoints):
// GET /api/alerts, GET /api/alerts/{id}, GET /api/alerts/{id}/explanation, GET /api/alerts/{id}/risk, POST /api/alerts/{id}/decision, GET /api/decisions
export const USE_MOCK=true;
const http=axios.create({baseURL:import.meta.env.VITE_API_URL||'/api'});
const wait=(v,ms=450)=>new Promise(r=>setTimeout(()=>r(v),ms));
let decisions=[];
export const getAlerts=()=>USE_MOCK?wait(ALERTS):http.get('/alerts').then(r=>r.data);
export const getAlert=id=>USE_MOCK?wait(ALERTS.find(a=>a.id===id)):http.get(`/alerts/${id}`).then(r=>r.data);
export const getExplanation=id=>USE_MOCK?wait(ALERTS.find(a=>a.id===id)?.shap):http.get(`/alerts/${id}/explanation`).then(r=>r.data);
export const getRisk=id=>USE_MOCK?wait(ALERTS.find(a=>a.id===id)?.score):http.get(`/alerts/${id}/risk`).then(r=>r.data);
export const getDecisions=()=>USE_MOCK?wait([...decisions],200):http.get('/decisions').then(r=>r.data);
export const postDecision=(id,body)=>{if(!USE_MOCK)return http.post(`/alerts/${id}/decision`,body).then(r=>r.data);
 const d={...body,id:`DEC-${2001+decisions.length}`,alertId:id};decisions=[d,...decisions];return wait(d,300);};
// Mock health is deliberately "unverified": nothing is probed in mock mode.
export const getHealth=()=>USE_MOCK?wait(HEALTH.map(h=>({...h,status:'unverified'})),300):http.get('/health').then(r=>r.data);
