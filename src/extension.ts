import * as vscode from 'vscode';
import { extractLiteral } from './extractLiteral';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'extension.extractLiteral',
    extractLiteral
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
