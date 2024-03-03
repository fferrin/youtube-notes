function formatNumber(value) {
  return value.toString().padStart(2, "0");
}

function formatTime(seconds) {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  var seconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return [
      formatNumber(hours),
      formatNumber(minutes),
      formatNumber(seconds),
    ].join(":");
  } else {
    return [formatNumber(minutes), formatNumber(seconds)].join(":");
  }
}

async function sendMessageToChangeVideoTime(payload) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, {
    type: "setVideoTimeTo",
    message: {
      timestamp: payload.detail.timestamp,
      channelAlias: payload.detail.channelAlias,
    },
  });
}

function setNoteValueInTextArea(payload) {
  const note = document.getElementById("ytNote");
  note.value = payload.detail.note;
}

function saveCurrentTimeInLocalStorage(payload) {
  document.getElementById("ytFormattedCurrentTime").innerHTML = formatTime(
    payload.detail.timestamp
  );

  window.localStorage.setItem("ytCurrentTime", payload.detail.timestamp);
  window.localStorage.setItem(
    "ytFormattedCurrentTime",
    formatTime(payload.detail.timestamp)
  );
}

function saveUpdatedNotesInLocalStorage(payload) {
  const { notesInVideo, note, timestamp } = payload.detail;
  const newNotes = { ...notesInVideo, [timestamp]: note };
  window.localStorage.setItem("notes", JSON.stringify(newNotes));
  chrome.storage.local.set({ [payload.detail.videoId]: newNotes });
}

function renderList(videoId, channelAlias) {
  console.info("renderList");
  chrome.storage.local.get({ [videoId]: {} }, function (result) {
    const notesInVideo = result[videoId] ?? {};
    var ulElement = document.getElementById("ytNotes");
    ulElement.innerHTML = "";

    for (var timestamp in notesInVideo) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      const textBetween = document.createElement("span");
      const deleteButton = document.createElement("button");

      a.href = "#";
      a.textContent = formatTime(timestamp);

      textBetween.textContent = notesInVideo[timestamp];

      // Delete button
      deleteButton.textContent = "Delete";

      (function (timestamp) {
        deleteButton.addEventListener("click", function () {
          li.remove();
          const event = new CustomEvent("noteDeleted", {
            detail: { timestamp, videoId, channelAlias },
          });
          document.dispatchEvent(event);
        });
      })(timestamp);

      (function (timestamp) {
        a.addEventListener("click", function () {
          const event = new CustomEvent("noteEdited", {
            detail: {
              timestamp,
              channelAlias,
              videoId,
              note: notesInVideo[timestamp],
            },
          });
          document.dispatchEvent(event);
        });
      })(timestamp);

      li.appendChild(a);
      li.appendChild(textBetween);
      li.appendChild(deleteButton);

      ulElement.appendChild(li);
    }
  });
}

function updateNoteTextAreaFromStorage(payload) {
  const { videoId, currentTime: timestamp } = payload.detail;
  chrome.storage.local.get({ [videoId]: {} }, function (result) {
    const notesInVideo = result[videoId] ?? {};
    const note = document.getElementById("ytNote");
    note.value = notesInVideo[timestamp] ?? "";
  });
}

function renderListFromPayload(payload) {
  renderList(payload.detail.videoId, payload.detail.channelAlias);
}

function sendMessageToBackground(eventName) {
  chrome.runtime.sendMessage({ type: eventName, action: eventName });
}

function deleteNoteFromLocalStorage(payload) {
  const notes = JSON.parse(window.localStorage.getItem("notes"));
  delete notes[payload.detail.timestamp];
  window.localStorage.setItem("notes", JSON.stringify(notes));
}

function deleteNoteFromStorage(payload) {
  chrome.storage.local.get({ [payload.detail.videoId]: {} }, function (result) {
    const notesInVideo = result[payload.detail.videoId] ?? {};
    delete notesInVideo[payload.detail.timestamp];
    chrome.storage.local.set({ [payload.detail.videoId]: notesInVideo });
  });
}

function saveNotesInLocalStorage(payload) {
  chrome.storage.local.get({ [payload.detail.videoId]: {} }, function (result) {
    const notesInVideo = result[payload.detail.videoId] ?? {};
    window.localStorage.setItem("notes", JSON.stringify(notesInVideo));
  });
}

