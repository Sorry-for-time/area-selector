import "@/styles/styles.scss";
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
  // 取得所有需要进行操作的 dom 节点
  const selectorArea = document.querySelector(".selector-area") as HTMLDivElement;
  const selectorBox = document.querySelector(".selector-box") as HTMLDivElement;
  const contentArea = document.querySelector(".content-area") as HTMLDivElement;

  // 拖选区域内节点的数组
  const allSpans: Array<HTMLSpanElement> = [];
  // 被选中的节点的记录数组
  const selectedSpanBucket: Set<HTMLSpanElement> = new Set<HTMLSpanElement>();

  // 填充元素
  const fragmentWrapper: DocumentFragment = document.createDocumentFragment();
  for (let i: number = 1; i <= 36; ++i) {
    const span: HTMLSpanElement = document.createElement("span");
    span.classList.add("item");
    span.textContent = `${i}`;
    allSpans.push(span);
    fragmentWrapper.appendChild(span);
  }
  // 将所有节点批量插入到目标区域内
  contentArea.appendChild(fragmentWrapper);

  /**
   * 鼠标移动过程中设置框选器的操作
   * @param moveAction
   */
  const whenMoveAction: (mv: MouseEvent) => void = (moveAction: MouseEvent): void => {
    moveAction.stopPropagation();
    // 取得拖拽框的初始位置
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

    // 向正方向拖拽的情况
    if (applyWith >= selectorArea.offsetWidth - initX) {
      applyWith = selectorArea.offsetWidth - initX;
    }
    if (applyHeight >= selectorArea.offsetHeight - initY) {
      applyHeight = selectorArea.offsetHeight - initY;
    }

    // 往反方向进行拖拽的情况
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

    // 更新最后一次记录的位置(这里图方便的做法)
    lastSavedPosition.translateX = applyLeft;
    lastSavedPosition.translateY = applyTop;
    lastSavedPosition.width = applyWith;
    lastSavedPosition.height = applyHeight;

    // 修改 style 字符串, 因为拖拽框的宽高和拖拽视图区域的一致, 所以比例换算会很简单
    selectorBox.style.cssText = `transform:translate3d(${applyLeft}px,${applyTop}px,1px) scale(${
      applyWith / selectorArea.offsetWidth
    },${applyHeight / selectorArea.offsetHeight})`;
  };

  /**
   * 鼠标按下后操作
   */
  document.addEventListener("mousedown", (clickEv: MouseEvent): void => {
    clickEv.stopPropagation();
    dragStartCoordinates.x = clickEv.pageX - selectorArea.offsetLeft;
    dragStartCoordinates.y = clickEv.pageY - selectorArea.offsetTop;
    // 在范围内才进行监听 --> 粗暴做法
    if (dragStartCoordinates.x >= 0 && dragStartCoordinates.y >= 0) {
      document.addEventListener("mousemove", whenMoveAction);
    }
  });

  /**
   * 鼠标抬起后的收尾操作
   */
  document.addEventListener("mouseup", (): void => {
    /**
     * 清理移动过程监听器
     */
    document.removeEventListener("mousemove", whenMoveAction);

    // 设置边界值方便进行判断
    const startLeft: number = lastSavedPosition.translateX;
    const startTop: number = lastSavedPosition.translateY;
    const selectorEndWidth: number = startLeft + lastSavedPosition.width;
    const selectorEndHeight: number = startTop + lastSavedPosition.height;

    selectedSpanBucket.clear(); /* 清理 Set */

    // 循环判断每个子节点是否被选取覆盖
    for (const aSpan of allSpans) {
      const spanLeft: number = aSpan.offsetLeft + contentArea.offsetLeft;
      const spanTop: number = aSpan.offsetTop + contentArea.offsetTop;
      const spanEndWidth: number = aSpan.offsetLeft + aSpan.offsetWidth + contentArea.offsetLeft;
      const spanEndHeight: number = aSpan.offsetTop + aSpan.offsetHeight + contentArea.offsetTop;
      if (
        /* 只有完全在拖选框范围内的元素才认为被覆盖 */
        spanLeft >= startLeft &&
        spanTop >= startTop &&
        spanEndWidth <= selectorEndWidth &&
        spanEndHeight <= selectorEndHeight
      ) {
        // 如何被覆盖久将其节点引用添加到 set 当中
        selectedSpanBucket.add(aSpan);
        aSpan.classList.add("when-selected");
      } else {
        aSpan.classList.remove("when-selected");
      }
    }
    console.log(selectedSpanBucket);

    /**
     * 给拖选框添加一个简单的消失过渡动画
     */
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
        //  无论结果如何, 均清理 style 行内样式字符串
        selectorBox.style.cssText = "transform:translate3d(0,0,1px) scale(0,0)";
      });
    // .............
  });
});
