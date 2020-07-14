chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  const generatePath = (givenPath) => {
    const matchBracket = /\$\(([^\)]+)\)/g;
    const matchContent = /(?<=\().+?(?=\))/;

    return givenPath.replace(matchBracket, (matched) => {
      return document.querySelector(matchContent.exec(matched)[0]).innerText;
    });
  };

  const { action } = request;
  if (action === "getPath") {
    sendResponse({
      status: "ok",
      path: generatePath(request.path),
    });
  } else if (action === "getImgs") {
    const images = document.querySelectorAll(request.selector);

    sendResponse({
      status: "ok",
      imgs: Object.values(images).map((img) => img.src),
    });
  } else if (action === "download") {
    sendResponse({
      status: "ok",
      path: generatePath(request.path),
    });
  }
});
