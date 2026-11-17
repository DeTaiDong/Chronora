import places from "@/data/china-city-geo.json";

type ChinaPlace = {
  area: string;
  city: string;
  country: string;
  lat: string;
  lng: string;
  province: string;
};

export function searchChinaPlaces(input: string) {
  const query = input.trim().replace(/\s+/g, "");
  if (query.length < 2) return [];

  return (places as ChinaPlace[])
    .map((place, index) => {
      const names = [place.area, place.city, place.province].filter(Boolean);
      const score = names.includes(query) ? 0 : names.some((name) => name.startsWith(query)) ? 1
        : names.some((name) => name.includes(query)) ? 2 : 3;
      return { place, index, score };
    })
    .filter(({ score }) => score < 3)
    .sort((a, b) => a.score - b.score || Number(Boolean(a.place.area)) - Number(Boolean(b.place.area)))
    .slice(0, 6)
    .map(({ place, index }) => ({
      id: `china-${index}`,
      name: [place.area, place.city, place.province, place.country].filter(Boolean).join("，"),
      latitude: place.lat,
      longitude: place.lng,
      country: place.country,
      countryCode: "CN",
      state: place.province,
      city: place.city === "市辖区" ? place.province : place.city,
      district: place.area,
      type: place.area ? "district" : "city",
    }));
}
