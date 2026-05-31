"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem("hw_tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  const saveTasks = (newTasks: any[]) => {
    setTasks(newTasks);
    localStorage.setItem("hw_tasks", JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (!name.trim()) return;

    const newTask = {
      id: Date.now(),
      name,
      subject,
      due,
      done: false,
    };

    saveTasks([newTask, ...tasks]);

    setName("");
    setSubject("");
    setDue("");
  };

  const toggleDone = (id: number) => {
    saveTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, done: !task.done }
          : task
      )
    );
  };

  const deleteTask = (id: number) => {
    saveTasks(tasks.filter((task) => task.id !== id));
  };

  const today = new Date().toISOString().split("T")[0];

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.done;
    if (filter === "done") return task.done;
    if (filter === "today") return task.due === today;
    return true;
  });

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-10">
          <h1 className="text-5xl font-bold">
            งานของฉัน
          </h1>
          <p className="text-gray-400 mt-2">
            จัดการการบ้านและงานที่ต้องส่ง
          </p>
        </div>

        <div className="bg-white text-black rounded-3xl p-6 mb-8 shadow-xl">
          <h2 className="text-xl font-bold mb-4">
            เพิ่มงานใหม่
          </h2>

          <input
            type="text"
            placeholder="ชื่องาน"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-xl p-3 mb-3"
          />

          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="วิชา"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border rounded-xl p-3"
            />

            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="border rounded-xl p-3"
            />
          </div>

          <button
            onClick={addTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
          >
            เพิ่มงาน
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white text-black rounded-3xl p-6">
            <p className="text-gray-500">ทั้งหมด</p>
            <h3 className="text-4xl font-bold">
              {tasks.length}
            </h3>
          </div>

          <div className="bg-white text-black rounded-3xl p-6">
            <p className="text-gray-500">ยังไม่เสร็จ</p>
            <h3 className="text-4xl font-bold">
              {tasks.filter((t) => !t.done).length}
            </h3>
          </div>

          <div className="bg-white text-black rounded-3xl p-6">
            <p className="text-gray-500">เสร็จแล้ว</p>
            <h3 className="text-4xl font-bold">
              {tasks.filter((t) => t.done).length}
            </h3>
          </div>

          <div className="bg-white text-black rounded-3xl p-6">
            <p className="text-gray-500">ส่งวันนี้</p>
            <h3 className="text-4xl font-bold">
              {tasks.filter((t) => t.due === today).length}
            </h3>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap mb-6">
          <button
            onClick={() => setFilter("all")}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            ทั้งหมด
          </button>

          <button
            onClick={() => setFilter("pending")}
            className="bg-white text-black px-4 py-2 rounded-xl"
          >
            ยังไม่เสร็จ
          </button>

          <button
            onClick={() => setFilter("done")}
            className="bg-white text-black px-4 py-2 rounded-xl"
          >
            เสร็จแล้ว
          </button>

          <button
            onClick={() => setFilter("today")}
            className="bg-white text-black px-4 py-2 rounded-xl"
          >
            ส่งวันนี้
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-black mb-4">
            รายการงาน
          </h2>

          {filteredTasks.length === 0 ? (
            <p className="text-gray-400">
              ยังไม่มีงาน
            </p>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-black font-semibold">
                      {task.name}
                    </h3>

                    <p className="text-gray-500 text-sm">
                      {task.subject}
                    </p>

                    <p className="text-gray-400 text-xs">
                      {task.due}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleDone(task.id)}
                      className="bg-blue-600 text-white px-3 py-2 rounded-lg"
                    >
                      ✓
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}