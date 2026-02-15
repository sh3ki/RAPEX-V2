import { NextRequest, NextResponse } from 'next/server'

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()

  if (!query) {
    return NextResponse.json({ message: 'Search query is required' }, { status: 400 })
  }

  try {
    const params = new URLSearchParams({
      format: 'json',
      q: query,
      limit: '5',
      countrycodes: 'ph',
      addressdetails: '1',
    })

    const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'RAPEX-V2/1.0 (merchant-signup-geocode)',
      },
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      return NextResponse.json({ message: 'Unable to search address' }, { status: response.status })
    }

    const results = await response.json()
    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ message: 'Unable to search address' }, { status: 500 })
  }
}