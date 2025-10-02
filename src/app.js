const SWAPI_ORIGIN = "https://swapi.info/api/people/?page=1";
const PROXY = "https://api.allorigins.win/raw?url=";
let currentEndpoint = PROXY + encodeURIComponent(SWAPI_ORIGIN);

const $grid = document.getElementById("grid");
const $status = document.getElementById("status");
const $btnLoad = document.getElementById("btnLoad");
const $btnPost = document.getElementById("btnPost");

$btnLoad.addEventListener("click", () => loadPeople(currentEndpoint));
$btnPost.addEventListener("click", testHttpBinPost);

async function loadPeople(url) {
  setStatus("Cargando personajes...");
  try {
    const data = await fetchJson(url);
    const list = normalizeResults(data);
    renderPeople(list);
    setStatus(`Mostrando ${list.length} personajes`);
  } catch (err) {
    console.error(err);
    renderPeople([]);
    setStatus("Error cargando personajes.");
  }
}

function normalizeResults(data) {
  if (!data) return [];
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.people)) return data.people;
  if (Array.isArray(data)) return data;
  return [];
}

function renderPeople(people) {
  const $grid = document.getElementById('grid');
  if (!people || people.length === 0) {
    $grid.innerHTML = `<div class="card"><h3>Sin resultados</h3><p class="meta">Probá de nuevo más tarde.</p></div>`;
    return;
  }
  const html = people.map(p => `
    <div class="card">
      <h3>${escapeHtml(p.name || 'Desconocido')}</h3>
      <div class="meta">
        <div><strong>Altura:</strong> ${escapeHtml(p.height || 'N/D')} cm</div>
        <div><strong>Peso:</strong> ${escapeHtml(p.mass || 'N/D')} kg</div>
        <div><strong>Año de nacimiento:</strong> ${escapeHtml(p.birth_year || 'N/D')}</div>
        <div><strong>Género:</strong> ${escapeHtml(p.gender || 'N/D')}</div>
      </div>
    </div>`).join('');
  $grid.innerHTML = html;
}


async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function setStatus(msg) {
  $status.textContent = msg || "";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[s]));
}

async function testHttpBinPost() {
  setStatus("Enviando POST...");
  const payload = {
    character: "Luke Skywalker",
    film: "A New Hope",
    faction: "Rebel Alliance",
    droid: "R2-D2",
    timestamp: new Date().toISOString()
  };

  const CORS_POST = "https://corsproxy.io/?";
  const url = CORS_POST + encodeURIComponent("https://httpbin.org/post");

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    console.log("POST httpbin.org → status:", resp.status);
    console.log("Echo JSON:", data.json);
    console.log("Respuesta completa:", data);
    setStatus("POST completado.");
  } catch (err) {
    console.error("POST httpbin error:", err);
    setStatus("POST con error.");
  }
}
