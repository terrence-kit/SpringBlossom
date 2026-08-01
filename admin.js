const imageSlots = [
  ["Interior / hero", "INTERIOR.png"], ["Food photo 1", "FOOD_1.png"],
  ["Food photo 2", "FOOD_2.png"], ["Cocktail photo", "COCKTAIL.png"],
  ["Menu: Spirits & Beer", "11 (3).png"], ["Menu: Beverages", "12 (3).png"],
  ["Menu: Breakfast", "13 (3).png"], ["Menu: Cocktails", "14 (3).png"],
  ["Menu: Filipino dishes", "15 (3).png"], ["Menu: Pica-pica", "16 (3).png"],
  ["Menu: Korean sets", "17 (3).png"], ["Menu: Korean dishes", "18 (3).png"],
  ["Website QR", "WEBSITE QR.png"], ["Facebook QR", "FACEBOOK QR.png"],
  ["Instagram QR", "INSTAGRAM QR.png"]
];

const loginView = document.querySelector("#login-view");
const dashboard = document.querySelector("#dashboard");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const editor = document.querySelector("#html-editor");
const preview = document.querySelector("#site-preview");
const htmlMessage = document.querySelector("#html-message");
const imageMessage = document.querySelector("#image-message");
const saveButton = document.querySelector("#save-html");
let currentSha = "";

const showMessage = (element, text, type = "") => {
  element.textContent = text;
  element.className = `form-message ${type}`.trim();
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Something went wrong.");
    error.status = response.status;
    throw error;
  }
  return data;
};

const refreshPreview = () => {
  const html = editor.value.replace(/<head([^>]*)>/i, '<head$1><base href="/">');
  preview.srcdoc = html;
};

const loadContent = async () => {
  showMessage(htmlMessage, "Loading the latest version…");
  const data = await request("/api/content");
  editor.value = data.html;
  currentSha = data.sha;
  refreshPreview();
  showMessage(htmlMessage, "Latest version loaded.");
};

const openDashboard = async () => {
  loginView.hidden = true;
  dashboard.hidden = false;
  try {
    await loadContent();
  } catch (error) {
    if (error.status === 401) {
      loginView.hidden = false;
      dashboard.hidden = true;
    } else {
      showMessage(htmlMessage, error.message, "error");
    }
  }
};

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = loginForm.querySelector("button");
  button.disabled = true;
  showMessage(loginMessage, "Signing in…");
  try {
    await request("/api/session", { method: "POST", body: JSON.stringify({ username: loginForm.username.value, password: loginForm.password.value }) });
    loginForm.reset();
    showMessage(loginMessage, "");
    await openDashboard();
  } catch (error) {
    showMessage(loginMessage, error.message, "error");
  } finally {
    button.disabled = false;
  }
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  await request("/api/session", { method: "DELETE" }).catch(() => {});
  dashboard.hidden = true;
  loginView.hidden = false;
});

document.querySelectorAll(".admin-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach(item => item.classList.toggle("active", item === tab));
    document.querySelectorAll(".admin-panel").forEach(panel => panel.classList.toggle("active", panel.id === tab.dataset.panel));
  });
});

document.querySelector("#preview-button").addEventListener("click", refreshPreview);
const findInput = document.querySelector("#find-text");
const findWebsiteText = () => {
  const term = findInput.value.trim();
  if (!term) {
    showMessage(htmlMessage, "Type the website words you want to find.", "error");
    findInput.focus();
    return;
  }
  const start = Math.max(editor.selectionEnd, 0);
  let index = editor.value.toLowerCase().indexOf(term.toLowerCase(), start);
  if (index < 0) index = editor.value.toLowerCase().indexOf(term.toLowerCase());
  if (index < 0) {
    showMessage(htmlMessage, `Could not find “${term}” in index.html.`, "error");
    return;
  }
  editor.focus();
  editor.setSelectionRange(index, index + term.length);
  const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 20;
  editor.scrollTop = Math.max(0, editor.value.slice(0, index).split("\n").length * lineHeight - editor.clientHeight / 3);
  showMessage(htmlMessage, "Text found and selected. Type the replacement, then refresh the preview.", "success");
};
document.querySelector("#find-button").addEventListener("click", findWebsiteText);
findInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    findWebsiteText();
  }
});
document.querySelector("#reload-source").addEventListener("click", async () => {
  if (editor.value && !window.confirm("Reload the latest original source? Any unsaved edits will be lost.")) return;
  try {
    await loadContent();
    showMessage(htmlMessage, "The complete source was reloaded from GitHub.", "success");
  } catch (error) {
    showMessage(htmlMessage, error.message, "error");
  }
});

saveButton.addEventListener("click", async () => {
  if (!editor.value.trim().toLowerCase().includes("<!doctype html>")) {
    showMessage(htmlMessage, "This does not look like a complete HTML page.", "error");
    return;
  }
  saveButton.disabled = true;
  showMessage(htmlMessage, "Saving to GitHub…");
  try {
    const data = await request("/api/content", { method: "PUT", body: JSON.stringify({ html: editor.value, sha: currentSha }) });
    currentSha = data.sha;
    showMessage(htmlMessage, "Saved. Vercel should publish it in a minute or two.", "success");
  } catch (error) {
    showMessage(htmlMessage, error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
});

const fileToBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(",")[1]);
  reader.onerror = () => reject(new Error("Could not read that file."));
  reader.readAsDataURL(file);
});

const imageGrid = document.querySelector("#image-grid");
imageSlots.forEach(([label, path], index) => {
  const card = document.createElement("article");
  card.className = "image-card";
  card.innerHTML = `<img src="${encodeURI(path)}" alt="${label}"><div class="image-card-body"><h3>${label}</h3><small>${path}</small><input id="image-${index}" type="file" accept="image/png"><label for="image-${index}">Choose replacement</label></div>`;
  const input = card.querySelector("input");
  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;
    if (file.type !== "image/png") {
      showMessage(imageMessage, "Please choose a PNG image.", "error");
      input.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showMessage(imageMessage, "Please choose an image smaller than 3 MB.", "error");
      input.value = "";
      return;
    }
    input.disabled = true;
    showMessage(imageMessage, `Uploading ${label}…`);
    try {
      const content = await fileToBase64(file);
      await request("/api/image", { method: "PUT", body: JSON.stringify({ path, content, mime: file.type }) });
      card.querySelector("img").src = `${encodeURI(path)}?v=${Date.now()}`;
      showMessage(imageMessage, `${label} was replaced. Vercel will publish it shortly.`, "success");
    } catch (error) {
      showMessage(imageMessage, error.message, "error");
    } finally {
      input.disabled = false;
      input.value = "";
    }
  });
  imageGrid.appendChild(card);
});

// Always begin a fresh visit at the credential form. A successful sign-in opens
// the dashboard; an old session cookie must never skip this screen.
loginView.hidden = false;
dashboard.hidden = true;
