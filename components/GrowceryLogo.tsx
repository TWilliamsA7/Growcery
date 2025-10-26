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
  width = 640, // Increased default width for a banner look
  height = 160, // Custom height to give it a 4:1 wide ratio
  alt = "App Logo",
}: LogoProps) {
  // For a wide banner effect, we'll use 'fill' within a custom aspect ratio container.
  // This will force the image to cover the rectangular space, eliminating the visual white space issue.
  // If the source is square, it will be cropped/stretched, but it will be wide and bold.

  return (
    // Key Changes:
    // 1. 'relative' and 'overflow-hidden' for 'fill'.
    // 2. We are manually setting the width/height via the component props and letting the container take over.
    // 3. We use custom tailwind classes for aspect ratio padding, which is the responsive way to set aspect ratio.
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`relative shrink-0 ${className} w-full max-w-full overflow-hidden`}
    >
      <Image
        src="/growcery_logo.png"
        alt={alt}
        // Use 'fill' to make the image take up the entire container area
        fill
        // Use 'object-cover' to ensure the image covers the entire wide container.
        // This will crop the top/bottom of the square image, making it wide.
        className="object-cover"
        priority={true}
      />
    </div>
  );
}
