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

/////////

// document.addEventListener("DOMContentLoaded", async function () {
//   // (async () => {
//   //   console.error("SALUDE AL CONTENT");
//   //   const response = await chrome.runtime.sendMessage({ greeting: "hello" });
//   //   // do something with response here, not outside the function
//   //   console.log(response);
//   // })();
//   const saveButton = document.getElementById("ytSaveButton");
//   const note = document.getElementById("ytNote");
//
//   const title = window.localStorage.getItem("ytTitle");
//   const url = window.localStorage.getItem("ytVideoUrl");
//   const channelName = window.localStorage.getItem("ytChannelName");
//   const channelAlias = window.localStorage.getItem("ytChannelAlias");
//   const videoId = window.localStorage.getItem("ytVideoId");
//   const currentTime = window.localStorage.getItem("ytCurrentTime");
//   const imgSrc = window.localStorage.getItem("ytImgSrc");
//
//   console.warn("SETTING UP");
//   console.warn({ title, url, channelName, channelAlias, videoId, currentTime });
//   document.getElementById("ytTitle").innerHTML = title;
//   document.getElementById("ytUrl").innerHTML = url;
//   document.getElementById("ytChannelName").innerHTML = channelName;
//   document.getElementById("ytChannelAlias").innerHTML = channelAlias;
//   document.getElementById("ytVideoId").innerHTML = videoId;
//   document.getElementById("ytCurrentTime").innerHTML = currentTime;
//   document.getElementById("ytImg").src = imgSrc;
//
//   const videoIdText = window.localStorage.getItem("ytVideoId");
//   function dispatchNotesUpdatedEvent(videoIdParam) {
//     const event = new CustomEvent("notesUpdated", { detail: { videoIdParam } });
//     document.dispatchEvent(event);
//   }
//
//   // Function to handle the custom event and update the content of the "escucha" div
//   function handleNotesUpdatedEvent(event) {
//     const notes = document.getElementById("ytNotes2");
//     const videoIdParam = event.detail.videoIdParam;
//     notes.textContent =
//       'Event "createdAhora" received at ' +
//       new Date().toLocaleTimeString() +
//       ". VideoID: " +
//       videoIdParam;
//   }
//
//   // Add event listeners
//   // document.getElementById("ytNotes2").addEventListener("notesUpdated", handleNotesUpdatedEvent);
//   document.addEventListener("notesUpdated", handleNotesUpdatedEvent);
//
//   // TODO: Ver esto
//   // chrome.storage.local.get([videoIdText], function (result) {
//   chrome.storage.local.get({ [videoIdText]: {} }, function (result) {
//     const notesInVideo = result[videoIdText] ?? {};
//
//     var ulElement = document.getElementById("ytNotes");
//     ulElement.innerHTML = "";
//
//     for (var timestamp in notesInVideo) {
//       const li = document.createElement("li");
//       const a = document.createElement("a");
//       const textBetween = document.createElement("span");
//       const deleteButton = document.createElement("button");
//
//       a.href = "#";
//       a.textContent = formatTime(timestamp);
//
//       textBetween.textContent = notesInVideo[timestamp];
//
//       // Delete button
//       deleteButton.textContent = "Delete";
//       (function (timestamp) {
//         deleteButton.addEventListener("click", function () {
//           console.log(`Delete clicked for: ${timestamp}`);
//           removeNoteFromStorage(videoIdText, timestamp);
//           li.remove();
//         });
//       })(timestamp);
//
//       (function (timestamp) {
//         a.addEventListener("click", function (event) {
//           event.preventDefault();
//
//           chrome.tabs.query(
//             { active: true, currentWindow: true },
//             function (tabs) {
//               var currentTab = tabs[0];
//
//               chrome.scripting.executeScript({
//                 target: { tabId: currentTab.id },
//                 func: seekTo,
//                 args: [timestamp],
//               });
//             }
//           );
//           note.value = notesInVideo[timestamp];
//         });
//       })(timestamp);
//
//       li.appendChild(a);
//       li.appendChild(textBetween);
//       li.appendChild(deleteButton);
//
//       ulElement.appendChild(li);
//     }
//   });
//
//   // TODO: Ver esto
//   // chrome.storage.local.get([videoIdText], function (result) {
//   chrome.storage.local.get({ [videoIdText]: {} }, function (result) {
//     const timee = window.localStorage.getItem("ytCurrentTime");
//     note.value = result[videoIdText][timee] ?? "";
//     // console.error(document.getelementbyid("ytcurrenttime").innertext);
//     // const notesinvideo = result[videoidtext] ?? {};
//     // notesinvideo[currenttimetext] = note.value;
//     // chrome.storage.local.set({
//     //   [videoidtext]: notesinvideo,
//     // });
//   });
//
//   saveButton.addEventListener("click", function () {
//     const channelAliasText = channelAlias.innerText;
//     const channelNameText = channelName.innerText;
//     const videoIdText = videoId.innerText;
//     const currentTimeText = currentTime.innerText;
//
//     // Save channelAlias in channels
//     chrome.storage.local.get(["channels"], function (result) {
//       const channels = result.channels ?? {};
//       channels[channelAliasText] = channelNameText;
//       chrome.storage.local.set({ channels });
//     });
//
//     // Save videoId in channel alias
//     chrome.storage.local.get([channelAliasText], function (result) {
//       const videosInChannel = result[channelAliasText] ?? {};
//       videosInChannel[videoId.innerText] =
//         window.localStorage.getItem("ytTitle");
//       chrome.storage.local.set({ [channelAliasText]: videosInChannel });
//     });
//
//     // Save currentTime in videoId
//     chrome.storage.local.get([videoIdText], function (result) {
//       const notesInVideo = result[videoIdText] ?? {};
//       notesInVideo[currentTimeText] = note.value;
//       chrome.storage.local.set({
//         [videoIdText]: notesInVideo,
//       });
//       updateNotes(videoIdText);
//     });
//     chrome.runtime.sendMessage({ action: "noteUpdated" });
//   });
// });
