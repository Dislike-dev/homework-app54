"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Task = { id: string; title: string; subject: string; due: string; done: boolean; user_id: string; };
type User = { id: string; email: string; user_metadata: { full_name: string; avatar_url: string; }; };

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"mine" | "friends">("mine");
  const [friendEmail, setFriendEmail] = useState("");
  const [friendTasks, setFriendTasks] = useState<Task[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user as unknown as User ?? null);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as unknown as User ?? null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    const { data } = await supabase.from("tasks").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
    setTasks(data || []);
  };

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTasks([]);
  };

  const addTask = async () => {
    if (!title.trim() || !user) return;
    const { data } = await supabase.from("tasks").insert({ title, subject, due: due || null, done: false, user_id: user.id }).select();
    if (data) setTasks([data[0], ...tasks]);
    setTitle(""); setSubject(""); setDue("");
  };

  const toggleDone = async (task: Task) => {
    await supabase.from("tasks").update({ done: !task.done }).eq("id", task.id);
    setTasks(tasks.map((t) => t.id === task.id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = async (task: Task) => {
    await supabase.from("tasks").delete().eq("id", task.id);
    setTasks(tasks.filter((t) => t.id !== task.id));
  };

  const loadFriendTasks = async () => {
    if (!friendEmail.trim()) return;
    const { data: users } = await supabase.from("tasks").select("*").eq("user_id", friendEmail);
    setFriendTasks(users || []);
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

  if (!user) return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">การบ้านของฉัน</h1>
      <button onClick={login} className="bg-blue-600 px-6 py-3 rounded-xl font-semibold">Login with Google</button>
    </main>
  );

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">สวัสดี {user.user_metadata.full_name}!</h1>
          <button onClick={logout} className="bg-red-600 px-4 py-2 rounded-xl text-sm">Logout</button>
        </div>

        <div className="flex gap-3 mb-4">
          <button onClick={() => setViewMode("mine")} className={`px-4 py-2 rounded-xl text-sm ${viewMode === "mine" ? "bg-blue-600" : "bg-zinc-800"}`}>งานของฉัน</button>
          <button onClick={() => setViewMode("friends")} className={`px-4 py-2 rounded-xl text-sm ${viewMode === "friends" ? "bg-blue-600" : "bg-zinc-800"}`}>งานเพื่อน</button>
        </div>

        {viewMode === "friends" ? (
          <div>
            <div className="flex gap-2 mb-4">
              <input type="email" placeholder="ใส่ email เพื่อน..." value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-white" />
              <button onClick={loadFriendTasks} className="bg-blue-600 px-4 py-2 rounded-xl text-sm">ค้นหา</button>
            </div>
            <div className="flex flex-col gap-2">
              {friendTasks.length === 0 && <p className="text-center text-zinc-500 py-8">ยังไม่มีข้อมูล</p>}
              {friendTasks.map((task) => (
                <div key={task.id} className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 ${task.done ? "opacity-50" : ""}`}>
                  <p className={`font-medium ${task.done ? "line-through" : ""}`}>{task.title}</p>
                  <p className="text-zinc-400 text-sm">{task.subject} {task.due && `· ${task.due}`}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
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
                    <button onClick={() => toggleDone(task)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${task.done ? "bg-green-500 border-green-500" : "border-zinc-600"}`}>
                      {task.done && "✓"}
                    </button>
                    <button onClick={() => deleteTask(task)} className="text-zinc-500 hover:text-red-400 text-sm px-2">ลบ</button>
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