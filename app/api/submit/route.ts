import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// ---- Env (set on Vercel) ----
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const DESTINATION_EMAIL = process.env.DESTINATION_EMAIL || "wilco477@umn.edu";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev"; // replace with verified sender later

// ---- Clients ----
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const resend = new Resend(RESEND_API_KEY);

// ---- Helpers ----
function toPlainText(obj: Record<string, any>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v ?? "")}`)
    .join("\n");
}
function toHtmlTable(obj: Record<string, any>): string {
  const rows = Object.entries(obj)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;border:1px solid #ddd;"><b>${k}</b></td><td style="padding:6px 10px;border:1px solid #ddd;">${
          typeof v === "object" ? `<pre style="margin:0">${JSON.stringify(v, null, 2)}</pre>` : String(v ?? "")
        }</td></tr>`
    )
    .join("");
  return `<table style="border-collapse:collapse;font-family:system-ui,Arial,sans-serif;font-size:14px">${rows}</table>`;
}

// ---- Route ----
export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as Record<string, any>;

    // 1) Save in DB and get global case number
    const { data, error } = await supabase
      .from("submissions")
      .insert([{ payload }])
      .select("id")
      .single();

    if (error || !data) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ ok: false, error: "DB insert failed" }, { status: 500 });
    }

    const caseNumber = data.id;

    // 2) Email
    const subject = `mECMO EMS submission – Case #${caseNumber}`;
    const text = `New submission\n\nCase #: ${caseNumber}\n\n${toPlainText(payload)}`;
    const html = `
      <div style="font-family:system-ui,Arial,sans-serif;font-size:14px">
        <h2 style="margin:0 0 10px">mECMO EMS submission</h2>
        <p><b>Case #${caseNumber}</b></p>
        ${toHtmlTable(payload)}
      </div>
    `;

    const emailRes = await resend.emails.send({
      from: FROM_EMAIL,
      to: DESTINATION_EMAIL,
      subject,
      text,
      html,
    });

    if (emailRes.error) {
      console.error("Resend error:", emailRes.error);
      return NextResponse.json({ ok: true, caseNumber, email: "failed" });
    }

    return NextResponse.json({ ok: true, caseNumber });
  } catch (e: any) {
    console.error("Unhandled submit error:", e);
    return NextResponse.json({ ok: false, error: e?.message || "Unhandled error" }, { status: 500 });
  }
}
