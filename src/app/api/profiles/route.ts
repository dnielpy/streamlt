export function POST() {
  return Response.json({ error: "Streamlt profiles are managed by Home Server." }, { status: 410 });
}
