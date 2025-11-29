import React, { useState, useContext, useMemo, useEffect } from "react";
import "./OnBoarding.css";
import SkillSelector from "./SkillsSelector";
import { useNavigate } from "react-router-dom";
import { SkillsContext } from "./SkillsContext";
import axios from "axios";

const OnBoarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { skills } = useContext(SkillsContext);

  const [formData, setFormData] = useState({
    username: "",
    // will use skillsWanted as the 'needed skills' selection
    skillsWanted: [],
    bio: "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({ username: '', skillsWanted: '', photo: '', bio: '' });
  const [networkError, setNetworkError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [fixedNames, setFixedNames] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null=unchecked, true/false
  const [usernameChecking, setUsernameChecking] = useState(false);

  // FORM INPUT HANDLER
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear transient error messages when the user changes inputs
    setNetworkError('');
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handlePhotoChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setPhotoFile(f);
      try {
        const url = URL.createObjectURL(f);
        setPhotoPreview(url);
      } catch (e) {
        setPhotoPreview(null);
      }
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
    setNetworkError('');
    setErrors(prev => ({ ...prev, photo: '' }));
  };

  // VALIDATION LOGIC
  const validateStep = () => {
    switch (step) {
      case 1:
        // require minimum length and availability
        if (!formData.username || String(formData.username).trim().length < 4) return false;
        return usernameAvailable === true;

      case 2:
        return Array.isArray(formData.skillsWanted) && formData.skillsWanted.length > 0;

      case 3:
        // photo is optional, allow proceeding without it
        return true;

      case 4:
        // bio may be optional but allow simple validation (non-empty)
        return formData.bio.trim() !== "";

      default:
        return true;
    }
  };

  // SUBMIT HANDLER (connect to backend)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) {
      // set a generic field-level message for the current step
      switch (step) {
        case 1:
          setErrors(prev => ({ ...prev, username: 'Please enter a valid and available username.' }));
          break;
        case 2:
          setErrors(prev => ({ ...prev, skillsWanted: 'Please select at least one skill.' }));
          break;
        case 4:
          setErrors(prev => ({ ...prev, bio: 'Please provide a short bio.' }));
          break;
        default:
          break;
      }
      return;
    }

    setNetworkError('');
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const fd = new FormData();
      fd.append('username', formData.username.trim());
      fd.append('bio', formData.bio || '');
      // send needed skills as JSON string (backend accepts JSON or array)
      fd.append('neededSkills', JSON.stringify(formData.skillsWanted || []));
      if (photoFile) fd.append('photo', photoFile);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `jwt ${token}` } : {};

      const res = await axios.post(`/api/onboarding`, fd, {
        headers,
        onUploadProgress: (progressEvent) => {
          if (progressEvent && progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(pct);
          }
        }
      });

      const user = res.data && res.data.user ? res.data.user : null;
      if (user) {
        try {
          localStorage.setItem('currentUserId', String(user._id || user.id || ''));
          localStorage.setItem('currentUser', JSON.stringify(user));
        } catch (e) {}
      }

      setIsSubmitting(false);
      navigate('/home');
    } catch (err) {
      setIsSubmitting(false);
      const status = err && err.response && err.response.status;
      if (status === 401) setNetworkError('Authentication required. Please sign in and try again.');
      else if (status === 409) setNetworkError('Username already taken. Choose a different username.');
      else if (status === 503) setNetworkError('Service unavailable. Please try again later.');
      else setNetworkError('Failed to complete onboarding. Please try again.');
      console.error('Error submitting onboarding:', err && err.message ? err.message : err);
    }
  };

  // STEP NAVIGATION
  const nextStep = () => {
    setNetworkError('');
    setStep((prev) => Math.min(prev + 1, 4));
  };
  const prevStep = () => {
    setNetworkError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    let mounted = true;
    axios.get('/api/fixeddata')
      .then((res) => {
        if (!mounted) return;
        const data = res && res.data ? res.data : {};
        if (Array.isArray(data.generalNames) && data.generalNames.length) {
          setFixedNames(data.generalNames);
        } else {
          setFixedNames(null);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setFixedNames(null);
      });
    return () => { mounted = false; };
  }, []);

  // Real-time username availability check (debounced)
  useEffect(() => {
    const name = (formData.username || '').toString().trim();
    setUsernameAvailable(null);
    if (!name || name.length < 1) {
      setUsernameChecking(false);
      return;
    }

    // Enforce minimum locally
    if (name.length < 4) {
      setUsernameChecking(false);
      setUsernameAvailable(false);
      return;
    }

    let cancelled = false;
    const source = axios.CancelToken.source();
    setUsernameChecking(true);

    const t = setTimeout(() => {
      const currentUserId = localStorage.getItem('currentUserId');
      const params = { username: name };
      if (currentUserId) params.excludeId = currentUserId;
      axios.get(`/api/users/check-username`, { params, cancelToken: source.token })
        .then(r => {
          if (cancelled) return;
          const ok = r && r.data && r.data.available === true;
          setUsernameAvailable(!!ok);
          setUsernameChecking(false);
        })
        .catch(err => {
          if (axios.isCancel(err)) return;
          console.warn('Username check failed:', err && err.message ? err.message : err);
          if (!cancelled) {
            setUsernameAvailable(false);
            setUsernameChecking(false);
          }
        });
    }, 600);

    return () => {
      cancelled = true;
      source.cancel('username check cancelled');
      clearTimeout(t);
    };
  }, [formData.username]);

  // Unique skills list: prefer canonical fixedNames when available
  const allSkills = useMemo(() => {
    if (Array.isArray(fixedNames) && fixedNames.length) {
      return fixedNames.slice().sort();
    }
    const unique = [...new Set(skills.map((s) => s.name))];
    return unique.sort();
  }, [skills, fixedNames]);

  return (
    <div className="onboarding-container">
      <form onSubmit={handleSubmit} className="onboarding-form">

        {networkError && (
          <p className="form-network-error">{networkError}</p>
        )}

        {/* STEP 1: Username */}
        {step === 1 && (
          <div className="onboarding-step">
            <h1>Welcome to InstaSkill</h1>
            <h2>Choose a username</h2>

            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              disabled={isSubmitting}
            />

            <div className="status-row">
              {usernameChecking && <span className="status-muted">Checking username…</span>}
              {!usernameChecking && usernameAvailable === false && formData.username && String(formData.username).trim().length < 4 && (
                <span className="status-danger">Username must be at least 4 characters</span>
              )}
              {!usernameChecking && usernameAvailable === false && formData.username && String(formData.username).trim().length >= 4 && (
                <span className="status-danger">Username already taken</span>
              )}
              {!usernameChecking && usernameAvailable === true && (
                <span className="status-success">Username available</span>
              )}
            </div>

            {errors.username && (
              <div className="field-error">{errors.username}</div>
            )}

            <div className="button-row">
              <button
                type="button"
                onClick={() => validateStep() ? nextStep() : setErrors(prev => ({ ...prev, username: 'Please enter a valid and available username.' }))}
                disabled={isSubmitting || usernameChecking || usernameAvailable !== true}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Needed skills */}
        {step === 2 && (
          <div className="onboarding-step">
            <h1>What do you want to learn?</h1>

            <SkillSelector
              label="Select the skill(s) you need"
              allSkills={allSkills}
              selectedskills={formData.skillsWanted}
              setSelectedSkills={(skillsArr) => {
                setFormData({ ...formData, skillsWanted: skillsArr });
                setNetworkError('');
                setErrors(prev => ({ ...prev, skillsWanted: '' }));
              }}
            />

            {errors.skillsWanted && (
              <div className="field-error">{errors.skillsWanted}</div>
            )}

            <div className="button-row">
              <button type="button" onClick={prevStep} disabled={isSubmitting}>Back</button>
              <button type="button" onClick={() => validateStep() ? nextStep() : setErrors(prev => ({ ...prev, skillsWanted: 'Please select at least one skill.' }))} disabled={isSubmitting}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 3: Profile photo upload */}
        {step === 3 && (
          <div className="onboarding-step">
            <h1>Upload a profile photo</h1>

            <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={isSubmitting} />
            {photoPreview && (
              <img src={photoPreview} alt="preview" className="photo-preview" />
            )}

            <div className="button-row">
              <button type="button" onClick={prevStep} disabled={isSubmitting}>Back</button>
              <button type="button" onClick={() => nextStep()} disabled={isSubmitting}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 4: Bio and final submit */}
        {step === 4 && (
          <div className="onboarding-step">
            <h1>Tell us about yourself</h1>

            <textarea
              name="bio"
              className="form-input"
              placeholder="A short bio (what you're looking for, background, etc.)"
              value={formData.bio}
              onChange={handleChange}
              rows={5}
              disabled={isSubmitting}
            />

            {isSubmitting && (
              <div className="upload-progress">
                <div>Uploading: {uploadProgress}%</div>
              </div>
            )}

            <div className="button-row">
              <button type="button" onClick={prevStep} disabled={isSubmitting}>Back</button>
              <button
                type="submit"
                onClick={(e) => {
                  if (!validateStep()) {
                    setErrors(prev => ({ ...prev, bio: 'Please provide a short bio.' }));
                    e.preventDefault();
                    return;
                  }
                }}
                disabled={isSubmitting}
              >
                Finish
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};

export default OnBoarding;
