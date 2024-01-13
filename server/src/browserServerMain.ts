/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createConnection, BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver/browser';

import { Color, ColorInformation, Range, InitializeParams, InitializeResult, TextDocuments, ColorPresentation, TextEdit, TextDocumentIdentifier, TextDocumentSyncKind, DidChangeConfigurationNotification, TextDocumentPositionParams, CompletionItem, CompletionItemKind, DiagnosticSeverity, Diagnostic } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getSafestDistribution, officialImages } from './openai/fetchSafeImage';

console.log('running server awssecplat-webextension in mode Dockerfile');

/* browser specific setup code */

//Type insertion, because self functions correctly but throws error when building
const messageReader = new BrowserMessageReader(self as unknown as DedicatedWorkerGlobalScope);
const messageWriter = new BrowserMessageWriter(self as unknown as DedicatedWorkerGlobalScope);

const connection = createConnection(messageReader, messageWriter);

/* from here on, all code is non-browser specific and could be shared with a regular extension */

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {


	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Full, //does not work with value Incremental???
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			},
		}
	};

	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// Track open, change and close text document events
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

documents.onDidChangeContent((changeEvent) => {
	validateTextDocumentInstructions(changeEvent.document);
});

function validateTextDocumentInstructions(document: TextDocument) {
	const diagnostics: Diagnostic[] = [];
	const dockerOfficialImageList: string[] = officialImages;
    const lines = document.getText().split('\n');
	
	// Regex for KEYWORD
	const fromRegex = /^FROM\s*(\w+):/i;
	const copyRegex = /^COPY \. /i;

    let match: RegExpExecArray | null;

	console.log(lines);
    // Check for COPY instructions that copies everything
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (copyRegex.test(line)) {
            diagnostics.push({
                severity: DiagnosticSeverity.Warning, // 2: Warning, 
                range: {
                    start: { line: i, character: 0 },
                    end: { line: i, character: line.length }
                },
				// Markdown not supported for Diagnostics
                message: ['Copying everything from the current directory is *not recommended*',
						  'or make sure you do not copy sensitive data like secrets',
					      'Read the COPY Keyword manual'].join("\n"),
                source: 'dockerfile-linter'
            });
        }
		if ((match = fromRegex.exec(line))) {

            let baseImage: string = match[1];

			/**
			 * AI Feature: API handling for safe image; when API key not set; fetch from local file; update local file with AI data
			 * problems: api key needs to be set, 
			 */
			let safeImage: string = getSafestDistribution(baseImage);

            if (dockerOfficialImageList.includes(baseImage)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Information, // 3: Information, 
                    range: {
                        start: { line: i, character: (line.indexOf(match[1]) + match[0].indexOf(baseImage)) },
                        end: { line: i, character: (line.indexOf(match[1]) + match[0].indexOf(baseImage)) }
                    },
                    // Markdown not supported for Diagnostics
                    message: [`the safest distribution and version for **${baseImage}** is: ${safeImage}`,
                    ].join("\n"),

                    source: 'docker-compose-linter'
                });
            }
        }
    }

    // Send the diagnostics to VS Code
    connection.sendDiagnostics({ uri: document.uri, diagnostics });
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		return [
			{
				label: 'FROM',
				kind: CompletionItemKind.Text,
				data: 1,
				documentation: {
					kind: "markdown",
					value: [
						'## **FROM** KEYWORD',
						'For more information read the catalog at the **Pulling Images from Dockerhub** section',
					].join('\n')
				}
			},
			{
				label: 'ENV',
				kind: CompletionItemKind.Text,
				data: 2,
				documentation: {
					kind: "markdown",
					value: [
						'## **ENV** KEYWORD',
						'For more information read the catalog at the **Environment Variables** section',
					].join('\n')
				}
			},
			{
				label: 'USER',
				kind: CompletionItemKind.Text,
				data: 3,
				documentation: {
					kind: "markdown",
					value: [
						'## **USER** KEYWORD',
						'For more information read the catalog at the **User and User privileges** and **Kernel namespaces and user namespaces** section',
					].join('\n')
				}
			},
			{
				label: 'EXPOSE',
				kind: CompletionItemKind.Text,
				data: 4,
				documentation: {
					kind: "markdown",
					value: [
						'## **EXPOSE** KEYWORD',
						'For more information read the catalog at the **Exposing Ports** section',
					].join('\n')
				}
			},
			{
				label: 'VOLUME',
				kind: CompletionItemKind.Text,
				data: 5,
				documentation: {
					kind: "markdown",
					value: [
						'## **VOLUME** KEYWORD',
						'Using externally linked volumes is a good practice, because it does not increase the size of a container it is using it and the content',
						'exists ouside the lifecycle of a container, which again has security benefits in form of persistence, outsourcing and you can',
						'configure your data structure to be redundant',
						'### [Docker volume information](https://docs.docker.com/storage/volumes/)',
						'### [Bind mount information](https://docs.docker.com/storage/bind-mounts/)',
					].join('\n')
				}
			},
			{
				label: 'RUN',
				kind: CompletionItemKind.Text,
				data: 6,
				documentation: {
					kind: "markdown",
					value: [
						'## **RUN** KEYWORD',
						'The run command can be used with a shell form and an execute form. The shell form invokes ```/bin/sh -c``` on Linux or ```cmd /S /C``` on Windows.',
						'You can execute many commands with this keyword and many of them serve security benefits.',
						'As an example using mount bind types. The bind type **secrets** are used to save credentials read-only externally, which is a good practice and should',
						'be considered when accessing secret credentials within a container, that should not be stored inside of it.',
						'You can also combine commands with the **&&** operator to reduce layers and by that also the size of your image',
						'### [RUN command](https://docs.docker.com/engine/reference/builder/#run)',
					].join('\n')
				}
			},
			{
				label: 'ADD',
				kind: CompletionItemKind.Text,
				data: 7,
				documentation: {
					kind: "markdown",
					value: [
						'## **Add** KEYWORD',
						'The Add keyword is useful for copying files, directories or remote file URLs to the filesystem of the container',
						'Using the ADD keyword is a good practice for pulling remote resources, because it has a built-in checksum feature you can use',
						'and on top of that it ensures a more precise build cache.',
						'You can also define chmod and chown to configure user and group ownerships.',
						'### [ADD command](https://docs.docker.com/engine/reference/builder/#add)',
						'### [ADD command - more instructions](https://docs.docker.com/develop/develop-images/instructions/#add-or-copy)'
					].join('\n')
				}
			},
			{
				label: 'COPY',
				kind: CompletionItemKind.Text,
				data: 8,
				documentation: {
					kind: "markdown",
					value: [
						'## **COPY** KEYWORD',
						'The COPY keyword is mainly used to copy stages from an image, used in a multi stage context and basically serves the same',
						'functionaliy as the ADD keyword.',
						'You can also define chmod and chown to configure user and group ownerships.',
						'### [COPY command](https://docs.docker.com/engine/reference/builder/#copy)',
						'### [COPY command - more instructions](https://docs.docker.com/develop/develop-images/instructions/#add-or-copy)'
					].join('\n')
				}
			},
			{
				label: 'AS',
				kind: CompletionItemKind.Text,
				data: 9,
				documentation: {
					kind: "markdown",
					value: [
						'## **AS** KEYWORD',
						'For more information read the catalog at the **Security aspects of multi-stage builds and production mode** section',
					].join('\n')
				}
			}
		];
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		// if (item.data === 1) {
		// 	//item.detail = 'TypeScript details';
		// 	//item.documentation = 'TypeScript documentation';
		// } else if (item.data === 2) {
		// 	item.detail = 'JavaScript details';
		// 	//item.documentation = 'JavaScript documentation';
		// } else if (item.data === 3) {
		// 	item.detail = 'Dockerfile details';
		// 	//item.documentation = 'Dockerfile documentation';
		// }
		return item;
	}
);

// Listen on the connection
documents.listen(connection);
connection.listen();


