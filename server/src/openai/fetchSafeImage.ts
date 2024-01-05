//import 'dotenv/config';
export function getSafestDistribution(baseImage: string): string {
    // if (!!(process.env.OPENAI_API_KEY)) {
    //     //api stuff
    //     console.log("OPENAI_API_KEY: " + process.env.OPENAI_API_KEY);

    //     // if key is set but data is still up to date, fetch data from local storage file to display "safest" distribution
    //     // if (condition) {

    //     // }
    //     return "key is set";
    // } else {
    //     console.log("Please set the OPENAI_API_KEY environment variable to your OpenAI API key.");
    //     // fetch data from local storage file to display "safest" distribution

    //     const distributionBaseImage = readJsonByKey("./src/openai/images.json", baseImage);

    //     return distributionBaseImage;
    // }

    const distributionBaseImage = readJsonByKey(baseImage);

    return distributionBaseImage;
}
