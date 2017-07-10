Google Apps Script as a Backend.
----
[![Build Status](https://travis-ci.org/tenbits/apps-script-backend.png?branch=master)](https://travis-ci.org/tenbits/apps-script-backend)
[![NPM version](https://badge.fury.io/js/apps-script-backend.svg)](http://badge.fury.io/js/apps-script-backend)

----

_First iteration of the library._

Features:

- [Google Spreadsheet ORM](#google-spreadsheet-orm)
- [Google Web App HTTP Router](#google-web-app-http-router)
- [Google Mocks](#google-mocks)


## Google Spreadsheet ORM

Annotate your models and tables with the information about the spreadsheet information, and save/load your entities with one line of code.


```ts
import StorageService from 'apps-script-backend/src/storage/StorageService'
import Entity from 'apps-script-backend/src/storage/Entity'
import Table from 'apps-script-backend/src/storage/Table'
import { tableColumns, tableName, tableType } from 'apps-script-backend/src/storage/decorators'

@tableColumns([
    ['name'], 
    ['age', { type: Number }]
])
class CatEntity extends Entity {
    name: string
    age: number
}

@tableName('Cats')
@tableType(CatEntity)
class CatsTable extends Table<CatEntity> {
    
}

let cat = new CatEntity();
cat.name = 'Barsik';
cat.age = 10;

let storage = new StorageService('my_spreadsheet_id');
let table = new CatsTable(storage);
table.upsert(cat);
```

> You can implement your own `IStorageService` to support storage other then google spreadsheets


## Google Web App HTTP Router

For now, there is an action based routing


```ts
// actions/GetEchoAction.ts
import Application from 'apps-script-backend/src/Application';
import { IAction } from 'apps-script-backend/src/Router';
import { sendJson } from 'apps-script-backend/src/helpers/http';

export default <IAction> {
    process (request, app: Application) {
        const foo = request.parameter.foo;
        return { echoFoo: foo };
    }
};
```
```ts
// main.ts
import options from './options';
import GetEchoAction from './actions/GetEchoAction';
import Application from 'apps-script-backend/src/Application';
import Router from 'apps-script-backend/src/Router';

let app = new Application({
	secure: options.secure,
	routes: {
		'$get /echo': GetEchoAction
	},
	spreadsheetId: options.spreadsheetId,
	shouldMeaserTimings: options.shouldMeaserTimings,
	logLevel: 'warn'
});

function doPost(request) {
	return app.process('post', request);
}
function doGet(request) {
	return app.process('get', request);
}
```


## Google Mocks

We have created some Google apps script API mocks, so that you can create and test your application even without uploading it to google scripts. See the `test` folder.  

----

:copyright: 2017 MIT