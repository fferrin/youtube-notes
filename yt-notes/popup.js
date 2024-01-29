const stringifyObject = (obj) => JSON.stringify(obj, null, 2);

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

const getTitle = () => {
  const titleObj = document.querySelector('meta[name="title"]');

  const title = titleObj ? titleObj.getAttribute("content") : "No Title";
  const channelName = document
    .querySelector('span[itemprop="author"] link[itemprop="name"]')
    .getAttribute("content");
  const channelAlias = document
    .querySelector('span[itemprop="author"] link[itemprop="url"]')
    .getAttribute("href")
    .split("@")
    .at(-1);
  const videoId = document
    .querySelector('meta[itemprop="identifier"]')
    .getAttribute("content");
  const currentTime = Math.floor(document.querySelector("video").currentTime);
  const totalTime = Math.floor(document.querySelector("video").duration);

  console.log("title = " + title);
  console.log("currentTime = " + currentTime);
  console.log("urlParams");
  console.log(" - video ID = " + videoId);
  console.log(" - channelName = " + channelName);
  console.log(" - channelAlias = " + channelAlias);
  return {
    title,
    currentTime,
    totalTime,
    videoId,
    channelName,
    channelAlias,
  };
};

document.addEventListener("DOMContentLoaded", function () {
  console.error("Setting badge");
  chrome.runtime.sendMessage({ action: "setBadge", text: "123" });
  const saveButton = document.getElementById("ytSaveButton");
  const note = document.getElementById("ytNote");
  const title = document.getElementById("ytTitle");
  const url = document.getElementById("ytUrl");
  const channelName = document.getElementById("ytChannelName");
  const channelAlias = document.getElementById("ytChannelAlias");
  const videoId = document.getElementById("ytVideoId");
  const currentTime = document.getElementById("ytCurrentTime");

  const videoIdText = window.localStorage.getItem("ytVideoId");

  // TODO: Ver esto
  // chrome.storage.local.get([videoIdText], function (result) {
  chrome.storage.local.get({[videoIdText]: {}}, function (result) {
    const notesInVideo = result[videoIdText] ?? {};

    var ulElement = document.getElementById("ytNotes");

    for (var timestamp in notesInVideo) {
      var liElement = document.createElement("li");
      liElement.textContent =
        formatTime(timestamp) + ": " + notesInVideo[timestamp];
      ulElement.appendChild(liElement);
    }
  });

  // TODO: Ver esto
  // chrome.storage.local.get([videoIdText], function (result) {
  chrome.storage.local.get({[videoIdText]: {}}, function (result) {
    console.log(
      "List para ver si esta el tiempo",
      stringifyObject({ result, time: currentTime.innerText })
    );
    const timee = window.localStorage.getItem("ytCurrentTime");
    console.error(timee);
    console.error("Todos:", stringifyObject(result[videoIdText]));
    console.error("tiempo:", stringifyObject({ timee }));
    console.error("Time:", result[videoIdText][timee]);
    note.value = result[videoIdText][timee] ?? "";
    // console.error(document.getElementById("ytCurrentTime").innerText);
    // const notesInVideo = result[videoIdText] ?? {};
    // notesInVideo[currentTimeText] = note.value;
    // chrome.storage.local.set({
    //   [videoIdText]: notesInVideo,
    // });
  });

  // [x] Listar todas las anotaciones del video
  // [ ] Listar todas las anotaciones de todos los videos del canal
  // [ ] Listar todas las anotaciones de todos los videos de todos los canales
  // {
  //  channels: {
  //    channelAlias1: channelName1,
  //    channelAlias2: channelName2,
  //    ...
  //  },
  //  channelAlias1: {
  //    videoId1: videoName1,
  //    videoId2: videoName2,
  //    ...
  //  }
  //
  // {
  //  videoId: {
  //    currentTime1: note1
  //    currentTime2: note2
  //    ...
  //  }
  // }
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
      videosInChannel[videoId.innerText] = 0;
      chrome.storage.local.set({ [channelAliasText]: videosInChannel });
    });

    // Save currentTime in videoId
    chrome.storage.local.get([videoIdText], function (result) {
      const notesInVideo = result[videoIdText] ?? {};
      notesInVideo[currentTimeText] = note.value;
      chrome.storage.local.set({
        [videoIdText]: notesInVideo,
      });
    });
  });

  // Set variables in tags
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];

    chrome.scripting.executeScript(
      {
        target: { tabId: currentTab.id },
        func: getTitle,
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
