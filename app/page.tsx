"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem("hw_tasks");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  const saveTasks = (newTasks: any[]) => {
    setTasks(newTasks);
    localStorage.setItem("hw_tasks", JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (!title.trim()) return;

    const task = {
      id: Date.now(),
      title,
      subject,
      due,
      done: false,
    };

    saveTasks([task, ...tasks]);

    setTitle("");
    setSubject("");
    setDue("");
  };

  const toggleDone = (id: number) => {
    saveTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const deleteTask = (id: number) => {
    saveTasks(tasks.filter((task) => task.id !== id));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "done") return task.done;
    if (filter === "pending") return !task.done;
    return true;
  });

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "คณิตศาสตร์":
        return "bg-blue-500/20 text-blue-400";
      case "วิทยาศาสตร์":
        return "bg-green-500/20 text-green-400";
      case "ภาษาไทย":
        return "bg-pink-500/20 text-pink-400";
      case "ภาษาอังกฤษ":
        return "bg-purple-500/20 text-purple-400";
      case "สังคมศึกษา":
        return "bg-orange-500/20 text-orange-400";
      case "คอมพิวเตอร์":
        return "bg-cyan-500/20 text-cyan-400";
      default:
        return "bg-zinc-700 text-white";
    }
  };

  const getDateColor = (due: string) => {
    if (!due) return "bg-zinc-700 text-white";

    const diff = Math.ceil(
      (new Date(due).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diff <= 1) return "bg-red-500/20 text-red-400";
    if (diff <= 3) return "bg-orange-500/20 text-orange-400";
    if (diff <= 7) return "bg-green-500/20 text-green-400";

    return "bg-blue-500/20 text-blue-400";
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            🔥 TEST NEW UI
          </h1>

          <button
            onClick={addTask}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
          >
            + เพิ่มงาน
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        <h2 className="text-6xl font-bold mb-2">
          งานของฉัน
        </h2>

        <p className="text-zinc-400 mb-10">
          จัดการงานและติดตามการบ้านของคุณ
        </p>

        <div className="grid md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white text-black rounded-3xl p-6 shadow-lg">
            <p className="text-gray-500">ทั้งหมด</p>
            <h3 className="text-5xl font-bold">{tasks.length}</h3>
          </div>

          <div className="bg-white text-black rounded-3xl p-6 shadow-lg">
            <p className="text-gray-500">รอดำเนินการ</p>
            <h3 className="text-5xl font-bold">
              {tasks.filter((t) => !t.done).length}
            </h3>
          </div>

          <div className="bg-white text-black rounded-3xl p-6 shadow-lg">
            <p className="text-gray-500">เสร็จแล้ว</p>
            <h3 className="text-5xl font-bold">
              {tasks.filter((t) => t.done).length}
            </h3>
          </div>

          <div className="bg-white text-black rounded-3xl p-6 shadow-lg">
            <p className="text-gray-500">ใกล้ครบกำหนด</p>
            <h3 className="text-5xl font-bold">
              {tasks.filter((t) => !t.done).length}
            </h3>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">
            เพิ่มงานใหม่
          </h3>

          <div className="grid md:grid-cols-3 gap-4">

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ชื่องาน"
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-4"
            />

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">เลือกวิชา</option>
              <option>คณิตศาสตร์</option>
              <option>วิทยาศาสตร์</option>
              <option>ภาษาไทย</option>
              <option>ภาษาอังกฤษ</option>
              <option>สังคมศึกษา</option>
              <option>คอมพิวเตอร์</option>
              <option>ศิลปะ</option>
            </select>

            <div>
              <label className="block mb-2 text-sm text-zinc-400">
                วันที่กำหนดส่ง
              </label>

              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4"
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">

          <div className="flex justify-between items-center p-5 border-b border-zinc-800">
            <h3 className="text-xl font-bold">
              รายการงาน
            </h3>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2"
            >
              <option value="all">ทั้งหมด</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="done">เสร็จแล้ว</option>
            </select>
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center p-10 text-zinc-500">
              ยังไม่มีงาน
            </div>
          )}

          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center p-5 border-b border-zinc-800"
            >
              <div className="flex gap-4">

                <button
                  onClick={() => toggleDone(task.id)}
                  className={`w-7 h-7 rounded-full border ${
                    task.done
                      ? "bg-green-500 border-green-500"
                      : "border-zinc-500"
                  }`}
                />

                <div>
                  <h3 className="font-semibold text-lg">
                    {task.title}
                  </h3>

                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${getSubjectColor(
                      task.subject
                    )}`}
                  >
                    📚 {task.subject}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">

                <span
                  className={`px-4 py-2 rounded-full text-sm ${getDateColor(
                    task.due
                  )}`}
                >
                  📅{" "}
                  {task.due
                    ? new Date(task.due).toLocaleDateString("th-TH")
                    : "-"}
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}