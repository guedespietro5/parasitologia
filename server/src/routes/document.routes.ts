import { Router } from "express";
import { Client } from "minio";

const router = Router();

// Extrair endpoint e porta
const s3Endpoint = process.env.S3_ENDPOINT || "http://localhost:9000";
const endpointWithoutProtocol = s3Endpoint.replace("http://", "").replace("https://", "");
const [endPoint, portStr] = endpointWithoutProtocol.split(":");
const port = portStr ? parseInt(portStr) : 9000;

// Configurar cliente MinIO
const minioClient = new Client({
  endPoint: endPoint,
  port: port,
  useSSL: process.env.S3_SSL === "true",
  accessKey: process.env.S3_ACCESS_KEY || "admin",
  secretKey: process.env.S3_SECRET_KEY || "admin123",
});

const bucketName = process.env.S3_BUCKET_NAME || "parasitologia";

// Rota para servir documentos
router.get("/:fileName", async (req, res) => {
  try {
    const fileName = `attachments/${req.params.fileName}`;

    // Buscar objeto do MinIO
    const dataStream = await minioClient.getObject(bucketName, fileName);
    
    // Definir headers apropriados
    const ext = fileName.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === 'pdf') {
      contentType = 'application/pdf';
    } else if (ext === 'doc') {
      contentType = 'application/msword';
    } else if (ext === 'docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${req.params.fileName}"`);
    
    // Fazer pipe do stream para a resposta
    dataStream.pipe(res);
  } catch (error) {
    console.error("❌ Erro ao buscar documento:", error);
    res.status(404).json({ message: "Documento não encontrado" });
  }
});

export default router;