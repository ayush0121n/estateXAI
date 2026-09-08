/**
 * render_diagrams.js
 * Renders all .mmd Mermaid files in this directory to PNG using @mermaid-js/mermaid-cli
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const DIAGRAMS_DIR = path.join(__dirname, 'report_diagrams');
const OUTPUT_DIR = path.join(__dirname, 'report_diagrams', 'png');
const CONFIG = path.join(DIAGRAMS_DIR, 'mermaid-config.json');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const mmdFiles = fs.readdirSync(DIAGRAMS_DIR).filter(f => f.endsWith('.mmd'));

console.log(`Found ${mmdFiles.length} Mermaid diagram files to render...\n`);

for (const file of mmdFiles) {
    const inputPath = path.join(DIAGRAMS_DIR, file);
    const outputName = file.replace('.mmd', '.png');
    const outputPath = path.join(OUTPUT_DIR, outputName);

    console.log(`  Rendering: ${file} → ${outputName}`);
    try {
        execSync(
            `npx mmdc -i "${inputPath}" -o "${outputPath}" -c "${CONFIG}" -b transparent -w 2400 -H 1600 --scale 2`,
            { cwd: path.join(__dirname, '..'), stdio: 'pipe', timeout: 60000 }
        );
        console.log(`  ✓ Done: ${outputName} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
    } catch (err) {
        console.error(`  ✗ Failed: ${file} — ${err.message}`);
    }
}

console.log('\nAll diagrams rendered!');
