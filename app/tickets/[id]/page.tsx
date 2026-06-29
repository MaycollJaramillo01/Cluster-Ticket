"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BellPlus,
  CheckCircle2,
  Download,
  Edit3,
  FileText,
  History,
  MessageSquare,
  Paperclip,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Ticket } from "@/types";
import { LABELS } from "@/lib/constants";
import toast from "react-hot-toast";

const actions: Record<string, string> = {
  TICKET_CREATED: "creó el ticket",
  STATUS_CHANGED: "cambió el estado",
  PRIORITY_CHANGED: "cambió la prioridad",
  ASSIGNEE_CHANGED: "cambió el responsable",
  FILES_ATTACHED: "adjuntó archivos",
  FILE_DELETED: "eliminó un archivo",
  COMMENT_ADDED: "agregó un comentario",
  TICKET_COMPLETED: "completó el ticket",
  TICKET_DELETED: "eliminó el ticket",
  REMINDER_CREATED: "configuró un recordatorio",
};
export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [tab, setTab] = useState("comments");
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    clientProject: "",
    internalNotes: "",
  });
  const load = useCallback(
    () =>
      fetch(`/api/tickets/${id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((t) => {
          setTicket(t);
          if (t)
            setDraft({
              title: t.title,
              description: t.description,
              clientProject: t.clientProject || "",
              internalNotes: t.internalNotes || "",
            });
        }),
    [id],
  );
  useEffect(() => {
    load();
  }, [load]);
  async function patch(data: object) {
    const r = await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, actorId: 1 }),
    });
    if (!r.ok) return toast.error("No se pudo actualizar.");
    toast.success("Ticket actualizado.");
    setEditing(false);
    load();
  }
  async function addComment() {
    const r = await fetch(`/api/tickets/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment, userId: 1 }),
    });
    if (!r.ok) return toast.error("Escribe un comentario.");
    setComment("");
    toast.success("Comentario agregado.");
    load();
  }
  async function addReminder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const r = await fetch(`/api/tickets/${id}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        remindAt: new Date(String(fd.get("remindAt"))).toISOString(),
        type: fd.get("type"),
        message: fd.get("message"),
        userId: 1,
      }),
    });
    if (!r.ok) return toast.error("No se pudo crear.");
    toast.success("Recordatorio creado.");
    (e.target as HTMLFormElement).reset();
    load();
  }
  async function removeFile(fid: number) {
    if (!confirm("¿Eliminar este archivo adjunto?")) return;
    await fetch(`/api/attachments/${fid}?userId=1`, { method: "DELETE" });
    load();
  }
  async function remove() {
    if (!confirm("¿Eliminar este ticket? Esta acción lo ocultará del sistema."))
      return;
    await fetch(`/api/tickets/${id}?actorId=1`, { method: "DELETE" });
    toast.success("Ticket eliminado.");
    router.push("/tickets");
  }
  if (!ticket)
    return (
      <div className="empty">
        <FileText />
        <div>Cargando ticket…</div>
      </div>
    );
  const overdue =
    new Date(ticket.dueAt) < new Date() &&
    !["COMPLETED", "CANCELLED"].includes(ticket.status);
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Link href="/tickets" className="btn btn-ghost">
          <ArrowLeft size={17} />
          Volver a tickets
        </Link>
      </div>
      <div className="detail-head">
        <div>
          <div className="ticket-id">
            TF-{String(ticket.id).padStart(4, "0")} · Creado{" "}
            {format(new Date(ticket.createdAt), "d 'de' MMMM, yyyy", {
              locale: es,
            })}
          </div>
          {editing ? (
            <input
              className="input"
              style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          ) : (
            <h2>{ticket.title}</h2>
          )}
          <div className="row-actions">
            <span className={`badge badge-${ticket.priority.toLowerCase()}`}>
              {LABELS[ticket.priority]}
            </span>
            <span className={`badge badge-${ticket.status.toLowerCase()}`}>
              {LABELS[ticket.status]}
            </span>
            {overdue && <span className="badge badge-urgent">Vencido</span>}
          </div>
        </div>
        <div className="row-actions">
          {editing ? (
            <>
              <button className="btn" onClick={() => setEditing(false)}>
                <X size={16} />
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={() => patch(draft)}>
                <Save size={16} />
                Guardar
              </button>
            </>
          ) : (
            <button className="btn" onClick={() => setEditing(true)}>
              <Edit3 size={16} />
              Editar
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => patch({ status: "COMPLETED" })}
          >
            <CheckCircle2 size={16} />
            Completar
          </button>
          <button
            className="btn btn-danger btn-icon"
            onClick={remove}
            aria-label="Eliminar ticket"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: 20 }}>
        <section className="panel">
          <div className="detail-body">
            <h3 className="section-title">Descripción</h3>
            {editing ? (
              <textarea
                className="input"
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            ) : (
              <div className="description">{ticket.description}</div>
            )}
            {ticket.internalNotes && (
              <>
                <h3 className="section-title" style={{ marginTop: 25 }}>
                  Notas internas
                </h3>
                {editing ? (
                  <textarea
                    className="input"
                    value={draft.internalNotes}
                    onChange={(e) =>
                      setDraft({ ...draft, internalNotes: e.target.value })
                    }
                  />
                ) : (
                  <div className="description">{ticket.internalNotes}</div>
                )}
              </>
            )}
          </div>
          <div className="tabs">
            <button
              className={tab === "comments" ? "active" : ""}
              onClick={() => setTab("comments")}
            >
              <MessageSquare size={15} /> Comentarios ({ticket.comments.length})
            </button>
            <button
              className={tab === "activity" ? "active" : ""}
              onClick={() => setTab("activity")}
            >
              <History size={15} /> Actividad
            </button>
          </div>
          <div className="detail-body">
            {tab === "comments" ? (
              <>
                <div className="field">
                  <label htmlFor="comment">Agregar comentario interno</label>
                  <textarea
                    id="comment"
                    className="input"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Escribe una actualización para el equipo…"
                    style={{ minHeight: 85 }}
                  />
                  <div>
                    <button
                      className="btn btn-primary"
                      onClick={addComment}
                      disabled={!comment.trim()}
                    >
                      <MessageSquare size={15} />
                      Comentar
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  {ticket.comments.map((c) => (
                    <div className="comment" key={c.id}>
                      <div className="avatar">
                        {c.user.name
                          .split(" ")
                          .map((x) => x[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="comment-body">
                        <div className="comment-head">
                          <b>{c.user.name}</b>
                          <time className="subtle">
                            {format(new Date(c.createdAt), "dd/MM/yyyy h:mm a")}
                          </time>
                        </div>
                        <p>{c.comment}</p>
                      </div>
                    </div>
                  ))}
                  {!ticket.comments.length && (
                    <div className="empty" style={{ padding: 30 }}>
                      Todavía no hay comentarios.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="timeline">
                {ticket.activityLog.map((a) => (
                  <div className="activity" key={a.id}>
                    <div className="activity-icon">
                      <History size={14} />
                    </div>
                    <div>
                      <p>
                        <b>{a.user?.name || "Sistema"}</b>{" "}
                        {actions[a.action] || a.action}
                        {a.oldValue && a.newValue && (
                          <>
                            {" "}
                            de <b>{LABELS[a.oldValue] || a.oldValue}</b> a{" "}
                            <b>{LABELS[a.newValue] || a.newValue}</b>
                          </>
                        )}
                      </p>
                      <time>
                        {format(
                          new Date(a.createdAt),
                          "dd/MM/yyyy 'a las' h:mm a",
                        )}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <aside style={{ display: "grid", gap: 18, alignContent: "start" }}>
          <div className="panel properties">
            <div className="property">
              <label>Estado</label>
              <select
                className={`input badge badge-${ticket.status.toLowerCase()}`}
                value={ticket.status}
                onChange={(e) => patch({ status: e.target.value })}
              >
                {[
                  "NEW",
                  "PENDING",
                  "IN_PROGRESS",
                  "IN_REVIEW",
                  "COMPLETED",
                  "CANCELLED",
                ].map((x) => (
                  <option key={x} value={x}>
                    {LABELS[x]}
                  </option>
                ))}
              </select>
            </div>
            <div className="property">
              <label>Prioridad</label>
              <select
                className="input"
                value={ticket.priority}
                onChange={(e) => patch({ priority: e.target.value })}
              >
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((x) => (
                  <option key={x} value={x}>
                    {LABELS[x]}
                  </option>
                ))}
              </select>
            </div>
            <div className="property">
              <label>Categoría</label>
              <strong>{LABELS[ticket.category]}</strong>
            </div>
            <div className="property">
              <label>Vencimiento</label>
              <strong className={overdue ? "overdue" : ""}>
                {format(new Date(ticket.dueAt), "dd MMM yyyy, h:mm a", {
                  locale: es,
                })}
              </strong>
            </div>
            <div className="property">
              <label>Responsable</label>
              <strong>{ticket.assignedTo?.name || "Maycoll Jaramillo"}</strong>
              <span className="subtle">
                {ticket.assignedTo?.email || "maycolljaramillo01@gmail.com"}
              </span>
            </div>
            <div className="property">
              <label>Cliente / proyecto</label>
              {editing ? (
                <input
                  className="input"
                  value={draft.clientProject}
                  onChange={(e) =>
                    setDraft({ ...draft, clientProject: e.target.value })
                  }
                />
              ) : (
                <strong>{ticket.clientProject || "Sin especificar"}</strong>
              )}
            </div>
          </div>
          <div className="panel side-note">
            <h3>
              <Paperclip size={16} /> Archivos adjuntos (
              {ticket.attachments.length})
            </h3>
            <div className="file-list">
              {ticket.attachments.map((a) => (
                <div className="file-item" key={a.id}>
                  <a
                    href={a.fileUrl}
                    download
                    className="ticket-link"
                    style={{ fontSize: 12 }}
                  >
                    <Download size={14} /> {a.fileName}
                  </a>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => removeFile(a.id)}
                    aria-label={`Eliminar ${a.fileName}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {!ticket.attachments.length && (
                <span className="subtle">Este ticket no tiene archivos.</span>
              )}
            </div>
          </div>
          <div className="panel side-note">
            <h3>
              <BellPlus size={16} /> Recordatorios
            </h3>
            <form onSubmit={addReminder} className="field">
              <label htmlFor="remindAt">Fecha y hora</label>
              <input
                id="remindAt"
                name="remindAt"
                type="datetime-local"
                className="input"
                required
              />
              <label htmlFor="type">Canal</label>
              <select id="type" name="type" className="input">
                <option value="DESKTOP">Notificación de escritorio</option>
                <option value="EMAIL">Email</option>
                <option value="BOTH">Ambos</option>
              </select>
              <input
                name="message"
                className="input"
                placeholder="Mensaje opcional"
              />
              <button className="btn">
                <Plus size={15} />
                Agregar recordatorio
              </button>
            </form>
            <div className="file-list">
              {ticket.reminders.map((r) => (
                <div className="file-item" key={r.id}>
                  <span>
                    <b>{format(new Date(r.remindAt), "dd/MM/yy h:mm a")}</b>
                    <br />
                    <span className="subtle">
                      {LABELS[r.type]}
                      {r.message ? ` · ${r.message}` : ""}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
