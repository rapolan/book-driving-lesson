
const schools = [
    "Eastlake High School, Chula Vista",
    "Otay Ranch High School, Chula Vista",
    "Bonita Vista High School, Chula Vista",
    "Olympian High School, Chula Vista",
    "Mater Dei Catholic High School, Chula Vista",
    "Chula Vista High School, Chula Vista",
    "Castle Park High School, Chula Vista",
    "Hilltop High School, Chula Vista",
    "Sweetwater High School, National City",
    "Southwest High School, San Diego",
    "Montgomery High School, San Diego",
    "San Ysidro High School, San Diego",
    "Mar Vista High School, Imperial Beach",
    "High Tech High Chula Vista"
];

const fetchAddress = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'BookDrivingLessonApp/1.0' } });
        const data = await res.json();
        if (data && data.length > 0) {
            console.log(`{ name: "${query.split(',')[0]}", address: "${data[0].display_name}" },`);
        } else {
            console.log(`// Part not found: ${query}`);
        }
    } catch (e) {
        console.error(`Error fetching ${query}:`, e);
    }
};

const run = async () => {
    console.log("export const POPULAR_LOCATIONS = [");
    for (const school of schools) {
        await fetchAddress(school);
        await new Promise(r => setTimeout(r, 1000)); // Be nice to API
    }
    console.log("];");
};

run();
