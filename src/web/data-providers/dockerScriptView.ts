import * as vscode from 'vscode';

/**
 * Settings for the tree view items so the tree can be expanded
 */
interface ItemSettings {
    command: string;
    title: string;
}

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

class ImageItem extends vscode.TreeItem {
    constructor(public readonly label: string, public readonly command?: vscode.Command) {
        super(label);
        this.contextValue = 'imageItem';
    }
}

export class DockerScriptViewProvider implements vscode.TreeDataProvider<DockerScriptViewItem | ContainerItem | ImageItem> {

    // Change events which get fired when the tree data changes
    private _onDidChangeTreeData = new vscode.EventEmitter<DockerScriptViewItem | ContainerItem | ImageItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    //Lists for the two item expandables
    private containers: ContainerItem[] = [];
    private images: ImageItem[] = [];

    private readonly itemSettings: { [key: string]: ItemSettings } = {
        "container": { command: "dockerScriptView.scanContainer", title: "Scan" },
        "image": { command: "dockerScriptView.scanImage", title: "Scan" },
    };

    refresh(items: string[], itemType: string) {

        if (itemType === "container") {
            this.containers = items.map(itemName => new ContainerItem(itemName, {
                command: this.itemSettings[itemType].command,
                arguments: [itemName],
                title: 'Scan',
            }));
        } else if (itemType === "image") {
            this.images = items.map(itemName => new ImageItem(itemName, {
                command: this.itemSettings[itemType].command,
                arguments: [itemName],
                title: 'Scan',
            }));
        }
        this._onDidChangeTreeData.fire(undefined);
    }

    dropContainer(containerName: string) {
        this.containers = this.containers.filter(container => container.label !== containerName);
        this._onDidChangeTreeData.fire(undefined);
    }

    dropImage(imageName: string) {
        this.images = this.images.filter(image => image.label !== imageName);
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: DockerScriptViewItem | ContainerItem | ImageItem): vscode.TreeItem | Thenable<vscode.TreeItem> {

        return element;
    }
    getChildren(element?: DockerScriptViewItem | ContainerItem | ImageItem): vscode.ProviderResult<DockerScriptViewItem[] | ContainerItem[] | ImageItem[]> {

        if (!element) {
            return [
                new DockerScriptViewItem("Container scan", "containerViewItem"),
                new DockerScriptViewItem("Image scan", "imageViewItem")
            ];
        } else if (element instanceof DockerScriptViewItem) {
            if (element.label === "Container scan") {
                return this.containers;
            }
            else if (element.label === "Image scan") {
                return this.images;
            }
        }
        return [];
    }
}