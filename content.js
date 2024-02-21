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

function notifyPopupForVideoInfo() {
  chrome.runtime.sendMessage({
    action: "videoInfoUpdated",
    message: getVideoInfoFromPage(),
  });
}

function seekTo(seconds) {
  // document.getElementById("movie_player").seekTo(seconds);
  document.getElementsByTagName("video")[0].currentTime = seconds;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.type) {
    case "requestVideoInfo":
      notifyPopupForVideoInfo();
      break;
    case "setVideoTimeTo":
      seekTo(request.message.timestamp)
      break;
  }
});

// TODO: Check this. Probably it's not needed
document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    const events = [
      "DOMContentLoaded",
      "load",
      "readystatechange",
      "yt-guide-cache",
      "yt-guide-finish",
      "yt-guide-show",
      "yt-guide-start",
      "yt-guide-toggle",
      "yt-page-date-changed",
      "yt-page-date-updated",
    ];

    events.forEach((event) => {
      document.addEventListener(event, notifyPopupForVideoInfo);
    });
  }
};
