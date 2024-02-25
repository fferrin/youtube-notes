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

document.addEventListener("noteEdited", async function (payload) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, {
    type: "setVideoTimeTo",
    message: { timestamp: payload.detail.timestamp, channelAlias: payload.detail.channelAlias },
  });
});

document.addEventListener("noteEdited", function (payload) {
  const note = document.getElementById("ytNote");
  note.value = payload.detail.note;
});

document.addEventListener("noteEdited", function (payload) {
  document.getElementById("ytCurrentTime").innerHTML = payload.detail.timestamp;
});

document.addEventListener("noteSaved", function (payload) {
  const { notesInVideo, note, timestamp } = payload.detail;
  const newNotes = { ...notesInVideo, [timestamp]: note };
  window.localStorage.setItem("notes", JSON.stringify(newNotes));
  chrome.storage.local.set({ [payload.detail.videoId]: newNotes });
});

function renderList(videoId, channelAlias) {
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
            detail: { timestamp, channelAlias, videoId, note: notesInVideo[timestamp] },
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

document.addEventListener("videoInfoUpdated", function (payload) {
  const { videoId, currentTime: timestamp } = payload.detail;
  chrome.storage.local.get({ [videoId]: {} }, function (result) {
    const notesInVideo = result[videoId] ?? {};
    const note = document.getElementById("ytNote");
    note.value = notesInVideo[timestamp] ?? "";
  });
});

document.addEventListener("videoInfoUpdated", function (payload) {
  renderList(payload.detail.videoId, payload.detail.channelAlias);
});

document.addEventListener("noteSaved", function (payload) {
  renderList(payload.detail.videoId, payload.detail.channelAlias);
});

document.addEventListener("noteEdited", function (payload) {
  renderList(payload.detail.videoId, payload.detail.channelAlias);
});

document.addEventListener("noteSaved", function (payload) {
  chrome.runtime.sendMessage({ type: "noteSaved", action: "noteSaved" });
});

document.addEventListener("noteEdited", function (payload) {
  chrome.runtime.sendMessage({ type: "noteEdited", action: "noteEdited" });
});

document.addEventListener("noteDeleted", function (payload) {
  chrome.runtime.sendMessage({ type: "noteDeleted", action: "noteDeleted" });
});

document.addEventListener("noteDeleted", function (payload) {
  const notes = JSON.parse(window.localStorage.getItem("notes"));
  delete notes[payload.detail.timestamp];
  window.localStorage.setItem("notes", JSON.stringify(notes));
});

document.addEventListener("noteDeleted", function (payload) {
  chrome.storage.local.get({ [payload.detail.videoId]: {} }, function (result) {
    const notesInVideo = result[payload.detail.videoId] ?? {};
    delete notesInVideo[payload.detail.timestamp];
    chrome.storage.local.set({ [payload.detail.videoId]: notesInVideo });
  });
});

document.addEventListener("videoInfoUpdated", function (payload) {
  chrome.storage.local.get({ [payload.detail.videoId]: {} }, function (result) {
    const notesInVideo = result[payload.detail.videoId] ?? {};
    window.localStorage.setItem("notes", JSON.stringify(notesInVideo));
  });
});

// DOM Manipulation
document.addEventListener("videoInfoUpdated", function (payload) {
  const { detail: data } = payload;
  document.getElementById("ytTitle").innerHTML = data.title;
  document.getElementById("ytUrl").innerHTML = data.videoUrl;
  document.getElementById("ytChannelName").innerHTML = data.channelName;
  document.getElementById("ytChannelAlias").innerHTML = data.channelAlias;
  document.getElementById("ytVideoId").innerHTML = data.videoId;
  document.getElementById("ytImg").src = data.imgSrc;
  document.getElementById("ytCurrentTime").innerHTML = data.currentTime;
  document.getElementById("ytTotalTime").innerHTML = data.totalTime;
  document
    .getElementById("ytSaveButton")
    .addEventListener("click", function () {
      const note = document.getElementById("ytNote").value;
      const timestamp = document.getElementById("ytCurrentTime").innerHTML;
      const channelAlias = document.getElementById("ytChannelAlias").innerHTML;
      const channelName = document.getElementById("ytChannelName").innerHTML;
      const videoTitle = document.getElementById("ytTitle").innerHTML;
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
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "videoInfoUpdated":
      const event = new CustomEvent("videoInfoUpdated", {
        detail: request.message,
      });
      document.dispatchEvent(event);
  }
});

// On DOMContentLoaded, send request to content.js and dispatch event with data
document.addEventListener("DOMContentLoaded", async function () {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, { type: "requestVideoInfo" });
});

document.addEventListener("noteSaved", function (payload) {
  chrome.storage.local.get([payload.detail.channelAlias], function (result) {
    const videosInChannel = result[payload.detail.channelAlias] ?? {};
    videosInChannel[payload.detail.videoId] = payload.detail.videoTitle;
    chrome.storage.local.set({
      [payload.detail.channelAlias]: videosInChannel,
    });
  });
});

document.addEventListener("noteSaved", function (payload) {
  chrome.storage.local.get(["channels"], function (result) {
    const channels = result["channels"] ?? {};
    if (!(payload.detail.channelAlias in channels)) {
      channels[payload.detail.channelAlias] = payload.detail.channelName;
      chrome.storage.local.set({ channels: channels });
    }
  });
});

document.addEventListener("noteDeleted", function (payload) {
  chrome.storage.local.get([payload.detail.videoId], function (result) {
    const notesInVideo = result[payload.detail.videoId] ?? {};
    delete notesInVideo[payload.detail.timestamp];

    if (Object.entries(notesInVideo).length === 0) {
      chrome.storage.local.remove([payload.detail.videoId]);
    }
  });
});

document.addEventListener("noteDeleted", function (payload) {
  chrome.storage.local.get([payload.detail.videoId], function (result) {
    const notesInVideo = result[payload.detail.videoId] ?? {};
    delete notesInVideo[payload.detail.timestamp];

    if (Object.entries(notesInVideo).length === 0) {
      chrome.storage.local.remove([payload.detail.videoId]);

      const channelAlias = payload.detail.channelAlias
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
});
