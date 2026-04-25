import { useState, useEffect } from "react";
import supabase from "./supabase";

function App() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [logged, setLogged] = useState(false);
  const [page, setPage] = useState("dashboard");

  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState("");

  const [tickets, setTickets] = useState([]);

  const [ticketClient, setTicketClient] = useState("");
  const [ticketIssue, setTicketIssue] = useState("");
  const [ticketPriority, setTicketPriority] = useState("Media");
  const [ticketTech, setTicketTech] = useState("Juan");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data, error } = await supabase
      .from("Clients")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.log("LOAD ERROR:", error);
      return;
    }

    setClients(data || []);

    if (data && data.length > 0) {
      setTicketClient(data[0].Name);
    }
  };

  const login = () => {
    if (user === "admin" && pass === "1234") {
      setLogged(true);
    } else {
      alert("Datos incorrectos");
    }
  };

  const addClient = async () => {
    if (!newClient.trim()) return;

    const { data, error } = await supabase
      .from("Clients")
      .insert([
        {
          Name: newClient,
        },
      ])
      .select();

    if (error) {
      alert(error.message);
      console.log("INSERT ERROR:", error);
      return;
    }

    console.log("CLIENTE GUARDADO:", data);

    setNewClient("");
    loadClients();
  };

  const addTicket = () => {
    if (!ticketIssue.trim()) return;

    setTickets([
      ...tickets,
      {
        client: ticketClient,
        issue: ticketIssue,
        priority: ticketPriority,
        tech: ticketTech,
      },
    ]);

    setTicketIssue("");
  };

  if (!logged) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="bg-slate-900 w-full max-w-md p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <h1 className="text-4xl font-bold text-white text-center mb-6">
            Pendify 🚀
          </h1>

          <input
            placeholder="Usuario"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 mb-4"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 mb-4"
          />

          <button
            onClick={login}
            className="w-full bg-emerald-500 hover:bg-emerald-600 p-3 rounded-xl text-white font-bold"
          >
            Ingresar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:block">
        <h1 className="text-3xl font-bold mb-8">Pendify 🚀</h1>

        <nav className="space-y-3">
          <MenuItem
            text="📊 Dashboard"
            active={page === "dashboard"}
            onClick={() => setPage("dashboard")}
          />

          <MenuItem
            text="🏢 Clientes"
            active={page === "clientes"}
            onClick={() => setPage("clientes")}
          />

          <MenuItem
            text="🎫 Tickets"
            active={page === "tickets"}
            onClick={() => setPage("tickets")}
          />
        </nav>
      </div>

      <div className="flex-1 p-8">
        {page === "dashboard" && (
          <Dashboard clients={clients.length} tickets={tickets.length} />
        )}

        {page === "clientes" && (
          <Clientes
            clients={clients}
            newClient={newClient}
            setNewClient={setNewClient}
            addClient={addClient}
          />
        )}

        {page === "tickets" && (
          <Tickets
            clients={clients}
            tickets={tickets}
            ticketClient={ticketClient}
            setTicketClient={setTicketClient}
            ticketIssue={ticketIssue}
            setTicketIssue={setTicketIssue}
            ticketPriority={ticketPriority}
            setTicketPriority={setTicketPriority}
            ticketTech={ticketTech}
            setTicketTech={setTicketTech}
            addTicket={addTicket}
          />
        )}
      </div>
    </div>
  );
}

function MenuItem({ text, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl cursor-pointer transition ${
        active ? "bg-emerald-500" : "bg-slate-800 hover:bg-slate-700"
      }`}
    >
      {text}
    </div>
  );
}

function Dashboard({ clients, tickets }) {
  return (
    <>
      <h2 className="text-4xl font-bold mb-6">Dashboard</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Clientes" value={clients} />
        <Card title="Tickets" value={tickets} />
        <Card title="Urgentes" value="0" red />
      </div>
    </>
  );
}

function Clientes({ clients, newClient, setNewClient, addClient }) {
  return (
    <>
      <h2 className="text-4xl font-bold mb-6">Clientes</h2>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 mb-6">
        <input
          placeholder="Nuevo cliente"
          value={newClient}
          onChange={(e) => setNewClient(e.target.value)}
          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 mb-4"
        />

        <button
          onClick={addClient}
          className="bg-emerald-500 px-5 py-3 rounded-xl"
        >
          Guardar cliente
        </button>
      </div>

      {clients.map((c) => (
        <Box key={c.id} text={`🏢 ${c.Name}`} />
      ))}
    </>
  );
}

function Tickets(props) {
  return (
    <>
      <h2 className="text-4xl font-bold mb-6">Tickets</h2>

      <div className="space-y-3">
        {props.tickets.map((ticket, index) => (
          <div
            key={index}
            className="bg-slate-900 p-4 rounded-xl border border-slate-800"
          >
            <h3 className="font-bold">🎫 {ticket.client}</h3>
            <p>{ticket.issue}</p>
            <p>⚡ {ticket.priority}</p>
            <p>👨‍🔧 {ticket.tech}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function Card({ title, value, red }) {
  return (
    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
      <p className="text-slate-400">{title}</p>

      <h2 className={`text-3xl font-bold ${red ? "text-red-500" : "text-white"}`}>
        {value}
      </h2>
    </div>
  );
}

function Box({ text }) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-3">
      {text}
    </div>
  );
}

export default App;