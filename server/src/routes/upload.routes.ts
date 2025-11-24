import { Router } from "express";
import multer from "multer";
import { Client } from "minio";

const router = Router();

// Configurar Multer para armazenar em memória
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

// Extrair endpoint e porta corretamente
const s3Endpoint = process.env.S3_ENDPOINT || "http://localhost:9000";
const endpointWithoutProtocol = s3Endpoint.replace("http://", "").replace("https://", "");
const [endPoint, portStr] = endpointWithoutProtocol.split(":");
const port = portStr ? parseInt(portStr) : 9000;

// Configurar cliente MinIO
const minioClient = new Client({
  endPoint: endPoint, // Apenas 'minio' ou 'localhost'
  port: port, // 9000
  useSSL: process.env.S3_SSL === "true",
  accessKey: process.env.S3_ACCESS_KEY || "admin",
  secretKey: process.env.S3_SECRET_KEY || "admin123",
});

const bucketName = process.env.S3_BUCKET_NAME || "parasitologia";

// Garantir que o bucket existe e é público
const ensureBucketExists = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, "us-east-1");
    }
    
    // Tornar o bucket público
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    console.log("✅ Bucket configurado como público");
  } catch (error) {
    console.error("❌ Erro ao configurar bucket:", error);
  }
};

// Executar ao iniciar
ensureBucketExists();

// Rota de upload de IMAGENS
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado" });
    }

    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname}`;

    // Upload para MinIO
    await minioClient.putObject(
      bucketName,
      fileName,
      file.buffer,
      file.size,
      {
        "Content-Type": file.mimetype,
      }
    );

    const publicUrl = `http://localhost:3000/images/${fileName}`;

    res.json({
      message: "Upload realizado com sucesso",
      url: publicUrl,
      imageUrl: publicUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error("❌ Erro no upload:", error);
    res.status(500).json({ message: "Erro ao fazer upload da imagem" });
  }
});

// Rota de upload de DOCUMENTOS (PDF/Word)
router.post("/document", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum documento enviado" });
    }

    const file = req.file;
    
    // Validar tipo de arquivo
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        message: "Tipo de arquivo não permitido. Apenas PDF e Word são aceitos." 
      });
    }

    // Nome único para o arquivo
    const uniqueFileName = `${Date.now()}-${file.originalname}`;
    
    // Caminho completo no MinIO (com pasta attachments/)
    const minioPath = `attachments/${uniqueFileName}`;

    // Upload para MinIO
    await minioClient.putObject(
      bucketName,
      minioPath,
      file.buffer,
      file.size,
      {
        "Content-Type": file.mimetype,
      }
    );

    // URL pública (SEM a pasta attachments, pois a rota já adiciona)
    const publicUrl = `http://localhost:3000/documents/${uniqueFileName}`;

    res.json({
      message: "Upload de documento realizado com sucesso",
      url: publicUrl,
      documentUrl: publicUrl,
      fileName: minioPath, // Caminho completo para debug
      type: file.mimetype,
      size: file.size,
    });
  } catch (error) {
    console.error("❌ Erro no upload do documento:", error);
    res.status(500).json({ message: "Erro ao fazer upload do documento" });
  }
});

export default router;