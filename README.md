# ngx-translate-extract-literal README

VS Code extension to help extract literals for ngx-translate.

## Features

Extract selected text to i18n json file and choose translation for all languages/locales in project.

## Requirements

The extension itself does not have any requirements. But it is intendent to help you extract literals for **ngx-translate**.

## Extension Settings

This extension contributes the following settings:

* `ngx-translate-extract-literal.translationsDir` - Root directory of i18n json files.
* `ngx-translate-extract-literal.locales` - Array of all locales that must be supported.
* `ngx-translate-extract-literal.defaultLocale` - Default locale to work with.
* `ngx-translate-extract-literal.setDefaultLanguageTranslationOnly` - If this is 'true' then only set empty translation for every non-default language. Otherwise, you will be prompted to enter translation for every language.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

### 0.0.3

* Add keybinding `Cmd+Shift+K`.

* If no text is selected, give option to enter translation for default locale.

* Update placeholders for input fields.

### 0.0.2

* Update extention's name to "Extract literals".

### 0.0.1

* Initial release. Minimum functionality and configuration. Not much customization.
