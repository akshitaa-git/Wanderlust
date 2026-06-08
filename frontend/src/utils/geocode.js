const cache = {};

export const geocode = async (place) => {
    if (!place) return null;
    if (cache[place]) return cache[place];

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data && data[0]) {
            const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
            cache[place] = result;
            return result;
        }
    } catch (e) {
        console.warn('Geocoding failed for:', place);
    }
    return null;
};
