// boxCarousel.js
export function initBoxCarousel(selector, cardData, titleElSelector = null) {
  const box = document.querySelector(selector);
  if (!box) return;

  // 如果有传递 titleElSelector，就找这个标题元素
  let titleEl = null;
  if (titleElSelector) {
    titleEl = document.querySelector(titleElSelector);
  }

  // 用来追踪当前索引
  let currentIndex = 0;
  const total = cardData.length;

  // 初始化: 循环插入数据
  cardData.forEach((data, i) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item";

    // 判断是图片还是视频
    if (data.type === "video") {
      const videoEl = document.createElement("video");
      videoEl.src = data.src;
      videoEl.width = data.width;
      videoEl.height = data.height;
      videoEl.controls = true;
      itemDiv.appendChild(videoEl);
    } else {
      // 默认图片
      const img = document.createElement("img");
      img.src = data.src;
      img.alt = data.alt || "";
      img.style.width = data.width + "px";
      img.style.height = data.height + "px";
      itemDiv.appendChild(img);
    }
    box.appendChild(itemDiv);
  });

  // 更新标题函数
  function updateTitle() {
    if (titleEl) {
      // 如果当前项目有 title 属性，就显示，否则留空
      const currentItem = cardData[currentIndex];
      titleEl.textContent = currentItem.title || "";
    }
  }

  // 初次显示标题
  updateTitle();

  // 翻到下一张
  function moveNext() {
    let items = box.querySelectorAll(".item");
    box.appendChild(items[0]); // 把第一个移到末尾

    // 更新 currentIndex
    currentIndex = (currentIndex + 1) % total;
    updateTitle();
  }

  // 翻到上一张
  function movePrev() {
    let items = box.querySelectorAll(".item");
    box.prepend(items[items.length - 1]); // 把最后一个移到最前

    // 更新 currentIndex
    currentIndex = (currentIndex - 1 + total) % total;
    updateTitle();
  }

  // 监听滚轮事件
  box.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (event.deltaY > 0) moveNext();
    else movePrev();
  }, { passive: false });
}
