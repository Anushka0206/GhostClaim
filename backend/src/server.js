// src/server.js
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "GhostClaim Shield API", time: new Date().toISOString() });
});

app.use("/api", apiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`GhostClaim Shield API running on http://localhost:${PORT}`);
});
