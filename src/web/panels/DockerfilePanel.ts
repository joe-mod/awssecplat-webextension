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
          <h2>Security aspects for images</h2>
          <a href="#1">Pulling Images from Dockerhub</a><br>
          <a href="#2">Environment Variables</a><br>
          <a href="#3">User and User Privileges</a><br>
          <a href="#4">Exposing ports</a><br>
          <a href="#5">Security aspects of multi-stage builds and production mode</a><br>
          <a href="#6">Healthcheck for container</a><br>
          <h2>Intrinsic security of containers</h2>
          <a href="#7">Kernel namespaces</a><br>
          <a href="#8">Control Groups</a><br>
          <a href="#9">Linux Kernel Capabilities</a>
          <br>
          <h1>Security aspects for images</h1>
          <h2 id="1">Pulling Images from Dockerhub</h2>
          <section>
            <div>
              <p>
              When pulling images from the Docker Hub it is important to know what you are pulling. Therefore you should inspect the image on the hub. 
              It is recommended to look up if the Image you are about to pull got a <b>'DOCKER OFFICIAL IMAGE'</b> sign, because these are the most secure ones.
              These are also beginner-friendly, because they serve clear documentation. Furthermore it is recommended to lookup if the image got pushed by a <b>'VERIFIED PUBLISHER'</b>
              with a marked badge.
              </p>
              <p>
              Images may vary in their code version and every version got their own benefits and downsides. It is generally a good practice to look for variant that minimizes the 
              Image size, e.g. filtering the dev dependencies for a production image like alpine or a slim distribution for a NodeJS image. 
              On top of that you also minimize the attack vectors that come with a larger amount of packages.
              </p>
              <b>Pulling example images</b>
              <br>
              | FROM node:16.17.0-bullseye-slim
              <br>
              | FROM node:alpine
            </div>
            <section class="component-row">
              <h4>1. Which images can you trust by default?</h4>
              <vscode-checkbox id="1_1_checkbox">A docker official image</vscode-checkbox><br>
              <vscode-checkbox id="1_2_checkbox">An image published by a verified publisher</vscode-checkbox><br>
              <vscode-checkbox id="1_3_checkbox">An image which has been pulled by many docker users</vscode-checkbox><br>
              <vscode-button id="question1_submit">Submit answer</vscode-button>
            </section>
          </section>
          
          <section>
          <h2 id="2">Environment Variables</h2>
          <div>
            <p>
            Especially for images built to use in production you want to make sure that your frameworks and libraries have the ideal performance and security settings.
            Thus it is good to use environment variables that activate these settings. You can look up the perfect coniguration for your image.
            In a production NodeJS image you can set your environment variables to <b>ENV NODE_ENV=production</b> to achieve the above mentioned effect.
            Another example when writing a database image is to declare a user with restricted privileges with <b>MYSQL_USER</b> and <b>MYSQL_PASSWORD</b>
            <p>
              <a href="https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production">
              More information environment variables with node</a>
            </p>
            <p>
              <a href="https://www.dynatrace.com/news/blog/the-drastic-effects-of-omitting-node-env-in-your-express-js-applications/">
              Effects of using node_env in express</a>
            </p>
            <b>Setting up environment variables</b>
            <br>
            | ENV MY_VAR my-value
            </p>
          </div>
            <section class="component-row">
              <h4>2. What are benefits of environment variables?</h4>
              <vscode-checkbox id="2_1_checkbox">Secrets and configurations do not get pasted on git</vscode-checkbox><br>
              <vscode-checkbox id="2_2_checkbox">Better performance and security </vscode-checkbox><br>
              <vscode-checkbox id="2_3_checkbox">You can create environment variables for storing secrets</vscode-checkbox><br>
              <vscode-button id="question2_submit">Submit answer</vscode-button>
            </section>
          </section>
          <h2 id="3">User and User Privileges</h2>
          <section>
          <div>
          <p>
          The default user for a newly created container is root, therefore there is an approach called rootless and running the container with a non-root user.
          Rootless got some prerequisites so the docker daemon itself is a non-privileged user.
          <p>
          <a href="https://docs.docker.com/engine/security/rootless/#prerequisites">
          More information for rootless prerequisites</a>
          </p>
          <p>
          To start the container itself with a specified user, you need to either use the default users declared in your runtime environment or create
          your own with your preferences. For NodeJS it could be the user <b>'node'</b>
          When creating an user you can restrict it to use certain files or to only access certain directories.
          </p>
            <p>
              <b>User configuration</b>
              | RUN adduser -D awsec-node && chown -R awsec-node /app
              <br>
              | USER awsec-node
            </p>
          </p>
            <section class="component-row">
                <h4>3. When you declare a user in a dockerfile, it is...</h4>
                <vscode-checkbox id="3_1_checkbox">on the host and within the container</vscode-checkbox><br>
                <vscode-checkbox id="3_2_checkbox">only within the container, not related to a host user</vscode-checkbox><br>
                <vscode-checkbox id="3_3_checkbox">only on the host </vscode-checkbox><br>
                <vscode-button id="question3_submit">Submit answer</vscode-button>
              </section>
            </section>
          </div>
          </section>
          <h2 id="4">Exposing ports</h2>
          <section>
            <p>
              Exposing ports in normally only a problem if your container image itself is poorly configured which leads to potential vulnerabilites.
              Although you need to make sure that you only open ports that need to be accessed. If containers need to communicate with each other,
              it may be better to build a network for them. The default bridge network links every container on the host with each other by opening a port,
              which may not be your intention. 
              <p>
                <a href="https://docs.docker.com/network/network-tutorial-standalone/#use-user-defined-bridge-networks">
                More information to create your own bridge network</a>
              </p>
            </p>
          </section>
          <h2 id="5">Security aspects of multi-stage builds and production mode</h2>
          <section>
            <p>
              Multi-stage builds are a good way to increase performance when building your image and also minimize the attack vectors for your image.
              By using multiple stages you can use the cache management effectively and your stages can also, if possible, be executed in parallel. 
              As an example, the final stage, which could represent the production image, can install only the relevant production dependencies to run
              your application and filter many vulnerabilites which come along with a large amount of development dependencies.
            </p>
            <p>
              <a href="https://docs.docker.com/develop/security-best-practices/#use-multi-stage-builds">
              More security-wise information</a>
            </p>
            <p>
              <a href="https://docs.docker.com/build/building/multi-stage/">How to configure multi-stage builds</a>
            </p>
            <section class="component-row">
              <h4>4. What is correct when it comes to security aspects of multi-stage builds</h4>
              <vscode-checkbox id="4_1_checkbox">Minimizing the attack vectors by filtering production irrelevant dev dependencies</vscode-checkbox><br>
              <vscode-checkbox id="4_2_checkbox">By using the cache management arbitrary code can get cached</vscode-checkbox><br>
              <vscode-checkbox id="4_3_checkbox">Performance increase when building and a final production image</vscode-checkbox><br>
              <vscode-button id="question4_submit">Submit answer</vscode-button>
            </section>
          </section>
          </section>
          <h2 id="6">Healthcheck for container</h2>
          <section>
          <p>
            The healthcheck is a useful option to add, especially for production containers, to check their health status.
            You can log these healthchecks for example and take actions for your specific use case.
            With integrating healthcheck you have many side benefits like preventing Dos attacks by taking actions corresponding
            to the health status, or also isolate the unhealthy container to lower the potential of damaging other healthy container
            in the same environment.
          </p>
          <p>
            <a href="https://docs.docker.com/engine/reference/builder/#healthcheck">
            Use a healthcheck</a>
          </p>
          <p>
            <b>Healthcheck</b>
            <br>
            | HEALTHCHECK --interval=5m --timeout=3s \
              CMD curl -f http://localhost/ || exit 1
          </p>
            <section class="component-row">
                <h4>5. What is correct for healthckecks?</h4>
                <vscode-checkbox id="5_1_checkbox">With healthchecks you can have many side benefits if you implement them, e.g. taking actions when certain conditions occurs</vscode-checkbox><br>
                <vscode-checkbox id="5_2_checkbox">If the health status of a container is unhealthy it is getting restarted automatically</vscode-checkbox><br>
                <vscode-checkbox id="5_3_checkbox">There are four conditions for healthckecks</vscode-checkbox><br>
                <vscode-button id="question5_submit">Submit answer</vscode-button>
              </section>
            </section>
          <br><h1>Intrinsic security of containers</h1><br>
          <h2 id="7">Kernel namespaces and user namespaces</h2>
          <section>
            <p>
              Linux namespaces are security relevant, because they limit the scope of what a container can observe.
              That includes <a href="https://www.redhat.com/sysadmin/7-linux-namespaces#:~:text=Linux%20containers&text=There%20are%20seven%20common%20types,each%20namespace%20works%20by%20example.">
              seven namespace types</a>.
              With these namespaces processes in a container belong to this single container and cannot affect others or even the host system. 
              Isolating container by user namespaces is an option if your process needs to be run as root within the container.
              You can map the root UID in the container to a range of less-priviledged UID on the host, so you fix the potential of a
              privilege escalation vulnerability breach from container to host. Now your process is running as UID 0 (root) within the container, 
              but on the host its mapped to a normal user in your specified range.
            </p>
            <p>
              <a href="https://docs.docker.com/engine/security/userns-remap/#isolate-containers-with-a-user-namespace">
              Using user namespaces</a>
            </p>
            <p>
              <a href="https://www.linux.com/news/understanding-and-securing-linux-namespaces/">
              Understanding and Securing Linux Namespaces</a>
            </p>
          </section>
          <h2 id="8">Control Groups</h2>
          <section>
            <p>
              Control Groups are useful if you are trying to limit resource usage by sharing shares on the docker host by containers.
              With the flag <b>cpu-shares</b> you can influence the amount of CPU time a containers gets and <b>cpuset-cpus</b> locks a container to a defined CPU. 
              You can prevent fork bombs by adding a flag called <b>pids-limit</b> to your docker run command and it prevents a container from consuming the entire docker host process table.
              Limiting a containers memory access is also security relevant. If the Linux kernel does not have enough memory space to perform system functions it can throw a <b>Out of memory exception</b> 
              which then kills processes, this could also hit the docker daemon process. Although Docker itself tries to mitigate the risk it can still occur. Therefore you should consider using 
              <a href="https://docs.docker.com/config/containers/resource_constraints/">hard or soft limits.</a>
            </p>
            <p>
              <b>Lock the container to a CPU</b>
              <br>
              | --cpuset-cpus 0
              <br>
              <b>Shares of CPU time in %</b>
              <br>
              | --cpu-shares 0-1024
              <br>
              <b>Process container limit</b>
              <br>
              | --pids-limit 100
              <br>
              <b>To list up the running processes in a container</b>
              <br>
              | docker top CONTAINER 
              <br>
              <b>To check the container runtime metrics</b>
              <br>
              | docker stats CONTAINER1 CONTAINER2
            </p>
            <section class="component-row">
                <h4>6. What is correct?</h4>
                <vscode-checkbox id="6_1_checkbox">Docker has a default limit for parallel running processes </vscode-checkbox><br>
                <vscode-checkbox id="6_2_checkbox">A memory leak can only cause the stopping of processes that are not the docker daemon</vscode-checkbox><br>
                <vscode-checkbox id="6_3_checkbox">If a process is using more CPU time than another one, they can share the CPU time if is free</vscode-checkbox><br>
                <vscode-button id="question6_submit">Submit answer</vscode-button>
              </section>
            </section>
          </section>
          <h2 id="9">Linux Kernel Capabilities and Seccomp security</h2>
          <section>
            <p>
              Docker manages an allowlist for cabalities and these can be found <a href="https://github.com/moby/moby/blob/master/oci/caps/defaults.go#L6-L19">here</a>.
              You can remove or add cabalities, but every new added capabilites makes Docker less secure. Therefore it is recommended to only use the needed ones for processes.
              Seccomp is also an allowlist of system calls and the default can be found <a href="https://github.com/moby/moby/blob/master/profiles/seccomp/default.json">here</a>. It is already least privilege
              so changing the profile is not recommended.
            </p>
            <p>
              <b>Add or drop capabilites</b>
              <br>
              | --cap-add CAPABILITIES
              <br>
              | --cap-drop CAPABILITIES
            </p>
            <p>
              <a href="https://docs.docker.com/engine/security/seccomp/#significant-syscalls-blocked-by-the-default-profile">More information</a>
            </p>
          </section>
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
        const isQuestionCorrect = message.data;

        switch (command) {
          case "pressedQuestionSubmitButton":
            if(isQuestionCorrect) {
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