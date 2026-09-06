import { Router } from "express";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { exec } from "child_process";
import { promisify } from "util";
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);
const uploadsRouter = Router();

// VERCEL_OPENAI_LAZY_FIX_20260906
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI is not configured");
  }
  return new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    apiKey,
  });
}

const UPLOAD_DIR = process.env.VERCEL ? path.join("/tmp", "uploads") : path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Initialize cloud storage client
const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account" as any,
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos

async function uploadToCloudStorage(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const publicPath = process.env.PUBLIC_OBJECT_SEARCH_PATHS?.split(",")[0];
  if (!publicPath) {
    throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not configured");
  }
  
  const objectId = randomUUID();
  const ext = filename.split('.').pop() || 'bin';
  const cloudFilename = `${objectId}.${ext}`;
  const fullPath = `${publicPath}/${cloudFilename}`;
  const pathParts = fullPath.split("/").filter(p => p);
  const bucketName = pathParts[0];
  const objectName = pathParts.slice(1).join("/");
  
  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);
  
  await file.save(buffer, { contentType });
  
  return `/objects/public/${cloudFilename}`;
}

uploadsRouter.post("/api/upload-image", async (req, res) => {
  try {
    const { image, filename } = req.body;
    
    if (!image || !filename) {
      return res.status(400).json({ error: "Image and filename required" });
    }

    const videoMimeMatch = image.match(/^data:(video\/\w+);base64,/);
    if (videoMimeMatch) {
      const mimeType = videoMimeMatch[1];
      if (!ALLOWED_VIDEO_TYPES.includes(mimeType)) {
        return res.status(400).json({ error: "Only MP4, WebM, and MOV videos are allowed" });
      }
      const base64Data = image.replace(/^data:video\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      if (buffer.length > MAX_VIDEO_SIZE) {
        return res.status(400).json({ error: "Video too large. Maximum size is 50MB" });
      }
      const ext = mimeType.split('/')[1] === 'quicktime' ? 'mov' : mimeType.split('/')[1];
      const cloudUrl = await uploadToCloudStorage(buffer, `video.${ext}`, mimeType);
      return res.json({ url: cloudUrl });
    }

    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    if (!mimeMatch) {
      return res.status(400).json({ error: "Invalid image format" });
    }
    const mimeType = mimeMatch[1];
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return res.status(400).json({ error: "Only JPEG, PNG, GIF, WebP, and SVG images are allowed" });
    }
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ error: "Image too large. Maximum size is 10MB" });
    }
    const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
    const cloudUrl = await uploadToCloudStorage(buffer, `image.${ext}`, mimeType);
    res.json({ url: cloudUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

uploadsRouter.post("/api/scan-menu", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "Image is required" });
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    if (!mimeMatch) return res.status(400).json({ error: "Invalid image format" });
    console.log("Scanning menu image with AI Vision...");
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at reading restaurant menus. Analyze the provided menu image and extract all menu items AND their modifiers/toppings.\n\nFor each MENU ITEM, extract:\n- name: The name of the menu item\n- description: The description if visible (empty string if not)\n- price: The price as a string (e.g., "5.99") - extract numbers only, no currency symbols\n- category: Suggest a category from these options: platters, family-bucket, peri-peri, beef-burgers, chicken-burgers, burgers, fried-chicken, sides, sauces, kids, milkshakes, drinks, other-menus\n- modifiers: Array of add-ons/toppings for this item (can be empty)\n\nFor each MODIFIER/TOPPING within an item, extract:\n- name: The name of the modifier (e.g., "Extra Cheese", "Add Bacon", "Large Size")\n- price: The additional price as a string (e.g., "1.50") - use "0.00" if free or not visible\n\nReturn your response as a valid JSON object with an "items" array.\nImportant:\n- Extract ALL visible menu items\n- Look for "Add-ons", "Extras", "Toppings", "Make it a meal", "Upgrades" sections\n- If price is not visible, use "0.00"\n- Be thorough and accurate\n- Return ONLY the JSON object, no additional text`
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: image, detail: "high" } },
            { type: "text", text: "Please analyze this menu image and extract all menu items with their names, descriptions, prices, categories, and any modifiers/toppings. Return as JSON." }
          ]
        }
      ],
      max_tokens: 4096,
      temperature: 0.1,
    });
    const content = response.choices[0]?.message?.content || "";
    let items = [];
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) items = JSON.parse(jsonMatch[0]).items || [];
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
    }
    res.json({ items, rawResponse: content });
  } catch (error: any) {
    console.error("Menu scan error:", error);
    res.status(500).json({ error: "Failed to analyze menu image", details: error?.message || "Unknown error" });
  }
});

uploadsRouter.post("/api/scan-menu-video", async (req, res) => {
  try {
    const { video } = req.body;
    if (!video) return res.status(400).json({ error: "Video is required" });
    const mimeMatch = video.match(/^data:(video\/\w+);base64,/);
    if (!mimeMatch) return res.status(400).json({ error: "Invalid video format" });
    const videoId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const videoPath = path.join(UPLOAD_DIR, `${videoId}.mp4`);
    const framesDir = path.join(UPLOAD_DIR, `frames-${videoId}`);
    if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir, { recursive: true });
    const base64Data = video.replace(/^data:video\/\w+;base64,/, "");
    fs.writeFileSync(videoPath, Buffer.from(base64Data, "base64"));
    try {
      await execAsync(`ffmpeg -i "${videoPath}" -vf "fps=1" -frames:v 10 "${framesDir}/frame-%03d.jpg" -y`);
    } catch (ffmpegError: any) {
      console.error("FFmpeg error:", ffmpegError);
      fs.unlinkSync(videoPath);
      fs.rmSync(framesDir, { recursive: true, force: true });
      return res.status(500).json({ error: "Failed to extract frames from video" });
    }
    const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg')).sort();
    if (frameFiles.length === 0) {
      fs.unlinkSync(videoPath);
      fs.rmSync(framesDir, { recursive: true, force: true });
      return res.status(400).json({ error: "No frames could be extracted from video" });
    }
    const allItems: any[] = [];
    for (const frameFile of frameFiles) {
      const frameBuffer = fs.readFileSync(path.join(framesDir, frameFile));
      const base64Frame = `data:image/jpeg;base64,${frameBuffer.toString('base64')}`;
      try {
        const response = await getOpenAIClient().chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: `You are an expert at reading restaurant menus. Analyze this menu image and extract all menu items AND modifiers/toppings. Return a valid JSON object with an "items" array. Return ONLY the JSON object, no additional text.` },
            { role: "user", content: [
              { type: "image_url", image_url: { url: base64Frame, detail: "high" } },
              { type: "text", text: "Extract all menu items with modifiers. Return as JSON." }
            ] }
          ],
          max_tokens: 4096,
          temperature: 0.1,
        });
        const content = response.choices[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.items) allItems.push(...parsed.items);
        }
      } catch (frameError) {
        console.error(`Error processing frame ${frameFile}:`, frameError);
      }
    }
    fs.unlinkSync(videoPath);
    fs.rmSync(framesDir, { recursive: true, force: true });
    const seenNames = new Set<string>();
    const uniqueItems = allItems.filter(item => {
      const normalizedName = item.name?.toLowerCase().trim();
      if (!normalizedName || seenNames.has(normalizedName)) return false;
      seenNames.add(normalizedName);
      return true;
    });
    res.json({ items: uniqueItems, framesProcessed: frameFiles.length });
  } catch (error: any) {
    console.error("Video scan error:", error);
    res.status(500).json({ error: "Failed to analyze video", details: error?.message || "Unknown error" });
  }
});

uploadsRouter.post("/api/ai/generate-image", async (req, res) => {
  try {
    const { prompt, size, background, shopName } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    const openaiValidSizes = ["1024x1024", "512x512", "256x256"];
    const requestedSize = size || "1024x1024";
    const apiSize = openaiValidSizes.includes(requestedSize) ? requestedSize : "1024x1024";
    let fullPrompt = prompt;
    const commaItems = prompt.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    if (commaItems.length >= 2) fullPrompt += `. This is a meal deal with ${commaItems.length} items. Show a small label or badge saying "${commaItems.length} Items" on the image`;
    if (shopName) fullPrompt += `. The wrapper paper or packaging should have the shop name "${shopName}" clearly printed/branded on it`;
    if (background) fullPrompt += `. Background: ${background}`;
    fullPrompt += ". Professional food photography style, high quality, studio lighting.";
    const response = await getOpenAIClient().images.generate({
      model: "gpt-image-1",
      prompt: fullPrompt,
      n: 1,
      size: apiSize as any,
    });
    const imageData = response.data?.[0];
    if (!imageData || !imageData.b64_json) return res.status(500).json({ error: "No image generated" });
    let finalBase64 = imageData.b64_json;
    if (requestedSize === "600x450") {
      try {
        const sharp = (await import("sharp")).default;
        const inputBuffer = Buffer.from(imageData.b64_json, "base64");
        const resizedBuffer = await sharp(inputBuffer).resize(600, 450, { fit: "cover" }).png().toBuffer();
        finalBase64 = resizedBuffer.toString("base64");
      } catch (resizeErr) {
        console.warn("Sharp resize failed, returning original size:", resizeErr);
      }
    }
    res.json({ image: `data:image/png;base64,${finalBase64}`, revised_prompt: (imageData as any).revised_prompt || prompt });
  } catch (error: any) {
    console.error("AI image generation error:", error);
    res.status(500).json({ error: "Failed to generate image", details: error?.message || "Unknown error" });
  }
});

const ttsStreamToBuffer = async (stream: any): Promise<Buffer> => {
  const chunks: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    stream.on("data", (data: any) => {
      if (data instanceof Buffer) chunks.push(data);
      else if (typeof data === "object") chunks.push(Buffer.from(data));
    });
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("close", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err: any) => reject(err));
  });
};

uploadsRouter.post("/api/tts", async (req, res) => {
  try {
    const { MsEdgeTTS, OUTPUT_FORMAT } = await import("msedge-tts");
    const { text, lang } = req.body;
    if (!text || typeof text !== "string") return res.status(400).json({ error: "Text is required" });
    const tts = new MsEdgeTTS();
    let voiceName = "ar-SA-HamedNeural";
    if (lang === "ur") voiceName = "ur-PK-AsadNeural";
    else if (lang === "en") voiceName = "en-US-GuyNeural";
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const clean = text.replace(/\n+/g, " ").trim().slice(0, 3000);
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang === "ur" ? "ur-PK" : lang === "en" ? "en-US" : "ar-SA"}"><voice name="${voiceName}"><prosody rate="${lang === "ar" ? "-25%" : "-15%"}" pitch="${lang === "ar" ? "-5%" : "0%"}">${clean}</prosody></voice></speak>`;
    const result = tts.toStream(ssml);
    const combined = await ttsStreamToBuffer(result.audioStream);
    if (combined.length === 0) {
      const fallback = tts.toStream(clean);
      const fbBuf = await ttsStreamToBuffer(fallback.audioStream);
      res.set({ "Content-Type": "audio/mpeg", "Content-Length": fbBuf.length.toString(), "Cache-Control": "public, max-age=86400" });
      return res.send(fbBuf);
    }
    res.set({ "Content-Type": "audio/mpeg", "Content-Length": combined.length.toString(), "Cache-Control": "public, max-age=86400" });
    res.send(combined);
  } catch (error: any) {
    console.error("TTS error:", error?.message);
    res.status(500).json({ error: "TTS failed", details: error?.message });
  }
});

export { uploadsRouter, UPLOAD_DIR };
