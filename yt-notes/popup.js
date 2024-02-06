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

const getVideoInfoFromPage = () => {
  const imgSrc = document.querySelector("ytd-video-owner-renderer yt-img-shadow#avatar img#img").src
  const title = document.querySelector("#above-the-fold div#title yt-formatted-string").textContent
  const channelName = document
    .querySelector("#top-row #text")
    .getAttribute("title");
  const channelAlias = document
    .querySelector("#top-row #text a")
    .getAttribute("href")
    .split("/")
    .at(-1);
  const videoId = document.querySelector("ytd-page-manager#page-manager ytd-watch-flexy").getAttribute("video-id")
  const currentTime = Math.floor(document.querySelector("video").currentTime);
  const totalTime = Math.floor(document.querySelector("video").duration);

  return {
    title,
    currentTime,
    totalTime,
    videoId,
    imgSrc,
    channelName,
    channelAlias,
  };
};

function seekTo(seconds) {
  // document.getElementById("movie_player").seekTo(seconds);
  document.getElementsByTagName("video")[0].currentTime = seconds;
}

async function removeNoteFromStorage(videoId, timestamp) {
  const notes = await chrome.storage.local.get([videoId]);
  delete notes[videoId][timestamp];
  await chrome.storage.local.set({ [videoId]: notes[videoId] });
  chrome.runtime.sendMessage({ action: "noteDeleted" });
}

async function updateNotes(videoId) {
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
          console.log(`Delete clicked for: ${timestamp}`);
          removeNoteFromStorage(videoId, timestamp);
          li.remove();
        });
      })(timestamp);

      (function (timestamp) {
        a.addEventListener("click", function (event) {
          event.preventDefault();

          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              var currentTab = tabs[0];

              chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: seekTo,
                args: [timestamp],
              });
            }
          );
          note.value = notesInVideo[timestamp];
        });
      })(timestamp);

      li.appendChild(a);
      li.appendChild(textBetween);
      li.appendChild(deleteButton);

      ulElement.appendChild(li);
    }
  });
}

function messageReceivedEvent(message) {
  switch (message.action) {
    case "ytNavigateFinish":
      console.error("ytNavigateFinish en el popup");
      console.error(JSON.parse(message.data));
  }
}
chrome.runtime.onMessage.addListener(messageReceivedEvent);

async function getVideoInfo() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];

  chrome.scripting.executeScript(
    {
      target: { tabId: currentTab.id },
      func: getVideoInfoFromPage,
    },
    (result) => {
      const r = result[0].result;
      document.getElementById("ytTitle").innerText = r.title;
      document.getElementById("ytUrl").innerText = currentTab.url;
      document.getElementById("ytCurrentTime").innerText = r.currentTime;
      document.getElementById("ytTotalTime").innerText = r.totalTime;
      document.getElementById("ytChannelAlias").innerText = r.channelAlias;
      document.getElementById("ytChannelName").innerText = r.channelName;
      document.getElementById("ytVideoId").innerText = r.videoId;
      document.getElementById("ytImg").src = r.imgSrc;

      window.localStorage.setItem("ytTitle", r.title);
      window.localStorage.setItem("ytUrl", currentTab.url);
      window.localStorage.setItem("ytCurrentTime", r.currentTime);
      window.localStorage.setItem("ytTotalTime", r.totalTime);
      window.localStorage.setItem("ytChannelAlias", r.channelAlias);
      window.localStorage.setItem("ytChannelName", r.channelName);
      window.localStorage.setItem("ytVideoId", r.videoId);
    }
  );
}

document.addEventListener("yt-navigate-finish", function () {
  // Handle the event when the page navigation finishes
  console.error("NEW VIDEO PAGE LOADED. FETCH NEW TAG INFORMATION HERE.");
  getVideoInfo();
  let counter = window.localStorage.getItem("counter") ?? 0;
  window.localStorage.setItem("counter", counter + 1);

  // Your logic to fetch and process the new video tags
  // ...
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === "ytPageUpdated") {
    //  To do something
    console.log(request.data.subject);
    console.log(request.data.content);
    window.localStorage.setItem("MENSAJE", request.data.content);
  }
});

