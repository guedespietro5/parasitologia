import express from "express";
import cors from "cors";
import roleRoutes from "./routes/role.routes";
import userRoutes from "./routes/user.routes";
import postRoutes from "./routes/post.routes";
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middleware/auth";

const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/auth", authRoutes);

app.use("/roles", authMiddleware, roleRoutes);
app.use("/users", authMiddleware, userRoutes);
app.use("/post", authMiddleware, postRoutes);

app.listen(3000, () => {
  console.log("Rodando essa porra");
});
