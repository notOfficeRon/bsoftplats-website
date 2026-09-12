export async function GET() {
  const value = process.env.TEST_ENV_VAR;
  return Response.json({
    ok: true,
    set: typeof value === "string" && value.length > 0,
    value: typeof value === "string" && value.length > 0 ? value : "(not set)",
  });
}
