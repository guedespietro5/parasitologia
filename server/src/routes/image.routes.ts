import { Router } from "express";
import { Client } from "minio";

const router = Router();

const minioClient = new Client({
  endPoint: "minio",
  port: 9000,
  useSSL: false,
  accessKey: process.env.S3_ACCESS_KEY || "admin",
  secretKey: process.env.S3_SECRET_KEY || "admin123",
});

const bucketName = process.env.S3_BUCKET_NAME || "parasitologia";

router.get("/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;
    
    const stream = await minioClient.getObject(bucketName, fileName);
    
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Type', 'image/png');
    
    stream.pipe(res);
  } catch (error) {
    console.error("Erro ao buscar imagem:", error);
    res.status(404).json({ message: "Imagem não encontrada" });
  }
});

export default router;