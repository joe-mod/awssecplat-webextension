
import * as webviewui from "@vscode/webview-ui-toolkit";

// let uiTools;

// async function fetchModule() {
//     uiTools = await import("@vscode/webview-ui-toolkit");
// }

// fetchModule();


//webviewui.provideVSCodeDesignSystem().register(webviewui.vsCodeButton());
webviewui.provideVSCodeDesignSystem().register(webviewui.allComponents);

const vscode = acquireVsCodeApi();


window.addEventListener("load", main);

const catalogQuestions = [
  {
    "id": [
      "question1_submit",
      "question2_submit",
      // "question3_submit",
      // "question4_submit",
      // "question5_submit",
      // "question6_submit",
    ]
  }
];


function main() {
    // To get improved type annotations/IntelliSense the associated class for
  // a given toolkit component can be imported and used to type cast a reference
  // to the element (i.e. the `as Button` syntax)
  const howdyButton = document.getElementById("howdy") as webviewui.Button;
  howdyButton?.addEventListener("click", handleHowdyClick);

  //
  

  // Add a listener to every questionID to pass it to the handler function
  catalogQuestions[0].id.forEach((questionID) => {
    const listener = document.getElementById(questionID); //as webviewui.Button;
    listener?.addEventListener("click", (event) =>
      handleQuestionCorrection(event, questionID)
    );
  });

}

function handleQuestionCorrection(event: MouseEvent, questionID: string) {
  vscode.postMessage({
    command: "button",
    text: `Button with ID ${questionID} pressed!`,
  });
}

function handleHowdyClick() {
    // Some quick background:
    //
    // Webviews are sandboxed environments where abritrary HTML, CSS, and
    // JavaScript can be executed and rendered (i.e. it's basically an iframe).
    //
    // Because of this sandboxed nature, VS Code uses a mechanism of message
    // passing to get data from the extension context (i.e. src/panels/HelloWorldPanel.ts)
    // to the webview context (this file), all while maintaining security.
    //
    // vscode.postMessage() is the API that can be used to pass data from
    // the webview context back to the extension context––you can think of
    // this like sending data from the frontend to the backend of the extension.
    //
    // Note: If you instead want to send data from the extension context to the
    // webview context (i.e. backend to frontend), you can find documentation for
    // that here:
    //
    // https://code.visualstudio.com/api/extension-guides/webview#passing-messages-from-an-extension-to-a-webview
    //
    // The main thing to note is that postMessage() takes an object as a parameter.
    // This means arbitrary data (key-value pairs) can be added to the object
    // and then accessed when the message is recieved in the extension context.
    //
    // For example, the below object could also look like this:
    //
    // {
    //  command: "hello",
    //  text: "Hey there partner! 🤠",
    //  random: ["arbitrary", "data"],
    // }
    //

    console.log("this is just a test");

    vscode.postMessage({
      command: "hello",
      text: "Hey there partner! 🤠",
    });
}