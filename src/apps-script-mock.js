if (typeof window === 'undefined') {
    global.window = global;
}

const LockService = {
    getDocumentLock () {
        return {
            waitLock () {},
            releaseLock () {}
        }
    }
};

const SpreadsheetApp = {
    getActiveSpreadsheet () {
        return window.spreadsheet || (window.spreadsheet = new SpreadsheetMock());
    },
    id: null,
    openById (id) {
        if (this.id && this.id !== id) {
            throw Error('Only one spreadsheet is supported');
        }
        this.id = id;
        return this.getActiveSpreadsheet();
    }
}


const ContentService = {
    response: null,
    MimeType: {},    
    createTextOutput (json) {
        this.response = Promise.resolve(JSON.parse(json));
        return this;
    },
    setMimeType () {
        return this.response;
    }
};


class SpreadsheetMock {
    constructor () {
        this.tables = {};
    }
    getSheetByName (name) {
        let table = this.tables[name];
        if (table) return table;

        return this.tables[name] = new SheetMock();
    }
}

class SheetMock {
    constructor () {
        this.table = [];
    }    
    getRange (rowNumber, columnNumber, rowCount = 1, columnCount = 1) {
        let range = [];
        for (var row = rowNumber; row < rowNumber + rowCount; row++) {
            let arr = [];
            for (var column = columnNumber; column < columnNumber + columnCount; column++) {
                arr.push([row, column])
            } 
            range.push(arr);         
        }
        return new RangeMock(this, range);
    }    
    getLastRow () {
        return this.table.length;
    }
    getLastColumn () {
        var max = 1;
        this.table.forEach(x => max = Math.max(max, x.length));
        return max;
    }
    appendRow (rowValues) {
        this.table.push(rowValues);
    }
    getValue (rowNum, columnNum) {
        if (this.table.length < rowNum - 1) {
            return null;
        }
        let rowValues = this.table[rowNum - 1];
        if (rowValues == null) {
            return null;
        }
        return rowValues[columnNum - 1];
    }
    setValue (rowNum, columnNum, value) {
        let rowArr = this.table[rowNum - 1];
        if (rowArr == null) {
            rowArr = this.table[rowNum - 1] = [];
        }
        rowArr[columnNum - 1] = value;
    }
    deleteRow (rowNum) {
        this.table.splice(rowNum - 1, 1);
    }
    deleteRows (rowNum, count) {
        this.table.splice(rowNum - 1, count);
    }
}

class RangeMock {
    constructor (sheet, positions) {
        this.sheet = sheet;
        this.positions = positions;
    }
    getValues () {
        return this.positions.map(rowPositions => {
            return rowPositions.map(position => {
                let [row, column] = position;
                return this.sheet.getValue(row, column);
            });            
        })
    }
    setValues (values) {
         this.positions.forEach((rowPositions, i) => {
            rowPositions.forEach((position, j) => {
                let [row, column] = position;
                let value = getValue(i, j);
                return this.sheet.setValue(row, column, value);
            });            
        });
        function getValue (i, j) {
            let x = values[i];
            if (x == null) {
                return null;
            }
            return x[j];
        }
    }
}

class UrlFetchAppMock {
    constructor () {
        window.UrlFetchApp = this;
        this.fetchCalls = [];
    }    

    fetch (...args) {
        this.fetchCalls.push([...args]);
    }
}



class CacheServiceMock {
    constructor () {
        this.cache = {};
    }
    get (key) {
        return this.cache[key];
    }
    put (key, val) {
        this.cache[key] = val;
    }
}


const CacheService = {
    cache: new CacheServiceMock(),
    getScriptCache () {
        return this.cache;
    }
}