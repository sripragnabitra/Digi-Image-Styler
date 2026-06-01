// frontend/src/components/UploadForm.jsx
import React, { useState, useRef } from "react";

/* ── DropZone ─────────────────────────────────────────── */
function DropZone({ label, accentColor, icon, preview, onFile, hint }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); };
  const onChange    = (e) => processFile(e.target.files[0]);

  return (
    <div className="flex flex-col gap-4">
      {/* Label row */}
      <div className="flex items-center gap-3">
        <span
          className="tag"
          style={{
            background: accentColor + "1a",
            color: accentColor,
            border: `1px solid ${accentColor}40`,
          }}
        >
          {label}
        </span>
        <span className="text-xs" style={{ color: "var(--muted)" }}>{hint}</span>
      </div>

      {/* Zone */}
      <div
        className={`drop-zone rounded-2xl flex flex-col items-center justify-center${dragging ? " dragging" : ""}`}
        style={{ minHeight: preview ? "auto" : "176px", padding: preview ? "10px" : "36px 20px" }}
        onClick={() => inputRef.current.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {preview ? (
          <div className="relative w-full group">
            <img
              src={preview}
              alt={`${label} preview`}
              className="w-full rounded-xl object-cover"
              style={{ maxHeight: "220px", display: "block" }}
            />
            {/* hover overlay */}
            <div
              className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(13,13,15,0.68)", backdropFilter: "blur(4px)" }}
            >
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: accentColor }}
              >
                Change Image
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-4">{icon}</div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
              Drop image here
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>or click to browse</p>
            <p
              className="text-xs mt-4 px-4 py-1 rounded-full"
              style={{
                background: "var(--surface2)",
                color: "var(--muted)",
                fontSize: "0.62rem",
                letterSpacing: "0.07em",
              }}
            >
              PNG · JPG · JPEG · up to 10 MB
            </p>
          </>
        )}
        <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={onChange} />
      </div>
    </div>
  );
}

/* ── UploadForm ───────────────────────────────────────── */
export default function UploadForm({ onStylize }) {
  const [contentImage,  setContentImage]  = useState(null);
  const [styleImage,    setStyleImage]    = useState(null);
  const [contentPreview, setContentPreview] = useState(null);
  const [stylePreview,   setStylePreview]   = useState(null);

  const handleContent = (file) => { setContentImage(file);  setContentPreview(URL.createObjectURL(file)); };
  const handleStyle   = (file) => { setStyleImage(file);    setStylePreview(URL.createObjectURL(file)); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (contentImage && styleImage) onStylize?.(contentImage, styleImage);
  };

  const ready = contentImage && styleImage;

  return (
    <div className="max-w-5xl mx-auto animate-fade-up-d1">

      {/* Section heading */}
      <div className="text-center mb-10">
        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--gold)" }}>
          Step 1 — Upload
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--text)" }}>
          Choose Your Images
        </h2>
        <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          A <em>content image</em> provides the structure; a <em>style image</em> provides the artistic character.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Upload cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <DropZone
              label="Content"
              accentColor="var(--teal)"
              icon="📷"
              preview={contentPreview}
              onFile={handleContent}
              hint="Your photo or scene"
            />
          </div>
          <div className="card p-6">
            <DropZone
              label="Style"
              accentColor="var(--rose)"
              icon="🎨"
              preview={stylePreview}
              onFile={handleStyle}
              hint="Painting or artwork"
            />
          </div>
        </div>

        {/* Tips panel */}
        <div
          className="mb-8 rounded-2xl p-5"
          style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.14)" }}
        >
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--gold)" }}>
            Tips for Best Results
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
            <div>
              <p className="font-medium mb-2" style={{ color: "var(--teal)" }}>Content Image</p>
              <ul className="space-y-1.5">
                <li>· Clear subject with good contrast</li>
                <li>· Higher resolution → sharper output</li>
                <li>· Simple backgrounds work best</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2" style={{ color: "var(--rose)" }}>Style Image</p>
              <ul className="space-y-1.5">
                <li>· Paintings with strong brushwork</li>
                <li>· Impressionist or abstract styles</li>
                <li>· High colour contrast amplifies effect</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button type="submit" disabled={!ready} className="btn-gold">
            <span style={{ fontSize: "0.9rem" }}>✦</span>
            <span>{ready ? "Generate Stylized Image" : "Upload Both Images to Continue"}</span>
          </button>
          {!ready && (
            <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
              {!contentImage && !styleImage
                ? "Waiting for both images…"
                : !contentImage
                ? "Still need a content image"
                : "Still need a style image"}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
