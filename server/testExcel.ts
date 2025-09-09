import * as XLSX from 'xlsx';
import path from 'path';

async function testExcelFile() {
  try {
    const filePath = path.join(process.cwd(), 'attached_assets/ExpensesDataWithCategories_1757399520442.xlsx');
    console.log('Trying to read file:', filePath);
    
    // Check if file exists
    const { existsSync } = await import('fs');
    if (!existsSync(filePath)) {
      console.log('File does not exist!');
      return;
    }
    
    console.log('File exists, reading...');
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet names:', workbook.SheetNames);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Raw data:', data);
    console.log('First row:', data[0]);
    console.log('Data length:', data.length);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testExcelFile();