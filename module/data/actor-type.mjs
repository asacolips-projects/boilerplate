export default class BoilerplateActorType extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = {};

        schema.health = new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
            max: new fields.NumberField({ ...requiredInteger, initial: 10 })
        });
        schema.power = new fields.SchemaField({
            value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
            max: new fields.NumberField({ ...requiredInteger, initial: 5 })
        });
        schema.biography = new fields.StringField({ initial: "" });

        return schema;
    }

    prepareBaseData() {

    }

    prepareDerivedData() {
        
    }
}