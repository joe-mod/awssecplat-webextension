import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { getDockerComposeHTML, getDockerSwarmHTML, getDockerfileHTML } from "../utilities/getDockerFileTypeHTML";


/**
 * Panel class for the Dockerfile catalog
 */
export class DockerModePanel {

  // the currently active panel
  public static currentPanel: { [key: string]: DockerModePanel | undefined } = {};
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  private constructor(panel: WebviewPanel, extensionUri: Uri, dockerNodeLabel: string) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(dockerNodeLabel), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, dockerNodeLabel);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebViewMessageListener(this._panel.webview);
  }

  public static render(extensionUri: Uri, dockerNodeLabel: string) {
    if (DockerModePanel.currentPanel[dockerNodeLabel]) {
      // If the webview panel already exists reveal it
      DockerModePanel.currentPanel[dockerNodeLabel]?._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        (`${dockerNodeLabel}`),
        // Panel title
        (`${dockerNodeLabel} catalog`),
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `dist/web` directory
          localResourceRoots: [Uri.joinPath(extensionUri, "dist/web")],
        }
      );

      DockerModePanel.currentPanel[dockerNodeLabel] = new DockerModePanel(panel, extensionUri, dockerNodeLabel);
    }
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri, dockerNodeLabel: string) {

    const webviewUri = getUri(webview, extensionUri, ["dist/web", "webview.js"]);
    const styleUri = getUri(webview, extensionUri, ["dist/web", "style.css"]);
    // Randomly created nonce so script get only executed in the webview context
    const nonce = getNonce();

    if (dockerNodeLabel === "Dockerfile") {
      return getDockerfileHTML(webviewUri, styleUri, nonce);
    }
    if (dockerNodeLabel === "Docker-Compose") {
      return getDockerComposeHTML(webviewUri, styleUri, nonce);
    }
    else { // No case where dockerNodeLabel is not set
      return getDockerSwarmHTML(webviewUri, styleUri, nonce);
    }


  }

  // Called when Webview is closed to shut down all (possible) remaining processes
  public dispose(dockerNodeLabel: string) {

    DockerModePanel.currentPanel[dockerNodeLabel] = undefined;

    // Delete every existing listener or something
    if (this._disposables.length >= 1) {
      this._disposables.forEach(element => {
        element.dispose();
      });
    }

    this._panel.dispose();
  }

  private _setWebViewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const text = message.text;
        const isQuestionCorrect = message.data;

        switch (command) {
          case "pressedQuestionSubmitButton":
            if (isQuestionCorrect) {
              window.showInformationMessage(text);
            } else {
              window.showWarningMessage(text);
            }
            break;
        }
      },
      undefined,
      this._disposables
    );
  }

}