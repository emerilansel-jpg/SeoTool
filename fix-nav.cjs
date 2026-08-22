const fs = require('fs');
let content = fs.readFileSync('src/client/navigation/items.ts', 'utf8');

// Insert route definition
if (!content.includes('gmb-grid')) {
  content = content.replace(
    /to: "\/p\/\$projectId\/rank-tracking" as const,\n    label: "Rank Tracking",\n    icon: TrendingUp,\n  },/,
    'to: "/p/$projectId/rank-tracking" as const,\n    label: "Rank Tracking",\n    icon: TrendingUp,\n  },\n  {\n    to: "/_dashboard/projects/$projectId/gmb-grid" as const,\n    label: "Local Map Rank",\n    icon: MapPin,\n  },'
  );
  
  // Add icon import
  content = content.replace(
    'TrendingUp,',
    'TrendingUp,\n  MapPin,'
  );

  // Insert to group
  content = content.replace(
    'byPath("/p/$projectId/rank-tracking"),',
    'byPath("/p/$projectId/rank-tracking"),\n        byPath("/_dashboard/projects/$projectId/gmb-grid"),'
  );
  
  fs.writeFileSync('src/client/navigation/items.ts', content);
  console.log("Nav fixed.");
} else {
  console.log("Already added");
}
