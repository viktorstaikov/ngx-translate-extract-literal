import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export async function extractLiteral() {
  const settings = getSettings();

  if (!settings) {
    vscode.window.showErrorMessage('No settings provided.');
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No selected text to translate');
    return;
  }

  const selectedText = editor.document.getText(editor.selection);
  if (!selectedText) {
    vscode.window.showWarningMessage('No selected text to translate');
    return;
  }

  let input =
    (await vscode.window.showInputBox({
      prompt: `Enter a key for "${selectedText}" translation literal`,
      placeHolder: 'e.g. "greetings.daily_greeting"'
    })) || '';

  const key = input;
  if (!key) {
    vscode.window.showWarningMessage('No translation key entered');
    return;
  }
  const value = selectedText;

  const replaceWith = `{{ '${key}' | translate }}`;
  editor.edit(builder => {
    builder.replace(editor.selection, replaceWith);
  });

  const locales = settings.locales;
  const setDefaultLanguageTranslationOnly =
    settings.setDefaultLanguageTranslationOnly;

  await locales.reduce((chain: Promise<any>, locale: string) => {
    return chain
      .then(result => {
        vscode.window.showInformationMessage(result);

        if (locale === settings.defaultLocale && value) {
          return updateLocale(settings.translationsDir, locale, key, value);
        }
        if (setDefaultLanguageTranslationOnly) {
          return updateLocale(settings.translationsDir, locale, key, '');
        }

        return vscode.window
          .showInputBox({
            prompt: `Enter translation of "${selectedText}" (${key}) for ${locale}`,
            placeHolder: `${locale.toUpperCase()}`
          })
          .then((inputBoxValue: string | undefined) => {
            const translation = inputBoxValue || '';
            return updateLocale(
              settings.translationsDir,
              locale,
              key,
              translation
            );
          });
      })
      .then(
        msg => {
          vscode.window.showInformationMessage(msg);
        },
        e => {
          vscode.window.showErrorMessage(e);
        }
      );
  }, Promise.resolve());
}

function getSettings() {
  const settings = vscode.workspace.getConfiguration(
    'ngx-translate-extract-literal'
  );

  if (!settings) {
    vscode.window.showErrorMessage('Not configured');
    return;
  }

  if (!settings.translationsDir) {
    vscode.window.showErrorMessage('No translationsDir provided.');
    return;
  }

  if (!settings.locales || !Array.isArray(settings.locales)) {
    vscode.window.showErrorMessage('No locales array provided.');
    return;
  }

  if (!settings.defaultLocale) {
    vscode.window.showErrorMessage('No default locale provided.');
    return;
  }

  return settings;
}

function updateLocale(
  translationsDir: string,
  locale: string,
  key: string,
  value: string
) {
  const root = vscode.workspace.rootPath || '';
  const filePath = path.join(root, `${translationsDir}/${locale}.json`);

  return new Promise<string>((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err.message);
        return;
      }
      let json;
      try {
        json = JSON.parse(data);
      } catch (err) {}

      if (!json) {
        reject(`No valid JSON for ${locale}`);
        return;
      }

      // json[key] = value;
      const updated = setKey(json, key, value);

      fs.writeFile(filePath, JSON.stringify(updated, null, 4), err => {
        if (err) {
          reject(`Error while saving for language ${locale}: ${err.message}`);
          return;
        }

        resolve(`Success for ${locale}`);
      });
    });
  });
}

function setKey(obj: any, key: string, value: string): any {
  const tokens = key.split('.');

  if (tokens.length < 2) {
    return Object.assign({}, obj, { [key]: value });
  }

  if (!obj[tokens[0]]) {
    obj[tokens[0]] = {};
  }
  const childObj = obj[tokens[0]];
  const childKey = tokens.slice(1).join('.');

  const updated = setKey(childObj, childKey, value);
  return Object.assign({}, obj, { [tokens[0]]: updated });
}
