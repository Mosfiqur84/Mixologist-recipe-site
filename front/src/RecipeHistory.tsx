const getHistoryPath = (currentId: string, allRecipes: any[]) => {
  const path = [];
  let current = allRecipes.find(r => r.id === currentId);
  
  while (current) {
    path.unshift(current); // Add to top of list
    // Look for the parent in your local list
    const parent = allRecipes.find(r => r.id === current.parentId);
    
    if (!parent && current.parentId) {
      // If we have a parentId but it's not in our DB, it's the external Original
      path.unshift({ title: "Original Recipe", id: current.parentId, isOriginal: true });
      break;
    }
    current = parent;
  }
  return path;
};