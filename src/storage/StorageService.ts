export interface IStorageService {
    insertRow (tableName: string, values: any[])
    updateRow (tableName: string, rowNumber: number, values: any[])
	getRow (tableName: string, row: number): any[]
    findRow (tableName: string, column: number, value: any): number
    deleteRow(tableName: string, row: number)
	deleteRows(tableName: string, row: number, count: number)
	count(tableName: string): number
	
    lock ()
    unlock ()
}

export default class SpreadsheetStorageService implements IStorageService {
	private spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet;
	private mutex: GoogleAppsScript.Lock.Lock;
	private sheets = {};
    private locked = 0;
    
	constructor (spreadsheetId: string) {
		this.spreadsheet =  SpreadsheetApp.openById(spreadsheetId);
	}
	
	lock () {
        if (++this.locked > 1) {
			return;
		}		
        this.mutex = LockService.getDocumentLock();
		this.mutex.waitLock(10000);        
	}
	unlock () {
		if (--this.locked < 1) {
			this.mutex.releaseLock();
		}
	}
	insertRow (tableName: string, values: any[]) {
		let sheet = this.spreadsheet.getSheetByName(tableName);
		sheet.appendRow(values);		
	}
	updateRow (tableName: string, rowNumber: number, values: any[]) {
		let sheet = this.getTable(tableName);
		let columnCount = sheet.getLastColumn();
		if (columnCount < values.length) {
			columnCount = values.length;
		} else {
			while(values.length < columnCount) {
				values.push('');
			}
		}
		let range = sheet.getRange(rowNumber, 1, 1, columnCount);
		range.setValues([values]);
	}	
	findRow (tableName: string, column: number, value: any): number {
		if (isNaN(column) || column < 1) {
			throw Error('Invalid column number: ' + column);
		}
		let sheet = this.getTable(tableName);
		let index = 0;
		let range = sheet.getRange(index + 1, column, sheet.getLastRow() + 1 - index);
		let values = range.getValues();
		for (let i = 0; i < values.length; i++) {
			let val = values[i][0];
			if (val === value) {
				return i + 1;
			}			
		}
		return -1;
	}
	deleteRow (tableName: string, row: number) {
		if (isNaN(row) || row < 1) {
			throw Error('Invalid row number: ' + row);
		}
		let table = this.getTable(tableName);
		table.deleteRow(row);
	}
	deleteRows (tableName: string, row: number, count: number = 1) {
		if (isNaN(row) || row < 1) {
			throw Error('Invalid row number: ' + row);
		}
		let table = this.getTable(tableName);
		table.deleteRows(row, count);
	}
	getRow (tableName: string, row: number): any[] {
		if (isNaN(row) || row < 1) {
			throw Error('Invalid row number: ' + row);
		}
		let table = this.getTable(tableName);
		return table.getRange(row, 1, 1, table.getLastColumn() + 1).getValues()[0];
	}
	count (tableName: string) {
		let table = this.getTable(tableName);
		return table.getLastRow();
	}
	private getTable (name: string): GoogleAppsScript.Spreadsheet.Sheet {
		if (name in this.sheets) {
			return this.sheets[name];
		}
		let table = this.sheets[name] = this.spreadsheet.getSheetByName(name);
		if (table == null) {
			this.lock();
			try {
				table = this.sheets[name] = this.spreadsheet.insertSheet(name);
			}
			finally {
				this.unlock();
			}
		}
		return table;
	}
}