async function sendMessageToContentScript(message) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  chrome.tabs.sendMessage(activeTab.id, {
    type: "popup-to-content",
    message: message,
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  console.warn("POR ENVIAR MENSAJE AL SCRIPT");
  await sendMessageToContentScript("PASAME LOS DATOS");
  console.warn("MENSAJE ENVIADO");
  const saveButton = document.getElementById("ytSaveButton");
  const note = document.getElementById("ytNote");
  const title = document.getElementById("ytTitle");
  const url = document.getElementById("ytUrl");
  const channelName = document.getElementById("ytChannelName");
  const channelAlias = document.getElementById("ytChannelAlias");
  const videoId = document.getElementById("ytVideoId");
  const currentTime = document.getElementById("ytCurrentTime");

  const videoIdText = window.localStorage.getItem("ytVideoId");
  function dispatchNotesUpdatedEvent(videoIdParam) {
    const event = new CustomEvent("notesUpdated", { detail: { videoIdParam } });
    document.dispatchEvent(event);
  }

  // Function to handle the custom event and update the content of the "escucha" div
  function handleNotesUpdatedEvent(event) {
    const notes = document.getElementById("ytNotes2");
    const videoIdParam = event.detail.videoIdParam;
    notes.textContent =
      'Event "createdAhora" received at ' +
      new Date().toLocaleTimeString() +
      ". VideoID: " +
      videoIdParam;
  }

  // Add event listeners
  saveButton.addEventListener("click", () => dispatchNotesUpdatedEvent(123));
  console.error("NOTES2", document.getElementById("ytNotes2"));
  // document.getElementById("ytNotes2").addEventListener("notesUpdated", handleNotesUpdatedEvent);
  document.addEventListener("notesUpdated", handleNotesUpdatedEvent);

  // TODO: Ver esto
  // chrome.storage.local.get([videoIdText], function (result) {
  chrome.storage.local.get({ [videoIdText]: {} }, function (result) {
    const notesInVideo = result[videoIdText] ?? {};

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
          console.log(`Delete clicked for: ${timestamp}`);
          removeNoteFromStorage(videoIdText, timestamp);
          li.remove();
        });
      })(timestamp);

      (function (timestamp) {
        a.addEventListener("click", function (event) {
          event.preventDefault();

          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              var currentTab = tabs[0];

              chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: seekTo,
                args: [timestamp],
              });
            }
          );
          note.value = notesInVideo[timestamp];
        });
      })(timestamp);

      li.appendChild(a);
      li.appendChild(textBetween);
      li.appendChild(deleteButton);

      ulElement.appendChild(li);
    }
  });

  // TODO: Ver esto
  // chrome.storage.local.get([videoIdText], function (result) {
  chrome.storage.local.get({ [videoIdText]: {} }, function (result) {
    const timee = window.localStorage.getItem("ytCurrentTime");
    note.value = result[videoIdText][timee] ?? "";
    // console.error(document.getelementbyid("ytcurrenttime").innertext);
    // const notesinvideo = result[videoidtext] ?? {};
    // notesinvideo[currenttimetext] = note.value;
    // chrome.storage.local.set({
    //   [videoidtext]: notesinvideo,
    // });
  });

  saveButton.addEventListener("click", function () {
    const channelAliasText = channelAlias.innerText;
    const channelNameText = channelName.innerText;
    const videoIdText = videoId.innerText;
    const currentTimeText = currentTime.innerText;

    // Save channelAlias in channels
    chrome.storage.local.get(["channels"], function (result) {
      const channels = result.channels ?? {};
      channels[channelAliasText] = channelNameText;
      chrome.storage.local.set({ channels });
    });

    // Save videoId in channel alias
    chrome.storage.local.get([channelAliasText], function (result) {
      const videosInChannel = result[channelAliasText] ?? {};
      videosInChannel[videoId.innerText] =
        window.localStorage.getItem("ytTitle");
      chrome.storage.local.set({ [channelAliasText]: videosInChannel });
    });

    // Save currentTime in videoId
    chrome.storage.local.get([videoIdText], function (result) {
      const notesInVideo = result[videoIdText] ?? {};
      notesInVideo[currentTimeText] = note.value;
      chrome.storage.local.set({
        [videoIdText]: notesInVideo,
      });
      updateNotes(videoIdText);
    });
    chrome.runtime.sendMessage({ action: "noteUpdated" });
  });

  // Set variables in tags
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];

    chrome.scripting.executeScript(
      {
        target: { tabId: currentTab.id },
        func: getVideoInfoFromPage,
      },
      (result) => {
        const r = result[0].result;
        document.getElementById("ytTitle").innerText = r.title;
        document.getElementById("ytUrl").innerText = currentTab.url;
        document.getElementById("ytCurrentTime").innerText = r.currentTime;
        document.getElementById("ytTotalTime").innerText = r.totalTime;
        document.getElementById("ytChannelAlias").innerText = r.channelAlias;
        document.getElementById("ytChannelName").innerText = r.channelName;
        document.getElementById("ytVideoId").innerText = r.videoId;
        document.getElementById("ytImg").src = r.imgSrc;

        window.localStorage.setItem("ytTitle", r.title);
        window.localStorage.setItem("ytUrl", currentTab.url);
        window.localStorage.setItem("ytCurrentTime", r.currentTime);
        window.localStorage.setItem("ytTotalTime", r.totalTime);
        window.localStorage.setItem("ytChannelAlias", r.channelAlias);
        window.localStorage.setItem("ytChannelName", r.channelName);
        window.localStorage.setItem("ytVideoId", r.videoId);
      }
    );
  });
});
