// ====== Configuration ======
const BCIT_BASE_URL = "https://learn.bcit.ca/d2l/le/content/";
const VALID_PATH_LENGTHS = [3, 4];

// ====== Initialization ======
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Service worker initialized");
});

// ====== URL Pattern Matching ======
function matchesBCITPattern(url) {
  if (!url || !url.startsWith(BCIT_BASE_URL)) {
    return false;
  }

  const pathSegments = extractPathSegments(url);
  return VALID_PATH_LENGTHS.includes(pathSegments.length);
}

function extractPathSegments(url) {
  const pathAfterBase = url.substring(BCIT_BASE_URL.length);
  const cleanPath = pathAfterBase.replace(/\/$/, "");
  return cleanPath.split("/").filter((segment) => segment.length > 0);
}

// ====== ID Extraction ======
function extractIdsFromUrl(url) {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname
      .split("/")
      .filter((segment) => segment.length > 0);

    const courseId = pathSegments[3];
    const resourceId = pathSegments[5];

    if (!isValidId(courseId) || !isValidId(resourceId)) {
      console.warn("Invalid IDs extracted:", { courseId, resourceId });
      return null;
    }

    return { courseId, resourceId };
  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
}

function isValidId(id) {
  return id && /^\d+$/.test(id);
}

// ====== URL Construction ======
function buildDownloadUrl(courseId, resourceId) {
  return `https://learn.bcit.ca/d2l/le/content/${courseId}/topics/files/download/${resourceId}/DirectFileTopicDownload`;
}

// ====== Script Injection ======
async function injectContentScript(tabId, downloadUrl) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: initializeContentScript,
      args: [downloadUrl],
    });
    console.log("Content script injected successfully");
  } catch (error) {
    console.error("Error injecting content script:", error);
    throw error;
  }
}

// ====== Tab Event Handlers ======
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) {
    return;
  }

  console.log("🔍 Tab updated:", tab.url);

  if (!matchesBCITPattern(tab.url)) {
    console.log("URL doesn't match pattern, skipping");
    return;
  }

  const ids = extractIdsFromUrl(tab.url);
  if (!ids) {
    console.error("Failed to extract IDs from URL");
    return;
  }

  const downloadUrl = buildDownloadUrl(ids.courseId, ids.resourceId);
  await injectContentScript(tabId, downloadUrl);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    if (tab.url && matchesBCITPattern(tab.url)) {
      console.log("✅ Activated tab matches pattern:", tab.url);
    }
  } catch (error) {
    console.error("❌ Error checking activated tab:", error);
  }
});

// ============================================
// CONTENT SCRIPT (Injected Function)
// ============================================

