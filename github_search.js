import ZAI from 'z-ai-web-dev-sdk';

async function searchGitHubProjects() {
  try {
    const zai = await ZAI.create();

    const searchResult = await zai.functions.invoke("web_search", {
      query: "github projects youtube channel scraper ytdl yt-dlp channel information",
      num: 10
    });

    console.log('GitHub Projects for YouTube Channel Scraping:');
    console.log('==========================================\n');

    if (searchResult && searchResult.length > 0) {
      searchResult.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Snippet: ${result.snippet}`);
        console.log(`   Host: ${result.host_name}`);
        console.log('');
      });
    } else {
      console.log('No results found');
    }

  } catch (error) {
    console.error('Error searching GitHub projects:', error.message);
  }
}

searchGitHubProjects();