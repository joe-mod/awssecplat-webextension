// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DockerFileTypeProvider } from "./data-providers/dockerFileType";
import { LanguageServices } from '../../client/src/browserClientMain';
import { DockerModePanel } from './panels/DockerModePanel';
import { DockerScriptViewProvider } from './data-providers/dockerScriptView';
import { getDockerItemNames } from './utilities/containerScan';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// TreeDataProvider to list up the DockerFileTypes in the view of the view container
	const dockerFileTypeProvider = new DockerFileTypeProvider();
	const dockerScriptViewProvider = new DockerScriptViewProvider();

	// Handler to start the Language Client 
	const langHandler = new LanguageServices();

	// the label of the selected Docker Mode
	let dockerNodeLabel: string = "[Mode not selected]";

	/**
	 * Register the TreeDataProvider for both the docker modes and the scanning scripts
	 */
	vscode.window.registerTreeDataProvider('dockerContainer', dockerFileTypeProvider);

	vscode.window.registerTreeDataProvider('dockerScriptView', dockerScriptViewProvider);

	vscode.commands.registerCommand("dockerContainer.showDockerFileTypeView", () => {
		vscode.commands.executeCommand('workbench.view.explorer');
	});

	// !Only gets registered when the select button is pressed, so everything depending on the docker Mode needs to be executed here!
	const showDockerSelection = vscode.commands.registerCommand("dockerContainer.selectContainer", (dockerNode) => {
		vscode.window.showInformationMessage((`You have selected ${dockerNode.label} as your desired Docker mode`));

		dockerNodeLabel = dockerNode.label;

		// Open the webview for the selected Docker Mode
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

		//start client, when docker type selected
		langHandler.activateClient(context, dockerNodeLabel);

	});

	const showDockerScriptView = vscode.commands.registerCommand('dockerScriptView.listContainers', (containerList) => {
		
		vscode.window.showWarningMessage((`Please make sure that docker is running`));

		try {
			const terminal = vscode.window.activeTerminal || vscode.window.createTerminal({ name: 'Docker Script View commandline' });
			terminal.show();
			terminal.sendText('docker ps --format "{{.ID}}:{{.Names}};"'); 
		} catch (error) {
			vscode.window.showInformationMessage((`Please open a terminal`));
		}

		// regex to match <container id>:<container name>
		const regexContainer = /^[a-fA-F0-9]{12}:[a-zA-Z0-9_.-]+$/;

		vscode.window.showInputBox({
			prompt: 'Enter the \'docker ps\' output in the commandline',
			placeHolder: '<container id>:<container name>',
			validateInput: text => {
				const lines = text.split(';');
				for (const line of lines) {
					if (line && !regexContainer.test(line.trim())) {
						return 'One or more lines have an invalid format';
					}
				}
				return null; // Return null if all lines are valid
			},
			ignoreFocusOut: true
		}).then(userInput => {
			if (userInput) {
				containerList = getDockerItemNames(userInput);

				dockerScriptViewProvider.refresh(containerList);
			}
		});

	});

	const scanCommand = vscode.commands.registerCommand('dockerScriptView.scanContainer', (containerName) => {

		console.log(`Scanning container: ${containerName.label}`);
		const command =
			"docker run --rm --net host --pid host --userns host --cap-add audit_control " +
			"-e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST " +
			"-v /usr/bin/containerd:/usr/bin/containerd:ro " +
			"-v /usr/bin/runc:/usr/bin/runc:ro " +
			"-v /usr/lib/systemd:/usr/lib/systemd:ro " +
			"-v /var/lib:/var/lib:ro " +
			"-v /var/run/docker.sock:/var/run/docker.sock:ro " +
			"--label docker_bench_security " +
			"docker/docker-bench-security " +
			"-i " + containerName.label;

		try {
			const terminal = vscode.window.activeTerminal || vscode.window.createTerminal({ name: 'Docker Script View commandline' });
			terminal.show();
			terminal.sendText(command, true);
		} catch (error) {
			vscode.window.showInformationMessage((`Please open a terminal`));
		}

	});

	const dropContainerCommand = vscode.commands.registerCommand('dockerScriptView.dropContainer', (containerName) => {
        // Drops the container with for the given containerName
		dockerScriptViewProvider.dropContainer(containerName.label);
    });


	context.subscriptions.push(showDockerSelection, showDockerScriptView, scanCommand, dropContainerCommand);

}

// This method is called when your extension is deactivated
export function deactivate() {

}
