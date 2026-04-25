import { useState, useEffect } from "react";

function App() {
  const users = [
    { username: "admin", password: "1234", role: "admin" },
    { username: "juan", password: "1234", role: "user" },
    { username: "carlos", password: "1234", role: "user" }
  ];

  const [logged, setLogged] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [role, setRole] = useState("");

  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [text, setText] = useState("");
  const [responsable, setResponsable] = useState("juan");
  const [priority, setPriority] = useState("Media");
  const [dueDate, setDueDate] = useState("");

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("pendifyTasks");
    if (saved) return JSON.parse(saved);

    return [
      {
        id: 1,
        text: "Revisar impresora cliente XYZ",
        user: "juan",
        priority: "Alta",
        dueDate: "2026-04-30",
        done: false
      },
      {
        id: 2,
        text: "Instalar Office empresa ABC",
        user: "carlos",
        priority: "Media",
        dueDate: "2026-05-02",
        done: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("pendifyTasks", JSON.stringify(tasks));
  }, [tasks]);

  const login = () => {
    const found = users.find(
      (u) =>
        u.username === loginUser &&
        u.password === loginPass
    );

    if (found) {
      setLogged(true);
      setCurrentUser(found.username);
      setRole(found.role);
    } else {
      alert("Datos incorrectos");
    }
  };

  const logout = () => {
    setLogged(false);
    setCurrentUser("");
    setRole("");
    setLoginUser("");
    setLoginPass("");
  };

  const addTask = () => {
    if (!text || !dueDate) {
      alert("Completa todos los campos");
      return;
    }

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text,
        user: responsable,
        priority,
        dueDate,
        done: false
      }
    ]);

    setText("");
    setResponsable("juan");
    setPriority("Media");
    setDueDate("");
  };

  const completeTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, done: !task.done }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const isExpired = (date, done) => {
    if (done) return false;
    const today = new Date().toISOString().split("T")[0];
    return date < today;
  };

  const visibleTasks =
    role === "admin"
      ? tasks
      : tasks.filter(
          (task) => task.user === currentUser
        );

  const total = tasks.length;
  const pending = tasks.filter((t) => !t.done).length;
  const completed = tasks.filter((t) => t.done).length;
  const urgent = tasks.filter(
    (t) => t.priority === "Alta" && !t.done
  ).length;

  if (!logged) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="bg-slate-900 w-full max-w-md p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <h1 className="text-4xl font-bold text-white text-center mb-2">
            Pendify 🚀
          </h1>

          <p className="text-slate-400 text-center mb-6">
            Sistema empresarial moderno
          </p>

          <input
            placeholder="Usuario"
            value={loginUser}
            onChange={(e) =>
              setLoginUser(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 mb-4"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={loginPass}
            onChange={(e) =>
              setLoginPass(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 mb-4"
          />

          <button
            onClick={login}
            className="w-full bg-emerald-500 hover:bg-emerald-600 transition p-3 rounded-xl text-white font-bold"
          >
            Ingresar
          </button>

          <p className="text-slate-500 text-center mt-4">
            admin / 1234
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold">
            Pendify 🚀
          </h1>
          <p className="text-slate-400">
            Usuario: {currentUser} ({role})
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card title="Total tareas" value={total} />
        <Card title="Pendientes" value={pending} />
        <Card title="Completadas" value={completed} />
        <Card
          title="Urgentes"
          value={urgent}
          red={true}
        />
      </div>

      {role === "admin" && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Nueva tarea
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Nombre tarea"
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
              className="p-3 rounded-xl bg-slate-800 border border-slate-700"
            />

            <select
              value={responsable}
              onChange={(e) =>
                setResponsable(e.target.value)
              }
              className="p-3 rounded-xl bg-slate-800 border border-slate-700"
            >
              <option value="juan">juan</option>
              <option value="carlos">carlos</option>
            </select>

            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
              className="p-3 rounded-xl bg-slate-800 border border-slate-700"
            >
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) =>
                setDueDate(e.target.value)
              }
              className="p-3 rounded-xl bg-slate-800 border border-slate-700"
            />
          </div>

          <button
            onClick={addTask}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 px-5 py-3 rounded-xl font-bold"
          >
            Guardar tarea
          </button>
        </div>
      )}

      <div className="space-y-4">
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-slate-900 p-5 rounded-2xl border ${
              isExpired(task.dueDate, task.done)
                ? "border-red-500"
                : "border-slate-800"
            }`}
          >
            <h3 className="text-xl font-bold mb-2">
              {task.done ? "✅" : "📌"} {task.text}
            </h3>

            <p className="text-slate-400">
              👤 {task.user}
            </p>

            <p className="text-slate-400">
              ⚡ {task.priority}
            </p>

            <p className="text-slate-400">
              📅 {task.dueDate}
            </p>

            {isExpired(task.dueDate, task.done) && (
              <p className="text-red-500 font-bold mt-2">
                🔴 VENCIDA
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  completeTask(task.id)
                }
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl"
              >
                ✔
              </button>

              {role === "admin" && (
                <button
                  onClick={() =>
                    deleteTask(task.id)
                  }
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
                >
                  🗑
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, value, red }) {
  return (
    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
      <p className="text-slate-400">{title}</p>
      <h2
        className={`text-3xl font-bold ${
          red ? "text-red-500" : "text-white"
        }`}
      >
        {value}
      </h2>
    </div>
  );
}

export default App;