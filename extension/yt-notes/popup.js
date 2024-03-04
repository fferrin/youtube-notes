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
  document.getElementById("ytFormattedCurrentTime").innerHTML = formatTime(payload.detail.timestamp)

  window.localStorage.setItem("ytCurrentTime", payload.detail.timestamp)
  window.localStorage.setItem("ytFormattedCurrentTime", formatTime(payload.detail.timestamp))
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
      deleteButton.classList.add('delete-button'); // Add class to the button

      a.href = "#";
      a.textContent = formatTime(timestamp);

      textBetween.textContent = notesInVideo[timestamp];

      // Delete button
      // deleteButton.textContent = "Delete";

      (function (timestamp) {
        deleteButton.addEventListener("click", function () {
          //hide delete button
          deleteButton.style.display = 'none';
          // Remove existing confirmation buttons (if any)
          removeConfirmationButtons(li);
          // Add confirmation buttons
          handleDeleteButtonClick(deleteButton, li, { timestamp, videoId, channelAlias });
          // li.remove();
          // const event = new CustomEvent("noteDeleted", {
          //   detail: { timestamp, videoId, channelAlias },
          // });
          // document.dispatchEvent(event);
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
      let svgTrash = getTrashIcon()
      deleteButton.appendChild(svgTrash);
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
  window.localStorage.setItem("ytTitle", data.title);
  window.localStorage.setItem("ytUrl", data.videoUrl);
  window.localStorage.setItem("ytChannelName", data.channelName);
  window.localStorage.setItem("ytChannelAlias", data.channelAlias);
  window.localStorage.setItem("ytVideoId", data.videoId);
  window.localStorage.setItem("ytImg", data.imgSrc);
  window.localStorage.setItem("ytCurrentTime", data.currentTime);
  window.localStorage.setItem("ytFormattedCurrentTime", formatTime(data.currentTime));
  window.localStorage.setItem("ytTotalTime", data.totalTime);

  document.getElementById("ytTitle").innerHTML = data.title;
  // document.getElementById("ytUrl").innerHTML = data.videoUrl;
  document.getElementById("ytChannelName").innerHTML = data.channelName;
  document.getElementById("ytChannelAlias").innerHTML = data.channelAlias;
  // document.getElementById("ytVideoId").innerHTML = data.videoId;
  document.getElementById("ytImg").src = data.imgSrc;
  document.getElementById("ytFormattedCurrentTime").innerHTML = formatTime(data.currentTime)
  // document.getElementById("ytTotalTime").innerHTML = data.totalTime;
  document
    .getElementById("ytSaveButton")
    .addEventListener("click", function () {
      const note = document.getElementById("ytNote").value;
      // const channelAlias = document.getElementById("ytChannelAlias").innerHTML;
      // const channelName = document.getElementById("ytChannelName").innerHTML;
      // const videoTitle = document.getElementById("ytTitle").innerHTML;
      const timestamp = window.localStorage.getItem("ytCurrentTime");
      const channelAlias = window.localStorage.getItem("ytChannelAlias")
      const channelName = window.localStorage.getItem("ytChannelName")
      const videoTitle = window.localStorage.getItem("ytTitle")
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

function getTrashIcon() {
  // Create SVG element
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('x', '0px');
  svg.setAttribute('y', '0px');

  // Create path element for the trash icon
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute('d', 'M 10 2 L 9 3 L 4 3 L 4 5 L 5 5 L 5 20 C 5 20.522222 5.1913289 21.05461 5.5683594 21.431641 C 5.9453899 21.808671 6.4777778 22 7 22 L 17 22 C 17.522222 22 18.05461 21.808671 18.431641 21.431641 C 18.808671 21.05461 19 20.522222 19 20 L 19 5 L 20 5 L 20 3 L 15 3 L 14 2 L 10 2 z M 7 5 L 17 5 L 17 20 L 7 20 L 7 5 z M 9 7 L 9 18 L 11 18 L 11 7 L 9 7 z M 13 7 L 13 18 L 15 18 L 15 7 L 13 7 z');


  // Append path elements to the svg element
  svg.appendChild(path);
  return svg
}

function getCancelIcon() {
  // Create SVG element
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('x', '0px');
  svg.setAttribute('y', '0px');

  // Create path element for the trash icon
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute('d', 'M 4.7070312 3.2929688 L 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 L 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 L 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 L 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z');


  // Append path elements to the svg element
  svg.appendChild(path);
  return svg
}

function getConfirmIcon() {
  // Create SVG element
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('x', '0px');
  svg.setAttribute('y', '0px');

  // Create path element for the trash icon
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute('d', 'M 20.292969 5.2929688 L 9 16.585938 L 4.7070312 12.292969 L 3.2929688 13.707031 L 9 19.414062 L 21.707031 6.7070312 L 20.292969 5.2929688 z');


  // Append path elements to the svg element
  svg.appendChild(path);
  return svg
}

function removeConfirmationButtons(container) {
  if (!container) return
  var confirmationButtons = container.querySelectorAll('.confirmation-button, .cancel-button');
  confirmationButtons.forEach(function (button) {
    container.removeChild(button);
  });
}

function handleDeleteButtonClick(deleteButton, container, detail) {
  if (!container || !deleteButton) return
  // Create confirmation button ("Yes")
  var yesButton = document.createElement('button');
  // yesButton.textContent = 'Yes';
  let svgConfirm = getConfirmIcon()
  yesButton.appendChild(svgConfirm);
  yesButton.classList.add('confirmation-button');
  yesButton.addEventListener('click', function () {
    // Handle confirmation action (e.g., delete)
    // console.log('Delete confirmed');
    container.remove();
    const event = new CustomEvent("noteDeleted", {
      detail,
    });
    document.dispatchEvent(event);
    // Remove the confirmation buttons
    removeConfirmationButtons(container);
  });

  // Create cancel button ("No")
  var noButton = document.createElement('button');
  // noButton.textContent = 'No';
  let svgCancel = getCancelIcon()
  noButton.appendChild(svgCancel);
  noButton.classList.add('cancel-button');
  noButton.addEventListener('click', function () {
    // Handle cancellation action
    // console.log('Delete canceled');
    // Remove the confirmation buttons
    removeConfirmationButtons(container);
    deleteButton.style.display = 'block';
  });

  // Append buttons to container
  container.appendChild(yesButton);
  container.appendChild(noButton);
}