"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Download, RefreshCw } from "lucide-react";
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
  const [mirrored, setIsMirrored] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [foodImageUrl, setFoodImageUrl] = useState<string | null>(null);
  const [foodInfo, setFoodInfo] = useState<GeminiResponse | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [needUserGestureToStart, setNeedUserGestureToStart] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // helper: wait for video size metadata to be available
  const waitForVideoSize = (video: HTMLVideoElement, timeout = 2000) =>
    new Promise<void>((resolve, reject) => {
      if (video.videoWidth && video.videoHeight) return resolve();
      const onLoaded = () => {
        video.removeEventListener("loadeddata", onLoaded);
        if (video.videoWidth && video.videoHeight) resolve();
        else reject(new Error("No video size"));
      };
      video.addEventListener("loadeddata", onLoaded);
      setTimeout(() => {
        video.removeEventListener("loadeddata", onLoaded);
        if (video.videoWidth && video.videoHeight) resolve();
        else reject(new Error("Timed out waiting for video size"));
      }, timeout);
    });

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    const videoElement = videoRef.current;

    // Ensure attributes are set before attaching a stream
    if (videoElement) {
      videoElement.muted = true;
      videoElement.playsInline = true;
      videoElement.autoplay = true;
      videoElement.style.userSelect = "none";
      videoElement.style.touchAction = "manipulation";
    }

    const decideMirrorFromTrack = (stream: MediaStream | null) => {
      if (!stream) return false;
      const track = stream.getVideoTracks()[0];
      if (!track) return false;
      const settings: any = track.getSettings?.() ?? {};
      if (settings.facingMode) return settings.facingMode === "environment";
      const label = (track.label || "").toLowerCase();
      if (
        label.includes("back") ||
        label.includes("rear") ||
        label.includes("environment")
      )
        return true;
      return false;
    };

    const startStream = async () => {
      try {
        // Prefer the back camera (environment) on mobile
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        streamRef.current = currentStream;

        if (!videoRef.current) return;
        videoRef.current.srcObject = currentStream;

        // decide whether to mirror by default (based on track settings/label)
        const mirror = decideMirrorFromTrack(currentStream);
        setIsMirrored(!mirror);

        // Wait for metadata/canplay so videoWidth/videoHeight are available
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

          // fallback resolve in case event doesn't fire (defensive)
          setTimeout(() => resolve(), 1500);
        });

        // Play may still reject on some browsers if there wasn't a user gesture.
        await videoRef.current.play().catch((err) => {
          console.warn(
            "video.play() rejected — will require user gesture:",
            err
          );
          setNeedUserGestureToStart(true);
        });

        setIsCameraActive(true);
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        setError(
          err?.name === "NotAllowedError" ||
            err?.name === "PermissionDeniedError"
            ? "Camera access denied. Please allow permissions."
            : err?.name === "NotFoundError"
            ? "No camera found."
            : `Error: ${err?.message ?? "Unknown error"}`
        );
        setIsCameraActive(false);
      }
    };

    startStream();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.pause();
      }
    };
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        streamRef.current = stream;
        // update mirror state based on stream
        const track = stream.getVideoTracks()[0];
        const settings: any = track.getSettings?.() ?? {};
        let mirror = false;
        if (settings.facingMode) mirror = settings.facingMode === "environment";
        else {
          const label = (track.label || "").toLowerCase();
          mirror =
            label.includes("back") ||
            label.includes("rear") ||
            label.includes("environment");
        }
        setIsMirrored(!mirror);
        setIsCameraActive(true);
        setNeedUserGestureToStart(false);
      }
    } catch (err: any) {
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

  const dataURLtoFile = async (
    dataUrl: string,
    filename: string
  ): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const decideMirrorFromTrack = (stream: MediaStream | null) => {
    if (!stream) return false;
    const track = stream.getVideoTracks()[0];
    if (!track) return false;
    const settings: any = track.getSettings?.() ?? {};
    // Common modern API: facingMode === 'environment' or 'user'
    if (settings.facingMode) {
      return settings.facingMode === "environment";
    }
    // Fallback: use label - sometimes contains "back", "rear", "environment"
    const label = (track.label || "").toLowerCase();
    if (
      label.includes("back") ||
      label.includes("rear") ||
      label.includes("environment")
    ) {
      return true;
    }
    return false;
  };

  const handleCapture = async () => {
    if (!videoRef.current || !isCameraActive || isCapturing) return;

    setIsCapturing(true);
    try {
      if (!profile) throw new Error("User profile does not exist!");

      const video = videoRef.current;

      // ensure we have dimensions before drawing
      await waitForVideoSize(video);

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        if (mirrored) {
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        const imageURL = canvas.toDataURL("image/png");
        setFoodImageUrl(imageURL);
        const capture: File = await dataURLtoFile(imageURL, "capture.png");

        const formData = new FormData();
        formData.append("image", capture);
        formData.append("type", profile.user_type);

        const response = await fetch("/api/image/classify", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log(result);
        setFoodInfo(result);

        if (!response.ok) {
          setError(result.message ?? "Server error");
          throw new Error(result.message ?? "Something went wrong");
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

  if (!profile) return null;

  return (
    // Lock the page to viewport so Safari / address bar won't push content
    <div
      className="fixed inset-0 flex flex-col p-0 bg-black text-white"
      style={{
        // Keep controls above notches and the home indicator
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        overscrollBehavior: "none",
      }}
    >
      {/* Top bar — keep in normal flow */}
      <div
        className="flex justify-between items-center p-4 bg-zinc-900 z-20"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top))" }}
      >
        <h1 className="text-xl font-bold">Camera</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            // stop camera before leaving
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop());
              streamRef.current = null;
            }
            router.back();
          }}
          className="text-white hover:bg-zinc-700"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close Camera</span>
        </Button>
      </div>

      {/* Camera area: grow to fill remaining space */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
        {error ? (
          <p className="text-red-400 p-8 text-center text-lg z-10">{error}</p>
        ) : (
          <>
            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-gray-300 z-10">
                <p>Waiting for stream...</p>
              </div>
            )}

            {/* video element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transform ${
                mirrored ? "scale-x-[-1]" : ""
              }`}
              style={{ objectPosition: "center" }}
            />

            {/* If autoplay blocked and user gesture needed, show a big tap button */}
            {needUserGestureToStart && (
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <button
                  onClick={startCamera}
                  className="bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg"
                >
                  Tap to start camera
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating controls (fixed) so they always sit above the home indicator */}
      {/* Mirror toggle (left) + capture button (center) */}
      <div
        aria-hidden
        className="pointer-events-none"
        // container for fixed buttons; pointer-events-none lets inner buttons accept events only
      >
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: "calc(env(safe-area-inset-bottom) + 18px)",
            transform: "translateX(-50%)",
            zIndex: 40,
            display: "flex",
            gap: 12,
            alignItems: "center",
            pointerEvents: "auto", // allow buttons inside to be clickable
          }}
        >
          {/* Mirror toggle */}
          <Button
            onClick={() => setIsMirrored((m) => !m)}
            variant="ghost"
            className="text-white hover:bg-zinc-800 w-12 h-12 flex items-center justify-center rounded-full"
            title="Toggle mirror"
          >
            <RefreshCw className={`h-5 w-5 ${mirrored ? "rotate-180" : ""}`} />
          </Button>

          {/* Capture button */}
          <Button
            onClick={handleCapture}
            disabled={!isCameraActive || isCapturing}
            className={cn(
              "bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98] transition-all",
              "h-16 w-16 rounded-full p-0 flex items-center justify-center shadow-2xl shadow-orange-500/60"
            )}
            aria-label="Take Photo"
          >
            {isCapturing ? (
              <Download className="h-6 w-6 animate-pulse" />
            ) : (
              <Camera className="h-8 w-8" />
            )}
          </Button>
        </div>
      </div>

      {/* loader and sheet */}
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
