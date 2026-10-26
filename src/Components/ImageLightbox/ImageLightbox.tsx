import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import useLockBodyScroll from "../../Hooks/useLockBodyScroll";

type ImageLightboxProps = {
  src: string;
  alt?: string;
  onClose: () => void;
};

export default function ImageLightbox({
  src,
  alt = "image",
  onClose,
}: ImageLightboxProps) {
  useLockBodyScroll();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="animate-fade-in fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
    >
      <button
        type="button"
        aria-label="Close image"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
      >
        <FiX className="h-6 w-6" />
      </button>

      {/* clicking the image itself should NOT close the viewer */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
      />
    </div>,
    document.body,
  );
}