function initializeContentScript(downloadUrl) {
  if (window.hubSummerizerInjected) {
    console.log("Hub Summarizer already injected, skipping");
    return;
  }

  window.hubSummerizerInjected = true;

  const state = {
    popup: {
      isMinimized: false,
      isExpanded: false,
      hasSummarized: false,
      summaryText: "",
      isLoading: false,
    },
    position: {
      button: { bottom: "20px", right: "20px" },
      popup: { side: "right" },
    },
  };

  // ====== Fetch + Spinner Control ======
  function fetchContent(url) {
    setLoading(true);

    fetch(url)
      .then(async (response) => {
        state.popup.hasSummarized = true;
        const arrayBuffer = await response.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);

        const form = new FormData();
        form.append(
          "file",
          new Blob([uint8], { type: "application/pdf" }),
          "doc.pdf"
        );

        const summaryResponse = await fetch(
          "http://localhost:3000/buffer-to-text",
          {
            method: "POST",
            body: form,
          }
        );

        const data = await summaryResponse.json();
        setLoading(false);
        return data.text;
      })
      .then((text) => {
        const popupSummaryElement = document.getElementById("summaryText");
        if (popupSummaryElement) popupSummaryElement.innerHTML = text;

        state.popup.summaryText = text;

        // [FIXED END LOADING] stop spinner after text is set
        setLoading(false); // small delay ensures DOM update
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setLoading(false); // stop spinner if failed too
      });
  }

  // Spinner toggle
  function setLoading(isLoading) {
    state.popup.isLoading = isLoading;

    const mainBtn = document.getElementById("summarizeBtn");
    if (mainBtn !== null) {
      mainBtn.disabled = isLoading;
      const spin = document.getElementById("summarizeBtnSpinner");
      const label = document.getElementById("summarizeBtnLabel");
      if (spin) spin.style.display = isLoading ? "inline-block" : "none";
      if (label) label.style.opacity = isLoading ? "0.6" : "1";
    }

    const miniBar = document.getElementById("miniBar");
    if (miniBar !== null) {
      const miniBtn = [...miniBar.querySelectorAll("button")].find((b) =>
        b.textContent.includes("Summarize")
      );
      if (miniBtn !== null) {
        miniBtn.disabled = isLoading;
        const miniSpin = miniBtn.querySelector(".miniSummarizeSpinner");
        const miniLabel = miniBtn.querySelector(".miniSummarizeLabel");
        if (miniSpin)
          miniSpin.style.display = isLoading ? "inline-block" : "none";
        if (miniLabel) miniLabel.style.opacity = isLoading ? "0.6" : "1";
      }
    }

    const popupSpin = document.getElementById("popupSpinner");
    if (popupSpin !== null)
      popupSpin.style.display = isLoading ? "block" : "none";
  }

  // ====== UI ======
  function loadExternalResources() {
    loadStylesheet(
      "bootstrap-css",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
    );
    loadStylesheet(
      "bootstrap-icons",
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
    );
  }

  function loadStylesheet(id, href) {
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }

  function createSummarizeButton() {
    if (state.popup.hasSummarized || document.getElementById("summarizeBtn"))
      return;

    loadExternalResources();

    const btn = document.createElement("button");
    btn.id = "summarizeBtn";
    btn.className = "btn btn-primary d-flex align-items-center gap-2";
    btn.innerHTML = `
      <span id="summarizeBtnSpinner" class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:none;"></span>
      <i class="bi bi-lightning-charge-fill"></i>
      <span id="summarizeBtnLabel">Summarize</span>
    `;

    Object.assign(btn.style, {
      position: "fixed",
      bottom: state.position.button.bottom,
      right: state.position.button.right,
      zIndex: "1000",
    });

    btn.addEventListener("click", handleSummarizeClick);
    document.body.appendChild(btn);
  }

  function handleSummarizeClick() {
    openSummaryPopup();
    removeSummarizeButton();
  }

  function removeSummarizeButton() {
    const btn = document.getElementById("summarizeBtn");
    if (btn) btn.remove();
  }

  function openSummaryPopup() {
    if (document.getElementById("summaryPopup")) return;

    const popup = createPopupElement();
    document.body.appendChild(popup);
    attachPopupEventListeners();
    state.popup.isExpanded = true;

    if (state.popup.isLoading) {
      const popupSpin = document.getElementById("popupSpinner");
      if (popupSpin) popupSpin.style.display = "block";
    }
  }

  function createPopupElement() {
    const popup = document.createElement("div");
    popup.id = "summaryPopup";
    popup.className = "shadow-lg bg-white border rounded";
    Object.assign(popup.style, {
      position: "fixed",
      zIndex: "2000",
      top: "10px",
      height: "calc(100vh - 60px)",
      width: "33vw",
      right: "10px",
    });
    popup.innerHTML = getPopupHTML();
    return popup;
  }

  function getPopupHTML() {
    return `
      <div class="d-flex justify-content-between align-items-center border-bottom p-2 bg-light">
        <div class="d-flex align-items-center gap-2">
          <img src="https://via.placeholder.com/30" class="rounded" alt="Logo">
          <strong>Summary</strong>
        </div>
        <div class="d-flex gap-2">
          <button id="reloadBtn" class="btn btn-sm btn-outline-secondary"><i class="bi bi-arrow-clockwise"></i></button>
          <button id="minimizeBtn" class="btn btn-sm btn-outline-secondary"><i class="bi bi-dash"></i></button>
        </div>
      </div>
      <div id="popupContent" class="p-3" style="height: calc(100% - 90px); overflow-y: auto;">
        <div id="popupSpinner" class="d-flex justify-content-center my-3" style="display:none;">
          <div class="spinner-border" role="status" aria-label="Loading"></div>
        </div>
        <p id="summaryText">${state.popup.summaryText}</p>
      </div>
      <div class="border-top p-2 text-end" style="position: absolute; bottom: 0; width: 100%;">
        <button id="downloadBtn" class="btn btn-success"><i class="bi bi-download"></i> Download</button>
      </div>
    `;
  }

  function attachPopupEventListeners() {
    document
      .getElementById("minimizeBtn")
      ?.addEventListener("click", minimizePopup);
    document
      .getElementById("reloadBtn")
      ?.addEventListener("click", reloadPopup);
    document
      .getElementById("downloadBtn")
      ?.addEventListener("click", downloadSummary);
  }

  function minimizePopup() {
    closePopup();
    state.popup.isMinimized = true;
    state.popup.isExpanded = false;
    createMiniBar();
  }

  function closePopup() {
    const popup = document.getElementById("summaryPopup");
    state.popup.hasSummarized = false;
    if (popup) popup.remove();
  }

  function reloadPopup() {
    updatePopupContent(
      `<p>Reloaded at ${new Date().toLocaleTimeString()}.</p>`
    );
  }

  function updatePopupContent(html) {
    const content = document.getElementById("popupContent");
    if (content) content.innerHTML = html;
  }

  function createMiniBar() {
    removeMiniBar();

    const bar = document.createElement("div");
    bar.id = "miniBar";
    bar.className = "btn-group shadow";
    Object.assign(bar.style, {
      position: "fixed",
      bottom: state.position.button.bottom,
      right: state.position.button.right,
      zIndex: "1500",
    });

    bar.appendChild(
      createMiniBarButton(
        `<span class="spinner-border spinner-border-sm miniSummarizeSpinner" style="display:none;" role="status" aria-hidden="true"></span> <span class="miniSummarizeLabel">Summarize</span>`,
        "btn-primary",
        handleSummarizeAgain
      )
    );
    bar.appendChild(
      createMiniBarButton(
        '<i class="bi bi-arrows-angle-expand"></i>',
        "btn-outline-primary",
        expandPopup
      )
    );
    document.body.appendChild(bar);
  }

  function createMiniBarButton(content, className, onClick) {
    const btn = document.createElement("button");
    btn.className = `btn ${className}`;
    btn.innerHTML = content;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function removeMiniBar() {
    const bar = document.getElementById("miniBar");
    if (bar) bar.remove();
  }

  function expandPopup() {
    removeMiniBar();
    openSummaryPopup();
    state.popup.isMinimized = false;
    state.popup.isExpanded = true;
  }

  function handleSummarizeAgain() {
    state.popup.hasSummarized = true;
    expandPopup();
    fetchContent(downloadUrl);
  }

  function downloadSummary() {
    fetchContent(downloadUrl);
    const blob = new Blob([state.popup.summaryText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "summary.txt";
    link.click();
  }

  fetchContent(downloadUrl);
  createSummarizeButton();
}
