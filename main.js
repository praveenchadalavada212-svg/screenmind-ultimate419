const editor = document.getElementById('editor');
const toast = document.getElementById('toast');
const status = document.getElementById('status');
const panelPsych = document.getElementById('panel-psychology');
const panelMyth = document.getElementById('panel-mythology');
const panelCollab = document.getElementById('panel-collaboration');
const beatBoardPanel = document.getElementById('beatboard-panel');
const aiPanel = document.getElementById('ai-panel');
const btnPsych = document.getElementById('btn-psychology');
const btnMyth = document.getElementById('btn-mythology');
const btnNew = document.getElementById('btn-new');
const btnImport = document.getElementById('file-import');
const btnCollab = document.getElementById('btn-collaboration');
const btnBeatBoard = document.getElementById('btn-beatboard');
const btnAI = document.getElementById('btn-ai-suggest');
const btnExportPDF = document.getElementById('btn-export-pdf');
const btnExportTXT = document.getElementById('btn-export-txt');
const btnExportFountain = document.getElementById('btn-export-fountain');
const btnCopyDraft = document.getElementById('btn-copy-draft');
const btnDark = document.getElementById('btn-darkmode');

function insertFormat(type) {
  const textarea = editor;
  let template = '';
  switch(type) {
    case 'scene':
      template = '\nINT./EXT. LOCATION - DAY\n';
      break;
    case 'shot':
      template = '\nSHOT: \n';
      break;
    case 'action':
      template = '\nAction: ';
      break;
    case 'character':
      template = '\n             CHARACTER NAME\n';
      break;
    case 'dialogue':
      template = '\n             Character\n             Dialogue goes here.\n';
      break;
    default:
      template = '\n';
  }
  insertAtCursor(textarea, template);
}
function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.substring(0, start);
  const after  = textarea.value.substring(end, textarea.value.length);
  textarea.value = before + text + after;
  textarea.selectionStart = textarea.selectionEnd = before.length + text.length;
  textarea.focus();
}
btnDark.onclick = () => {
  document.body.classList.toggle('darkmode');
  showToast(document.body.classList.contains('darkmode') ? 'Dark mode on!' : 'Light mode!');
};
btnNew.onclick = () => {
  editor.value = '';
  status.textContent = "New blank script. Start writing!";
  showToast("Blank screenplay ready.");
  editor.focus();
  closePanels();
};
btnExportPDF.onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:"pt",format:"a4"});
  const scriptText = editor.value || "";
  const margin = 54, lineHeight = 16;
  doc.setFont("Courier", "normal"); doc.setFontSize(12);
  let y = margin;
  doc.text("Screenplay Export", margin, y, {align:"left"});
  y += 2 * lineHeight;
  const lines = doc.splitTextToSize(scriptText, 460);
  for (let line of lines) {
    doc.text(line, margin, y, {align:"left"});
    y += lineHeight;
    if (y > 800) {doc.addPage(); y = margin;}
  }
  doc.save("Screenplay.pdf");
  showToast("Exported PDF!");
};
btnExportTXT.onclick = () => {
  const blob = new Blob([editor.value||""], {type:"text/plain"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob); link.download = "Screenplay.txt";
  document.body.appendChild(link); link.click(); link.remove();
  showToast("Exported as text file.");
};
btnExportFountain.onclick = () => {
  const blob = new Blob([editor.value||""], {type:"text/plain"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob); link.download = "Screenplay.fountain";
  document.body.appendChild(link); link.click(); link.remove();
  showToast("Exported as Fountain.");
};
btnCopyDraft.onclick = () => {
  navigator.clipboard.writeText(editor.value||"");
  showToast("Draft copied to clipboard!");
};
btnImport.onchange = async () => {
  const file = btnImport.files[0];
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  let text = '';
  try {
    if (['txt', 'fountain', 'fdx', 'docx', 'doc'].includes(ext)) {
      text = await file.text();
    } else if (ext === "pdf") {
      showToast("Importing PDF…");
      const pdfData = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({data: pdfData}).promise;
      let pageText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pageText += content.items.map(item => item.str).join(" ") + "\n";
      }
      text = pageText;
    } else {
      showToast("Unsupported format: " + ext);
      return;
    }
    editor.value = text;
    status.textContent = "Imported " + file.name;
    showToast("Script imported: " + file.name);
    editor.focus(); closePanels();
  } catch(e) {
    showToast("Import error: " + e.message);
  }
};
btnPsych.onclick = () => {
  closePanels();
  panelPsych.innerHTML = renderPsychology(editor.value);
  panelPsych.classList.remove("hidden");
  panelPsych.focus();
};
btnMyth.onclick = () => {
  closePanels();
  panelMyth.innerHTML = renderMythology(editor.value);
  panelMyth.classList.remove("hidden");
  panelMyth.focus();
};
function renderPsychology(text) {
  const charNames = Array.from(new Set((text.match(/^[A-Z][A-Z0-9 _\-]+\s*$/gm) || []).map(x => x.trim())));
  if (!charNames.length)
    return <h2>Psychological Analysis</h2><p>No character names found so far.</p>;
  return `<h2>Psychological Analysis</h2>
    ${charNames.map((name, i) => `
      <section>
        <h3 tabindex="0">${name}</h3>
        <div>
          Archetype: <strong>${["Hero", "Mentor", "Shadow", "Trickster", "Guardian"][i % 5]}</strong><br>
          Motivation: <em>To discover/change/protect</em>
          <ul><li>Courageous</li><li>Driven</li><li>Resilient</li></ul>
        </div>
      </section>`).join("")}
    <button onclick="document.getElementById('panel-psychology').classList.add('hidden')">Close</button>`;
}
function renderMythology(text) {
  let foundStages = [];
  if (/FADE\s*IN/.test(text)) foundStages.push("Ordinary World");
  if (/CALL TO ADVENTURE/i.test(text)) foundStages.push("Call to Adventure");
  if (/RETURN/i.test(text)) foundStages.push("Return/Reward");
  return `<h2>Mythological Analysis</h2>
      <ul>
        <li>Structure: ${foundStages.join(", ") || "No major beats detected yet."}</li>
        <li>Archetypes: Mentor, Guardian, Shadow</li>
      </ul>
      <button onclick="document.getElementById('panel-mythology').classList.add('hidden')">Close</button>`;
}
btnCollab.onclick = () => {
  closePanels();
  panelCollab.innerHTML = `
    <h2>Collaboration</h2>
    <p><strong>Invite collaborators:</strong> Share your script (demo only)</p>
    <button onclick="navigator.clipboard.writeText(editor.value||'');showToast('Script copied to clipboard!')">Copy script to clipboard</button>
    <input id="collab-email" type="email" placeholder="Enter collaborator email">
    <div style="margin-top:5px;font-size:.93em;opacity:0.7;">(Realtime editing requires server)</div>
    <button onclick="document.getElementById('panel-collaboration').classList.add('hidden')">Close</button>
  `;
  panelCollab.classList.remove("hidden");
  panelCollab.focus();
};
let beats = ["FADE IN", "Ordinary World", "Call to Adventure"];
btnBeatBoard.onclick = () => {
  closePanels();
  beatBoardPanel.innerHTML = renderBeatBoard();
  beatBoardPanel.classList.remove("hidden");
  beatBoardPanel.focus();
  setupBeatDrag();
};
function renderBeatBoard() {
  return `<h2>Beat Board</h2>
    <div class="beatboard">
      <div class="beat-add">
        <input id="beat-input" type="text" placeholder="Add new beat...">
        <button onclick="addBeat()">Add</button>
      </div>
      <div class="beatboard-list" id="beatboard-list">
        ${beats.map((b, i) => <div class="beat" draggable="true" data-index="${i}">${b}</div>).join("")}
      </div>
    </div>
    <button onclick="document.getElementById('beatboard-panel').classList.add('hidden')">Close</button>`;
}
window.addBeat = () => {
  const inp = document.getElementById("beat-input");
  if (inp.value.trim()) {
    beats.push(inp.value.trim());
    beatBoardPanel.innerHTML = renderBeatBoard();
    setupBeatDrag();
  }
  inp.value = "";
};
function setupBeatDrag() {
  const beatEls = Array.from(document.querySelectorAll('.beat'));
  let dragIdx = null;
  beatEls.forEach(beat => {
    beat.ondragstart = e => {dragIdx = Number(beat.dataset.index); beat.classList.add('dragging');};
    beat.ondragend = e => {beat.classList.remove('dragging'); dragIdx = null;};
    beat.ondragover = e => e.preventDefault();
    beat.ondrop = e => {
      const targetIdx = Number(beat.dataset.index);
      if (dragIdx === null || dragIdx === targetIdx) return;
      const moved = beats.splice(dragIdx, 1)[0];
      beats.splice(targetIdx, 0, moved);
      beatBoardPanel.innerHTML = renderBeatBoard();
      setupBeatDrag();
    };
  });
}
btnAI.onclick = async () => {
  closePanels();
  aiPanel.innerHTML = `<h2>AI Suggestions</h2>
    <div id="ai-wait" style="margin-bottom:1em;">Thinking…</div>
    <div id="ai-content"></div>
    <button onclick="document.getElementById('ai-panel').classList.add('hidden')">Close</button>`;
  aiPanel.classList.remove("hidden");
  aiPanel.focus();

  const context = editor.value.length > 2000 ? editor.value.slice(-1000) : editor.value;
  let output = '';
  const GEMINI_API_KEY = 'AIzaSyD-NeRs_I-lL8thwQg2fDWnRrYjCQIbJ-g';
  try {
    const resp = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' +
        GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: Screenplay excerpt:\n${context}\nSuggest the next scene or continue the story.
            }]
          }]
        })
      }
    );
    const data = await resp.json();
    output = (data.candidates && data.candidates[0].content.parts[0].text)
      ? data.candidates[0].content.parts[0].text.trim()
      : "(No AI output)";
  } catch (err) {
    output = "[Error] " + err.message;
  }
  document.getElementById('ai-wait').style.display = 'none';
  document.getElementById('ai-content').innerHTML =
    <div style="margin:1em 0;padding:1em 1.2em;background:#feffd9;border-radius:.7em;white-space:pre-wrap;"><em>${output}</em></div>;
};
function showToast(msg, t = 2100) { toast.innerText = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), t); }
function closePanels() { [panelPsych, panelMyth, panelCollab, beatBoardPanel, aiPanel].forEach(p => p.classList.add("hidden")); }
document.addEventListener('keydown', e => {
  if (e.key === "Escape") closePanels();
  if (e.ctrlKey && e.key.toLowerCase() === "p") { btnPsych.click(); e.preventDefault(); }
  if (e.ctrlKey && e.key.toLowerCase() === "m") { btnMyth.click(); e.preventDefault(); }
  if (e.ctrlKey && e.key.toLowerCase() === "c") { btnCollab.click(); e.preventDefault(); }
  if (e.ctrlKey && e.key.toLowerCase() === "b") { btnBeatBoard.click(); e.preventDefault(); }
  if (e.ctrlKey && e.key.toLowerCase() === "a") { btnAI.click(); e.preventDefault(); }
  if (e.ctrlKey && e.key.toLowerCase() === "e") { btnExportPDF.click(); e.preventDefault(); }
});
[panelPsych, panelMyth, panelCollab, beatBoardPanel, aiPanel].forEach(panel => {
  panel.tabIndex = 0; panel.addEventListener('keydown', e => {
    if (e.key === "Escape") { panel.classList.add('hidden'); }
  });
});
window.onload = () => editor.focus();
