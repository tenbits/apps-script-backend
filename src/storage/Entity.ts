import { EntityHelper } from './decorators';

export default abstract class Entity {
    
    public row: number = 0;

    serialize(options?: any): any[] {
        return EntityHelper.serialize(this, options);
    }

    static deserialize (this: new () => Entity, values: any[]) {
        return EntityHelper.deserialize(this, values);     
    }
}