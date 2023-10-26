import { createReadStream, createWriteStream } from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import ProgressBar from 'progress';
import chalk from 'chalk';

function normalizeCPF(cpf) {
  return cpf?.replace(/[^0-9]/g, '');
}

async function isDirectory(filePath) {
  const stats = await fsp.stat(filePath);
  return stats.isDirectory();
}

async function copyDirectoryRecursive(sourceDir, destDir) {
  try {
    await fsp.access(destDir);
  } catch {
    await fsp.mkdir(destDir);
  }

  const entries = await fsp.readdir(sourceDir);
  for (const entry of entries) {
    const fullPathSource = path.join(sourceDir, entry);
    const fullPathDest = path.join(destDir, entry);

    if (await isDirectory(fullPathSource)) {
      await copyDirectoryRecursive(fullPathSource, fullPathDest);
    } else {
      await new Promise((resolve, reject) => {
        const readStream = createReadStream(fullPathSource);
        const writeStream = createWriteStream(fullPathDest);

        readStream.pipe(writeStream);

        readStream.on('error', err => reject(err));
        writeStream.on('error', err => reject(err));
        writeStream.on('finish', resolve);
      });
    }
  }
}

async function moveFilesFromSpreadsheet({
  nomeDaPlanilha,
  nomeDaPastaComArquivos,
  nomeDaNovaPasta
}) {
  const workbook = xlsx.readFile(nomeDaPlanilha);
  const sheet_name_list = workbook.SheetNames;
  const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  try {
    await fsp.access(nomeDaNovaPasta);
  } catch {
    await fsp.mkdir(nomeDaNovaPasta);
  }

  const bar = new ProgressBar(':bar :percent :etas', {
    total: xlData.length,
    width: 40
  });

  console.log(chalk.white.bgBlue.bold('Iniciando cópia de arquivos!'));

  const files = await fsp.readdir(nomeDaPastaComArquivos);

  for (const row of xlData) {
    const normalizedFileNameFromSheet = normalizeCPF(row["Arquivos"]);
    const matchedEntry = files.find(file => normalizeCPF(path.basename(file, path.extname(file))) === normalizedFileNameFromSheet);

    if (matchedEntry) {
      const fullPathSource = path.join(nomeDaPastaComArquivos, matchedEntry);
      const fullPathDest = path.join(nomeDaNovaPasta, matchedEntry);

      if (await isDirectory(fullPathSource)) {
        await copyDirectoryRecursive(fullPathSource, fullPathDest);
      } else {
        await new Promise((resolve, reject) => {
          const readStream = createReadStream(fullPathSource);
          const writeStream = createWriteStream(fullPathDest);

          readStream.pipe(writeStream);

          readStream.on('error', err => reject(err));
          writeStream.on('error', err => reject(err));
          writeStream.on('finish', resolve);
        });
      }
      bar.tick();
    } else {
      console.log(chalk.red(`Entry matching CPF ${row["Arquivos"]} not found.`));
      bar.tick();
    }
  }

  console.log('All files and directories have been copied.');
}

const argv = yargs(hideBin(process.argv))
  .option('nomeDaPlanilha', {
    description: 'Nome do arquivo da planilha',
    alias: 'p',
    type: 'string'
  })
  .option('nomeDaPastaComArquivos', {
    description: 'Nome da pasta com os arquivos',
    alias: 'o',
    type: 'string'
  })
  .option('nomeDaNovaPasta', {
    description: 'Nome da nova pasta',
    alias: 'n',
    type: 'string'
  })
  .demandOption(['nomeDaPlanilha', 'nomeDaPastaComArquivos', 'nomeDaNovaPasta'], 'Por favor, forneça todos os argumentos necessários para continuar')
  .help()
  .alias('help', 'h')
  .argv;

moveFilesFromSpreadsheet({
  nomeDaPlanilha: argv.nomeDaPlanilha,
  nomeDaPastaComArquivos: argv.nomeDaPastaComArquivos,
  nomeDaNovaPasta: argv.nomeDaNovaPasta
}).catch(error => {
  console.error('An error occurred:', error);
});
