export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}

export function withCors(data: object, status = 200) {
  return Response.json(data, { status, headers: corsHeaders })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}
