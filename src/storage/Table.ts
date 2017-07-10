import Entity from './Entity';
import { IStorageService } from './StorageService';
import { TableHelper, EntityHelper } from './decorators';

abstract class Table<T extends Entity> {
	
	constructor (protected service: IStorageService) {

	}
	
	lock () {
		this.service.lock();
	}
	unlock () {
		this.service.unlock();
	}
	
	find (property: string, value: any): T {
		let row = this.findRow(property, value);
		if (row === -1) {
			return null;
		}
		let tableName = TableHelper.getName(this);
		let tableType = TableHelper.getType(this);
		let values = this.service.getRow(tableName, row);
		let entry = EntityHelper.deserialize(tableType, values) as T;
		entry.row = row;
		return entry;
	}
	findRow (property: string, value: any): number {
		let tableName = TableHelper.getName(this);
		let tableType = TableHelper.getType(this);
		let column = EntityHelper.getColumn(tableType, property);
		return this.service.findRow(tableName, column, value);
	}
	deleteRow (row: number) {
		let tableName = TableHelper.getName(this);
		this.service.deleteRow(tableName, row);
	}
	deleteRows (row: number, count: number = 1) {
		let tableName = TableHelper.getName(this);
		this.service.deleteRows(tableName, row, count);
	}
	upsert (entity: T) {
		if (entity.row > 0) {
			this.update_(entity);
			return;
		} 
		this.insert_(entity);
	}
	count (): number {
		let tableName = TableHelper.getName(this);		
		return this.service.count(tableName);
	}
	private insert_ (entity: T) {
		let tableName = TableHelper.getName(this);
		let values = EntityHelper.serialize(entity);
		this.service.insertRow(tableName, values);
	}
	private update_ (entity: T) {
		let tableName = TableHelper.getName(this);
		let values = EntityHelper.serialize(entity);
		this.service.updateRow(tableName, entity.row, values);
	}
}


export default Table;