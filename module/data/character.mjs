import BoilerplateActorType from "./actor-type.mjs";

export default class BoilerplateCharacter extends BoilerplateActorType {

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.attributes = new fields.SchemaField({
            level: new fields.SchemaField({
                value: new fields.NumberField({ ...requiredInteger, initial: 1 })
            }),
        });
        schema.abilities = new fields.SchemaField({
            str: new fields.SchemaField({
                value: new fields.NumberField({ ...requiredInteger, initial: 10 }),
                mod: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                label: new fields.StringField({ initial: "" })
            }),
            dex: new fields.SchemaField({
                value: new fields.NumberField({ ...requiredInteger, initial: 10 }),
                mod: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                label: new fields.StringField({ initial: "" })
            }),
            con: new fields.SchemaField({
                value: new fields.NumberField({ ...requiredInteger, initial: 10 }),
                mod: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                label: new fields.StringField({ initial: "" })
            }),
            int: new fields.SchemaField({
                value: new fields.NumberField({ ...requiredInteger, initial: 10 }),
                mod: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                label: new fields.StringField({ initial: "" })
            }),
            wis: new fields.SchemaField({
                value: new fields.NumberField({ ...requiredInteger, initial: 10 }),
                mod: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                label: new fields.StringField({ initial: "" })
            }),
            cha: new fields.SchemaField({
                value: new fields.NumberField({ ...requiredInteger, initial: 10 }),
                mod: new fields.NumberField({ ...requiredInteger, initial: 0 }),
                label: new fields.StringField({ initial: "" })
            }),
        });

        return schema;
    }

    prepareBaseData() {

    }

    prepareDerivedData() {
        // Loop through ability scores, and add their modifiers to our sheet output.
        for (const key in this.abilities) {
            // Calculate the modifier using d20 rules.
            this.abilities[key].mod = Math.floor((this.abilities[key].value - 10) / 2);
            this.abilities[key].label = game.i18n.localize(CONFIG.BOILERPLATE.abilities[key]) ?? key;
        }
    }
}