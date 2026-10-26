import { useEffect, useRef, useState, type ChangeEvent } from "react";

type PickedImage = { file: File; url: string };

export default function useImagePicker() {
  const [image, setImage] = useState<PickedImage | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.url);
    };
  }, [image]);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage({ file, url: URL.createObjectURL(file) });
  }

  function clear() {
    setImage(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return { image, inputRef, onChange, clear };
}
