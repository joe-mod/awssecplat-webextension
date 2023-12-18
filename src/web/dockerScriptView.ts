import * as vscode from 'vscode';



class DockerScriptViewItem {
    constructor(public readonly label: string) {}
}

export class DockerScriptViewProvider implements vscode.TreeDataProvider<DockerScriptViewItem> {
    //onDidChangeTreeData?: vscode.Event<void | DockerNode | DockerNode[] | null | undefined> | undefined;

    getTreeItem(element: DockerScriptViewItem): vscode.TreeItem | Thenable<vscode.TreeItem> {

        return {
            label: element.label,
        };
    }
    getChildren(element?: DockerScriptViewItem | undefined): vscode.ProviderResult<DockerScriptViewItem[]> {

        vscode.window.showInformationMessage("You can now select your desired Docker mode");

        // TODO maybe list up a new Item for every Container
        return [
            new DockerScriptViewItem("Container scan")
        ];
    }
}