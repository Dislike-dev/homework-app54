"use client";
export const dynamic = "force-dynamic";
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
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";

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

  useEffect(() => {
    getRedirectResult(auth).then(async (result) => {
      if (!result) return;
      const u = result.user;
      const userDocRef = doc(db, "users", u.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await addDoc(collection(db, "users"), {
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          friends: [],
        });
      }
      setUser({
        uid: u.uid,
        displayName: u.displayName || "User",
        email: u.email || "",
        friends: docSnap.exists() ? docSnap.data().friends : [],
      });
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!viewFriends) {
      const q = query(collection(db, "tasks"), where("uid", "==", user.uid));
      const unsub = onSnapshot(q, (snapshot) => {
        setTasks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Task)));
      });
      return unsub;
    } else {
      const loadFriendTasks = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const friends: string[] = userDoc.data()?.friends || [];
        if (friends.length === 0) { setTasks([]); return; }
        const q = query(collection(db, "tasks"), where("uid", "in", friends));
        onSnapshot(q, (snapshot) => {
          setTasks(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Task)));
        });
      };
      loadFriendTasks();
    }
  }, [user, viewFriends]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
    setTasks([]);
  };

  const addTask = async () => {
    if (!title.trim() || !user) return;
    await addDoc(collection(db, "tasks"), { title, subject, due, done: false, uid: user.uid });
    setTitle(""); setSubject(""); setDue("");
  };

  const toggleDone = async (task: Task) => {
    await updateDoc(doc(db, "tasks", task.id), { done: !task.done });
  };

  const addFriend = async () => {
    if (!friendEmail || !user) return;
    const q = query(collection(db, "users"), where("email", "==", friendEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const friendUid = snap.docs[0].data().uid;
      await updateDoc(doc(db, "users", user.uid), {
        friends: [...(user.friends || []), friendUid],
      });
      setFriendEmail("");
      setUser({ ...user, friends: [...(user.friends || []), friendUid] });
    }
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
      <div className="max-w-2xl mx-auto">
        {!user ? (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-3xl font-bold">การบ้านของฉัน</h1>
            <button onClick={login} className="bg-blue-600 px-6 py-3 rounded-xl font-semibold">
              Login with Google
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{user.displayName}'s Homework</h1>
              <button onClick={logout} className="bg-red-600 px-4 py-2 rounded-xl text-sm">Logout</button>
            </div>

            <div className="flex gap-3 mb-4 flex-wrap">
              <button onClick={() => setViewFriends(false)} className={`px-4 py-2 rounded-xl text-sm ${!viewFriends ? "bg-blue-600" : "bg-zinc-800"}`}>งานของฉัน</button>
              <button onClick={() => setViewFriends(true)} className={`px-4 py-2 rounded-xl text-sm ${viewFriends ? "bg-blue-600" : "bg-zinc-800"}`}>งานเพื่อน</button>
              {viewFriends && (
                <>
                  <input type="text" placeholder="email เพื่อน..." value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white flex-1" />
                  <button onClick={addFriend} className="bg-green-600 px-4 py-2 rounded-xl text-sm">+ เพิ่มเพื่อน</button>
                </>
              )}
            </div>

            {!viewFriends && (
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
            )}

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
                  {!viewFriends && (
                    <button onClick={() => toggleDone(task)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${task.done ? "bg-green-500 border-green-500" : "border-zinc-600"}`}>
                      {task.done && "✓"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}