"use client";
console.log(auth);
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged,
} from "firebase/auth";

import {
collection,
addDoc,
getDocs,
updateDoc,
deleteDoc,
doc,
} from "firebase/firestore";

type Task = {
id: string;
title: string;
subject: string;
due: string;
done: boolean;
};

export default function Home() {
const [user, setUser] = useState<any>(null);
const [tasks, setTasks] = useState<Task[]>([]);
const [title, setTitle] = useState("");
const [subject, setSubject] = useState("");
const [due, setDue] = useState("");
const [filter, setFilter] = useState("all");

useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, (u) => {
setUser(u);


  if (u) {
    loadTasks(u.uid);
  } else {
    setTasks([]);
  }
});

return () => unsubscribe();


}, []);

const loadTasks = async (uid: string) => {
const snap = await getDocs(
collection(db, "users", uid, "tasks")
);


const data = snap.docs.map((docItem) => ({
  id: docItem.id,
  ...docItem.data(),
})) as Task[];

setTasks(data);


};

const login = async () => {
const provider = new GoogleAuthProvider();
await signInWithPopup(auth, provider);
};

const logout = async () => {
await signOut(auth);
};

const addTask = async () => {
if (!title.trim() || !user) return;


await addDoc(
  collection(db, "users", user.uid, "tasks"),
  {
    title,
    subject,
    due,
    done: false,
  }
);

setTitle("");
setSubject("");
setDue("");

loadTasks(user.uid);


};

const toggleDone = async (task: Task) => {
if (!user) return;


await updateDoc(
  doc(db, "users", user.uid, "tasks", task.id),
  {
    done: !task.done,
  }
);

loadTasks(user.uid);

};

const removeTask = async (taskId: string) => {
if (!user) return;

await deleteDoc(
  doc(db, "users", user.uid, "tasks", taskId)
);

loadTasks(user.uid);

};

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const tomorrowStr = tomorrow
.toISOString()
.split("T")[0];

const filteredTasks = tasks.filter((task) => {
if (filter === "doing") return !task.done;
if (filter === "done") return task.done;
if (filter === "tomorrow")
return task.due === tomorrowStr;

return true;

});

return ( <main className="min-h-screen bg-black text-white p-6"> <div className="max-w-3xl mx-auto">

    {!user ? (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-4xl font-bold">
          Homework App
        </h1>

        <button
          onClick={login}
          className="bg-blue-600 px-6 py-3 rounded-xl"
        >
          Login with Google
        </button>
      </div>
    ) : (
      <>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            สวัสดี {user.displayName}
          </h1>

          <button
            onClick={logout}
            className="bg-red-600 px-4 py-2 rounded-xl"
          >
            Logout
          </button>
        </div>

        <div className="bg-zinc-900 p-4 rounded-2xl mb-6">
          <div className="grid md:grid-cols-3 gap-3 mb-3">

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="ชื่องาน"
              className="bg-zinc-800 p-3 rounded-xl"
            />

            <select
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
              className="bg-zinc-800 p-3 rounded-xl"
            >
              <option value="">
                เลือกวิชา
              </option>
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
              onChange={(e) =>
                setDue(e.target.value)
              }
              className="bg-zinc-800 p-3 rounded-xl"
            />
          </div>

          <button
            onClick={addTask}
            className="w-full bg-blue-600 p-3 rounded-xl"
          >
            + เพิ่มงาน
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            ["all", "ทั้งหมด"],
            ["doing", "กำลังทำ"],
            ["done", "เสร็จแล้ว"],
            ["tomorrow", "ส่งพรุ่งนี้"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-xl ${
                filter === value
                  ? "bg-blue-600"
                  : "bg-zinc-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">

          {filteredTasks.length === 0 && (
            <div className="text-center text-zinc-500 py-10">
              ไม่มีงาน
            </div>
          )}

          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-zinc-900 p-4 rounded-2xl flex justify-between items-center"
            >
              <div>
                <p
                  className={
                    task.done
                      ? "line-through text-zinc-500"
                      : ""
                  }
                >
                  {task.title}
                </p>

                <p className="text-sm text-zinc-400">
                  {task.subject}
                  {task.due &&
                    ` • ${task.due}`}
                </p>
              </div>

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    toggleDone(task)
                  }
                  className="bg-green-600 px-3 py-2 rounded-lg"
                >
                  ✓
                </button>

                <button
                  onClick={() =>
                    removeTask(task.id)
                  }
                  className="bg-red-600 px-3 py-2 rounded-lg"
                >
                  ลบ
                </button>

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