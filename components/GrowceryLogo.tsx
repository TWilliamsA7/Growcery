// components/Logo.jsx
import Image from "next/image";

/**
 * Reusable Logo component using next/image for optimization.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className=''] - Additional CSS classes for the container div.
 * @param {string} [props.size='md'] - Predefined size ('sm', 'md', 'lg', 'xl').
 * @param {number} [props.width] - Optional specific width (overrides size prop).
 * @param {number} [props.height] - Optional specific height (overrides size prop).
 * @param {string} [props.alt='App Logo'] - Alt text for accessibility.
 */

interface LogoProps {
  className: string;
  size?: string;
  width?: number;
  height?: number;
  alt: string;
}

export default function GrowceryLogo({
  className = "",
  size = "md",
  width,
  height,
  alt = "App Logo",
}: LogoProps) {
  // Define standard sizes based on the 'size' prop (mobile-first approach)
  // These are tailwind-like size mappings. You can adjust these values.
  const sizeMap: {
    [key: string]: { w: number; h: number };
  } = {
    sm: { w: 64, h: 64 }, // Small (e.g., in a navbar)
    md: { w: 96, h: 96 }, // Medium (e.g., in a sign-up form)
    lg: { w: 128, h: 128 }, // Large (e.g., on a hero section)
    xl: { w: 192, h: 192 }, // Extra Large
    xxl: { w: 256, h: 256 },
    xxxl: { w: 320, h: 320 },
    xxxxl: { w: 384, h: 384 },
  };

  // Determine the final dimensions
  const finalWidth = width || sizeMap[size]?.w || sizeMap.md.w;
  const finalHeight = height || sizeMap[size]?.h || sizeMap.md.h;

  return (
    <div className={`shrink-0 ${className}`}>
      <Image
        src="/growcery_logo.png" // Path to the logo in the /public folder
        alt={alt}
        width={finalWidth}
        height={finalHeight}
        // Tailwind classes can be applied directly to the Image component
        // or through the container div via the className prop.
        className="object-contain"
        priority={size === "md" || size === "sm"} // High priority for smaller logos above the fold
      />
    </div>
  );
}
