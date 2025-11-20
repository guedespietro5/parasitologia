import express from "express";
import roleRoutes from "./routes/role.routes";

const app = express();
app.use(express.json());

app.use("/roles", roleRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
