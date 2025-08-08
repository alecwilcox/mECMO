import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function GET() {
  try {
    const to = process.env.DESTINATION_EMAIL || "wilco477@umn.edu";
    const from = process.env.FROM_EMAIL || "onboarding@resend.dev";
    const result = await resend.emails.send({
      from, to,
      subject: "Resend test from mECMO",
      text: "If you see this, Resend is configured correctly."
    });
    if (result.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    console.error("Email test error:", e);
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}
