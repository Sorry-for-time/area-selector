import "@/styles/custom.scss";
import "@/styles/style.css";
import "normalize.css";

type PositionType = {
  x: number;
  y: number;
};

window.addEventListener("load", (): void => {
  const selectorArea = document.querySelector(".selector-area") as HTMLDivElement;
  const selectorBox = document.querySelector(".selector-box") as HTMLDivElement;
  const contentArea = document.querySelector(".content-area") as HTMLDivElement;
  const allSpans: Array<HTMLSpanElement> = [];
  const selectedSpanBucket: Set<HTMLSpanElement> = new Set<HTMLSpanElement>();

  // 填充元素
  const fragmentWrapper: DocumentFragment = document.createDocumentFragment();
  for (let i: number = 1; i <= 36; ++i) {
    const span = document.createElement("span");
    span.classList.add("item");
    span.textContent = `${i}`;
    allSpans.push(span);
    fragmentWrapper.appendChild(span);
  }
  // 设置代理绑定监听器
  contentArea.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopImmediatePropagation();
    ev.stopPropagation();
    selectedSpanBucket.clear();
    if (ev.target !== contentArea) {
      (ev.target as HTMLSpanElement).classList.toggle("when-selected");
      selectedSpanBucket.add(ev.target as HTMLSpanElement);
    }
  });
  contentArea.appendChild(fragmentWrapper);

  /**
   * 存储位置信息
   */
  const positionProxy = new Proxy(
    {
      x: 0,
      y: 0
    },
    {
      set(target: PositionType, p: string | symbol, newValue: any, receiver: any) {
        return Reflect.set(target, p, newValue, receiver);
      },
      get(target: PositionType, p: string | symbol, receiver: any) {
        return Reflect.get(target, p, receiver);
      }
    }
  );

  document.addEventListener("mousedown", (clickEv: MouseEvent): void => {
    clickEv.stopPropagation();
    positionProxy.x = clickEv.pageX - selectorArea.offsetLeft;
    positionProxy.y = clickEv.pageY - selectorArea.offsetTop;
    if (positionProxy.x >= 0 && positionProxy.y >= 0) {
      document.addEventListener("mousemove", whenMoveAction);
    }
  });

  document.addEventListener("mouseup", (): void => {
    document.removeEventListener("mousemove", whenMoveAction);

    const startLeft: number = selectorBox.offsetLeft;
    const startTop: number = selectorBox.offsetTop;
    const selectorEndWidth: number = startLeft + selectorBox.offsetWidth;
    const selectorEndHeight: number = startTop + selectorBox.offsetHeight;

    selectedSpanBucket.clear();
    allSpans.forEach((span: HTMLSpanElement): void => {
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
    });

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
          duration: 100
        }
      )
      .finished.finally((): void => {
        selectorBox.removeAttribute("style");
      });
  });

  function whenMoveAction(moveAction: MouseEvent): void {
    moveAction.stopPropagation();
    moveAction.stopImmediatePropagation();
    // 定位的初始位置
    const initX: number = positionProxy.x;
    const initY: number = positionProxy.y;

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
      applyWith = selectorArea.offsetWidth - initX - 4; /* 减去边框值*/
    }
    if (applyHeight >= selectorArea.offsetHeight - initY) {
      applyHeight = selectorArea.offsetHeight - initY - 4; /* 减去边框值 */
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

    // 修改 style 字符串
    selectorBox.style.cssText = `left:${applyLeft}px;top:${applyTop}px;width:${applyWith}px;height:${applyHeight}px`;
  }
});
