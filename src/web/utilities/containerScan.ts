export function getContainerNames(userInput: string): string[] {
    const lines = userInput.split(';');
    const containerList: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].trim();
        if (lines[i] !== '') {
            containerList.push(lines[i].split(':')[1]); 
        }
    }
    return containerList; 
}