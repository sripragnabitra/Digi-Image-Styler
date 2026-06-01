// frontend/src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import UploadForm from "./components/UploadForm";

/* ── small UI atoms ──────────────────────────────────── */

function GoldDivider() {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      <span style={{ color: "var(--muted)", fontSize: "0.55rem", letterSpacing: "0.2em" }}>✦</span>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

function StepPill({ n, label }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: "rgba(201,168,76,0.14)",
          border: "1px solid rgba(201,168,76,0.4)",
          color: "var(--gold)",
        }}
      >
        {n}
      </span>
      <span className="text-sm" style={{ color: "var(--text)" }}>{label}</span>
    </div>
  );
}

function FooterList({ title, items }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--gold)" }}>
        {title}
      </p>
      <ul className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
        {items.map((t) => (
          <li key={t} className="flex items-center gap-2">
            <span style={{ color: "var(--gold)", fontSize: "0.45rem" }}>●</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── App ─────────────────────────────────────────────── */

export default function App() {
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const resultRef = useRef(null);

  const backendURL = process.env.REACT_APP_BACKEND_URL;

  /* resize before upload */
  const resizeImage = (file, maxWidth = 512, maxHeight = 512) =>
    new Promise((resolve, reject) => {
      const img    = new Image();
      const reader = new FileReader();
      reader.onload  = (e) => { img.src = e.target.result; };
      reader.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width  > maxWidth)  { height = Math.round((maxWidth  / width)  * height); width  = maxWidth;  }
        if (height > maxHeight) { width  = Math.round((maxHeight / height) * width);  height = maxHeight; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve(new File([blob], file.name, { type: file.type })) : reject(new Error("Canvas is empty")),
          file.type, 0.95
        );
      };
      img.onerror = reject;
      reader.readAsDataURL(file);
    });

  /* cleanup blob URLs */
  useEffect(() => {
    return () => { if (outputImage?.startsWith("blob:")) URL.revokeObjectURL(outputImage); };
  }, [outputImage]);

  /* main handler */
  const handleStylize = async (contentFile, styleFile) => {
    setLoading(true); setError(null);
    try {
      const [rc, rs] = await Promise.all([resizeImage(contentFile), resizeImage(styleFile)]);
      const fd = new FormData();
      fd.append("content", rc); fd.append("style", rs);

      const res = await fetch(`${backendURL}/stylize`, { method: "POST", body: fd });
      if (!res.ok) {
        let msg = `Server error (${res.status})`;
        try { const j = await res.json(); msg = j.error || msg; } catch { msg = await res.text() || msg; }
        throw new Error(msg);
      }
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) throw new Error("Expected an image in the response.");
      if (outputImage?.startsWith("blob:")) URL.revokeObjectURL(outputImage);
      setOutputImage(URL.createObjectURL(blob) + `#${Date.now()}`);

      // scroll to result
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--ink)" }}>

      {/* ── HEADER ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 animate-fade-up"
        style={{
          background: "rgba(13,13,15,0.82)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-light))", color: "#0d0d0f" }}
            >
              ✦
            </div>
            <span className="font-display text-xl font-bold shimmer-text">Digi Image Styler</span>
          </div>
          <span
            className="text-xs tracking-widest uppercase hidden sm:block"
            style={{ color: "var(--muted)" }}
          >
            Neural Style Transfer
          </span>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "var(--canvas)" }}>
        {/* ambient blobs */}
        <div
          className="blob absolute"
          style={{
            width: 460, height: 460,
            top: -140, left: -120,
            background: "radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 70%)",
            animationDelay: "0s",
          }}
        />
        <div
          className="blob absolute"
          style={{
            width: 360, height: 360,
            bottom: -80, right: -60,
            background: "radial-gradient(circle, rgba(62,207,178,0.13) 0%, transparent 70%)",
            animationDelay: "3s",
          }}
        />

        <div className="relative container mx-auto px-6 py-24 text-center">
          <p className="text-xs tracking-widest uppercase mb-5 animate-fade-up" style={{ color: "var(--gold)" }}>
            AI-Powered Artistic Transformation
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-black leading-none tracking-tight mb-6 animate-fade-up-d1">
            <span style={{ color: "var(--text)" }}>Turn any photo into</span>
            <br />
            <em className="shimmer-text">a masterpiece</em>
          </h1>
          <p
            className="max-w-xl mx-auto text-base leading-relaxed mb-12 animate-fade-up-d2"
            style={{ color: "var(--muted)" }}
          >
            Neural Style Transfer blends the structure of your photo with the texture and colour of
            any artwork — powered by the Google Magenta deep-learning model.
          </p>

          {/* steps strip */}
          <div
            className="inline-flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center
              px-6 py-5 rounded-2xl animate-fade-up-d3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <StepPill n="1" label="Upload your photo" />
            <div className="hidden sm:block w-8 h-px" style={{ background: "var(--border)" }} />
            <StepPill n="2" label="Pick a style artwork" />
            <div className="hidden sm:block w-8 h-px" style={{ background: "var(--border)" }} />
            <StepPill n="3" label="Download the result" />
          </div>
        </div>
      </section>

      {/* ── MAIN ────────────────────────────────────────── */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-16">

        {/* Upload form */}
        <section className="mb-16">
          <UploadForm onStylize={handleStylize} />
        </section>

        <GoldDivider />

        {/* Loading */}
        {loading && (
          <div className="text-center my-14 animate-fade-up">
            <div className="inline-flex flex-col items-center gap-5">
              <div className="relative w-16 h-16">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ border: "2px solid var(--surface2)" }}
                />
                <div
                  className="absolute inset-0 rounded-full spinner-ring"
                />
                <div
                  className="absolute inset-2 rounded-full spinner-pulse"
                />
              </div>
              <div>
                <p className="font-medium mb-1" style={{ color: "var(--text)" }}>
                  Painting in progress…
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  The neural network is blending your images. This may take 15–30 seconds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="max-w-xl mx-auto my-8 p-5 rounded-2xl animate-fade-up"
            style={{ background: "var(--rose-dim)", border: "1px solid rgba(224,96,126,0.3)" }}
          >
            <div className="flex items-start gap-3">
              <span style={{ color: "var(--rose)", fontSize: "1.1rem", lineHeight: 1.4 }}>⚠</span>
              <div>
                <p className="font-medium text-sm mb-1" style={{ color: "var(--rose)" }}>
                  Something went wrong
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {outputImage && (
          <section ref={resultRef} className="mt-12 animate-fade-up">
            <div className="text-center mb-8">
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--gold)" }}>
                Step 3 — Result
              </p>
              <h2
                className="font-display text-3xl font-bold"
                style={{ color: "var(--text)" }}
              >
                Your Stylized Image
              </h2>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="card p-3">
                <img
                  src={outputImage}
                  alt="Stylized output"
                  className="w-full rounded-xl"
                  style={{ display: "block" }}
                />
              </div>
              <div className="text-center mt-6">
                <a
                  href={outputImage}
                  download="stylized-image.png"
                  className="btn-gold"
                >
                  <span>↓</span>
                  <span>Download PNG</span>
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer style={{ background: "var(--canvas)", borderTop: "1px solid var(--border)" }}>
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <FooterList
              title="Stack"
              items={["React.js Frontend", "Python Flask Backend", "TensorFlow + TF-Hub", "Tailwind CSS"]}
            />
            <FooterList
              title="Model"
              items={["Google Magenta NST", "Arbitrary Image Stylization", "VGG-based architecture", "TF-Hub v2"]}
            />
            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--gold)" }}>
                About
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                A full-stack deep-learning project that applies the visual style of artworks onto
                photographs using Google's Magenta arbitrary-image-stylization model.
              </p>
            </div>
          </div>

          <GoldDivider />

          <p className="text-center text-xs mt-6" style={{ color: "var(--muted)" }}>
            © 2024 Digi Image Styler · Built with ❤ using modern web technologies
          </p>
        </div>
      </footer>
    </div>
  );
}
