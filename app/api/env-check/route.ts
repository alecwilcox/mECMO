import { NextResponse } from "next/server";

export function GET() {
  const has = (k: string) => (process.env[k]?.trim()?.length ?? 0) > 5;
  return NextResponse.json({
    RESEND_API_KEY: has("RESEND_API_KEY"),
    DESTINATION_EMAIL: has("DESTINATION_EMAIL"),
    FROM_EMAIL: has("FROM_EMAIL"),
    NEXT_PUBLIC_SUPABASE_URL: has("NEXT_PUBLIC_SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: has("SUPABASE_SERVICE_ROLE_KEY")
  });
}
