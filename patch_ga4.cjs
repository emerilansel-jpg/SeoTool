const fs = require('fs');

let content = fs.readFileSync('src/client/features/ga4-insights/Ga4InsightsPage.tsx', 'utf8');

// 1. Add state import and useState
if (!content.includes('isChangingProperty')) {
  content = content.replace('export function Ga4InsightsPage({ projectId }: { projectId: string }) {', 
`export function Ga4InsightsPage({ projectId }: { projectId: string }) {
  const [isChangingProperty, setIsChangingProperty] = React.useState(false);`);
}

// 2. Replace the Link with a button
content = content.replace(
  /<Link\s+to="\/p\/\$projectId\/settings"[\s\S]*?Change property\s+<\/Link>/,
  `<button
              type="button"
              onClick={() => setIsChangingProperty(true)}
              className="link link-hover shrink-0 self-start text-sm font-medium text-base-content/60 transition-colors hover:text-base-content sm:mt-1"
            >
              Change property
            </button>`
);

// 3. Inject the UI conditional rendering
const find = `) : !report?.connected ? (
          <div className="max-w-2xl">
            <Ga4ConnectionCard projectId={projectId} />
          </div>
        ) : (`;

const replace = `) : isChangingProperty ? (
          <div className="max-w-2xl space-y-4">
            <button 
              type="button" 
              className="btn btn-ghost btn-sm px-2 -ml-2"
              onClick={() => setIsChangingProperty(false)}
            >
              ← Back to Insights
            </button>
            <Ga4ConnectionCard projectId={projectId} />
          </div>
        ) : !report?.connected ? (
          <div className="max-w-2xl">
            <Ga4ConnectionCard projectId={projectId} />
          </div>
        ) : (`;

content = content.replace(find, replace);

// If the property changes, report?.connected might re-render, we should close it on successful report update or user click
// The simplest is to let the user close it, or when report data changes. Since we just want it to work, the user can change and press back or we can effect it.
// Actually, Ga4ConnectionCard doesn't have an "onConnected" prop right now. We'll just let them use the back button.

fs.writeFileSync('src/client/features/ga4-insights/Ga4InsightsPage.tsx', content);
console.log("Ga4 Insights Page updated.");
