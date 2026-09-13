import { NextResponse, type NextRequest } from "next/server";

import { forbidden, isAdminRequest } from "@/lib/auth";
import { uploadBlogImage } from "@/lib/cloudinary";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return forbidden();
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Expected multipart form data." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file attached." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "Only image files are allowed." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Image must be under 5 MB." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadBlogImage(buffer, file.name || "cover");
    return NextResponse.json({ ok: true, ...uploaded }, { status: 201 });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ ok: false, error: "Image upload failed." }, { status: 502 });
  }
}
