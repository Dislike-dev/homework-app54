"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

type Task = {
  id: string;
  title: string;
  subject: string;
  due: string;
  done: boolean;
  uid: string;
};

type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  friends?: string[];
};

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewFriends, setViewFriends] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");

  // Login Google
  const login = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const u = result.user;
    setUser({
      uid: u.uid,
      displayName: u.displayName || "User",
      email: u.email || "",
      friends: [],
    });

    // Check if user doc exists, else create
    const userDocRef = doc(db, "users", u.uid);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      await updateDoc(userDocRef, { uid: u.uid, displayName: u.displayName, email: u.email, friends: [] }).catch(async () => {
        await addDoc(collection(db, "users"), { uid: u.uid, displayName: u.displayName, email: u.email, friends: [] });
      });
    }
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
    setTasks([]);
  };

  // Load tasks (own or friends)
  const loadTasks = async () => {
    if (!user) return;

    if (!viewFriends) {
      // งานตัวเอง
      const q = query(collection(db, "tasks"), where("uid", "==", user.uid));
      onSnapshot(q, (snapshot) => {
        setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task)));
      });
    } else {
      // งานเพื่อน
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const friends: string[] = userDoc.data()?.friends || [];
      if (friends.length === 0) {
        setTasks([]);
        return;
      }
      const q = query(collection(db, "tasks"), where("uid", "in", friends));
      onSnapshot(q, (snapshot) => {
        setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task)));
      });
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user, viewFriends]);

  const addTask = async () => {
    if (!title.trim() || !user) return;

    await addDoc(collection(db, "tasks"), {
      title,
      subject,
      due,
      done: false,
      uid: user.uid,
    });

    setTitle("");
    setSubject("");
    setDue("");
  };

  const toggleDone = async (task: Task) => {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, { done: !task.done });
  };

  const deleteTask = async (task: Task) => {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, { done: task.done }); // หรือ deleteDoc(taskRef)
  };

  const addFriend = async () => {
    if (!friendEmail || !user) return;
    // ค้นหา UID ของเพื่อนจาก email
    const q = query(collection(db, "users"), where("email", "==", friendEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const friendUid = snap.docs[0].data().uid;
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        friends: [...(user.friends || []), friendUid],
      });
      setFriendEmail("");
      setUser({ ...user, friends: [...(user.friends || []), friendUid] });
    }
  };

  // กำหนดวันพรุ่งนี้
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "doing") return !task.done;
    if (filter === "done") return task.done;
    if (filter === "tomorrow") {
      return task.due === tomorrowStr;
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {!user ? (
          <button onClick={login} className="bg-blue-600 px-6 py-3 rounded-xl font-semibold">
            Login with Google
          </button>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{user.displayName}'s Homework</h1>
              <button onClick={logout} className="bg-red-600 px-4 py-2 rounded-xl">
                Logout
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setViewFriends(false)}
                className={`px-4 py-2 rounded-xl ${!viewFriends ? "bg-blue-600" : "bg-zinc-900"}`}
              >
                งานของฉัน
              </button>
              <button
                onClick={() => setViewFriends(true)}
                className={`px-4 py-2 rounded-xl ${viewFriends ? "bg-blue-600" : "bg-zinc-900"}`}
              >
                งานเพื่อน
              </button>
              {viewFriends && (
                <input
                  type="text"
                  placeholder="เพิ่มเพื่อนด้วย email"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-black"
                />
              )}
              {viewFriends && (
                <button onClick={addFriend} className="bg-green-600 px-4 py-2 rounded-xl">
                  + เพิ่มเพื่อน
                </button>
              )}
            </div>

            {!viewFriends && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-6">
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
                  <button onClick={addTask} className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 font-semibold">
                    + เพิ่มงาน
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-6 flex-wrap">
              {["all", "doing", "done", "tomorrow"].map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-5 py-2 rounded-xl font-medium transition-all ${
                    filter === value ? "bg-blue-600 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-700"
                  }`}
                >
                  {value === "all" ? "ทั้งหมด" : value === "doing" ? "กำลังทำ" : value === "done" ? "เสร็จแล้ว" : "ส่งพรุ่งนี้"}
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
                    {viewFriends && <p className="text-zinc-400 text-xs">UID: {task.uid}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    <span>{task.due || "-"}</span>
                    {!viewFriends && (
                      <>
                        <button onClick={() => toggleDone(task)} className="text-green-400">
                          ✓
                        </button>
                        <button onClick={() => deleteTask(task)} className="text-red-400">
                          ลบ
                        </button>
                      </>
                    )}
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