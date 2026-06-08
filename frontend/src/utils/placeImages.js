const WIKI_API_URL = 'https://en.wikipedia.org/w/api.php';
const COMMONS_API_URL = 'https://commons.wikimedia.org/w/api.php';

const curatedTravelFallbacks = [
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80',
];

const hashQuery = (query) =>
    Array.from(String(query || 'travel')).reduce((acc, char) => acc + char.charCodeAt(0), 0);

const fallbackImageFor = (query) => {
    const stableIndex = hashQuery(query) % curatedTravelFallbacks.length;
    return curatedTravelFallbacks[stableIndex];
};

const fetchWikipediaImage = async (query) => {
    const res = await fetch(
        `${WIKI_API_URL}?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}&origin=*`
    );
    const data = await res.json();
    const pages = data?.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    return pages?.[pageId]?.original?.source || '';
};

const fetchCommonsImage = async (query) => {
    const searchRes = await fetch(
        `${COMMONS_API_URL}?action=query&list=search&format=json&srnamespace=6&srlimit=1&origin=*&srsearch=${encodeURIComponent(`${query} travel landmark city`)}`
    );
    const searchData = await searchRes.json();
    const firstTitle = searchData?.query?.search?.[0]?.title;
    if (!firstTitle) return '';

    const imageRes = await fetch(
        `${COMMONS_API_URL}?action=query&titles=${encodeURIComponent(firstTitle)}&prop=imageinfo&iiprop=url&format=json&origin=*`
    );
    const imageData = await imageRes.json();
    const pages = imageData?.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    return pages?.[pageId]?.imageinfo?.[0]?.url || '';
};

export const getPlaceImage = async (placeName) => {
    if (!placeName) return fallbackImageFor('travel destination');

    try {
        const directImage = await fetchWikipediaImage(placeName);
        if (directImage) return directImage;

        const withoutPunctuation = placeName
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)[0];

        if (withoutPunctuation && withoutPunctuation !== placeName) {
            const shorterImage = await fetchWikipediaImage(withoutPunctuation);
            if (shorterImage) return shorterImage;
        }

        const commonsImage = await fetchCommonsImage(withoutPunctuation || placeName);
        if (commonsImage) return commonsImage;
    } catch (error) {
        // Avoid noisy UI errors; fallback keeps UX smooth.
        console.error('Image lookup failed for place:', placeName, error);
    }

    return fallbackImageFor(placeName);
};
