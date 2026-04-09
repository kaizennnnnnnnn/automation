/**
 * Google Places API integration for scraping business data.
 * Extracts: name, phone, address, hours, photos, website, rating, reviews.
 */

export interface BusinessData {
  name: string;
  phone: string;
  address: string;
  website: string;
  hours: string[];
  rating: number;
  reviewCount: number;
  photos: string[];
  category: string;
  description: string;
}

/**
 * Extracts a Place ID from a Google Maps URL.
 * Supports various Google Maps URL formats.
 */
export function extractPlaceQuery(url: string): string {
  // Try to extract business name from URL
  // Format: https://www.google.com/maps/place/Business+Name/...
  const placeMatch = url.match(/\/maps\/place\/([^/]+)/);
  if (placeMatch) {
    return decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
  }

  // Format: search query in URL
  const searchMatch = url.match(/[?&]q=([^&]+)/);
  if (searchMatch) {
    return decodeURIComponent(searchMatch[1].replace(/\+/g, " "));
  }

  // Just return the whole URL as a search query fallback
  return url;
}

/**
 * Fetches business data from Google Places API using a search query or Place ID.
 */
export async function fetchBusinessData(
  googleMapsUrl: string
): Promise<BusinessData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not set");
  }

  const query = extractPlaceQuery(googleMapsUrl);

  // Step 1: Find the place
  const searchRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      query
    )}&inputtype=textquery&fields=place_id&key=${apiKey}`
  );
  const searchData = await searchRes.json();

  if (!searchData.candidates?.length) {
    throw new Error("Business not found. Please check the Google Maps URL.");
  }

  const placeId = searchData.candidates[0].place_id;

  // Step 2: Get full details
  const detailsRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_phone_number,formatted_address,website,opening_hours,rating,user_ratings_total,photos,types,editorial_summary&key=${apiKey}`
  );
  const detailsData = await detailsRes.json();
  const place = detailsData.result;

  if (!place) {
    throw new Error("Could not fetch business details.");
  }

  // Step 3: Get photo URLs (up to 5)
  const photos: string[] = [];
  if (place.photos) {
    for (const photo of place.photos.slice(0, 5)) {
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photo.photo_reference}&key=${apiKey}`;
      photos.push(photoUrl);
    }
  }

  // Map types to a human-readable category
  const typeMap: Record<string, string> = {
    restaurant: "Restaurant",
    dentist: "Dentist",
    gym: "Gym",
    bakery: "Bakery",
    hair_care: "Hair Salon",
    beauty_salon: "Beauty Salon",
    real_estate_agency: "Real Estate",
    lawyer: "Law Firm",
    bar: "Bar",
    cafe: "Cafe",
    doctor: "Doctor",
    veterinary_care: "Pet Shop",
    spa: "Spa",
    car_repair: "Auto Shop",
  };

  const category =
    place.types
      ?.map((t: string) => typeMap[t])
      .find((t: string | undefined) => t) || "Business";

  return {
    name: place.name || "",
    phone: place.formatted_phone_number || "",
    address: place.formatted_address || "",
    website: place.website || "",
    hours: place.opening_hours?.weekday_text || [],
    rating: place.rating || 0,
    reviewCount: place.user_ratings_total || 0,
    photos,
    category,
    description: place.editorial_summary?.overview || "",
  };
}
