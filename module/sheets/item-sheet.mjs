import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

const { api, sheets } = foundry.applications;

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
      manageEffect: this._manageEffect,
    },
  };

  /* -------------------------------------------- */

  /** @override */
  static PARTS = {
    header: {
      template: 'systems/boilerplate/templates/item/header.hbs',
    },
    tabs: {
      // Foundry-provided generic template
      template: 'templates/generic/tab-navigation.hbs',
    },
    description: {
      template: 'systems/boilerplate/templates/item/description.hbs',
    },
    attributesFeature: {
      template:
        'systems/boilerplate/templates/item/attribute-parts/feature.hbs',
    },
    attributesGear: {
      template: 'systems/boilerplate/templates/item/attribute-parts/gear.hbs',
    },
    attributesSpell: {
      template: 'systems/boilerplate/templates/item/attribute-parts/spell.hbs',
    },
    effects: {
      template: 'systems/boilerplate/templates/item/effects.hbs',
    },
  };

  /** @override */
  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    // Not all parts always render
    options.parts = ['header', 'tabs', 'description'];
    // Don't show the other tabs if only limited view
    if (this.document.limited) return;
    // Control which parts show based on document subtype
    switch (this.document.type) {
      case 'feature':
        options.parts.push('attributesFeature', 'effects');
        break;
      case 'gear':
        options.parts.push('attributesGear');
        break;
      case 'spell':
        options.parts.push('attributesSpell');
        break;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const context = {
      item: this.item,
      // Adding system and flags for easier access
      system: this.item.system,
      flags: this.item.flags,
      // Adding a pointer to CONFIG.BOILERPLATE
      config: CONFIG.BOILERPLATE,
      // You can factor out context construction to helper functions
      tabs: this._getTabs(options.parts),
    };

    return context;
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'attributesFeature':
      case 'attributesGear':
      case 'attributesSpell':
        // Necessary for preserving active tab on re-render
        context.tab = context.tabs[partId];
        break;
      case 'description':
        context.tab = context.tabs[partId];
        // Enrich description info for display
        // Enrichment turns text like `[[/r 1d20]]` into buttons
        context.enrichedDescription = await TextEditor.enrichHTML(
          this.item.system.description,
          {
            // Whether to show secret blocks in the finished html
            secrets: this.document.isOwner,
            // Data to fill in for inline rolls
            rollData: this.item.getRollData(),
            // Relative UUID resolution
            relativeTo: this.item,
          }
        );
        break;
      case 'effects':
        context.tab = context.tabs[partId];
        // Prepare active effects for easier access
        context.effects = prepareActiveEffectCategories(this.item.effects);
        break;
    }
    return context;
  }

  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    return parts.reduce((tabs, partId) => {
      // If you have sub-tabs this is necessary to change
      const tabGroup = 'primary';
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'BOILERPLATE.Item.Tabs.',
      };
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'description':
          tab.id = 'description';
          tab.label += 'Description';
          break;
        case 'attributesFeature':
        case 'attributesGear':
        case 'attributesSpell':
          tab.id = 'attributes';
          tab.label += 'Attributes';
          break;
        case 'effects':
          tab.id = 'effects';
          tab.label += 'Effects';
          break;
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  /**************
   *
   *   ACTIONS
   *
   **************/

  /**
   * Determines effect parent to pass to helper
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _manageEffect(event, target) {
    // Using a wrapper to forward the correct owner
    onManageActiveEffect(event, target, this.document);
  }
}
