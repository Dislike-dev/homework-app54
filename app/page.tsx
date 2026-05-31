"use client";

import { useState, useEffect } from "react";

type Task = {
  id: number;
  title: string;
  subject: string;
  due: string;
  done: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem("hw_tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("hw_tasks", JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title,
      subject,
      due,
      done: false,
    };

    saveTasks([newTask, ...tasks]);
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

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const filteredTasks = tasks.filter((task) => {
    if (filter === "doing") return !task.done;
    if (filter === "done") return task.done;
    if (filter === "tomorrow") return task.due === tomorrowStr;
    return true;
  });

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">การบ้าน 5/4</h1>
        <p className="text-zinc-400 mb-8">
          จัดการงานและติดตามการบ้านของคุณ
        </p>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white text-black rounded-3xl p-6">
            <p>ทั้งหมด</p>
            <h2 className="text-4xl font-bold">{tasks.length}</h2>
          </div>

          <div className="bg-white text-black rounded-3xl p-6">
            <p>กำลังทำ</p>
            <h2 className="text-4xl font-bold">
              {tasks.filter((t) => !t.done).length}
            </h2>
          </div>

          <div className="bg-white text-black rounded-3xl p-6">
            <p>เสร็จแล้ว</p>
            <h2 className="text-4xl font-bold">
              {tasks.filter((t) => t.done).length}
            </h2>
          </div>

          <div className="bg-white text-black rounded-3xl p-6">
            <p>ส่งพรุ่งนี้</p>
            <h2 className="text-4xl font-bold">
              {tasks.filter((t) => t.due === tomorrowStr).length}
            </h2>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">เพิ่มงานใหม่</h3>

          <div className="grid md:grid-cols-4 gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ชื่องาน"
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-4"
            />

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-4"
            >
              <option value="">เลือกวิชา</option>
              <option>คณิตศาสตร์</option>
              <option>วิทยาศาสตร์</option>
              <option>ภาษาไทย</option>
              <option>ภาษาอังกฤษ</option>
              <option>สังคมศึกษา</option>
              <option>คอมพิวเตอร์</option>
            </select>

            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-4"
            />

            <button
              onClick={addTask}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 font-semibold"
            >
              + เพิ่มงาน
            </button>
          </div>
        </div>

       <div className="flex gap-3 mb-6 flex-wrap">
  {[
    ["all", "ทั้งหมด"],
    ["doing", "กำลังทำ"],
    ["done", "เสร็จแล้ว"],
    ["tomorrow", "ส่งพรุ่งนี้"],
  ].map(([value, label]) => (
    <button
      key={value}
      onClick={() => setFilter(value)}
      className={`px-5 py-2 rounded-xl font-medium transition-all ${
        filter === value
          ? "bg-blue-600 text-white"
          : "bg-zinc-900 text-zinc-400 border border-zinc-700"
      }`}
    >
      {label}
    </button>
  ))}
</div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center p-5 border-b border-zinc-800"
            >
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-zinc-400 text-sm">{task.subject}</p>
              </div>

              <div className="flex items-center gap-3">
                <span>{task.due || "-"}</span>

                <button
                  onClick={() => toggleDone(task.id)}
                  className="text-green-400"
                >
                  ✓
                </button>

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