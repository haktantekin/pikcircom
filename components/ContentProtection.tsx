import { attachContentProtection } from "@/src/contentProtection";
import { useEffect } from "react";

/** Sağ tık ve yakalanabilir ekran görüntüsü kısayollarını engeller. */
export default function ContentProtection() {
  useEffect(() => attachContentProtection(), []);

  return (
    <div
      id="screenshot-shield"
      className="pointer-events-none fixed inset-0 z-[9999] bg-black opacity-0 transition-opacity duration-150"
      aria-hidden
    />
  );
}
