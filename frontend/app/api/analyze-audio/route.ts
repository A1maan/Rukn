import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const region = formData.get('region') as string;
    const channel = formData.get('channel') as string || 'call';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    if (!region) {
      return NextResponse.json(
        { error: 'Region is required' },
        { status: 400 }
      );
    }

    // Convert audio file to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a new FormData for the backend request
    const backendFormData = new FormData();
    const blob = new Blob([buffer], { type: audioFile.type });
    backendFormData.append('audio', blob, audioFile.name);
    backendFormData.append('region', region);
    backendFormData.append('channel', channel);

    // Forward to Python backend for transcription and analysis
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/analyze-audio`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend error:', errorData);
      return NextResponse.json(
        { error: 'Failed to analyze audio', details: errorData },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Audio analyzed successfully',
    });

  } catch (error) {
    console.error('Error analyzing audio:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
