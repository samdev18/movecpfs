import ExcelJS from 'exceljs';
import { createReadStream } from 'fs';

import ProgressBar from 'progress';

const BASE_PATH = './base_de_dados.xlsx';

async function extractDataFromBase(cpfToFind, baseFilePath) {
  const workbook = new ExcelJS.Workbook();
  const stream = createReadStream(baseFilePath);
  await workbook.xlsx.read(stream);

  const dataToReturn = {};
  let headers = null;

  const worksheet = workbook.getWorksheet(1);

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      headers = row.values.slice(1);
    } else {
      const cpf = row.getCell(1).value;
      if (cpf === cpfToFind) {
        headers.forEach((header, index) => {
          dataToReturn[header] = row.values[index + 1];
        });
      }
    }
  });

  return dataToReturn;
}

async function completeUserSheet(filePath, baseFilePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  const baseWorkbook = new ExcelJS.Workbook();
  await baseWorkbook.xlsx.readFile(baseFilePath);
  const baseWorksheet = baseWorkbook.worksheets[0];
  const headers = baseWorksheet.getRow(1).values.slice(1);

  const bar = new ProgressBar('Processando [:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: worksheet.rowCount - 1
  });

  if (worksheet.rowCount === 0) {
    worksheet.addRow(headers);
  } else {
    worksheet.spliceRows(1, 0, headers);
  }

  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    const cpf = row.getCell(1).value;
    const data = await extractDataFromBase(cpf, baseFilePath);

    if (data) {
      let j = 1;
      for (const header of headers) {
        if (row.getCell(j).value === null) {
          row.getCell(j).value = data[header];
        }
        j++;
      }
    } else {
      console.warn(`CPF ${cpf} não encontrado na base de dados.`);
    }
    bar.tick();
  }

  await workbook.xlsx.writeFile(filePath);
  console.log(`Dados inseridos com sucesso em ${filePath}`);
}

export { completeUserSheet }

