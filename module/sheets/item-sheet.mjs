import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

const { api, sheets } = foundry.applications.sheets;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class BoilerplateItemSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['boilerplate', 'item'],
    actions: {
      effectControl: onManageActiveEffect,
    },
  };

  /* -------------------------------------------- */

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/boilerplate/templates/item-header.hbs',
    },
    description: {
      template: 'systems/boilerplate/templates/item/item-description.hbs',
    },
    attributes: {
      template: 'systems/boilerplate/templates/item/item-attributes.hbs',
    },
    effects: {
      template: 'systems/boilerplate/templates/item/item-effects.hbs',
    },
  };

  /** @override */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    // Not all parts always render
    options.parts = ['header', 'description'];
    // Don't show the other tabs if only limited view
    if (this.document.limited) return;
    // Control which parts show based on document subtype
    switch (this.document.type) {
      case 'feature':
        options.parts.push('attributes', 'effects');
        break;
      case 'gear':
        options.parts.push('attributes');
        break;
      case 'spell':
        options.parts.push('attributes');
        break;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(_options) {
    const context = {
      item: this.item,
      // Adding system and flags for easier access
      system: this.item.system,
      flags: this.item.flags,
      // Adding a pointer to CONFIG.BOILERPLATE
      config: CONFIG.BOILERPLATE,
    };

    // Enrich description info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedDescription = await TextEditor.enrichHTML(
      this.item.system.description,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.item.getRollData(),
        // Relative UUID resolution
        relativeTo: this.item,
      }
    );

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);

    return context;
  }
}
