import { useState } from "react";
import ImageLightbox from "./ImageLightbox";

type ViewableImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

export default function ViewableImage({
  src,
  alt = "image",
  className,
}: ViewableImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      {open && (
        <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
