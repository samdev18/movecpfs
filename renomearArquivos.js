import { promises as fsp } from 'fs';
import path from 'path';
import chalk from 'chalk';
import readdirp from 'readdirp';
import ProgressBar from 'progress';

function extractNumbersFromName(name) {
    return name.replace(/[^0-9]/g, '');
}

async function renameItemsInDirectory(directoryPath) {
    let count = 0;
    for await (const _ of readdirp(directoryPath)) {
        count++;
    }

    const bar = new ProgressBar(':bar :percent :etas', {
        total: count,
        width: 40
    });

    const directoryStream = readdirp(directoryPath, { type: 'directories' });
    for await (const dir of directoryStream) {
        const oldPath = dir.fullPath;
        const newPath = path.join(directoryPath, extractNumbersFromName(dir.basename));

        if (oldPath !== newPath) {
            await fsp.rename(oldPath, newPath);
            console.log(chalk.green(`Renomeando pasta: "${dir.basename}" -> "${path.basename(newPath)}"`));
            bar.tick();
        }
    } 0
    const fileStream = readdirp(directoryPath, { type: 'files' });
    for await (const file of fileStream) {
        const oldPath = file.fullPath;
        const newPath = path.join(path.dirname(oldPath), `${extractNumbersFromName(path.basename(oldPath, path.extname(oldPath)))}${path.extname(oldPath)}`);

        if (oldPath !== newPath) {
            await fsp.rename(oldPath, newPath);
            console.log(chalk.green(`Renomeando arquivo: "${file.basename}" -> "${path.basename(newPath)}"`));
            bar.tick();
        }
    }
}



export {renameItemsInDirectory}