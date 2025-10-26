import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const GEMINI_API_KEY: string = process.env.GEMINI_API_KEY!;
const AMD_CLASSIFIER_ENDPOINT: string = process.env.AMD_CLASSIFIER_ENDPOINT!;
const GEMINI_END_POINT: string = process.env.GEMINI_END_POINT!;

function getPrompt() {
  const filePath = path.join(process.cwd(), "public", "prompt.txt");
  return fs.readFileSync(filePath, "utf8");
}

type ProduceItem = {
  name: string;
  features: string;
  condition: string;
  storageInstructions: string;
  expirationDate: string;
  sensoryCharacteristics: string;
};

function parseProduceData(line: string): ProduceItem {
  // Split by '|' and trim whitespace
  const parts = line
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 6) {
    throw new Error("Incomplete data line: expected 6 fields");
  }

  return {
    name: parts[0],
    features: parts[1],
    condition: parts[2],
    storageInstructions: parts[3],
    expirationDate: parts[4],
    sensoryCharacteristics: parts[5],
  };
}

export async function POST(request: Request) {
  try {
    // Get the form data from the incoming request
    const data = await request.formData();

    // Extract image from formData
    const file: File | null = data.get("image") as unknown as File;
    const custType: string | null = data.get("type") as string | null;

    if (!file || !custType) {
      // Check for both file and status
      return NextResponse.json(
        { success: false, message: "Missing file or type parameter" },
        { status: 400 }
      );
    }

    const status = custType === "consumer" ? "produce" : "crop";

    // Prepare the new FormData object for the external endpoint
    const forwardFormData = new FormData();
    forwardFormData.append("file", file, file.name);
    forwardFormData.append("status", status);

    // 4. Send the POST request to the external endpoint
    const response = await fetch(AMD_CLASSIFIER_ENDPOINT, {
      method: "POST",
      body: forwardFormData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("External API failed:", errorBody);
      return NextResponse.json(
        { message: "External API call failed", details: errorBody },
        { status: response.status }
      );
    }

    // 5. Success
    const externalData = await response.json();
    // const formData = new FormData();

    // if (file) {
    //   formData.append("file", file, file.name); // The binary file
    // }
    // formData.append("type", custType);
    // formData.append("location", "Florida, United States");

    // // 3. ✨ Append the externalData fields using a loop (the efficient way)
    // for (const key in externalData) {
    //   if (Object.prototype.hasOwnProperty.call(externalData, key)) {
    //     // Ensure the value is converted to a string if it's not already
    //     formData.append(key, String(externalData[key]));
    //   }
    // }

    // const geminiRes = await fetch("/api/image/response", {
    //   method: "POST",
    //   body: formData,
    // });

    // if (!geminiRes.ok) {
    //   const errorBody = await geminiRes.text();
    //   console.error("External API failed:", errorBody);
    //   return NextResponse.json(
    //     { message: "External API call failed", details: errorBody },
    //     { status: geminiRes.status }
    //   );
    // }

    // const foodData = await geminiRes.json();

    // return NextResponse.json(foodData, { status: 200 });

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const promptText = getPrompt(); // returns your text string
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const geminiRes = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64,
              },
            },
          ],
        },
      ],
    });

    return NextResponse.json(
      {
        ...parseProduceData(geminiRes.text ?? ""),
        confidence: externalData.confidence_percent ?? 74,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error forwarding request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
