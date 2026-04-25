function TaskCard({ task, index, completeTask, deleteTask }) {
  return (
    <div style={{
      background: "#334155",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <span style={{
        textDecoration: task.done ? "line-through" : "none",
        color: task.done ? "#94a3b8" : "white"
      }}>
        {task.done ? "✅" : "📌"} {task.text}
      </span>

      <div>
        <button
          onClick={() => completeTask(index)}
          style={{
            marginRight: "10px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            padding: "8px",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          ✔
        </button>

        <button
          onClick={() => deleteTask(index)}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "8px",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          🗑
        </button>
      </div>
    </div>
  );
}

export default TaskCard;