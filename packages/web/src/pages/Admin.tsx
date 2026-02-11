import React, { useState, useEffect } from "react";
import { api } from "@/api/client";
import {
  Database,
  Table2,
  Plus,
  Trash2,
  Save,
  X,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Fields that are stored as JSON text in D1
const JSON_FIELDS = new Set([
  "known_for_tags",
  "eras",
  "signature_pieces",
]);

function isJsonField(col: string): boolean {
  return JSON_FIELDS.has(col);
}

function parseValue(col: string, val: any): any {
  if (isJsonField(col) && typeof val === "string") {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

interface CellEditorProps {
  column: string;
  value: any;
  onChange: (value: any) => void;
}

function CellEditor({ column, value, onChange }: CellEditorProps) {
  const isJson = isJsonField(column);
  const display = isJson ? JSON.stringify(value, null, 2) : (value ?? "");

  if (isJson) {
    return (
      <textarea
        value={display}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            onChange(e.target.value);
          }
        }}
        rows={6}
        className="w-full px-2 py-1.5 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 resize-y"
      />
    );
  }

  return (
    <input
      type="text"
      value={display}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
    />
  );
}

interface RowData {
  id: number;
  [key: string]: any;
}

export default function Admin() {
  const [tables, setTables] = useState<string[]>([]);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.admin.tables().then(setTables).catch((e) => setError(e.message));
  }, []);

  const loadTable = async (name: string) => {
    setActiveTable(name);
    setEditingId(null);
    setAdding(false);
    setError(null);
    setLoading(true);
    try {
      const { results } = await api.admin.query(
        `SELECT * FROM ${name} ORDER BY id DESC`
      );
      setRows(results || []);
      if (results?.length > 0) {
        setColumns(Object.keys(results[0]));
      } else {
        // Get columns from pragma
        const info = await api.admin.query(
          `SELECT name FROM pragma_table_info('${name}')`
        );
        setColumns((info.results || []).map((r: Record<string, any>) => r.name));
      }
    } catch (e: unknown) {
      const err = e as { data?: { error?: string }; message?: string };
      setError(err.data?.error || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (row: RowData) => {
    setEditingId(row.id);
    const parsed: Record<string, any> = {};
    for (const col of columns) {
      parsed[col] = parseValue(col, row[col]);
    }
    setEditData(parsed);
    setAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    setSaving(true);
    setError(null);
    try {
      const editableCols = columns.filter(
        (c) => c !== "id" && c !== "created_at"
      );
      const sets = editableCols.map((c) => `${c} = ?`).join(", ");
      const params = editableCols.map((c) =>
        isJsonField(c) ? JSON.stringify(editData[c]) : (editData[c] ?? "")
      );
      params.push(editingId as unknown as string);
      await api.admin.query(
        `UPDATE ${activeTable} SET ${sets} WHERE id = ?`,
        params
      );
      setEditingId(null);
      await loadTable(activeTable!);
    } catch (e: unknown) {
      const err = e as { data?: { error?: string }; message?: string };
      setError(err.data?.error || err.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const startAdd = () => {
    setAdding(true);
    setEditingId(null);
    const empty: Record<string, any> = {};
    for (const c of columns) {
      if (c === "id" || c === "created_at" || c === "updated_at") continue;
      empty[c] = isJsonField(c) ? [] : "";
    }
    setNewRow(empty);
  };

  const saveNew = async () => {
    setSaving(true);
    setError(null);
    try {
      const insertCols = Object.keys(newRow);
      const placeholders = insertCols.map(() => "?").join(", ");
      const params = insertCols.map((c) =>
        isJsonField(c) ? JSON.stringify(newRow[c]) : (newRow[c] ?? "")
      );
      await api.admin.query(
        `INSERT INTO ${activeTable} (${insertCols.join(", ")}) VALUES (${placeholders})`,
        params
      );
      setAdding(false);
      await loadTable(activeTable!);
    } catch (e: unknown) {
      const err = e as { data?: { error?: string }; message?: string };
      setError(err.data?.error || err.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (id: number) => {
    if (!confirm(`Delete row ${id}?`)) return;
    setError(null);
    try {
      await api.admin.query(`DELETE FROM ${activeTable} WHERE id = ?`, [id]);
      await loadTable(activeTable!);
    } catch (e: unknown) {
      const err = e as { data?: { error?: string }; message?: string };
      setError(err.data?.error || err.message || "Unknown error");
    }
  };

  // ── Table list view ───────────────────────────────────────

  if (!activeTable) {
    return (
      <div className="min-h-[calc(100vh-56px)] px-5 md:px-8 pt-8 pb-20 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Database className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
          <h1 className="font-serif text-3xl text-black">Database Admin</h1>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          {tables.map((t) => (
            <button
              key={t}
              onClick={() => loadTable(t)}
              className="w-full flex items-center gap-3 px-5 py-4 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all text-left"
            >
              <Table2
                className="w-4 h-4 text-gray-400"
                strokeWidth={1.5}
              />
              <span className="text-sm font-medium text-black">{t}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Table detail view ─────────────────────────────────────

  const editableCols = columns.filter(
    (c) => c !== "id" && c !== "created_at"
  );

  return (
    <div className="min-h-[calc(100vh-56px)] px-5 md:px-8 pt-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTable(null)}
            className="p-2 rounded-full hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft
              className="w-4 h-4 text-gray-400"
              strokeWidth={1.5}
            />
          </button>
          <h1 className="font-serif text-2xl text-black">{activeTable}</h1>
          <span className="text-xs text-gray-400">
            {rows.length} row{rows.length !== 1 && "s"}
          </span>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs tracking-wider font-medium rounded-full"
        >
          <Plus className="w-3.5 h-3.5" /> Add row
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-xl max-w-5xl mx-auto">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Add new row form */}
      {adding && (
        <div className="max-w-5xl mx-auto mb-6 p-5 border border-blue-200 bg-blue-50/30 rounded-xl space-y-3">
          <p className="text-xs tracking-wider uppercase text-gray-500 font-medium">
            New row
          </p>
          {editableCols
            .filter((c) => c !== "updated_at")
            .map((col) => (
              <div key={col}>
                <label className="text-xs text-gray-500 mb-1 block">
                  {col}
                </label>
                <CellEditor
                  column={col}
                  value={newRow[col]}
                  onChange={(v) => setNewRow({ ...newRow, [col]: v })}
                />
              </div>
            ))}
          <div className="flex gap-2 pt-2">
            <button
              onClick={saveNew}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs rounded-full disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save
            </button>
            <button
              onClick={() => setAdding(false)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs text-gray-500 hover:text-black transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">Table is empty.</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2.5 text-[11px] tracking-wider uppercase text-gray-400 font-medium whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-[11px] tracking-wider uppercase text-gray-400 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  {editingId === row.id
                    ? columns.map((col) => (
                        <td key={col} className="px-3 py-2 align-top">
                          {col === "id" || col === "created_at" ? (
                            <span className="text-xs text-gray-400">
                              {row[col]}
                            </span>
                          ) : (
                            <CellEditor
                              column={col}
                              value={editData[col]}
                              onChange={(v) =>
                                setEditData({ ...editData, [col]: v })
                              }
                            />
                          )}
                        </td>
                      ))
                    : columns.map((col) => (
                        <td
                          key={col}
                          className="px-3 py-2.5 text-sm text-gray-700 max-w-[200px] truncate align-top"
                          title={
                            isJsonField(col)
                              ? JSON.stringify(
                                  parseValue(col, row[col]),
                                  null,
                                  2
                                )
                              : String(row[col] ?? "")
                          }
                        >
                          {isJsonField(col)
                            ? (() => {
                                const parsed = parseValue(col, row[col]);
                                return Array.isArray(parsed)
                                  ? `[${parsed.length} items]`
                                  : String(row[col] ?? "");
                              })()
                            : String(row[col] ?? "")}
                        </td>
                      ))}
                  <td className="px-3 py-2 whitespace-nowrap align-top">
                    {editingId === row.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="p-1.5 rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
                        >
                          {saving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <X
                            className="w-3.5 h-3.5 text-gray-400"
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(row)}
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Save
                            className="w-3.5 h-3.5 text-gray-400"
                            strokeWidth={1.5}
                          />
                        </button>
                        <button
                          onClick={() => deleteRow(row.id)}
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2
                            className="w-3.5 h-3.5 text-red-400"
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
