import { NextResponse } from "next/server";

const AMD_CLASSIFIER_ENDPOINT: string = process.env.AMD_CLASSIFIER_ENDPOINT!;

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
    return NextResponse.json(externalData, { status: 200 });
  } catch (error) {
    console.error("Error forwarding request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
