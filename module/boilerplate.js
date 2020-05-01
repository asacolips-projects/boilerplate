// Import Modules
import { BoilerplateActor } from "./actor/actor.js";
import { BoilerplateActorSheet } from "./actor/actor-sheet.js";
import { BoilerplateItem } from "./item/item.js";
import { BoilerplateItemSheet } from "./item/item-sheet.js";

Hooks.once('init', async function() {

  game.boilerplate = {
    BoilerplateActor,
    BoilerplateItem
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2
  };

  // Define custom Entity classes
  CONFIG.Actor.entityClass = BoilerplateActor;
  CONFIG.Item.entityClass = BoilerplateItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("boilerplate", BoilerplateActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("boilerplate", BoilerplateItemSheet, { makeDefault: true });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });
});