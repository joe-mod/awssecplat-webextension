// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DockerFileTypeProvider } from "./dockerFileType";
import { DockerfilePanel } from './panels/DockerfilePanel';

// TreeDataProvider to list up the DockerFileTypes in the view of the view container
const dockerFileTypeProvider = new DockerFileTypeProvider();

//	Selectable Docker Mode, initially 'Mode not selected'
export var dockerNodeLabel: string = "[Mode not selected]"; 


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


	// // Current Panel, only one should exist at a time
	// let currentPanel: vscode.WebviewPanel | undefined = undefined;

	
	// const disposableHelloWorld = vscode.commands.registerCommand('awssecplat-webextension.helloWorld', () => {
		
	// 	vscode.window.showInformationMessage('Hello World from awssecplat-webextension in a web extension host!');
	// });

	// context.subscriptions.push(disposableHelloWorld);

	vscode.window.registerTreeDataProvider('dockerContainer',dockerFileTypeProvider);

	vscode.commands.registerCommand("dockerContainer.showDockerFileTypeView", () => {
		vscode.commands.executeCommand('workbench.view.explorer');
	});
	vscode.commands.registerCommand("dockerContainer.selectContainer", (dockerNode) => {
		vscode.window.showInformationMessage((`You have selected ${dockerNode.label} as your desired Docker mode`));
		//vscode.commands.executeCommand((`dockerContainer.selectContainer.catalog.${dockerNode.label}`));
		dockerNodeLabel = dockerNode.label;
	});


	const showCatalog = vscode.commands.registerCommand('test.Dockerfile', () => {

		vscode.window.showInformationMessage("Catalog for your " + dockerNodeLabel);

		// //Panel for catalog DockerFileType Webview
		// currentPanel = vscode.window.createWebviewPanel(
		// 	'catalog',
		// 	(`${dockerNodeLabel} catalog`),
		// 	vscode.ViewColumn.One,
		// 	{}
		// );

		DockerfilePanel.render(context.extensionUri);

	});	

	context.subscriptions.push(showCatalog);
	
}

// This method is called when your extension is deactivated
export function deactivate() { }
