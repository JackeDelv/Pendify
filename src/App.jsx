import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import supabase from "./supabase";

function App() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [logged, setLogged] = useState(false);

  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  /* CLIENTES */
  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");
  const [ruc, setRuc] = useState("");
  const [address, setAddress] = useState("");
  const [manager, setManager] = useState("");
  const [phone, setPhone] = useState("");

  /* TICKETS */
  const [tickets, setTickets] = useState([]);
  const [client, setClient] = useState("");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("Media");
  const [tech, setTech] = useState("Juan");

  /* MAPEOS */
  const [clienteMapeo, setClienteMapeo] = useState("");
  const [excelRows, setExcelRows] = useState([]);
  const [mapeos, setMapeos] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (logged) {
      loadClients();
      loadTickets();
      loadMapeos();
    }
  }, [logged]);

  async function loadClients() {
    const { data } = await supabase
      .from("Clients")
      .select("*")
      .order("id", { ascending: true });

    setClients(data || []);
    if (data?.length > 0) setClient(data[0].Name);
  }

  async function loadTickets() {
    const { data } = await supabase
      .from("Tickets")
      .select("*")
      .order("id", { ascending: false });

    setTickets(data || []);
  }

  async function loadMapeos() {
    const { data } = await supabase
      .from("Mapeos")
      .select("*")
      .order("id", { ascending: false });

    setMapeos(data || []);
  }

  function login() {
    if (user === "admin" && pass === "1234") {
      setLogged(true);
    } else {
      alert("Datos incorrectos");
    }
  }

  async function addClient() {
    const { error } = await supabase
      .from("Clients")
      .insert([
        {
          Name: name,
          Ruc: ruc,
          adress: address,
          managername: manager,
          managerphone: phone,
        },
      ]);

    if (error) return alert(error.message);

    setName("");
    setRuc("");
    setAddress("");
    setManager("");
    setPhone("");
    loadClients();
  }

  async function addTicket() {
    const { error } = await supabase
      .from("Tickets")
      .insert([
        {
          client,
          issue,
          priority,
          tech,
          status: "Abierto",
        },
      ]);

    if (error) return alert(error.message);

    setIssue("");
    loadTickets();
  }

  async function changeStatus(id, status) {
    const next =
      status === "Abierto"
        ? "En proceso"
        : status === "En proceso"
        ? "Resuelto"
        : status === "Resuelto"
        ? "Cerrado"
        : "Abierto";

    await supabase
      .from("Tickets")
      .update({ status: next })
      .eq("id", id);

    loadTickets();
  }

  function readExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, {
        type: "binary",
      });

      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      const rows =
        XLSX.utils.sheet_to_json(sheet);

      const cleanRows = rows.filter(
        (row) =>
          row["FUNCIONARIO"] &&
          row["FUNCIONARIO"] !== "CENTRAL"
      );

      setExcelRows(cleanRows);
    };

    reader.readAsBinaryString(file);
  }

  async function importToCloud() {
    if (!clienteMapeo.trim())
      return alert("Ingrese cliente");

    if (excelRows.length === 0)
      return alert("Seleccione Excel");

    const payload = excelRows.map((row) => ({
      cliente: clienteMapeo,
      funcionario:
        row["FUNCIONARIO"] || "",
      departamento:
        row["DEPARTAMENTO"] || "",
      equipo:
        row["EQUIPO"] || "",
      ram:
        row["MEMORIA RAM"] || "",
      windows:
        row["WINDOWS"] || "",
      office:
        row["OFFICE"] || "",
      extras: row,
    }));

    const { error } = await supabase
      .from("Mapeos")
      .insert(payload);

    if (error) return alert(error.message);

    alert("Importado");
    setExcelRows([]);
    loadMapeos();
  }

  if (!logged) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-md">
          <h1 className="text-4xl font-bold text-center mb-6">
            Pendify 🚀
          </h1>

          <input
            placeholder="Usuario"
            value={user}
            onChange={(e) =>
              setUser(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-slate-800 mb-4"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={(e) =>
              setPass(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-slate-800 mb-4"
          />

          <button
            onClick={login}
            className="w-full bg-emerald-500 p-3 rounded-xl font-bold"
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

  const filteredMapeos =
    mapeos.filter((m) =>
      JSON.stringify(m)
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white md:flex">

      {/* MOBILE TOPBAR */}
      <div className="md:hidden bg-slate-900 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
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
        className={`bg-slate-900 w-full md:w-64 p-6 ${
          menuOpen ? "block" : "hidden"
        } md:block`}
      >
        <Menu text="📊 Dashboard" page={page} current="dashboard" setPage={setPage}/>
        <Menu text="🏢 Clientes" page={page} current="clientes" setPage={setPage}/>
        <Menu text="🎫 Tickets" page={page} current="tickets" setPage={setPage}/>
        <Menu text="📁 Mapeos" page={page} current="mapeos" setPage={setPage}/>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">

        {page === "dashboard" && (
          <>
            <h2 className="text-3xl font-bold mb-6">
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
            <h2 className="text-3xl font-bold mb-6">
              Clientes
            </h2>

            <div className="bg-slate-900 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input placeholder="Nombre empresa" value={name} onChange={(e)=>setName(e.target.value)} className="p-3 rounded-xl bg-slate-800"/>
              <input placeholder="RUC" value={ruc} onChange={(e)=>setRuc(e.target.value)} className="p-3 rounded-xl bg-slate-800"/>
              <input placeholder="Dirección" value={address} onChange={(e)=>setAddress(e.target.value)} className="p-3 rounded-xl bg-slate-800"/>
              <input placeholder="Encargado" value={manager} onChange={(e)=>setManager(e.target.value)} className="p-3 rounded-xl bg-slate-800"/>
              <input placeholder="Número encargado" value={phone} onChange={(e)=>setPhone(e.target.value)} className="p-3 rounded-xl bg-slate-800 md:col-span-2"/>

              <button onClick={addClient} className="bg-emerald-500 p-3 rounded-xl font-bold md:col-span-2">
                Guardar cliente
              </button>
            </div>

            {clients.map((c)=>(
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
            <h2 className="text-3xl font-bold mb-6">
              Tickets
            </h2>

            <div className="bg-slate-900 p-4 rounded-2xl grid gap-4 mb-6">
              <select value={client} onChange={(e)=>setClient(e.target.value)} className="p-3 rounded-xl bg-slate-800">
                {clients.map((c)=>(
                  <option key={c.id}>{c.Name}</option>
                ))}
              </select>

              <input placeholder="Problema" value={issue} onChange={(e)=>setIssue(e.target.value)} className="p-3 rounded-xl bg-slate-800"/>

              <select value={priority} onChange={(e)=>setPriority(e.target.value)} className="p-3 rounded-xl bg-slate-800">
                <option>Alta</option>
                <option>Media</option>
                <option>Baja</option>
              </select>

              <select value={tech} onChange={(e)=>setTech(e.target.value)} className="p-3 rounded-xl bg-slate-800">
                <option>Juan</option>
                <option>Luis</option>
                <option>Carlos</option>
              </select>

              <button onClick={addTicket} className="bg-emerald-500 p-3 rounded-xl font-bold">
                Crear ticket
              </button>
            </div>

            {tickets.map((t)=>(
              <Box
                key={t.id}
                title={t.client}
                lines={[
                  `🎫 ${t.issue}`,
                  `⚡ ${t.priority}`,
                  `👨‍🔧 ${t.tech}`,
                  `📌 ${t.status}`,
                ]}
                button={
                  <button
                    onClick={() =>
                      changeStatus(
                        t.id,
                        t.status
                      )
                    }
                    className="mt-3 bg-emerald-500 px-4 py-2 rounded-xl"
                  >
                    Cambiar estado
                  </button>
                }
              />
            ))}
          </>
        )}

        {page === "mapeos" && (
          <>
            <h2 className="text-3xl font-bold mb-6">
              Mapeos
            </h2>

            <div className="bg-slate-900 p-4 rounded-2xl grid gap-4 mb-6">
              <input
                placeholder="Cliente"
                value={clienteMapeo}
                onChange={(e)=>setClienteMapeo(e.target.value)}
                className="p-3 rounded-xl bg-slate-800"
              />

              <input type="file" accept=".xlsx,.xls" onChange={readExcel}/>

              <button onClick={importToCloud} className="bg-emerald-500 p-3 rounded-xl font-bold">
                Importar Excel Online
              </button>

              <p className="text-slate-400">
                Filas detectadas: {excelRows.length}
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl mb-6">
              <input
                placeholder="Buscar usuario..."
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800"
              />
            </div>

            {filteredMapeos.map((m)=>(
              <Box
                key={m.id}
                title={m.funcionario}
                lines={[
                  `Cliente: ${m.cliente}`,
                  `Depto: ${m.departamento}`,
                  `Equipo: ${m.equipo}`,
                  `RAM: ${m.ram}`,
                  `Windows: ${m.windows}`,
                  `Office: ${m.office}`,
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
      className={`p-3 rounded-xl cursor-pointer mb-3 ${
        page === current
          ? "bg-emerald-500"
          : "bg-slate-800"
      }`}
    >
      {text}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-slate-900 p-5 rounded-2xl">
      <p className="text-slate-400">{title}</p>
      <h2 className="text-3xl font-bold">
        {value}
      </h2>
    </div>
  );
}

function Box({
  title,
  lines,
  button,
}) {
  return (
    <div className="bg-slate-900 p-5 rounded-2xl mb-4">
      <h3 className="text-xl font-bold mb-2">
        {title}
      </h3>

      {lines.map((line, i)=>(
        <p key={i} className="text-slate-400">
          {line}
        </p>
      ))}

      {button}
    </div>
  );
}

export default App;