import sharp from "sharp";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const images = formData.getAll("images");
    if (!images?.length) return new Response("No images uploaded", { status: 400 });

    const results = [];
    for (const file of images) {
      const buf = Buffer.from(await file.arrayBuffer());
      const out = await sharp(buf).jpeg({ quality: 90 }).toBuffer();
      const b64 = out.toString("base64");
      results.push({
        name: file.name.replace(/\.(heic)$/i, ".jpg"),
        dataUrl: `data:image/jpeg;base64,${b64}`,
      });
    }
    return Response.json({ results }); // { results: [{name, dataUrl}] }
  } catch (e) {
    console.error(e);
    return new Response("Conversion error", { status: 500 });
  }
}