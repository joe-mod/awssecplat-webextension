// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DockerFileTypeProvider } from "./dockerFileType";
import { LanguageServices } from '../../client/src/browserClientMain';
import { DockerModePanel } from './panels/DockerModePanel';
import { DockerScriptViewProvider } from './dockerScriptView';
//import { activateClient } from '../../client/src/browserClientMain';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// TreeDataProvider to list up the DockerFileTypes in the view of the view container
	const dockerFileTypeProvider = new DockerFileTypeProvider();
	const dockerScriptViewProvider = new DockerScriptViewProvider();

	// Handler to start the Language Client 
	const langHandler = new LanguageServices();

	let dockerNodeLabel: string = "[Mode not selected]";

	vscode.window.registerTreeDataProvider('dockerContainer', dockerFileTypeProvider);

	vscode.window.registerTreeDataProvider('dockerScriptView', dockerScriptViewProvider);

	vscode.commands.registerCommand("dockerContainer.showDockerFileTypeView", () => {
		vscode.commands.executeCommand('workbench.view.explorer');
	});

	// !Only gets registered when the select button is pressed, so everything depending on the docker Mode needs to be executed here!
	const showDockerSelection = vscode.commands.registerCommand("dockerContainer.selectContainer", (dockerNode) => {
		vscode.window.showInformationMessage((`You have selected ${dockerNode.label} as your desired Docker mode`));
		//vscode.commands.executeCommand((`dockerContainer.selectContainer.catalog.${dockerNode.label}`));
		dockerNodeLabel = dockerNode.label;

		// Open the webview for the selected Docker Mode
		// TODO
		switch (dockerNodeLabel) {
			case "Dockerfile":
				DockerModePanel.render(context.extensionUri, dockerNodeLabel);
				break;
			case "Docker-Compose":
				DockerModePanel.render(context.extensionUri, dockerNodeLabel);
				break;
			case "Docker_Swarm":
				//DockerSwarmPanel.render(context.extensionUri, dockerNodeLabel);
				break;
		}
		vscode.window.showInformationMessage("Catalog for your " + dockerNodeLabel);

		// TODO: Store the dockerNodeLabel in the extensionContext
		context.workspaceState.update('dockerNodeLabel', dockerNodeLabel);
		console.log("label with context in register command: " + context.workspaceState.get('dockerNodeLabel'));
		console.log("label in register command: " + dockerNodeLabel);

		//start client, when docker type selected
		langHandler.activateClient(context, dockerNodeLabel);

	});

	const showDockerScriptView = vscode.commands.registerCommand('dockerScriptView.selectContainerID', () => {
		vscode.window.showInformationMessage((`You have selected the container scan for container <number>`));
	});

	context.subscriptions.push(showDockerSelection);
	context.subscriptions.push(showDockerScriptView);

	console.log("label outside register command: " + dockerNodeLabel);

	// //if (client) {
	// 	//const disposable = client.start();
	// 	console.log(langHandler.getTrace());
	// 	console.log("label with context outside register command: " + context.workspaceState.get('dockerNodeLabel') + " client: " + client);
	// 	context.subscriptions.push(disposable);
	// //}

}

// This method is called when your extension is deactivated
export function deactivate() {

}
