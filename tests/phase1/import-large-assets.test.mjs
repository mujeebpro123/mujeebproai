import assert from "node:assert/strict"
import fs from "node:fs"

const importer = fs.readFileSync("components/786-chat/project-import.ts", "utf8")
const uploadRoute = fs.readFileSync("app/api/upload/client/route.ts", "utf8")

assert.match(importer, /@vercel\/blob\/client/)
assert.match(importer, /handleUploadUrl:\s*["']\/api\/upload\/client["']/)
assert.match(uploadRoute, /maximumSizeInBytes:\s*100\s*\*\s*1024\s*\*\s*1024/)
assert.match(uploadRoute, /allowedContentTypes/)

console.log("large import asset upload wiring ok")
