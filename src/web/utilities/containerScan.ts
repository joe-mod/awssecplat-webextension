/**
 * A helper function to filter out both container and image names 
 * @param userInput which is the output of the docker commands
 * @returns the filtered list of items
 */
export function getDockerItemNames(userInput: string): string[] {
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