import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL =
  process.env.FASTAPI_URL ?? "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${FASTAPI_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.detail ??
            "Temperature prediction failed",
        },
        {
          status: response.status,
        },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Prediction proxy error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to connect to the Ocean Lens prediction server.",
      },
      {
        status: 500,
      },
    );
  }
}