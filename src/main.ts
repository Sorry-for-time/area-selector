import "@/styles/custom.scss";
import "@/styles/style.css";
import "normalize.css";

type PositionType = {
  x: number;
  y: number;
};

/**
 * 拖拽点的起始位置
 */
const dragStartCoordinates: PositionType = {
  x: 0,
  y: 0
};

/**
 * 最后一次更新的坐标位置
 */
const lastSavedPosition = {
  translateX: 0,
  translateY: 0,
  width: 0,
  height: 0
};

window.addEventListener("load", (): void => {
  const selectorArea = document.querySelector(".selector-area") as HTMLDivElement;
  const selectorBox = document.querySelector(".selector-box") as HTMLDivElement;
  const contentArea = document.querySelector(".content-area") as HTMLDivElement;
  const allSpans: Array<HTMLSpanElement> = [];
  const selectedSpanBucket: Set<HTMLSpanElement> = new Set<HTMLSpanElement>();

  // 鼠标移动过程中设置框选器的操作
  const whenMoveAction: (mv: MouseEvent) => void = (moveAction: MouseEvent): void => {
    moveAction.stopPropagation();
    moveAction.stopImmediatePropagation();
    // 定位的初始位置
    const initX: number = dragStartCoordinates.x;
    const initY: number = dragStartCoordinates.y;

    // 移动过程中的相对偏移量
    const movingX: number = moveAction.pageX - selectorArea.offsetLeft;
    const movingY: number = moveAction.pageY - selectorArea.offsetTop;
    // 应用的边距距离
    let applyLeft: number = initX;
    let applyTop: number = initY;
    // 应用的元素宽高
    let applyWith: number = movingX - initX;
    let applyHeight: number = movingY - initY;

    // 正方向拖拽的情况
    if (applyWith >= selectorArea.offsetWidth - initX) {
      applyWith = selectorArea.offsetWidth - initX;
    }
    if (applyHeight >= selectorArea.offsetHeight - initY) {
      applyHeight = selectorArea.offsetHeight - initY;
    }

    // 往反方向拖拽的情况
    if (applyWith < 0) {
      applyLeft = movingX;
      applyWith = initX - movingX;
      if (applyLeft < 0) {
        applyLeft = 0;
        applyWith = initX;
      }
    }
    if (applyHeight < 0) {
      applyTop = movingY;
      applyHeight = initY - movingY;
      if (applyTop < 0) {
        applyTop = 0;
        applyHeight = initY;
      }
    }

    // 更新位置
    lastSavedPosition.translateX = applyLeft;
    lastSavedPosition.translateY = applyTop;
    lastSavedPosition.width = applyWith;
    lastSavedPosition.height = applyHeight;

    // 使用 transform 修改 style 字符串
    selectorBox.style.cssText = `transform:translate(${applyLeft}px,${applyTop}px) scale(${
      applyWith / selectorArea.offsetWidth
    },${applyHeight / selectorArea.offsetHeight})`;
  };

  // 填充元素
  const fragmentWrapper: DocumentFragment = document.createDocumentFragment();
  for (let i: number = 1; i <= 36; ++i) {
    const span: HTMLSpanElement = document.createElement("span");
    span.classList.add("item");
    span.textContent = `${i}`;
    allSpans.push(span);
    fragmentWrapper.appendChild(span);
  }

  contentArea.appendChild(fragmentWrapper);

  // 鼠标按下后
  document.addEventListener("mousedown", (clickEv: MouseEvent): void => {
    clickEv.stopPropagation();
    dragStartCoordinates.x = clickEv.pageX - selectorArea.offsetLeft;
    dragStartCoordinates.y = clickEv.pageY - selectorArea.offsetTop;
    // 在范围内才进行监听 --> 粗暴做法
    if (dragStartCoordinates.x >= 0 && dragStartCoordinates.y >= 0) {
      document.addEventListener("mousemove", whenMoveAction);
    }
  });

  // 鼠标抬起后
  document.addEventListener("mouseup", (): void => {
    // 释放移动过程监听器
    document.removeEventListener("mousemove", whenMoveAction);
    const startLeft: number = lastSavedPosition.translateX;
    const startTop: number = lastSavedPosition.translateY;
    const selectorEndWidth: number = startLeft + lastSavedPosition.width;
    const selectorEndHeight: number = startTop + lastSavedPosition.height;

    selectedSpanBucket.clear(); /* 清理 Set */
    for (const span of allSpans) {
      span.classList.remove("when-selected");
      const spanLeft: number = span.offsetLeft + contentArea.offsetLeft;
      const spanTop: number = span.offsetTop + contentArea.offsetTop;
      const spanEndWidth: number = span.offsetLeft + span.offsetWidth + contentArea.offsetLeft;
      const spanEndHeight: number = span.offsetTop + span.offsetHeight + contentArea.offsetTop;
      if (
        spanLeft >= startLeft &&
        spanTop >= startTop &&
        spanEndWidth <= selectorEndWidth &&
        spanEndHeight <= selectorEndHeight
      ) {
        span.classList.add("when-selected");
        selectedSpanBucket.add(span);
      }
    }
    console.log(selectedSpanBucket);

    // 添加消失动画
    selectorBox
      .animate(
        [
          {
            filter: "opacity(1)"
          },
          {
            filter: "opacity(0)"
          }
        ],
        {
          duration: 120
        }
      )
      .finished.finally((): void => {
        selectorBox.style.cssText = "transform:translate(0,0) scale(0,0)";
      });
  });
});
