import { TextDocument } from "vscode-languageserver-textdocument";
import { BrowserMessageReader, BrowserMessageWriter, CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity, InitializeParams, InitializeResult, TextDocumentPositionParams, TextDocumentSyncKind, TextDocuments, createConnection } from "vscode-languageserver/browser";



console.log('running server awssecplat-webextension in mode Docker-Compose');

/* browser specific setup code */

//TODO? Type insertion, because self functions correctly but throws error when building
const messageReader = new BrowserMessageReader(self as unknown as DedicatedWorkerGlobalScope);
const messageWriter = new BrowserMessageWriter(self as unknown as DedicatedWorkerGlobalScope);

const connection = createConnection(messageReader, messageWriter);

const dockerOfficialImageList: string[] = [
    "alpine",
    "nginx",
    "busybox",
    "ubuntu",
    "python",
    "redis",
    "postgres",
    "memcached",
    "node",
    "httpd",
    "mongo",
    "mysql",
    "traefik",
    "rabbitmq",
    "docker",
    "mariadb",
    "hello-world",
    "openjdk",
    "golang",
    "registry",
    "wordpress",
    "debian",
    "centos",
    "php",
    "consul"
    // ... more images
];

/* from here on, all code is non-browser specific and could be shared with a regular extension */


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

// Track open, change and close text document events
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

documents.onDidChangeContent((changeEvent) => {
    validateTextDocumentInstructions(changeEvent.document);
});

function validateTextDocumentInstructions(document: TextDocument) {
    const diagnostics: Diagnostic[] = [];
    const lines = document.getText().split('\n');

    console.log(lines);

    const regexPattern = /image:\s*"?(\w+):"?/i;
    const privilegedRegex = /privileged:\s*/i;
    const readonlyRegex = /read_only:\s*/i;
    let match: RegExpExecArray | null;

    // Check for COPY instructions that copies everything
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if ((match = privilegedRegex.exec(line)) && line.includes('true')) {
            diagnostics.push({
                severity: DiagnosticSeverity.Warning, // 2: Warning, 
                range: {
                    start: { line: i, character: (line.indexOf(match[0]) + match[0].length) }, // dont know why that works
                    end: { line: i, character: (line.indexOf(match[0]) + match[0].length) } 
                },
                message: ["Running a priveleged container is generally *not recommended* in most of the cases. You can use it carefully, if you are using your own image or",
                    "one that is from a trusted Docker publisher in a context where an attacker cannot easily harm your system due to that",
                    "setting. Breaching out from container to host system with this setting can be easily done, because an attacker is able to execute",
                    "commands with priveleges that host processes have.",
                ].join("\n"),

                source: 'docker-compose-linter'
            });
        }
        if ((match = readonlyRegex.exec(line)) && line.includes('false')) {

            diagnostics.push({
                severity: DiagnosticSeverity.Warning, // 2: Warning, 
                range: {
                    start: { line: i, character: (line.indexOf(match[0]) + match[0].length) }, // dont know why that works
                    end: { line: i, character: (line.indexOf(match[0]) + match[0].length) } 
                },
                message: ["Using writable volumes in services that do not need them is *not recommended* and you should consider setting it to true.",
                          "Read more in the Compose catalog",
                         ].join("\n"),

                source: 'docker-compose-linter'
            });
        }
        if ((match = regexPattern.exec(line))) {

            let baseImage: string = match[1];
            if (dockerOfficialImageList.includes(baseImage)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Information, // 3: Information, 
                    range: {
                        start: { line: i, character: (line.indexOf(match[1]) + match[0].indexOf(baseImage)) }, // dont know why that works
                        end: { line: i, character: (line.indexOf(match[1]) + match[0].indexOf(baseImage)) }
                    },
                    // Markdown not supported for Diagnostics
                    message: [`the safest distribution and version for **${baseImage}** is: test`,
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

connection.onCompletion((_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    return [
        {
            label: 'args',
            kind: CompletionItemKind.Text,
            data: 1,
            documentation: {
                kind: "markdown",
                value: [
                    '## **args** KEYWORD',
                    'For more information read the catalog at the **Environment variables** section',
                ].join('\n')
            }
        },
        {
            label: 'version',
            kind: CompletionItemKind.Text,
            data: 1,
            documentation: {
                kind: "markdown",
                value: [
                    '## **version** KEYWORD',
                    'The version keyword is optional and is only used for Compose backward capability to validate if the file can be fully parsed or not',
                    'due to new possible unknown attributes'
                ].join('\n')
            }
        },
        {
            label: 'secrets',
            kind: CompletionItemKind.Text,
            data: 1,
            documentation: {
                kind: "markdown",
                value: [
                    '## **secrets** KEYWORD',
                    'The secrets keyword can be used as a top-level attribute and define sensitive data, whether as a ```file``` or ```environment```',
                    'You can then define argument inside your services and decide which service should use the secret'
                ].join('\n')
            }
        },
        {
            label: 'volume',
            kind: CompletionItemKind.Text,
            data: 1,
            documentation: {
                kind: "markdown",
                value: [
                    '## **volume** KEYWORD',
                    'For more information read the Compose catalog at the **Mounting and volumes** section and also the Dockefile catalog with the related section',
                ].join('\n')
            }
        },
    ];
});

// Not needed but without it causes information Messages
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