import React, { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";

export const SkillsContext = createContext();

export const SkillsProvider = ({ children }) => {
  const [skills, setSkills] = useState([]);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const s = localStorage.getItem("savedSkillIds");
      return s ? JSON.parse(s) : [];
    } catch (e) {
      return [];
    }
  });

  // pagination / infinite scroll state
  const [page, setPage] = useState(1);
  const limit = 20;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isMounted = useRef(false);

  // helper: normalize a backend document (handles both old flat objects and new normalized ones)
  const normalize = (item, savedOverride) => {
    // If it already looks flattened, return as-is (but ensure fields exist)
    if (item && (item.name || item.brief || item.detail)) {
      const skillId = item.skillId || item.id || item._id || (item.skillId && item.skillId.toString && item.skillId.toString());
      return {
        skillId: skillId ? String(skillId) : String(item._id || item.id || Math.random()),
        id: item.id || item.skillId || item._id || null,
        name: item.name || "Unknown",
        brief: item.brief || "",
        detail: item.detail || "",
        image: item.image || item.skillImg || null,
        userId: item.userId || item.userId || null,
        username: item.username || null,
        category: item.category || null,
        width: item.width || Math.floor(Math.random() * 80) + 150,
        height: item.height || Math.floor(Math.random() * 100) + 200,
        saved: (savedOverride || savedIds).includes(item.skillId || item.id || item._id || ""),
        hidden: item.hidden || false,
      };
    }

    // Normalized shape: SkillOffering with populated skillId and userId
    const skill = item.skillId || item.skill || {};
    const user = item.userId || item.user || {};
    const detail = Array.isArray(item.description)
      ? item.description.join('\n')
      : item.detail || item.description || "";
    const brief = item.brief || (detail.length > 120 ? detail.slice(0, 117) + "..." : detail);
    const image = (Array.isArray(item.images) && item.images[0]) || item.image || user.photo || `https://via.placeholder.com/300x200?text=${encodeURIComponent(skill.name || item.offeringSlug || 'Skill')}`;
    const docId = item._id || (item.skillId && item.skillId._id) || item.id || null;

    return {
      skillId: docId ? String(docId) : String(Math.random()),
      id: docId,
      name: skill.name || item.offeringSlug || 'Unknown Skill',
      brief,
      detail,
      image,
      userId: user._id ? String(user._id) : user._id || null,
      username: user.username || item.username || 'demoUser',
      category: (skill.categories && skill.categories[0]) || (skill.category) || 'General',
      width: Math.floor(Math.random() * 80) + 150,
      height: Math.floor(Math.random() * 100) + 200,
      saved: (savedOverride || savedIds).includes(docId ? String(docId) : ""),
      hidden: false,
    };
  };

  // fetch a page of skills and append
  const fetchSkillsPage = async (p = 1, savedOverride) => {
    if (loading) return;
    setLoading(true);
    try {
      console.log(`Fetching skills page ${p}...`);
      const res = await axios.get(`/api/skills?page=${p}&limit=${limit}`);
      const data = Array.isArray(res.data) ? res.data : (res.data.items || []);
      const normalized = data.map((it) => normalize(it, savedOverride));

      setSkills((prev) => {
        const merged = [...prev, ...normalized];
        try { localStorage.setItem("skills", JSON.stringify(merged)); } catch (e) {}
        return merged;
      });

      if (data.length < limit) setHasMore(false);
      else setHasMore(true);
      setPage(p + 1);
    } catch (err) {
      console.error("Error fetching skills page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load cached page 1 if present
    const cached = localStorage.getItem("skills");
    if (cached) {
      setSkills(JSON.parse(cached));
    }

    // initial fetch only on first mount
    if (!isMounted.current) {
      // If we have a logged-in user, fetch their saved ids first so initial page includes saved flags
      const currentUserId = localStorage.getItem('currentUserId');
      if (currentUserId) {
        axios.get(`/api/users/${currentUserId}/saved/ids`)
          .then(r => {
            const ids = Array.isArray(r.data) ? r.data.map(String) : [];
            setSavedIds(ids);
            // fetch initial page and pass the freshly loaded saved ids so normalize can use them immediately
            fetchSkillsPage(1, ids);
          })
          .catch(err => {
            console.warn('Failed to load saved ids before initial fetch, proceeding without them', err);
            fetchSkillsPage(1);
          });
      } else {
        fetchSkillsPage(1);
      }
      isMounted.current = true;
    }

    // infinite scroll handler
    const onScroll = () => {
      if (!hasMore || loading) return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;
      if (nearBottom) {
        fetchSkillsPage(page);
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist saved ids
  useEffect(() => {
    try { localStorage.setItem('savedSkillIds', JSON.stringify(savedIds)); } catch (e) {}
  }, [savedIds]);

  /*** Action handlers ***/
  // Saved is per-user; we store an array of saved skill ids instead of mutating the skill object
  const handleSaveSkill = (id) => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
      // Persist saved on the backend (user.savedSkills)
      axios.post(`/api/users/${currentUserId}/saved`, { skillId: id })
        .then(res => {
          const saved = (res.data && res.data.savedSkills) ? res.data.savedSkills.map(s => String(s)) : [];
          setSavedIds(saved);
          setSkills((s) => s.map(item => item.skillId === id ? {...item, saved: true} : item));
        })
        .catch(err => {
          console.error('Failed to save skill on server:', err);
        });
      return;
    }

    // fallback: local-only saved list
    setSavedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      setSkills((s) => s.map(item => item.skillId === id ? {...item, saved: true} : item));
      return next;
    });
  };

  const handleUnsaveSkill = (id) => {
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
      axios.delete(`/api/users/${currentUserId}/saved/${id}`)
        .then(res => {
          const saved = (res.data && res.data.savedSkills) ? res.data.savedSkills.map(s => String(s)) : [];
          setSavedIds(saved);
          setSkills((s) => s.map(item => item.skillId === id ? {...item, saved: false} : item));
        })
        .catch(err => {
          console.error('Failed to unsave skill on server:', err);
        });
      return;
    }

    setSavedIds((prev) => {
      const next = prev.filter(x => x !== id);
      setSkills((s) => s.map(item => item.skillId === id ? {...item, saved: false} : item));
      return next;
    });
  };

  const handleHideSkill = (id) => {
    const updatedSkills = skills.map((s) =>
      s.skillId === id ? { ...s, hidden: true } : s
    );
    setSkills(updatedSkills);
    try { localStorage.setItem("skills", JSON.stringify(updatedSkills)); } catch (e) {}
  };

  const handleUnhideSkill = (id) => {
    const updatedSkills = skills.map((s) =>
      s.skillId === id ? { ...s, hidden: false } : s
    );
    setSkills(updatedSkills);
    try { localStorage.setItem("skills", JSON.stringify(updatedSkills)); } catch (e) {}
  };

  return (
    <SkillsContext.Provider
      value={{
        skills,
        loading,
        hasMore,
        fetchNextPage: () => fetchSkillsPage(page),
        handleSaveSkill,
        handleUnsaveSkill,
        handleHideSkill,
        handleUnhideSkill,
        savedIds,
      }}
    >
      {children}
    </SkillsContext.Provider>
  );
};