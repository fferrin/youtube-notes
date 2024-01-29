// Debug
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function debug(message, value) {
  console.error(getCurrentTime() + " | " + message + " : " + value);
}

const youtube = "https://www.youtube.com/watch";

// Chrome APIs
async function getCurrentTabUrl() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  return tabs && tabs.length > 0 ? tabs[0].url : null;
}

async function getFromStorage(key) {
  const value = await chrome.storage.local.get(key)
  return value ?? {};
}

// Helpers
function getVideoDetails(url) {
  const params = new URL(url).searchParams;
  return {
    videoId: params.get("v"),
  };
}

async function updateBadgeForUrl() {
  const url = await getCurrentTabUrl();
  let badge = "";
  if (url.startsWith("https://www.youtube.com/watch")) {
    const { videoId } = getVideoDetails(url);
    const notes = await getFromStorage(videoId);
    badge = Object.entries(notes).length;
  }
  setBadge(badge);
}

chrome.tabs.onUpdated.addListener(updateBadgeForUrl);
chrome.tabs.onActivated.addListener(updateBadgeForUrl);

function setBadge(text) {
  if (typeof text !== "string") {
    text = String(text);
  }
  chrome.action.setBadgeText({ text });
}
