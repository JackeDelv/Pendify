function TaskForm({ addTask }) {
  return (
    <button
      onClick={addTask}
      style={{
        padding: "12px 20px",
        background: "#22c55e",
        border: "none",
        color: "white",
        borderRadius: "10px",
        cursor: "pointer"
      }}
    >
      ➕ Nuevo Pendiente
    </button>
  );
}

export default TaskForm;