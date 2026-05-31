"use client";
import { useState, useEffect } from "react";

const SUBJECTS_COLORS = {
  คณิต: "bg-blue-100 text-blue-800",
  วิทย์: "bg-green-100 text-green-800",
  ไทย: "bg-orange-100 text-orange-800",
  อังกฤษ: "bg-pink-100 text-pink-800",
  สังคม: "bg-yellow-100 text-yellow-800",
  ศิลปะ: "bg-purple-100 text-purple-800",
};

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("mid");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem("hw_tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  const save = (t) => {
    setTasks(t);
    localStorage.setItem("hw_tasks", JSON.stringify(t));
  };

  const addTask = () => {
    if (!name.trim()) return;
    const newTask = { id: Date.now(), name, subject, due, priority, done: false };
    save([newTask, ...tasks]);
    setName(""); setSubject(""); setDue(""); setPriority("mid");
  };

  const toggleDone = (id) => save(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id) => save(tasks.filter((t) => t.id !== id));

  const today = new Date().toISOString().split("T")[0];
  const filtered = tasks.filter((t) => {
    if (filter === "pending") return !t.done;
    if (filter === "done") return t.done;
    if (filter === "today") return t.due === today;
    return true;
  });

  const getDueLabel = (due, done) => {
    if (!due) return null;
    if (!done && due < today) return <span className="text-red-500 text-xs">⚠️ เลยกำหนด</span>;
    if (!done && due === today) return <span className="text-yellow-600 text-xs">📅 ส่งวันนี้</span>;
    return <span className="text-gray-400 text-xs">กำหนดส่ง {due}</span>;
  };

  return (
    <main className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-medium mb-4">📚 การบ้านของฉัน</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm">
        <input className="w-full border border-gray-200 rounded-lg p-2 mb-2 text-sm" placeholder="ชื่องาน / การบ้าน..." value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-2 mb-2">
          <input className="flex-1 border border-gray-200 rounded-lg p-2 text-sm" placeholder="วิชา เช่น คณิต, วิทย์..." value={subject} onChange={(e) => setSubject(e.target.value)} />
          <input type="date" className="border border-gray-200 rounded-lg p-2 text-sm" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="flex-1 border border-gray-200 rounded-lg p-2 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="high">🔴 ด่วนมาก</option>
            <option value="mid">🟡 ปานกลาง</option>
            <option value="low">🟢 ไม่ด่วน</option>
          </select>
          <button onClick={addTask} className="bg-teal-600 text-white rounded-lg px-4 text-sm font-medium">+ เพิ่ม</button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["all","pending","done","today"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs border ${filter === f ? "bg-teal-600 text-white border-teal-600" : "border-gray-200 text-gray-500"}`}>
            {f === "all" ? "ทั้งหมด" : f === "pending" ? "ยังไม่เสร็จ" : f === "done" ? "เสร็จแล้ว" : "ส่งวันนี้"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">ไม่มีงานในหมวดนี้</p>}
        {filtered.map((t) => (
          <div key={t.id} className={`bg-white rounded-2xl border border-gray-200 p-3 flex items-center gap-3 shadow-sm ${t.done ? "opacity-50" : ""}`}>
            <button onClick={() => toggleDone(t.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${t.done ? "bg-teal-500 border-teal-500 text-white" : "border-gray-300"}`}>
              {t.done && "✓"}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${t.done ? "line-through text-gray-400" : "text-gray-800"}`}>{t.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {t.subject && <span className={`text-xs px-2 py-0.5 rounded-full ${SUBJECTS_COLORS[t.subject] || "bg-gray-100 text-gray-600"}`}>{t.subject}</span>}
                {getDueLabel(t.due, t.done)}
              </div>
            </div>
            <button onClick={() => deleteTask(t.id)} className="text-gray-300 hover:text-red-400 text-lg">🗑</button>
          </div>
        ))}
      </div>
    </main>
  );
}