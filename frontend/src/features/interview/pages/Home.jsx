import { useState, useRef } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate } from "react-router";

const Home = () => {
  const { loading, generateReport, reports } = useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resumeInputRef = useRef(null);

  const navigate = useNavigate();

  const isValidResumeFile = (file) => {
    if (!file) return false;

    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const fileName = (file.name || "").toLowerCase();
    const hasAllowedExtension = fileName.endsWith(".pdf") || fileName.endsWith(".docx");
    const isAllowedMimeType = allowedMimeTypes.includes(file.type);

    return (isAllowedMimeType || hasAllowedExtension) && file.size <= 5 * 1024 * 1024;
  };

  const handleResumeFile = (file) => {
    if (!file) return;

    if (!isValidResumeFile(file)) {
      setSelectedResume(null);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
      window.alert("Please upload a PDF or DOCX resume under 5MB.");
      return;
    }

    setSelectedResume(file);
  };

  const handleGenerateReport = async () => {
    if (isSubmitting) return;

    const resumeFile = resumeInputRef.current?.files?.[0] ?? selectedResume;

    if (!jobDescription.trim() && !selfDescription.trim() && !resumeFile) {
      window.alert("Please provide a valid job description and either a resume or self description before generating the report.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await generateReport({ jobDescription, selfDescription, resumeFile });

      if (data?._id) {
        navigate(`/interview/${data._id}`);
        return;
      }

      window.alert("We could not generate the report with the current input. Please check your job description and profile details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="loading-screen">
        <h1>Loading your interview plan...</h1>
      </main>
    );
  }

  return (
    <div className="home-page">
      <header className="page-header">
        <div className="page-header__eyebrow">Skill Match AI</div>
        <h1>
          Create Your Custom <span className="highlight">Interview Plan</span>
        </h1>
        <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
      </header>

      <div className="interview-card">
        <div className="interview-card__body">
          <div className="panel panel--left">
            <div className="panel__header">
              <span className="panel__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
              </span>
              <h2>Target Job Description</h2>
              <span className="badge badge--required">Required</span>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="panel__textarea"
              placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
              maxLength={5000}
            />
            <div className="char-counter">{jobDescription.length} / 5000 chars</div>
          </div>

          <div className="panel-divider" />

          <div className="panel panel--right">
            <div className="panel__header">
              <span className="panel__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </span>
              <h2>Your Profile</h2>
            </div>

            <div className="upload-section">
              <label className="section-label">
                Upload Resume
                <span className="badge badge--best">Best Results</span>
              </label>
              <label
                className={`dropzone ${isDragActive ? "dropzone--active" : ""}`}
                htmlFor="resume"
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragActive(true);
                }}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragActive(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragActive(false);
                  const droppedFile = event.dataTransfer.files?.[0];
                  handleResumeFile(droppedFile);

                  if (droppedFile && resumeInputRef.current) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(droppedFile);
                    resumeInputRef.current.files = dataTransfer.files;
                  }
                }}
              >
                <span className="dropzone__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                </span>
                {selectedResume ? (
                  <p className="dropzone__file">{selectedResume.name}</p>
                ) : (
                  <>
                    <p className="dropzone__title">Click to upload or drag &amp; drop</p>
                    <p className="dropzone__subtitle">PDF or DOCX (Max 5MB)</p>
                  </>
                )}
                <input
                  ref={resumeInputRef}
                  hidden
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0];
                    handleResumeFile(selectedFile);
                  }}
                />
              </label>
            </div>

            <div className="or-divider"><span>OR</span></div>

            <div className="self-description">
              <label className="section-label" htmlFor="selfDescription">Quick Self-Description</label>
              <textarea
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
                id="selfDescription"
                name="selfDescription"
                className="panel__textarea panel__textarea--short"
                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
              />
            </div>

            <div className="info-box">
              <span className="info-box__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
              </span>
              <p>
                Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.
              </p>
            </div>
          </div>
        </div>

        <div className="interview-card__footer">
          <span className="footer-info">AI-Powered Strategy Generation &bull; Approx 30s</span>
          <button onClick={handleGenerateReport} className="generate-btn" disabled={isSubmitting}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
            {isSubmitting ? "Generating..." : "Generate My Interview Strategy"}
          </button>
        </div>
      </div>

      {reports.length > 0 && (
        <section className="recent-reports">
          <div className="recent-reports__header">
            <div className="recent-reports__icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.64 5.64l1.77 1.77M16.59 16.59l1.77 1.77M5.64 18.36l1.77-1.77M16.59 7.41l1.77-1.77" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <div className="recent-reports__heading">
              <h2>
                My Recent <span>Interview Plans</span>
              </h2>
              <p>Track and manage your AI-powered interview plans</p>
            </div>
          </div>

          <div className="reports-list">
            {reports.map((report) => {
              const rawScore = report?.matchScore;
              const score = Number.isFinite(Number(rawScore)) ? Math.min(100, Math.max(0, Number(rawScore))) : null;
              const checkpointItems = [
                "Technical Questions",
                "Coding Problems",
                "System Design",
                "Behavioral Round",
              ];

              return (
                <article key={report._id} className="report-item" onClick={() => navigate(`/interview/${report._id}`)}>
                  <div className="report-item__header">
                    <div className="report-item__title-wrap">
                      <div className="report-item__mini-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 18h4a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4" />
                          <path d="M8 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M8 18l-1.5-7h9L16 18" />
                        </svg>
                      </div>
                      <div>
                        <h3>{report.title || "Untitled Position"}</h3>
                        <p className="report-meta">
                          <span className="report-meta__icon" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          </span>
                          Generated on {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "11/1/2026"}
                        </p>
                      </div>
                    </div>

                    <button type="button" className="report-item__button">
                      View Details <span>→</span>
                    </button>
                  </div>

                  <div className="report-item__body">
                    <div className="report-item__score" style={{ "--score": `${score ?? 0}%` }}>
                      <div className="report-item__score-value">{score !== null ? `${score}%` : "--"}</div>
                    </div>

                    <ul className="report-item__checks">
                      {checkpointItems.map((item) => (
                        <li key={item}>
                          <span className="report-item__check">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="report-item__footer">
                    <span className="report-item__spark" aria-hidden="true">✦</span>
                    All set! Your interview plan is ready.
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <footer className="page-footer">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Help Center</a>
      </footer>
    </div>
  );
};

export default Home;