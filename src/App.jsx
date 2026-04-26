import { useState, useEffect } from "react";
import supabase from "./supabase";

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const [clients, setClients] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [mapeos, setMapeos] = useState([]);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setSession(session);

    if (session) {
      await loadProfile(session.user.id);
      await loadAll();
    }

    supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);

        if (session) {
          await loadProfile(session.user.id);
          await loadAll();
        } else {
          setProfile(null);
        }
      }
    );
  }

  async function loadProfile(id) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    setProfile(data);
  }

  async function loadAll() {
    loadClients();
    loadTickets();
    loadMapeos();
  }

  async function loadClients() {
    const { data } = await supabase
      .from("Clients")
      .select("*");

    setClients(data || []);
  }

  async function loadTickets() {
    const { data } = await supabase
      .from("Tickets")
      .select("*");

    setTickets(data || []);
  }

  async function loadMapeos() {
    const { data } = await supabase
      .from("Mapeos")
      .select("*");

    setMapeos(data || []);
  }

  async function login() {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) alert(error.message);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md">
          <h1 className="text-5xl font-black text-center mb-6">
            Pendify 🚀
          </h1>

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 mb-4"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 mb-4"
          />

          <button
            onClick={login}
            className="w-full bg-emerald-500 hover:bg-emerald-400 p-3 rounded-2xl font-bold"
          >
            Ingresar
          </button>
        </div>
      </div>
    );
  }

  const abiertos = tickets.filter(
    (t) => t.status === "Abierto"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white md:flex">

      {/* MOBILE */}
      <div className="md:hidden bg-slate-900/80 p-4 flex justify-between items-center border-b border-slate-800">
        <h1 className="text-2xl font-black">
          Pendify 🚀
        </h1>

        <button
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          className="text-2xl"
        >
          ☰
        </button>
      </div>

      {/* SIDEBAR */}
      <div
        className={`bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 w-full md:w-72 p-6 ${
          menuOpen ? "block" : "hidden"
        } md:block`}
      >
        <h1 className="text-3xl font-black mb-6 hidden md:block">
          Pendify 🚀
        </h1>

        <div className="bg-slate-800 p-4 rounded-2xl mb-6">
          <p className="font-bold">
            {profile?.name}
          </p>
          <p className="text-slate-400 text-sm">
            {profile?.role}
          </p>
        </div>

        <Menu text="📊 Dashboard" page={page} current="dashboard" setPage={setPage}/>
        <Menu text="🏢 Clientes" page={page} current="clientes" setPage={setPage}/>
        <Menu text="🎫 Tickets" page={page} current="tickets" setPage={setPage}/>
        <Menu text="📁 Mapeos" page={page} current="mapeos" setPage={setPage}/>

        <button
          onClick={logout}
          className="w-full mt-6 bg-red-500 hover:bg-red-400 p-3 rounded-2xl font-bold"
        >
          Salir
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-4 md:p-8">

        {page === "dashboard" && (
          <>
            <h2 className="text-4xl font-black mb-6">
              Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card title="Clientes" value={clients.length}/>
              <Card title="Tickets" value={tickets.length}/>
              <Card title="Abiertos" value={abiertos}/>
              <Card title="Mapeos" value={mapeos.length}/>
            </div>
          </>
        )}

        {page === "clientes" && (
          <>
            <Title text="Clientes" />
            {clients.map((c) => (
              <Box
                key={c.id}
                title={c.Name}
                lines={[
                  `RUC: ${c.Ruc}`,
                  `📍 ${c.adress}`,
                  `👤 ${c.managername}`,
                  `📞 ${c.managerphone}`,
                ]}
              />
            ))}
          </>
        )}

        {page === "tickets" && (
          <>
            <Title text="Tickets" />
            {tickets.map((t) => (
              <Box
                key={t.id}
                title={t.client}
                lines={[
                  `🎫 ${t.issue}`,
                  `⚡ ${t.priority}`,
                  `👨‍🔧 ${t.tech}`,
                  `📌 ${t.status}`,
                ]}
              />
            ))}
          </>
        )}

        {page === "mapeos" && (
          <>
            <Title text="Mapeos" />
            {mapeos.map((m) => (
              <Box
                key={m.id}
                title={m.funcionario}
                lines={[
                  `Cliente: ${m.cliente}`,
                  `Depto: ${m.departamento}`,
                  `Equipo: ${m.equipo}`,
                  `RAM: ${m.ram}`,
                ]}
              />
            ))}
          </>
        )}

      </div>
    </div>
  );
}

function Menu({
  text,
  page,
  current,
  setPage,
}) {
  return (
    <div
      onClick={() => setPage(current)}
      className={`p-3 rounded-2xl cursor-pointer mb-3 transition ${
        page === current
          ? "bg-emerald-500"
          : "bg-slate-800 hover:bg-slate-700"
      }`}
    >
      {text}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl">
      <p className="text-slate-400">{title}</p>
      <h2 className="text-3xl font-black">{value}</h2>
    </div>
  );
}

function Box({ title, lines }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl mb-4 shadow-xl">
      <h3 className="text-xl font-bold mb-2">
        {title}
      </h3>

      {lines.map((line, i) => (
        <p key={i} className="text-slate-400">
          {line}
        </p>
      ))}
    </div>
  );
}

function Title({ text }) {
  return (
    <h2 className="text-4xl font-black mb-6">
      {text}
    </h2>
  );
}

export default App;