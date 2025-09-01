const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const assetsPath = path.join(__dirname, 'src', 'assets');
const verInfoPath = path.join(assetsPath, 'ver.info');

try {
    const packageJson = require(packageJsonPath);
    const versionInfo = `Project: ${packageJson.name}\nVersion: ${packageJson.version}`;

    // Assicurati che la cartella assets esista
    if (!fs.existsSync(assetsPath)) {
        fs.mkdirSync(assetsPath, { recursive: true });
    }

    fs.writeFileSync(verInfoPath, versionInfo);
    //console.log('File ver.info generato con successo!');
} catch (err) {
    console.error('Errore durante la generazione del file ver.info:', err);
}
