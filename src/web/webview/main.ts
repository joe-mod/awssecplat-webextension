
import * as webviewui from "@vscode/webview-ui-toolkit";

// let uiTools;

// async function fetchModule() {
//     uiTools = await import("@vscode/webview-ui-toolkit");
// }

// fetchModule();

webviewui.provideVSCodeDesignSystem().register(webviewui.allComponents);

const vscode = acquireVsCodeApi();


window.addEventListener("load", main);


const catalogCheckboxes = {
  //Dockerfile buttons
  "question1_submit": ["1_1_checkbox", "1_2_checkbox", "1_3_checkbox",],
  "question2_submit": ["2_1_checkbox", "2_2_checkbox", "2_3_checkbox",],
  "question3_submit": ["3_1_checkbox", "3_2_checkbox", "3_3_checkbox",],
  "question4_submit": ["4_1_checkbox", "4_2_checkbox", "4_3_checkbox",],
  "question5_submit": ["5_1_checkbox", "5_2_checkbox", "5_3_checkbox",],
  "question6_submit": ["6_1_checkbox", "6_2_checkbox", "6_3_checkbox",],
  //Compose buttons
  "question1_dc_submit": ["1_1_dc_checkbox", "1_2_dc_checkbox", "1_3_dc_checkbox"],
  "question2_dc_submit": ["2_1_dc_checkbox", "2_2_dc_checkbox", "2_3_dc_checkbox"],
  "question3_dc_submit": ["3_1_dc_checkbox", "3_2_dc_checkbox", "3_3_dc_checkbox"],
};

const correctQuestionsCheckboxes = {
  //Dockerfile buttons
  "question1_submit": ["1_1_checkbox", "1_2_checkbox"],
  "question2_submit": ["2_1_checkbox", "2_2_checkbox", "2_3_checkbox"],
  "question3_submit": ["3_2_checkbox"],
  "question4_submit": ["4_1_checkbox", "4_3_checkbox"],
  "question5_submit": ["5_1_checkbox"],
  "question6_submit": ["6_3_checkbox"],
  //Compose buttons
  "question1_dc_submit": ["1_1_dc_checkbox", "1_2_dc_checkbox"],
  "question2_dc_submit": ["2_2_dc_checkbox"],
  "question3_dc_submit": ["3_1_dc_checkbox"],
};


function main() {
  // To get improved type annotations/IntelliSense the associated class for
  // a given toolkit component can be imported and used to type cast a reference
  // to the element (i.e. the `as Button` syntax)



  for (const submitQuestionID in catalogCheckboxes) {

    // Add a listener to every questionID to pass it to the handler function
    const listener = document.getElementById(submitQuestionID); //as webviewui.Button;
    listener?.addEventListener("click", (event) =>
      handleQuestionCorrection(event, submitQuestionID)
    );

    // Listener for the questions checkboxes 
    const questionArr = catalogCheckboxes[submitQuestionID as keyof typeof catalogCheckboxes];
    for (const checkbox in questionArr) {
      const listener = document.getElementById(checkbox);
      listener?.addEventListener("change", (event) => {
        handleQuestionCorrection(event, submitQuestionID);
      });
    }
  }


}

function handleQuestionCorrection(event: Event, submitQuestionID: string) {

  // Checked checkboxes in the question 
  const checkedCheckboxesByID = catalogCheckboxes[submitQuestionID as keyof typeof catalogCheckboxes];
  // Correct answers by checking the right checkboxes in the question
  const correctCheckboxesByID = correctQuestionsCheckboxes[submitQuestionID as keyof typeof correctQuestionsCheckboxes];


  let isQuestionCorrect = true;

  checkedCheckboxesByID.forEach(correctCheckbox => {
    const checkbox = document.getElementById(correctCheckbox) as HTMLInputElement;


    if (!checkbox.checked && correctCheckboxesByID.includes(correctCheckbox)) {
      isQuestionCorrect = false;
    } else if (checkbox.checked && !correctCheckboxesByID.includes(correctCheckbox)) {
      isQuestionCorrect = false;
    }

  });

  let webviewText;
  if (isQuestionCorrect) {
    webviewText = `Your answer for question ${submitQuestionID} is correct!`;
    
    checkedCheckboxesByID.forEach(checkedCheckbox => {
      document.getElementById(checkedCheckbox)?.setAttribute('disabled', "true");
    });

    document.getElementById(submitQuestionID)?.setAttribute('disabled', "true");
  }
  else {
    webviewText = `Your answer for question ${submitQuestionID} is incorrect!`;
  }

  vscode.postMessage({
    command: "pressedQuestionSubmitButton",
    text: webviewText,
    data: isQuestionCorrect
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

  vscode.postMessage({
    command: "hello",
    text: "Hey there partner! 🤠",
  });
}