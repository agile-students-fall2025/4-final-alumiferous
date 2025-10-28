export async function fetchSkillById(id) {
  const res = await fetch("/mock/skills.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load skills");
  const skills = await res.json();
  const s = skills.find((x) => x.id === id);
  if (!s) throw new Error("Skill not found");
  return s;
}
