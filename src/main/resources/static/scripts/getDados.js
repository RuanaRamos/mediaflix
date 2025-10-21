
export default async function getDados(endpoint) {
  const resp = await fetch(endpoint, { headers: { "Content-Type": "application/json" } });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} em ${endpoint}`);
  return resp.json();
}
