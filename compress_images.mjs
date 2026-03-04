import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const files = [
    'public/anime-dmv.jpg',
    'public/anime-driver.jpg',
    'src/assets/plan-step-2.jpg',
    'src/assets/plan-step-3.jpg'
];

async function compress() {
    for (const file of files) {
        const inputPath = path.join(process.cwd(), file);
        if (!fs.existsSync(inputPath)) {
            console.log(`Skipping ${file} - not found`);
            continue;
        }
        const outputPath = inputPath.replace('.jpg', '.webp');
        console.log(`Compressing ${file}...`);
        await sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(outputPath);
        // Remove the old jpg
        fs.unlinkSync(inputPath);
        console.log(`Finished ${file} -> webp`);
    }
}

compress().catch(console.error);
