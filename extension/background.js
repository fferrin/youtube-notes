
const YOUTUBE = "https://www.youtube.com/watch";

// Chrome APIs
async function getCurrentTabUrl() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs && tabs.length > 0 ? tabs[0].url : null;
}

async function getFromStorage(key) {
  const value = await chrome.storage.local.get(key);
  return value[key] ?? {};
}

// Helpers
function getVideoIdFromUrl(url) {
  return new URL(url).searchParams.get("v");
}

async function updateBadgeForUrl() {
  const url = await getCurrentTabUrl();
  let badge = "";
  if (url.startsWith(YOUTUBE)) {
    const videoId = getVideoIdFromUrl(url);
    const notes = await getFromStorage(videoId);
    badge = Object.entries(notes).length;
  }
  setBadge(badge);
}

function messageReceivedEvent(message) {
  switch (message.action) {
    case "noteSaved":
    case "noteEdited":
    case "noteCreated":
    case "noteUpdated":
    case "noteDeleted":
    case "ytPageUpdated":
      updateBadgeForUrl();
      break;
  }
}

function handleSeek(seconds) {
  document.getElementById("movie_player").seekTo(seconds);
}

chrome.tabs.onUpdated.addListener(updateBadgeForUrl);
chrome.tabs.onActivated.addListener(updateBadgeForUrl);
chrome.runtime.onMessage.addListener(messageReceivedEvent);

function setBadge(text) {
  chrome.action.setBadgeText({ text: String(text) });
}
