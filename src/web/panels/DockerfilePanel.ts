import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { dockerNodeLabel } from '../extension';
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";


/**
 * Panel class for the Dockerfile catalog
 */
export class DockerfilePanel {

  public static currentPanel: DockerfilePanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebViewMessageListener(this._panel.webview);
  }

  public static render(extensionUri: Uri) {
    if (DockerfilePanel.currentPanel) {
      // If the webview panel already exists reveal it
      DockerfilePanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        'Dockerfile',
        // Panel title
        (`${dockerNodeLabel} catalog`),
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out` directory
          localResourceRoots: [Uri.joinPath(extensionUri, "dist/web")],
        }
      );

      DockerfilePanel.currentPanel = new DockerfilePanel(panel, extensionUri);
    }
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {

    const webviewUri = getUri(webview, extensionUri, ["dist/web", "webview.js"]);
    const styleUri = getUri(webview, extensionUri, ["dist/web", "style.css"]);
    console.log("WebviewUri: " + webviewUri);
    // Randomly created nonce so script get only executed in the webview context
    const nonce = getNonce();
    console.log("Nonce: " + nonce);

    return (/*html*/
      `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}${console.log("nonce1:" + nonce)}';">
          <link rel="stylesheet" href="${styleUri}">
					<title>Catalog</title>
				</head>
				<body>
					<h1>Dockerfile Catalog</h1><br>
          <a href="#1">Pulling Images from Dockerhub</a><br>
          <a href="#2">Environment Variables</a><br>
          <a href="#3">User and User Privileges</a><br>
          <a href="#4">Exposing ports</a><br>
          <a href="#5">Security aspects of multi-stage builds and production mode</a><br>
          <a href="#6">Healthcheck for container</a><br>
          <vscode-button id="howdy">Howdy!</vscode-button>
          <h2 id="1">Pulling Images from Dockerhub</h2>
          <section class="component-row">
            <vscode-checkbox id="1_1_checkbox">Answer 1</vscode-checkbox><br>
            <vscode-checkbox id="1_2_checkbox">Answer 2</vscode-checkbox><br>
            <vscode-checkbox id="1_3_checkbox">Answer 3</vscode-checkbox><br>
            <vscode-button id="question1_submit">Submit answer</vscode-button>
          </section>
          <h3>What is ...</h3>
          <section class="component-row">
            <vscode-checkbox id="2_1_checkbox">Answer 1</vscode-checkbox><br>
            <vscode-checkbox id="2_2_checkbox">Answer 2</vscode-checkbox><br>
            <vscode-checkbox id="2_3_checkbox">Answer 3</vscode-checkbox><br>
            <vscode-button id="question2_submit">Submit answer</vscode-button>
          </section>
          <h2 id="2">Environment Variables</h2>
          <h2 id="3">User and User Privileges</h2>
          <h2 id="4">Exposing ports</h2>
          <h2 id="5">Security aspects of multi-stage builds and production mode</h2>
          <h2 id="6">Healthcheck for container</h2>
          <!-- -->
          <script type="module" nonce="${nonce}${console.log("nonce2:" + nonce)}" src="${webviewUri}"></script>
				</body>
			</html>
			`
    );
  }

  // Called when Webview is closed to shut down all (possible) remaining processes
  public dispose() {

    DockerfilePanel.currentPanel = undefined;

    // Delete every existing listener or something
    if (this._disposables.length >= 1) {
      this._disposables.forEach(element => {
        element.dispose();
      });
    }

    this._panel.dispose();
    console.log("Panel got closed");
    //context.subscriptions
  }

  private _setWebViewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case "hello":
            window.showInformationMessage(text);
            break;
          case "button":
            window.showInformationMessage(text);
            break;
        }
      },
      undefined,
      this._disposables
    );
  }

}