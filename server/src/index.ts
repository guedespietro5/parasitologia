import express from "express";
import cors from "cors";
import roleRoutes from "./routes/role.routes";
import userRoutes from "./routes/user.routes";
import postRoutes from "./routes/post.routes";
import authRoutes from "./routes/auth.routes";
import hostRoutes from "./routes/host.routes";
import parasiteAgentRoutes from "./routes/parasiteAgent.routes";
import transmissionRoutes from "./routes/transmission.routes";
import uploadRoutes from "./routes/upload.routes";
import imageRoutes from "./routes/image.routes";

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
app.use("/users", userRoutes);
app.use("/post", postRoutes);
app.use("/host", authMiddleware, hostRoutes);
app.use("/parasiteAgent", authMiddleware, parasiteAgentRoutes);
app.use("/transmission", authMiddleware, transmissionRoutes);
app.use("/upload", authMiddleware, uploadRoutes);
app.use("/images", imageRoutes);

app.listen(3000, () => {
  console.log("Rodando essa porra");
});
