import sharp from "sharp";
import convert from "heic-convert";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({
      maxFiles: 200,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      filter: ({ mimetype }) => {
        return mimetype && mimetype.includes("image");
      },
    });

    const [fields, files] = await form.parse(req);
    
    const fileArray = Array.isArray(files.images) ? files.images : [files.images].filter(Boolean);

    if (!fileArray.length) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const results = await Promise.all(
      fileArray.map(async (file) => {
        const buf = fs.readFileSync(file.filepath);
        const originalName = file.originalFilename || "image";
        const isHeic = /\.(heic|heif)$/i.test(originalName);
        
        let out;
        
        if (isHeic) {
          // HEIC dosyaları için heic-convert kullan
          try {
            out = await convert({
              buffer: buf,
              format: 'JPEG',
              quality: 0.9
            });
          } catch (heicError) {
            console.error("HEIC conversion error:", heicError);
            // HEIC dönüştürme başarısız olursa Sharp ile dene
            out = await sharp(buf, { sequentialRead: true })
              .rotate()
              .jpeg({ quality: 90 })
              .toBuffer();
          }
        } else {
          // Diğer formatlar için Sharp kullan
          out = await sharp(buf, { sequentialRead: true })
            .rotate()
            .jpeg({ quality: 90 })
            .toBuffer();
        }

        // Dosya adını .jpg ile değiştir
        const name = originalName
          .replace(/\.(heic|heif|avif)$/i, ".jpg")
          .replace(/\.(png|webp)$/i, ".jpg");

        // Clean up temporary file
        fs.unlinkSync(file.filepath);

        return {
          name,
          dataUrl: `data:image/jpeg;base64,${out.toString("base64")}`,
        };
      })
    );

    return res.status(200).json({ results }); // { results: [{ name, dataUrl }] }
  } catch (e) {
    console.error("convert error:", e);
    return res.status(500).json(
      { error: e?.message || "Conversion error" }
    );
  }
}
