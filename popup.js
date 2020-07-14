const pathInput = document.getElementById("download-path");
const serialInput = document.getElementById("use-serial");
const prefixInput = document.getElementById("file-name-prefix");
const targetDom = document.getElementById("target-dom");
const targetVariable = document.getElementById("target-variable");
const collection = document.getElementById("collection");
const applyDom = document.getElementById("apply-dom");
const applyVariable = document.getElementById("apply-variable");
const downloadForm = document.getElementById("download-form");
const collectionCounts = document.getElementById("collection-counts");
const selectedCounts = document.getElementById("selected-counts");

let GlobalDirectory;

const getFileExtenstion = (url) => {
  return /[.]/.exec(url) ? /[^.]+$/.exec(url)[0] : undefined;
};

const purgeCollection = () => {
  collection.innerHTML = "";
  collectionCounts.innerText = "";
  selectedCounts.innerText = "";
};

const generateCollction = (imgArr) => {
  // clear collection before generate new collection
  purgeCollection();
  imgArr.map((img, index) => {
    setTimeout(() => {
      const wrapper = document.createElement("div");
      const imgLabel = document.createElement("label");
      const imgCheckbox = document.createElement("input");
      const imgTag = document.createElement("img");
      // setup wrapper
      wrapper.className = "collection-wrapper";
      // setup label
      imgLabel.htmlFor = `collection-${index}`;
      // setup checkboxs
      imgCheckbox.id = `collection-${index}`;
      imgCheckbox.className = "collection-checkbox";
      imgCheckbox.type = "checkbox";
      imgCheckbox.name = "collections[]";
      imgCheckbox.value = img;
      imgCheckbox.checked = true;
      // setup img
      imgTag.src = img;

      // appends
      imgLabel.appendChild(imgTag);
      wrapper.appendChild(imgCheckbox);
      wrapper.appendChild(imgLabel);
      collection.appendChild(wrapper);

      //update collection / selected counts
      collectionCounts.innerText = imgArr.length;
      selectedCounts.innerText = imgArr.length;
    }, index * 10);
  });
};

const generateDirectoryName = (givenPath) => {
  const matchBracket = /\$\(([^\)]+)\)/g;
  const matchContent = /(?<=\().+?(?=\))/;
  return givenPath.replace(matchBracket, (matched) => {
    return document.querySelector(matchContent.exec(matched)[0]).innerText;
  });
};

const persistSetting = () => {
  localStorage.setItem("path", pathInput.value);
  localStorage.setItem("dom", targetDom.value);
  localStorage.setItem("variable", targetVariable.value);
  localStorage.setItem("prefix", prefixInput.value);
};

const contentExecution = (obj) => {
  const { action } = obj;
  // get the active tab in current window
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (action === "getImgs") {
      chrome.tabs.sendMessage(tabs[0].id, obj, (response) => {
        console.log(response);
        generateCollction(response.imgs);
      });
    } else if (action === "getPath") {
      chrome.tabs.sendMessage(tabs[0].id, obj, (response) => {
        console.log(response);
        return response.path;
      });
    } else if (action === "download") {
      chrome.tabs.sendMessage(tabs[0].id, obj, (response) => {
        const directory = response.path;
        const formData = new FormData(downloadForm);
        const selected = formData.getAll("collections[]");
        GlobalDirectory = response.path;

        for (let i = 0; i < selected.length; i++) {
          setTimeout(() => {
            chrome.downloads.download({
              url: selected[i],
              filename: `${GlobalDirectory}/${prefixInput.value}${
                i + 1
              }.${getFileExtenstion(selected[i])}`,
            });
          }, i * 10);
        }
        chrome.downloads.showDefaultFolder();
      });
    }
  });
};

const downloadInterceptor = (downloadItem, suggest) => {
  suggest({
    filename: `${GlobalDirectory}/${downloadItem.filename}`,
    conflictAction: "uniquify",
  });
};

const interceptorSwitch = () => {
  if (serialInput.checked) {
    prefixInput.removeAttribute("disabled");
    chrome.downloads.onDeterminingFilename.removeListener(downloadInterceptor);
  } else {
    prefixInput.setAttribute("disabled", "true");
    chrome.downloads.onDeterminingFilename.addListener(downloadInterceptor);
  }
};
interceptorSwitch();

applyDom.addEventListener("click", () => {
  console.log("clicked!");
  contentExecution({
    action: "getImgs",
    selector: `${targetDom.value} img`,
  });
});

// listen to input changes and modify selected counts
downloadForm.addEventListener("change", (e) => {
  // get all checkbox
  const counts = document.querySelectorAll(
    '.collection input[name="collections[]"]:checked'
  ).length;
  selectedCounts.innerText = counts;
});

// submit / initialize download process
downloadForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // keep current setting
  persistSetting();
  contentExecution({ action: "download", path: pathInput.value });
});

serialInput.addEventListener("change", () => {
  interceptorSwitch();
});

const applySetting = () => {
  pathInput.value = localStorage.getItem("path");
  targetDom.value = localStorage.getItem("dom");
  targetVariable.value = localStorage.getItem("variable");
  prefixInput.value = localStorage.getItem("prefix");

  if (prefixInput.value !== "") {
    serialInput.click();
  }

  if (targetDom.value !== "") {
    purgeCollection();
    generateCollction(
      Object.values(document.querySelectorAll(`${targetDom.value} img`)).map(
        (img) => img.src
      )
    );
  }

  if (targetVariable.value !== "") {
  }
};
applySetting();

applyDom.click();
