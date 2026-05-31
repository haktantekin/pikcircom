import { useEffect, useState } from "react";

/** md breakpoint üstünde daha fazla sütun */
export function useResponsiveMasonryColumnCount(
  mobileCount = 2,
  desktopCount = 3,
  query = "(min-width: 768px)",
): number {
  const [count, setCount] = useState(mobileCount);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const media = window.matchMedia(query);
    const update = () => {
      setCount(media.matches ? desktopCount : mobileCount);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [mobileCount, desktopCount, query]);

  return count;
}
