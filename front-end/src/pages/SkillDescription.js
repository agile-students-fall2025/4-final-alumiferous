import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchSkillById } from "../api/skills";

export default function SkillDescription() {
  const { id } = useParams();
  const nav = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setLoading(true); setErr(null);
    fetchSkillById(id).then(setSkill).catch(e => setErr(e.message)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{padding:16}}>Loading…</div>;
  if (err)     return <div style={{padding:16}}>Error: {err} <Link to="/">Back</Link></div>;

  return (
    <div style={{minHeight:"100dvh", padding:"16px 16px 96px", display:"flex", flexDirection:"column", alignItems:"center"}}>
      <div style={{alignSelf:"flex-start", border:"2px solid #bbb", padding:"10px 14px", borderRadius:6, background:"#eee"}}>InstaSkill</div>
      <h1 style={{margin:"12px 0 16px"}}>Skill Info</h1>

      <div style={{width:"92%", maxWidth:520, border:"1px solid #ddd", borderRadius:8, background:"#fafafa", padding:12}}>
        <img src={skill.mediaUrl} alt={skill.name} style={{width:"100%", borderRadius:6}} />
        <div style={{textAlign:"center", fontWeight:600, marginTop:8}}>Image / Video of skill</div>
      </div>

      <div style={{width:"92%", maxWidth:600, border:"1px solid #ddd", borderRadius:8, padding:16, marginTop:16}}>
        <div style={{textAlign:"center", fontWeight:600, marginBottom:8}}>About skill</div>
        <p style={{lineHeight:1.6}}>{skill.description}</p>
      </div>

      <button
         onClick={() => nav(`/requests/new?skillId=${encodeURIComponent(skill.id)}`)}
         style={{ marginTop: 24, background: "#000", color: "#fff", border: "none", padding: "14px 22px", borderRadius: 8 }}
      >
        Draft a Request
     </button>
    </div>
  );
}
