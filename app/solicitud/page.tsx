"use client";
import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function PublicTicketRequestPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState<number | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const ticket = {
      requesterName: data.get("requesterName"),
      requesterEmail: data.get("requesterEmail"),
      clientProject: data.get("clientProject") || null,
      title: data.get("title"),
      description: data.get("description"),
      category: data.get("category"),
    };
    const form = new FormData();
    form.set("ticket", JSON.stringify(ticket));
    files.forEach((f) => form.append("files", f));
    const r = await fetch("/api/public/tickets", { method: "POST", body: form });
    const json = await r.json();
    setSaving(false);
    if (!r.ok) {
      setError(json.error || "No se pudo enviar la solicitud.");
      return;
    }
    setTicketId(json.id);
  }

  if (ticketId) {
    return (
      <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 20 }}>
        <div className="panel" style={{ width: "100%", maxWidth: 480, padding: 30, display: "grid", gap: 14, textAlign: "center" }}>
          <div style={{ display: "grid", placeItems: "center", color: "#16a34a" }}>
            <CheckCircle2 size={40} />
          </div>
          <h2 style={{ margin: 0 }}>¡Solicitud enviada!</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Tu ticket #{ticketId} fue registrado. Nuestro equipo lo revisará y
            te contactará por email.
          </p>
          <button className="btn btn-primary" onClick={() => { setTicketId(null); setFiles([]); }}>
            Crear otra solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 20 }}>
      <form onSubmit={submit} className="panel form-panel" style={{ width: "100%", maxWidth: 640, padding: 30, display: "grid", gap: 17 }}>
        <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
          <div className="brand-mark" style={{ color: "#fff" }}><BrandMark size={20} /></div>
          <div><b style={{ fontSize: 16 }}>Cluster Flow</b><span className="subtle" style={{ display: "block" }}>Solicitar soporte</span></div>
        </div>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          Cuéntanos qué necesitas. No hace falta una cuenta para enviar tu solicitud.
        </p>
        {error && (
          <div className="file-item" role="alert" style={{ color: "#b91c1c" }}>
            <AlertCircle size={17} />
            {error}
          </div>
        )}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="requesterName">
              Tu nombre <span className="required">*</span>
            </label>
            <input id="requesterName" name="requesterName" className="input" required minLength={2} maxLength={120} />
          </div>
          <div className="field">
            <label htmlFor="requesterEmail">
              Tu email <span className="required">*</span>
            </label>
            <input id="requesterEmail" name="requesterEmail" className="input" type="email" required />
          </div>
          <div className="field field-full">
            <label htmlFor="clientProject">Empresa o proyecto</label>
            <input id="clientProject" name="clientProject" className="input" placeholder="Opcional" />
          </div>
          <div className="field field-full">
            <label htmlFor="title">
              Título <span className="required">*</span>
            </label>
            <input id="title" name="title" className="input" required minLength={3} maxLength={160} placeholder="Ej. Necesito actualizar el banner del sitio" />
          </div>
          <div className="field field-full">
            <label htmlFor="description">
              Describe tu solicitud <span className="required">*</span>
            </label>
            <textarea id="description" name="description" className="input" required minLength={5} placeholder="Cuéntanos con detalle qué necesitas…" />
          </div>
          <div className="field">
            <label htmlFor="category">
              Categoría <span className="required">*</span>
            </label>
            <select id="category" name="category" className="input" required defaultValue="">
              <option value="" disabled>Seleccionar</option>
              <option value="SUPPORT">Soporte</option>
              <option value="GOOGLE_ADS">Google Ads</option>
              <option value="WEBSITE">Sitio web</option>
            </select>
          </div>
          <div className="field field-full">
            <label>Archivos adjuntos</label>
            <div className="upload">
              <FileUp size={26} />
              <b>Arrastra o selecciona varios archivos</b>
              <div className="helper">Imágenes, PDF, Word, Excel, ZIP y otros. Máximo 15 MB por archivo.</div>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.txt,.ppt,.pptx"
                onChange={(e) => setFiles([...files, ...Array.from(e.target.files || [])])}
              />
            </div>
            <div className="file-list">
              {files.map((f, i) => (
                <div className="file-item" key={`${f.name}-${i}`}>
                  <span className="category">
                    <Paperclip size={15} />
                    {f.name} <small className="subtle">({(f.size / 1024 / 1024).toFixed(1)} MB)</small>
                  </span>
                  <button type="button" className="btn btn-ghost btn-icon" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Quitar ${f.name}`}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="form-actions">
          <Link href="/login" className="btn">¿Ya tienes cuenta? Inicia sesión</Link>
          <button className="btn btn-primary" disabled={saving}>
            <Send size={16} />
            {saving ? "Enviando…" : "Enviar solicitud"}
          </button>
        </div>
      </form>
    </div>
  );
}
