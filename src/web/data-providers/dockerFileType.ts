import * as vscode from 'vscode';



class DockerNode {
    constructor(public readonly label: string, public readonly iconPath: vscode.Uri) {}
}

export class DockerFileTypeProvider implements vscode.TreeDataProvider<DockerNode> {
    //onDidChangeTreeData?: vscode.Event<void | DockerNode | DockerNode[] | null | undefined> | undefined;

    getTreeItem(element: DockerNode): vscode.TreeItem | Thenable<vscode.TreeItem> {

        return {
            label: element.label,
            iconPath: element.iconPath,
        };
    }
    getChildren(element?: DockerNode | undefined): vscode.ProviderResult<DockerNode[]> {

        const dockerFileTypeSelectionIcon = vscode.Uri.file("resources/edit.svg");

        //vscode.window.showInformationMessage("You can now select your desired Docker mode");

        return [
            new DockerNode("Dockerfile", dockerFileTypeSelectionIcon),
            new DockerNode("Docker-Compose", dockerFileTypeSelectionIcon),
            new DockerNode("Docker_Swarm", dockerFileTypeSelectionIcon)
        ];
    }
}