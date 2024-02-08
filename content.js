const getVideoInfoFromPage = () => {
  const imgSrc =
    document.querySelector(
      "ytd-video-owner-renderer yt-img-shadow#avatar img#img"
    )?.src ||
    "https://es.wikipedia.org/wiki/YouTube#/media/Archivo:YouTube_social_white_square_(2017).svg";
  const title = document.querySelector(
    "#above-the-fold div#title yt-formatted-string"
  )?.textContent;
  const channelName =
    document.querySelector("#top-row #text")?.getAttribute("title") || "";
  const channelAlias =
    document
      .querySelector("#top-row #text a")
      ?.getAttribute("href")
      ?.split("/")
      ?.at(-1) || "";
  const videoId =
    document
      .querySelector("ytd-page-manager#page-manager ytd-watch-flexy")
      ?.getAttribute("video-id") || "";
  const currentTime = Math.floor(document.querySelector("video").currentTime);
  const totalTime = Math.floor(document.querySelector("video").duration);
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return {
    channelAlias,
    channelName,
    currentTime,
    imgSrc,
    title,
    totalTime,
    videoId,
    videoUrl,
  };
};

// Function to send a message to the extension code
function sendMessageToExtension(eventType, data) {
  console.info("Mensaje a la extension", document.readyState, {
    eventType,
    data: JSON.parse(data),
  });
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
    console.warn("document.readyState.complete");
    console.warn(getVideoInfoFromPage());
    afterDOMLoaded();
  }
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "popup-to-content") {
    // Handle the message from the popup
    console.log("Message from Popup:", request.message);
    console.info("Te mando la data pa", { data: getVideoInfoFromPage() });

    sendResponse({ action: "content-to-popup", message: getVideoInfoFromPage() });
    return true;
  }
});

async function afterDOMLoaded() {
  // console.error("INFO FROM PAGE");
  // console.error(getVideoInfoFromPage());
  // document.addEventListener("yt-navigate-finish", function () {
  //   console.error("yt-navigate-finish");
  //   sendMessageToExtension(
  //     "ytNavigateFinish",
  //     JSON.stringify(getVideoInfoFromPage())
  //   );
  // });

  document.addEventListener("yt-guide-show", function () {
    // alert("yt-guide-show");
    console.info(getVideoInfoFromPage());
    sendMessageToExtension(
      "ytNavigateFinish",
      JSON.stringify(getVideoInfoFromPage())
    );
  });

  document.addEventListener("yt-guide-toggle", function () {
    // alert("yt-guide-toggle");
    console.info(getVideoInfoFromPage());
    sendMessageToExtension(
      "ytNavigateFinish",
      JSON.stringify(getVideoInfoFromPage())
    );
  });

  document.addEventListener("yt-navigate-cache", function () {
    // alert("yt-navigate-cache");
    console.info(getVideoInfoFromPage());
    sendMessageToExtension(
      "ytNavigateFinish",
      JSON.stringify(getVideoInfoFromPage())
    );
  });

  document.addEventListener("yt-navigate-finish", function () {
    // alert("yt-navigate-finish");
    console.info(getVideoInfoFromPage());
    sendMessageToExtension(
      "ytNavigateFinish",
      JSON.stringify(getVideoInfoFromPage())
    );
  });

  document.addEventListener("yt-navigate-start", function () {
    // alert("yt-navigate-start");
    console.info(getVideoInfoFromPage());
    sendMessageToExtension(
      "ytNavigateFinish",
      JSON.stringify(getVideoInfoFromPage())
    );
  });

  document.addEventListener("yt-page-data-updated", function () {
    // alert("yt-page-data-updated");
    sendMessageToExtension(
      "ytNavigateFinish",
      JSON.stringify(getVideoInfoFromPage())
    );
  });

  document.addEventListener("yt-page-type-changed", function () {
    // alert("yt-page-type-changed");
    sendMessageToExtension(
      "ytNavigateFinish",
      JSON.stringify(getVideoInfoFromPage())
    );
  });

  document.addEventListener("load", function () {
    // alert("load");
    sendMessageToExtension(
      "ytNavigateFinish",
      JSON.stringify(getVideoInfoFromPage())
    );
  });

  document.addEventListener("readystatechange", function () {
    // alert("readystatechange");
    sendMessageToExtension(
      "ytNavigateFinish",
      JSON.stringify(getVideoInfoFromPage())
    );
  });

  document.addEventListener("DOMContentLoaded", function () {
    // alert("DOMContentLoaded");
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
