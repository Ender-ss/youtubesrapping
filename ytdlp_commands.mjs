import ZAI from 'z-ai-web-dev-sdk';

async function getYtdlpCommands() {
  try {
    const zai = await ZAI.create();

    console.log('Researching yt-dlp commands for channel information extraction...\n');
    
    const commandsResult = await zai.functions.invoke("web_search", {
      query: "yt-dlp channel info extract command examples --flat-playlist --get-id --get-title",
      num: 8
    });

    console.log('=== yt-dlp Channel Commands ===\n');
    if (commandsResult && commandsResult.length > 0) {
      commandsResult.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   ${result.snippet}`);
        console.log('');
      });
    }

    console.log('\n=== Node.js yt-dlp Integration Examples ===\n');
    
    const nodeResult = await zai.functions.invoke("web_search", {
      query: "node js yt-dlp wrapper spawn child process channel information",
      num: 5
    });

    if (nodeResult && nodeResult.length > 0) {
      nodeResult.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   ${result.snippet}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error getting yt-dlp commands:', error.message);
  }
}

getYtdlpCommands();