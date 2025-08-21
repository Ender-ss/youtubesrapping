import ZAI from 'z-ai-web-dev-sdk';

async function finalSearch() {
  try {
    const zai = await ZAI.create();

    console.log('Final search for YouTube channel projects...');
    
    const searchResult = await zai.functions.invoke("web_search", {
      query: "site:github.com youtube channel info extractor scraper python nodejs typescript",
      num: 25
    });

    console.log('Top 5 YouTube Channel Information Projects on GitHub:');
    console.log('====================================================\n');

    if (searchResult && searchResult.length > 0) {
      const githubResults = searchResult.filter(result => 
        result.host_name === 'github.com' && 
        result.url.includes('/github.com/') &&
        !result.url.includes('/topics/') &&
        !result.url.includes('/marketplace/') &&
        !result.url.includes('/orgs/')
      );

      // Remover duplicatas e limitar a 5
      const uniqueProjects = [];
      const seenUrls = new Set();
      
      for (const result of githubResults) {
        if (!seenUrls.has(result.url) && uniqueProjects.length < 5) {
          seenUrls.add(result.url);
          uniqueProjects.push(result);
        }
      }

      uniqueProjects.forEach((result, index) => {
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

finalSearch();