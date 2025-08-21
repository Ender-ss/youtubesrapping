import ZAI from 'z-ai-web-dev-sdk';

async function detailedSearch() {
  try {
    const zai = await ZAI.create();

    console.log('Detailed search for YouTube channel analysis tools...');
    
    const searchResult = await zai.functions.invoke("web_search", {
      query: "youtube channel scraper analyzer tool github.com python nodejs",
      num: 30
    });

    console.log('Top 5 YouTube Channel Analysis Tools on GitHub:');
    console.log('==============================================\n');

    if (searchResult && searchResult.length > 0) {
      const githubResults = searchResult.filter(result => 
        result.host_name === 'github.com' && 
        result.url.includes('/github.com/') &&
        !result.url.includes('/topics/') &&
        !result.url.includes('/marketplace/') &&
        !result.url.includes('/orgs/') &&
        (result.snippet.toLowerCase().includes('channel') || 
         result.snippet.toLowerCase().includes('youtube') ||
         result.name.toLowerCase().includes('channel'))
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

detailedSearch();