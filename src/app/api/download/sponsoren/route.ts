
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dataDirectory = path.join(process.cwd(), 'src/data/sponsoren');
    const filePath = path.join(dataDirectory, 'sponsors.csv');
    
    const fileBuffer = await fs.readFile(filePath);
    
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv');
    headers.set('Content-Disposition', 'attachment; filename="sponsors.csv"');
    
    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (error) {
    console.error('Error reading sponsors.csv:', error);
    return new NextResponse('Error downloading file.', { status: 500 });
  }
}
