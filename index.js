import { createReadStream, createWriteStream, promises as fsp } from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import ProgressBar from 'progress';
import chalk from 'chalk';

function normalizeCPF(cpf) {
  return cpf?.replace(/[^0-9]/g, '');
}

async function moveOrCopyItem(source, destination, action) {
  const stats = await fsp.stat(source);

  if (stats.isDirectory()) {
    await fsp.mkdir(destination, { recursive: true });
    const items = await fsp.readdir(source);

    for (const item of items) {
      const sourcePath = path.join(source, item);
      const destinationPath = path.join(destination, item);

      await moveOrCopyItem(sourcePath, destinationPath, action);
    }

    if (action === 'mover') {
      await fsp.rmdir(source);
    }
  } else if (stats.isFile()) {
    if (action === 'mover') {
      await fsp.rename(source, destination);
    } else if (action === 'copiar') {
      await new Promise((resolve, reject) => {
        const readStream = createReadStream(source);
        const writeStream = createWriteStream(destination);

        readStream.pipe(writeStream);

        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', resolve);
      });
    }
  }
}

async function moveFilesFromSpreadsheet({ nomeDaPlanilha, nomeDaPastaComArquivos, nomeDaNovaPasta, acao }) {
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

  console.log(chalk.white.bgBlue.bold(`Operação selecionada: ${acao.toString().toUpperCase()}`));
  console.log(chalk.white.bgBlue.bold('Iniciando operação!'));

  for (const row of xlData) {
    const normalizedItemFromSheet = normalizeCPF(row["Arquivos"].toString());
    const items = await fsp.readdir(nomeDaPastaComArquivos);

    const matchedItem = items.find(item => {
      const normalizedItemName = normalizeCPF(path.basename(item));
      return normalizedItemName === normalizedItemFromSheet;
    });

    if (matchedItem) {
      const sourcePath = path.join(nomeDaPastaComArquivos, matchedItem);
      const destinationPath = path.join(nomeDaNovaPasta, matchedItem);
      await moveOrCopyItem(sourcePath, destinationPath, acao);

      bar.tick();
    } else {
      console.log(`Item correspondente ao CPF ${row["Arquivos"]} não encontrado.`);
      bar.tick();
    }
  }
  console.log('Operação concluída.');
}

export { moveFilesFromSpreadsheet }