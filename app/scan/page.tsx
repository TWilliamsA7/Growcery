"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useProfile } from "@/contexts/profile-provider";
import { FoodInfoSheet } from "@/components/FoodInfoSheet";
import CarrotLoader from "@/components/CarrotLoader";
import { GeminiResponse } from "@/lib/types/classification";
import { Produce, useProduce } from "@/contexts/produce-provider";
import { Crop, useCrop } from "@/contexts/crops-provider";
import { toast } from "sonner";

export default function ScanPage() {
  const router = useRouter();
  const { profile } = useProfile();
  const { addProduce } = useProduce();
  const { addCrop } = useCrop();
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [foodImageUrl, setFoodImageUrl] = useState<string | null>(null);
  const [foodInfo, setFoodInfo] = useState<GeminiResponse | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);

  // Ref for the video element
  const videoRef = useRef<HTMLVideoElement>(null);
  // Ref to store the MediaStream object
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    const videoElement = videoRef.current;

    // Ensure attributes are set before attaching stream (defensive)
    if (videoElement) {
      videoElement.muted = true;
      videoElement.playsInline = true;
      videoElement.autoplay = true;
      // prevent accidental taps from pausing on some iOS versions
      videoElement.style.userSelect = "none";
    }

    const startStream = async () => {
      try {
        // Prefer environment/back camera on mobile
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        streamRef.current = currentStream;

        if (!videoRef.current) return;
        videoRef.current.srcObject = currentStream;

        // Wait for metadata / canplay so videoWidth/videoHeight are available
        await new Promise<void>((resolve, reject) => {
          const v = videoRef.current!;
          const onLoaded = () => {
            v.removeEventListener("loadedmetadata", onLoaded);
            v.removeEventListener("error", onErr);
            resolve();
          };
          const onErr = (e: any) => {
            v.removeEventListener("loadedmetadata", onLoaded);
            v.removeEventListener("error", onErr);
            reject(e);
          };
          v.addEventListener("loadedmetadata", onLoaded);
          v.addEventListener("error", onErr);

          // Defensive timeout fallback (optional)
          setTimeout(() => resolve(), 1500);
        });

        // play() might reject — handle gracefully
        await videoRef.current.play().catch((err) => {
          console.warn("play() rejected", err);
        });

        // Only mark camera active when we have actual video dimensions / playing
        setIsCameraActive(true);
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        setError(
          err?.name === "NotAllowedError"
            ? "Camera access denied."
            : err?.message
        );
        setIsCameraActive(false);
      }
    };

    startStream();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.pause();
      }
    };
  }, []);

  const dataURLtoFile = async (
    dataUrl: string,
    filename: string
  ): Promise<File> => {
    // Fetch the data URL content
    const res = await fetch(dataUrl);
    // Get the Blob object
    const blob = await res.blob();
    // Create a File object from the Blob
    return new File([blob], filename, { type: blob.type });
  };

  // Function to start the camera stream (same logic as before)
  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err: any) {
      // Improved error handling for a dedicated page
      const errorMessage =
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera access denied. Please allow permissions."
          : err.name === "NotFoundError"
          ? "No camera found."
          : `Error: ${err.message}`;

      setError(errorMessage);
      setIsCameraActive(false);
    }
  }, []);

  // Function to stop the camera stream (same logic as before)
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Handle capture and download (same logic as before)
  const handleCapture = async () => {
    if (!videoRef.current || !isCameraActive || isCapturing) return;

    setIsCapturing(true);

    try {
      if (!profile) throw new Error("User profile does not exist!");

      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Mirror reversal logic
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

        const imageURL = canvas.toDataURL("image/png");
        setFoodImageUrl(imageURL);
        const capture: File = await dataURLtoFile(imageURL, "capture.png");

        const formData = new FormData();
        formData.append("image", capture);
        formData.append("type", profile.user_type);

        // Send the request to Next.js Route Handler
        const response = await fetch("/api/image/classify", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        setFoodInfo(result);

        if (response.ok) {
          console.log("Response:", result);
        } else {
          console.error("Response:", result);
          setError(result.message);
          throw new Error("Something went wrong!");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error has occurred:", err);
      }
    } finally {
      setIsCapturing(false);
      setSheetOpen(true);
    }
  };

  const handleSave = async () => {
    if (!profile || !foodInfo) return;

    if (profile.user_type === "consumer") {
      const newProduce: Partial<Produce> = {
        name: foodInfo.produce_name,
        expires_at: new Date(foodInfo.expiration_date).toISOString(),
      };

      await addProduce(newProduce);
    } else {
      const newCrop: Partial<Crop> = {
        name: foodInfo.crop_name,
        harvest_at: new Date(foodInfo.harvest_date).toISOString(),
      };

      await addCrop(newCrop);
    }

    toast("Save Successful", {
      description: "Your Food Item has been successfully saved!",
    });

    setSheetOpen(false);
    setFoodImageUrl(null);
    setFoodInfo(null);
  };

  const handleDiscard = async () => {
    setFoodImageUrl(null);
    setFoodInfo(null);
    setSheetOpen(false);
  };

  if (!profile) {
    return null;
  }

  return (
    // The main container now enforces a true full-screen, mobile-first experience
    <div className="h-screen w-screen flex flex-col p-0 bg-black text-white overflow-hidden">
      {/* 1. Top Bar */}
      <div className="flex justify-between items-center p-4 bg-zinc-900 z-10 shrink-0">
        <h1 className="text-xl font-bold">Camera</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()} // Use router.back() to close the page
          className="text-white hover:bg-zinc-700"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close Camera</span>
        </Button>
      </div>

      {/* 2. Camera Stream Area (takes up all available space) */}
      <div className="relative grow flex items-center justify-center overflow-hidden bg-black">
        {error ? (
          <p className="text-red-400 p-8 text-center text-lg">{error}</p>
        ) : (
          <>
            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-gray-300">
                <p>Waiting for stream...</p>
              </div>
            )}
            {/* Video Element - Centered and fills the available space */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute w-full h-full object-cover transform scale-x-[-1]"
              style={{ objectPosition: "center" }}
            />
          </>
        )}
      </div>

      {/* 3. Bottom Bar - Controls */}
      <div className="flex justify-center items-center p-4 bg-zinc-900 z-10 shrink-0">
        <Button
          onClick={handleCapture}
          disabled={!isCameraActive || isCapturing}
          // Using our custom orange styling with a large, centered button
          className={cn(
            "bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98] transition-all",
            "h-16 w-16 rounded-full p-0 flex items-center justify-center shadow-2xl shadow-orange-500/60"
          )}
        >
          {isCapturing ? (
            <Download className="h-6 w-6 animate-pulse" />
          ) : (
            <Camera className="h-8 w-8" />
          )}
          <span className="sr-only">Take Photo</span>
        </Button>
      </div>

      <CarrotLoader isActive={isCapturing} />

      {foodInfo && (
        <FoodInfoSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          foodInfo={foodInfo}
          type={profile?.user_type}
          foodImage={foodImageUrl ?? "/globe.svg"}
          onDiscard={handleDiscard}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
