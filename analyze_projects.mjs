import ZAI from 'z-ai-web-dev-sdk';

async function analyzeProjects() {
  try {
    const zai = await ZAI.create();

    console.log('Analyzing mitcdh/youtube-channel-scraper project...');
    
    const scraperResult = await zai.functions.invoke("web_search", {
      query: "mitcdh youtube-channel-scraper github code implementation approach",
      num: 5
    });

    console.log('\n=== mitcdh/youtube-channel-scraper Analysis ===\n');
    if (scraperResult && scraperResult.length > 0) {
      scraperResult.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   ${result.snippet}`);
        console.log(`   URL: ${result.url}`);
        console.log('');
      });
    }

    console.log('\n=== yt-dlp Channel Information Extraction ===\n');
    
    const ytdlpResult = await zai.functions.invoke("web_search", {
      query: "yt-dlp extract channel information command line examples",
      num: 5
    });

    if (ytdlpResult && ytdlpResult.length > 0) {
      ytdlpResult.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   ${result.snippet}`);
        console.log(`   URL: ${result.url}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error analyzing projects:', error.message);
  }
}

analyzeProjects();