function updateDOM(payload) {
  const { detail: data } = payload;
  window.localStorage.setItem("ytTitle", data.title);
  window.localStorage.setItem("ytUrl", data.videoUrl);
  window.localStorage.setItem("ytChannelName", data.channelName);
  window.localStorage.setItem("ytChannelAlias", data.channelAlias);
  window.localStorage.setItem("ytVideoId", data.videoId);
  window.localStorage.setItem("ytImg", data.imgSrc);
  window.localStorage.setItem("ytCurrentTime", data.currentTime);
  window.localStorage.setItem(
    "ytFormattedCurrentTime",
    formatTime(data.currentTime)
  );
  window.localStorage.setItem("ytTotalTime", data.totalTime);

  document.getElementById("ytTitle").innerHTML = data.title;
  document.getElementById("ytChannelName").innerHTML = data.channelName;
  document.getElementById("ytChannelAlias").innerHTML = data.channelAlias;
  document.getElementById("ytImg").src = data.imgSrc;
  document.getElementById("ytFormattedCurrentTime").innerHTML = formatTime(
    data.currentTime
  );
  document
    .getElementById("ytSaveButton")
    .addEventListener("click", function () {
      const note = document.getElementById("ytNote").value;
      const timestamp = window.localStorage.getItem("ytCurrentTime");
      const channelAlias = window.localStorage.getItem("ytChannelAlias");
      const channelName = window.localStorage.getItem("ytChannelName");
      const videoTitle = window.localStorage.getItem("ytTitle");
      const notesInVideo = JSON.parse(window.localStorage.getItem("notes"));
      document.dispatchEvent(
        new CustomEvent("noteSaved", {
          detail: {
            videoId: data.videoId,
            note,
            timestamp,
            channelAlias,
            channelName,
            videoTitle,
            notesInVideo,
          },
        })
      );
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "videoInfoUpdated":
      const event = new CustomEvent("videoInfoUpdated", {
        detail: request.message,
      });
      document.dispatchEvent(event);
  }
});

function updateVideosInChannelInStorage(payload) {
  chrome.storage.local.get([payload.detail.channelAlias], function (result) {
    const videosInChannel = result[payload.detail.channelAlias] ?? {};
    videosInChannel[payload.detail.videoId] = payload.detail.videoTitle;
    chrome.storage.local.set({
      [payload.detail.channelAlias]: videosInChannel,
    });
  });
}

function updateChannelsInStorage(payload) {
  chrome.storage.local.get(["channels"], function (result) {
    const channels = result["channels"] ?? {};
    if (!(payload.detail.channelAlias in channels)) {
      channels[payload.detail.channelAlias] = payload.detail.channelName;
      chrome.storage.local.set({ channels: channels });
    }
  });
}

async function requestVideoInfoToPage() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, { type: "requestVideoInfo" });
}

function deleteNoteFromVideoInStorage(payload) {
  chrome.storage.local.get([payload.detail.videoId], function (result) {
    const notesInVideo = result[payload.detail.videoId] ?? {};
    delete notesInVideo[payload.detail.timestamp];

    if (Object.entries(notesInVideo).length === 0) {
      chrome.storage.local.remove([payload.detail.videoId]);
    }
  });
}

function cleanStorageOnDelete(payload) {
  chrome.storage.local.get([payload.detail.videoId], function (result) {
    const notesInVideo = result[payload.detail.videoId] ?? {};
    delete notesInVideo[payload.detail.timestamp];

    if (Object.entries(notesInVideo).length === 0) {
      chrome.storage.local.remove([payload.detail.videoId]);

      const channelAlias = payload.detail.channelAlias;
      chrome.storage.local.get([channelAlias], function (result) {
        const videosInChannel = result[channelAlias] ?? {};
        delete videosInChannel[payload.detail.videoId];

        if (Object.entries(videosInChannel).length == 0) {
          chrome.storage.local.remove([channelAlias]);

          chrome.storage.local.get(["channels"], function (result) {
            const channels = result["channels"] ?? {};
            delete channels[channelAlias];
            chrome.storage.local.set({ channels });
          });
        } else {
          chrome.storage.local.set({ [channelAlias]: videosInChannel });
        }
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", requestVideoInfoToPage);
document.addEventListener("noteDeleted", (payload) => {
  sendMessageToBackground("noteDeleted");
  cleanStorageOnDelete(payload);
  deleteNoteFromLocalStorage(payload);
  deleteNoteFromStorage(payload);
  deleteNoteFromVideoInStorage(payload);
});
document.addEventListener("noteEdited", (payload) => {
  sendMessageToBackground("noteEdited");
  saveCurrentTimeInLocalStorage(payload);
  sendMessageToChangeVideoTime(payload);
  setNoteValueInTextArea(payload);
  renderListFromPayload(payload);
});
document.addEventListener("noteSaved", (payload) => {
  sendMessageToBackground("noteSaved");
  saveUpdatedNotesInLocalStorage(payload);
  updateChannelsInStorage(payload);
  updateVideosInChannelInStorage(payload);
  renderListFromPayload(payload);
});
document.addEventListener("videoInfoUpdated", (payload) => {
  saveNotesInLocalStorage(payload);
  updateDOM(payload);
  updateNoteTextAreaFromStorage(payload);
  renderListFromPayload(payload);
});
