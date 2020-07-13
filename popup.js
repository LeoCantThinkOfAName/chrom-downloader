const pathInput = document.getElementById("download-path");
const serialInput = document.getElementById("use-serial");
const prefixInput = document.getElementById("file-name-prefix");
const targetDom = document.getElementById("target-dom");
const targetVariable = document.getElementById("target-variable");
const collection = document.getElementById("collection");
const applyDom = document.getElementById("apply-dom");
const applyVariable = document.getElementById("apply-variable");
const downloadForm = document.getElementById("download-form");

const getFileExtenstion = (url) => {
  return /[.]/.exec(url) ? /[^.]+$/.exec(url)[0] : undefined;
};

const generateDirectoryName = () => {
  return "hello";
};

const purgeCollection = () => {
  collection.innerHTML = "";
};

const downloadInterceptor = (downloadItem, suggest) => {
  suggest({
    filename: `${generateDirectoryName()}/${downloadItem.filename}`,
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

const generateCollction = (imgArr) => {
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
    }, index * 50);
  });
};

applyDom.addEventListener("click", () => {
  purgeCollection();
  generateCollction(
    Object.values(document.querySelectorAll(`${targetDom.value} img`)).map(
      (img) => img.src
    )
  );
});

downloadForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const prefix = prefixInput.value;
  const formData = new FormData(downloadForm);
  const selected = formData.getAll("collections[]");

  for (let i = 0; i < selected.length; i++) {
    setTimeout(() => {
      chrome.downloads.download({
        url: selected[i],
        filename: `${generateDirectoryName()}/${prefix}${
          i + 1
        }.${getFileExtenstion(selected[i])}`,
      });
    }, i * 100);
  }
  chrome.downloads.showDefaultFolder();
});

serialInput.addEventListener("change", () => {
  interceptorSwitch();
});
