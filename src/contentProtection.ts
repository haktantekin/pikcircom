/** Print / screenshot kısayolları (tarayıcıda yakalanabilenler). */
function isScreenshotShortcut(event: KeyboardEvent): boolean {
  const key = event.key;
  const code = event.code;

  if (key === "PrintScreen" || code === "PrintScreen") {
    return true;
  }

  if (event.metaKey && event.shiftKey) {
    const digit = key.length === 1 ? key : "";
    if (digit === "3" || digit === "4" || digit === "5") {
      return true;
    }
  }

  if (event.ctrlKey && (key === "PrintScreen" || code === "PrintScreen")) {
    return true;
  }

  if (event.altKey && (key === "PrintScreen" || code === "PrintScreen")) {
    return true;
  }

  return false;
}

function flashScreenshotShield(): void {
  if (typeof document === "undefined") {
    return;
  }
  const el = document.getElementById("screenshot-shield");
  if (el) {
    el.classList.remove("opacity-0");
    el.classList.add("opacity-100");
    window.setTimeout(() => {
      el.classList.remove("opacity-100");
      el.classList.add("opacity-0");
    }, 800);
  }
}

function onContextMenu(event: MouseEvent): void {
  event.preventDefault();
}

function onKeyDown(event: KeyboardEvent): void {
  if (!isScreenshotShortcut(event)) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  flashScreenshotShield();
}

function onKeyUp(event: KeyboardEvent): void {
  if (!isScreenshotShortcut(event)) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
}

function onDragStart(event: DragEvent): void {
  const target = event.target;
  if (target instanceof HTMLImageElement) {
    event.preventDefault();
  }
}

export function attachContentProtection(): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("keyup", onKeyUp, true);
  document.addEventListener("dragstart", onDragStart);

  return () => {
    document.removeEventListener("contextmenu", onContextMenu);
    document.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("keyup", onKeyUp, true);
    document.removeEventListener("dragstart", onDragStart);
  };
}
