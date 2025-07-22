
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ message: 'Image URL is required.' }, { status: 400 });
  }

  try {
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    // Get the raw image data as a ReadableStream
    const imageStream = imageResponse.body;
    
    // Get headers from the original response to pass them along, like Content-Type
    const headers = new Headers(imageResponse.headers);

    // Set Content-Disposition to suggest a filename to the browser
    const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1).split('?')[0];
    headers.set('Content-Disposition', `attachment; filename="${filename || 'downloaded-image'}"`);

    return new NextResponse(imageStream, {
      status: 200,
      headers: headers,
    });

  } catch (error: any) {
    console.error('Error proxying image download:', error);
    return NextResponse.json({ message: 'Failed to download image.', error: error.message }, { status: 500 });
  }
}
