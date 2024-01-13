/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { LanguageClientOptions } from 'vscode-languageclient';

import { LanguageClient } from 'vscode-languageclient/browser';


export class LanguageServices {


	private languageClient: LanguageClient | undefined;

	constructor() {}

	/**
	 * Activation function for the language client to start the language server
	 * @param context is the extension context of the extension and all its resources
	 * @param dockerMode is the mode the user has selected
	 * @returns 
	 */
	activateClient(context: vscode.ExtensionContext, dockerMode: string): LanguageClient {
	
		console.log('lsp-web-extension activated!');
	
		//If a language server is already running, close the current one
		//There should not be 2 running at the same time, due to the ports being used
		if(this.languageClient) {
			console.log("currently langugage server running, closing it now");
			this.dispose();
		}

		console.log("Server is online: " + !!(this.languageClient));

		console.log("The mode is: " + dockerMode);

		let currentDockerMode = dockerMode;

		/* 
		 * all except the code to create the language client in not browser specific
		 * and could be shared with a regular (Node) extension
		 */
		
		let documentSelector;
		if(currentDockerMode === "Dockerfile") {
			documentSelector = [{ scheme: 'file', language: 'dockerfile' }]; 
		} else if (currentDockerMode === "Docker-Compose") {
			documentSelector = [{ scheme: 'file', language: 'dockercompose' }]; 
		}
	
		// Options to control the language client
		const clientOptions: LanguageClientOptions = {
			documentSelector,
			synchronize: {
				// Notify the server about file changes to '.clientrc files contained in the workspace
				fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
			},
			initializationOptions: {}
		};
		
		// Before starting new language client, close the old own -> no multi-language setup
		this.dispose();
		const client = this.createWorkerLanguageClient(context, clientOptions, dockerMode);
	
		client.onReady().then(() => {
			console.log('lsp-web-extension-sample server is ready');
		});

		//Start the client
		client.start();
	
		return client;
	}

	getTrace() {
		return this.languageClient?.traceOutputChannel;
	}
	
	createWorkerLanguageClient(context: vscode.ExtensionContext, clientOptions: LanguageClientOptions, dockerMode: string) {
		// Create a worker. The worker main file implements the language server.

		let serverFile = dockerMode === "Dockerfile" ? "browserServerMain.js" :
						 dockerMode === "Docker-Compose" ? "browserServerMainDC.js" : 
						 //dockerMode === "Docker_Swarm" ? ""
						 undefined;

		const serverMain = vscode.Uri.joinPath(context.extensionUri, `server/dist/${serverFile}`);
		// new worker gets created, which is a webworker in the web extension context
		const worker = new Worker(serverMain.toString(true));
		
		this.languageClient = new LanguageClient('awssecplat-webextension', 'LSP Web Extension AWSSECPLAT', clientOptions, worker);
		

		// create the language server client to communicate with the server running in the worker
		return this.languageClient;
	}

	dispose() {
		if(this.languageClient) {
			this.languageClient.stop();	
		}
	}
}
