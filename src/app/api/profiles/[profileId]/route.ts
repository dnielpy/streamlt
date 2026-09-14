const retired = () => Response.json({ error: "Streamlt profiles are managed by Home Server." }, { status: 410 });
export const PATCH = retired;
export const DELETE = retired;
