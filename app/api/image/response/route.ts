import { NextResponse } from "next/server";

const AMD_CLASSIFIER_ENDPOINT: string = process.env.AMD_CLASSIFIER_ENDPOINT!;
const GEMINI_END_POINT: string = process.env.GEMINI_END_POINT!;

export async function POST(request: Request) {
  try {
    const foodData = {
      user_type: "consumer",
      product_name: "carrot",
      crop_name: "carrot",
      expiration_date: "11/1/2025",
      harvest_date: "11/1/2025",
      storage_method: "Store in a cool, dry place about 70 degrees F",
      health: "Healthy",
      attributes: "Some discoloration and indents",
      physical_qualities: "Firm to the touch",
      treatment: "None",
      location: "Orlando, Florida",
      disease: "None",
    };

    return NextResponse.json(foodData, { status: 200 });
  } catch (error) {
    console.error("Error forwarding request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
