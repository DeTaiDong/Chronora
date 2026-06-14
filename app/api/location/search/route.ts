import { NextResponse } from "next/server";

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  address?: {
    country?: string;
    country_code?: string;
    state?: string;
    province?: string;
    region?: string;
    county?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("accept-language", "zh-CN,en");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Chronora-Bazi/0.1 contact: local-dev",
      Referer: "https://chronora.local"
    },
    next: {
      revalidate: 60 * 60 * 24
    }
  });

  if (!response.ok) {
    return NextResponse.json({ error: "地点搜索服务暂时不可用，请稍后再试。" }, { status: 502 });
  }

  const data = (await response.json()) as NominatimResult[];
  const results = data.map((item) => {
    const address = item.address ?? {};

    return {
      id: String(item.place_id),
      name: item.display_name,
      latitude: item.lat,
      longitude: item.lon,
      country: address.country ?? "",
      countryCode: address.country_code?.toUpperCase() ?? "",
      state: address.state ?? address.province ?? address.region ?? "",
      city: address.city ?? address.town ?? address.village ?? address.county ?? "",
      district: address.suburb ?? address.county ?? "",
      type: item.type ?? item.class ?? ""
    };
  });

  return NextResponse.json({ results });
}
