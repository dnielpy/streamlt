const retired = () => Response.json({ error: "Streamlt profiles are managed by Home Server." }, { status: 410 });
export const POST = retired;
export const DELETE = retired;
