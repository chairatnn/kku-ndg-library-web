export async function GET() {
  await new Promise((r) => setTimeout(r, 800));
  return Response.json({ status: 'ok' });
}