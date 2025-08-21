import ZAI from 'z-ai-web-dev-sdk';

async function searchSpecificProjects() {
  try {
    const zai = await ZAI.create();

    console.log('Searching for specific YouTube channel analysis projects...');
    
    const searchResult = await zai.functions.invoke("web_search", {
      query: "github.com youtube channel analyzer scraper information extractor nodejs python",
      num: 20
    });

    console.log('Top 5 YouTube Channel Analysis Projects on GitHub:');
    console.log('===================================================\n');

    if (searchResult && searchResult.length > 0) {
      const githubResults = searchResult.filter(result => 
        result.host_name === 'github.com' && 
        !result.url.includes('/topics/')
      );

      const projects = githubResults.slice(0, 5);
      
      projects.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   GitHub URL: ${result.url}`);
        console.log(`   Description: ${result.snippet}`);
        console.log('');
      });
    } else {
      console.log('No results found');
    }

  } catch (error) {
    console.error('Error searching projects:', error.message);
  }
}

searchSpecificProjects();