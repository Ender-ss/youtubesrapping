import ZAI from 'z-ai-web-dev-sdk';

async function searchGitHubProjects() {
  try {
    const zai = await ZAI.create();

    console.log('Searching for GitHub projects...');
    
    const searchResult = await zai.functions.invoke("web_search", {
      query: "github youtube channel scraper projects yt-dlp ytdl-core",
      num: 15
    });

    console.log('GitHub Projects for YouTube Channel Scraping:');
    console.log('==========================================\n');

    if (searchResult && searchResult.length > 0) {
      // Filtrar apenas resultados do GitHub
      const githubResults = searchResult.filter(result => 
        result.host_name.includes('github.com') || 
        result.url.includes('github.com')
      );

      githubResults.slice(0, 5).forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Description: ${result.snippet}`);
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