const fs = require('fs');
let appHtml = fs.readFileSync('src/routes/__root.tsx', 'utf8');

if (!appHtml.includes('maps.googleapis.com/maps/api/js')) {
  const scriptTag = `<script src={"https://maps.googleapis.com/maps/api/js?key=" + import.meta.env.VITE_GOOGLE_MAPS_API_KEY + "&libraries=places"} />`;
  // Add to Head
  appHtml = appHtml.replace('</Head>', `  ${scriptTag}\n        </Head>`);
  fs.writeFileSync('src/routes/__root.tsx', appHtml);
  console.log("Injected Google Maps script to __root.tsx");
} else {
  console.log("Script already exists");
}
