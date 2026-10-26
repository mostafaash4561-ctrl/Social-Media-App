import { FiX } from "react-icons/fi";

type ImagePreviewProps = {
  src: string;
  onRemove: () => void;
};

export default function ImagePreview({ src, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative inline-block center max-w-full ">
      <img
        src={src}
        alt="Selected preview"
        className="max-h-64 max-w-full  border border-line-soft rounded-2xl object-contain"
      />
      <button
        type="button"
        aria-label="Remove image"
        onClick={onRemove}
        className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-brand-950/70 text-white transition hover:bg-brand-950 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
}
