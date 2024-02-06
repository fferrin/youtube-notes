const getVideoInfoFromPage = () => {
  // console.warn("IMAGES")
  // console.warn(document.querySelectorAll("ytd-video-owner-renderer"))
  // console.warn(document.querySelectorAll("ytd-video-owner-renderer yt-img-shadow#avatar"))
  // console.warn(document.querySelectorAll("ytd-video-owner-renderer yt-img-shadow#avatar img#img"))
  const imgSrc = document.querySelector(
    "ytd-video-owner-renderer yt-img-shadow#avatar img#img"
  )?.src;
  const title = document.querySelector(
    "#above-the-fold div#title yt-formatted-string"
  ).textContent;
  const channelName = document
    .querySelector("#top-row #text")
    .getAttribute("title");
  const channelAlias = document
    .querySelector("#top-row #text a")
    .getAttribute("href")
    .split("/")
    .at(-1);
  const videoId = document
    .querySelector("ytd-page-manager#page-manager ytd-watch-flexy")
    .getAttribute("video-id");
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

// Function to send a message to the extension code
function sendMessageToExtension(eventType, data) {
  console.info("Mensaje a la extension", { eventType, data: JSON.parse(data) });
  chrome.runtime.sendMessage({ action: eventType, data });
}

// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", (doc) => afterDOMLoaded(doc));
// } else {
//   afterDOMLoaded();
// }

// Alternative to load event
document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    console.error("document.readyState.complete");
    console.error(getVideoInfoFromPage())
    afterDOMLoaded();
  }
};

async function afterDOMLoaded() {
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.type === "popup-to-content") {
        // Handle the message from the popup
        console.log("Message from Popup:", request.message);

        // Add your logic to handle the message here
      }
    }
  );
  // console.error("INFO FROM PAGE");
  // console.error(getVideoInfoFromPage());
  // document.addEventListener("yt-navigate-finish", function () {
  //   console.error("yt-navigate-finish");
  //   sendMessageToExtension(
  //     "ytNavigateFinish",
  //     JSON.stringify(getVideoInfoFromPage())
  //   );
  // });

  console.error("Document state", document.readyState)
  document.addEventListener("yt-navigate-start", function () {
    console.error("yt-navigate-start");
    console.error(getVideoInfoFromPage())
  })
  
  document.addEventListener("yt-navigate-finish", function () {
    console.error("yt-navigate-finish");
    console.error(getVideoInfoFromPage())
  })
  document.addEventListener("yt-page-data-updated", function () {
    console.error("yt-page-data-updated");
    sendMessageToExtension(
      "ytNavigateFinish",
      JSON.stringify(getVideoInfoFromPage())
    );
  });
}

// Function to handle changes in the DOM
function handleDOMChanges(mutationsList, observer) {
  // Send a message to the background script with the updated content
  const updatedContent =
    document.querySelector('meta[name="title"]').textContent;
  console.warn("handleDOMChanges");
  chrome.runtime.sendMessage({ type: "updated", content: updatedContent });
}

// Set up a MutationObserver for the element with ID "foo"
const targetElement = document.querySelector('meta[name="title"]');

const observerConfig = { childList: true, subtree: true };
const observer = new MutationObserver(handleDOMChanges);
observer.observe(targetElement, observerConfig);

// ESTE ES EL QUE VALE PARA ACTUALIZAR LOS DATOS!!!!!!!
document.addEventListener("yt-page-data-updated", function () {
  sendMessageToExtension(
    "ytPageUpdated",
    JSON.stringify(getVideoInfoFromPage())
  );
  // sendMessageToExtension('ytPageUpdated', "SE ACTUALIZO LA PAGINA");
});
