(function(){
  const all = window.webactPortfolioAll || window.portfolioDataAll || window.webactPortfolioDataAll || [];
  const tagMap = {};
  if (Array.isArray(all)) {
    all.forEach(function(item){
      if (Array.isArray(item) && item[0] && item[1]) {
        tagMap[String(item[0]).toLowerCase().trim()] = String(item[1]).trim();
      } else if (item && item.name && (item.category || item.industry || item.tag)) {
        tagMap[String(item.name).toLowerCase().trim()] = String(item.category || item.industry || item.tag).trim();
      }
    });
  }
  window.webactPortfolioTagMap = tagMap;
  window.webactGetPortfolioTag = function(project){
    if(!project) return "";
    const name = String(project.name || project.title || "").toLowerCase().trim();
    return tagMap[name] || project.category || project.industry || project.tag || "";
  };
})();

