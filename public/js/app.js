// =======================
// GLOBAL VARIABLES
// =======================
var map = null;
var currentAlertId = null;


// =======================
// MAP FUNCTION
// =======================
function initMap() {
  console.log("Map loaded");

  map = L.map('map').setView([17.3850, 78.4867], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // 🔥 LOAD REAL ALERTS
  loadAlerts();
  const legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  const div = L.DomUtil.create("div", "info legend");

  div.innerHTML = `
    <h4>Alert Legend</h4>
    <i style="background:#ff4d4d"></i> High Danger<br>
    <i style="background:#ff9800"></i> Medium Alert<br>
    <i style="background:#28a745"></i> Solved<br>
  `;

  return div;
};

legend.addTo(map);
}


// =======================
// LOAD ALERTS
// =======================
function loadAlerts() {
  fetch('/alerts/api/all')
    .then(res => res.json())
    .then(alerts => {
      alerts.forEach(alert => {
        addMarker(alert);
      });
    })
    .catch(err => console.error(err));
}


// =======================
// ADD MARKER WITH COLORS
// =======================
function addMarker(alert) {
  let color = "#ff4d4d"; // default red

  if (alert.status === "solved") {
    color = "#28a745"; // green
  } else if (alert.type === "ir_proximity") {
    color = "#ff9800"; // orange
  }

  const marker = L.circleMarker(
    [alert.location.latitude, alert.location.longitude],
    {
      radius: 10,
      fillColor: color,
      color: "#fff",       // white border
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }
  ).addTo(map);

  marker.bindPopup(`
    <div style="font-size:14px;">
      <b>${alert.type}</b><br>
      Status: ${alert.status || "active"}<br>
      <small>${alert.description || ""}</small>
    </div>
  `);
}

// =======================
// SOLVE ALERT
// =======================
function solveAlert(id) {
  fetch(`/alerts/${id}/solve`, {
    method: 'POST'
  })
  .then(res => {
    if (!res.ok) throw new Error("Failed to solve alert");
    return res.json();
  })
  .then(() => {
    alert("Alert solved!");
    location.reload();
  })
  .catch(err => {
    console.error(err);
    alert("Error solving alert");
  });
}


// =======================
// NOTE MODAL
// =======================
function openNoteModal(id) {
  currentAlertId = id;
  document.getElementById("noteModal").classList.remove("hidden");
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeNoteModal() {
   document.getElementById('noteText').value = '';
  document.getElementById("noteModal").classList.add("hidden");
    document.getElementById('modalOverlay').classList.add('hidden');
}


// =======================
// SUBMIT NOTE
// =======================
function submitNote() {
  const text = document.getElementById("noteText").value;

  if (!text) {
    alert("Enter note");
    return;
  }

  fetch(`/alerts/api/${currentAlertId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  })
  .then(res => res.json())
  .then(() => {
    alert("Note added");
    closeNoteModal();
    location.reload();
  })
  .catch(err => console.error(err));
}
// =======================
// 📌 OPEN MODAL
// =======================
function openGuidelineModal() {
  document.getElementById("guidelineModal").classList.remove("hidden");
}

function closeGuidelineModal() {
  document.getElementById("guidelineModal").classList.add("hidden");
}


// =======================
// 📌 SUBMIT GUIDELINE
// =======================
function submitGuideline() {
  const title = document.getElementById("gTitle").value;
  const category = document.getElementById("gCategory").value;
  const content = document.getElementById("gContent").value;

  if (!title || !content) {
    alert("Please fill all fields");
    return;
  }

  fetch('/guidelines/api', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title,
      category,
      content
    })
  })
  .then(res => {
    if (!res.ok) throw new Error("Failed to add guideline");
    return res.json();
  })
  .then(() => {
    alert("Guideline added!");
    closeGuidelineModal();
    location.reload();
  })
  .catch(err => {
    console.error(err);
    alert("Error adding guideline");
  });
}