import * as vscode from 'vscode';


/**
 * Tree view item for the dockerScriptView and its expandables
 */
class DockerScriptViewItem extends vscode.TreeItem {
    constructor(public readonly label: string, public readonly contextValue: string) {
        super(label, vscode.TreeItemCollapsibleState.Expanded);
        // the contextValue can be a container or image item
        this.contextValue = contextValue;
    }
}

class ContainerItem extends vscode.TreeItem {
    constructor(public readonly label: string, public readonly command?: vscode.Command) {
        super(label);
        this.contextValue = 'containerItem';
    }
}

export class DockerScriptViewProvider implements vscode.TreeDataProvider<DockerScriptViewItem | ContainerItem> {

    // Change events which get fired when the tree data changes
    private _onDidChangeTreeData = new vscode.EventEmitter<DockerScriptViewItem | ContainerItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    //Lists for the two item expandables
    private containers: ContainerItem[] = [];

    refresh(containerList: string[]) {
        this.containers = containerList.map(containerName => new ContainerItem(containerName, {
            command: 'dockerScriptView.scanContainer',
            arguments: [containerName],
                title: 'Scan',
            }));
        this._onDidChangeTreeData.fire(undefined);
    }

    dropContainer(containerName: string) {
        this.containers = this.containers.filter(container => container.label !== containerName);
        this._onDidChangeTreeData.fire(undefined);
    }
    //onDidChangeTreeData?: vscode.Event<void | DockerNode | DockerNode[] | null | undefined> | undefined;

    getTreeItem(element: DockerScriptViewItem | ContainerItem): vscode.TreeItem | Thenable<vscode.TreeItem> {

        return element;
    }
    getChildren(element?: DockerScriptViewItem | ContainerItem): vscode.ProviderResult<DockerScriptViewItem[]> {

        //vscode.window.showInformationMessage("You can now list all containers. Once done, you can scan a single container by selecting it");

        if (!element) {
            return [
                new DockerScriptViewItem("Container scan")
            ];
        } else if (element instanceof DockerScriptViewItem && element.label === "Container scan") {
                return this.containers;
        }
        return [];
    }
}