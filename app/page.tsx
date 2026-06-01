"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";

type Task = { id: string; title: string; subject: string; due: string; done: boolean; };

export default function Home() {
  const { user, isLoaded } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`tasks_${user.id}`);
    if (saved) setTasks(JSON.parse(saved));
  }, [user]);

  const save = (t: Task[]) => {
    setTasks(t);
    if (user) localStorage.setItem(`tasks_${user.id}`, JSON.stringify(t));
  };

  const addTask = () => {
    if (!title.trim()) return;
    save([{ id: Date.now().toString(), title, subject, due, done: false }, ...tasks]);
    setTitle(""); setSubject(""); setDue("");
  };

  const toggleDone = (id: string) => save(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id: string) => save(tasks.filter((t) => t.id !== id));

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const filteredTasks = tasks.filter((task) => {
    if (filter === "doing") return !task.done;
    if (filter === "done") return task.done;
    if (filter === "tomorrow") return task.due === tomorrowStr;
    return true;
  });

  if (!isLoaded) return <div className="min-h-screen bg-black flex items-center justify-center text-white">กำลังโหลด...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {!user ? (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-3xl font-bold">การบ้านของฉัน</h1>
            <SignInButton mode="modal">
              <button className="bg-blue-600 px-6 py-3 rounded-xl font-semibold">Login with Google</button>
            </SignInButton>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">สวัสดี {user.firstName}!</h1>
              <SignOutButton>
                <button className="bg-red-600 px-4 py-2 rounded-xl text-sm">Logout</button>
              </SignOutButton>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ชื่องาน..." className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm col-span-2" />
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm">
                  <option value="">เลือกวิชา</option>
                  <option>คณิตศาสตร์</option>
                  <option>วิทยาศาสตร์</option>
                  <option>ภาษาไทย</option>
                  <option>ภาษาอังกฤษ</option>
                  <option>สังคมศึกษา</option>
                  <option>คอมพิวเตอร์</option>
                </select>
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm" />
              </div>
              <button onClick={addTask} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl p-3 text-sm font-semibold">+ เพิ่มงาน</button>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {[["all","ทั้งหมด"],["doing","กำลังทำ"],["done","เสร็จแล้ว"],["tomorrow","ส่งพรุ่งนี้"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilter(v)} className={`px-4 py-2 rounded-xl text-sm ${filter === v ? "bg-blue-600" : "bg-zinc-800"}`}>{l}</button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {filteredTasks.length === 0 && <p className="text-center text-zinc-500 py-8">ไม่มีงานในหมวดนี้</p>}
              {filteredTasks.map((task) => (
                <div key={task.id} className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between ${task.done ? "opacity-50" : ""}`}>
                  <div>
                    <p className={`font-medium ${task.done ? "line-through" : ""}`}>{task.title}</p>
                    <p className="text-zinc-400 text-sm">{task.subject} {task.due && `· ${task.due}`}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleDone(task.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${task.done ? "bg-green-500 border-green-500" : "border-zinc-600"}`}>
                      {task.done && "✓"}
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="text-zinc-500 hover:text-red-400 text-sm px-2">ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}