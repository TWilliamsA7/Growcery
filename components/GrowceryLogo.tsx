// components/GrowceryLogo.tsx
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: string;
  width?: number;
  height?: number;
  alt: string;
}

export default function GrowceryLogo({
  className = "",
  width = 640,
  height = 160,
  alt = "App Logo",
}: LogoProps) {
  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`relative shrink-0 ${className} w-full max-w-full overflow-hidden`}
    >
      <Image
        src="/growcery_logo.png"
        alt={alt}
        fill
        className="object-cover"
        priority={true}
      />
    </div>
  );
}
