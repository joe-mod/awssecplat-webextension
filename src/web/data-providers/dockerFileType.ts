import * as vscode from 'vscode';



class DockerNode {
    constructor(public readonly label: string, public readonly iconPath?: vscode.Uri) {}
}

export class DockerFileTypeProvider implements vscode.TreeDataProvider<DockerNode> {

    getTreeItem(element: DockerNode): vscode.TreeItem | Thenable<vscode.TreeItem> {

        return {
            label: element.label,
            iconPath: element.iconPath,
        };
    }
    getChildren(element?: DockerNode | undefined): vscode.ProviderResult<DockerNode[]> {

        return [
            new DockerNode("Dockerfile"),
            new DockerNode("Docker-Compose"),
            new DockerNode("Docker_Swarm")
        ];
    }
}