"use client";
import { useEffect, useState } from "react";
import { Bell, Mail, Plus, Save, ShieldCheck, Users } from "lucide-react";
import type { User } from "@/types";
import { LABELS } from "@/lib/constants";
import toast from "react-hot-toast";
type Setting = {
  notificationEmail: string;
  desktopNotificationsEnabled: boolean;
  defaultReminderMinutes: number;
};
export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting>({
    notificationEmail: "maycolljaramillo01@gmail.com",
    desktopNotificationsEnabled: true,
    defaultReminderMinutes: 30,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const loadUsers = () =>
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        setSettings(s);
        localStorage.setItem(
          "desktop-notifications",
          String(s.desktopNotificationsEnabled),
        );
      });
    loadUsers();
  }, []);
  async function save() {
    setSaving(true);
    const r = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (!r.ok) return toast.error("Revisa la configuración.");
    localStorage.setItem(
      "desktop-notifications",
      String(settings.desktopNotificationsEnabled),
    );
    toast.success("Configuración guardada.");
  }
  async function addUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: f.get("name"),
        email: f.get("email"),
        role: f.get("role"),
      }),
    });
    const json = await r.json();
    if (!r.ok) return toast.error(json.error);
    toast.success("Usuario creado.");
    (e.target as HTMLFormElement).reset();
    loadUsers();
  }
  return (
    <>
      <div className="page-head">
        <div>
          <h2>Configuración</h2>
          <p>Notificaciones, recordatorios y usuarios del sistema.</p>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <Save size={16} />
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
      <div className="settings-grid">
        <section className="panel setting-card">
          <h3 className="section-title">
            <Mail size={18} />
            Notificaciones por email
          </h3>
          <div className="field">
            <label htmlFor="email">Email principal</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={settings.notificationEmail}
              readOnly
            />
            <span className="helper">
              Las tareas y sus correos se asignan siempre a esta dirección.
              Requiere las credenciales SMTP de Brevo en .env.
            </span>
          </div>
        </section>
        <section className="panel setting-card">
          <h3 className="section-title">
            <Bell size={18} />
            Notificaciones de escritorio
          </h3>
          <div className="switch-row">
            <div>
              <b>Activar alertas del navegador</b>
              <p className="subtle">Muestra vencimientos y tickets urgentes.</p>
            </div>
            <button
              className={`switch ${settings.desktopNotificationsEnabled ? "on" : ""}`}
              aria-label="Alternar notificaciones"
              aria-pressed={settings.desktopNotificationsEnabled}
              onClick={() =>
                setSettings({
                  ...settings,
                  desktopNotificationsEnabled:
                    !settings.desktopNotificationsEnabled,
                })
              }
            />
          </div>
          <div className="field" style={{ marginTop: 18 }}>
            <label htmlFor="defaultReminder">
              Recordatorio predeterminado (minutos)
            </label>
            <input
              id="defaultReminder"
              className="input"
              type="number"
              min="0"
              max="10080"
              value={settings.defaultReminderMinutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultReminderMinutes: Number(e.target.value),
                })
              }
            />
          </div>
        </section>
        <section className="panel setting-card" style={{ gridColumn: "1/-1" }}>
          <h3 className="section-title">
            <Users size={18} />
            Usuarios y permisos
          </h3>
          <div className="table-wrap">
            <table className="table" style={{ minWidth: 600 }}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="category">
                        <span className="avatar">
                          {u.name
                            .split(" ")
                            .map((x) => x[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                        <b>{u.name}</b>
                      </span>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge badge-medium">
                        {LABELS[u.role]}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-completed">Activo</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form
            onSubmit={addUser}
            className="form-grid"
            style={{
              marginTop: 20,
              paddingTop: 20,
              borderTop: "1px solid var(--line)",
            }}
          >
            <div className="field">
              <label htmlFor="name">Nombre</label>
              <input
                id="name"
                name="name"
                className="input"
                required
                minLength={2}
              />
            </div>
            <div className="field">
              <label htmlFor="userEmail">Email</label>
              <input
                id="userEmail"
                name="email"
                className="input"
                type="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="role">Rol</label>
              <select id="role" name="role" className="input">
                <option value="COLLABORATOR">Colaborador</option>
                <option value="CLIENT">Cliente</option>
                <option value="ADMIN">Administrador</option>
                <option value="READ_ONLY">Solo lectura</option>
              </select>
            </div>
            <div className="field" style={{ justifyContent: "end" }}>
              <button className="btn">
                <Plus size={16} />
                Agregar usuario
              </button>
            </div>
          </form>
          <div className="helper" style={{ marginTop: 14 }}>
            <ShieldCheck size={14} /> Administrador: control total. Colaborador:
            gestión de asignados. Solo lectura: acceso sin modificaciones.
          </div>
        </section>
      </div>
    </>
  );
}
