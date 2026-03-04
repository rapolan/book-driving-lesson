
const query = "Eastlake High School";
const viewbox = "-117.6,33.6,-116.0,32.5";
const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&countrycodes=us&limit=5&addressdetails=1`;

console.log(`Fetching: ${url}`);

fetch(url, {
    headers: {
        'User-Agent': 'BookDrivingLessonApp/1.0'
    }
})
    .then(res => res.json())
    .then(data => {
        console.log("Results found:", data.length);
        data.forEach((item, i) => {
            console.log(`[${i}] ${item.display_name} (${item.type})`);
        });
    })
    .catch(err => console.error(err));
