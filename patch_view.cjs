const fs = require('fs');
let content = fs.readFileSync('src/client/features/gmb-grid/GmbGridView.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  'import { useState } from "react";',
  'import { useState, useRef } from "react";\nimport { GmbAutocomplete } from "./components/GmbAutocomplete";\nimport { Loader2, Sparkles } from "lucide-react";'
);

content = content.replace(
  'createGmbGridRun \n} from "@/serverFunctions/gmb-grid";',
  'createGmbGridRun,\n  scanGmbKeywords\n} from "@/serverFunctions/gmb-grid";'
);

// 2. Add states to component
const stateReplacement = `
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<string | undefined>();
  const [scannedKeywords, setScannedKeywords] = useState<Array<{keyword: string, rank: number}> | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const scanKeywordsFn = useServerFn(scanGmbKeywords);

  const scanKeywordsMutation = useMutation({
    mutationFn: async (data: any) => await scanKeywordsFn({ data })
  });

  const handleProfileSelect = (placeId: string, name: string, lat: number, lng: number, website?: string) => {
    setSelectedPlaceId(placeId);
    setSelectedWebsite(website);
    
    if (formRef.current) {
      const inputs = formRef.current.elements as any;
      if (inputs.businessName) inputs.businessName.value = name;
      if (inputs.centerLat) inputs.centerLat.value = lat;
      if (inputs.centerLng) inputs.centerLng.value = lng;
    }
  };

  const onAutoScanKeywords = () => {
    if (!formRef.current || !selectedPlaceId) return;
    const inputs = formRef.current.elements as any;
    
    scanKeywordsMutation.mutate({
      placeId: selectedPlaceId,
      businessName: inputs.businessName.value,
      website: selectedWebsite,
      lat: parseFloat(inputs.centerLat.value),
      lng: parseFloat(inputs.centerLng.value)
    }, {
      onSuccess: (data) => {
        setScannedKeywords(data);
      }
    });
  };

  const useScannedKeyword = (kw: string) => {
    if (formRef.current) {
      const inputs = formRef.current.elements as any;
      if (inputs.keyword) inputs.keyword.value = kw;
    }
    setScannedKeywords(null); // Close modal
  };
`;

content = content.replace('const [activeRunId, setActiveRunId] = useState<string | null>(null);', stateReplacement);

// 3. Replace business name input with Autocomplete & add AutoScan button
const formReplacement = `
        <form ref={formRef} onSubmit={handleStartScan} className="flex flex-col gap-4">
          <GmbAutocomplete onSelectProfile={handleProfileSelect} />
          
          <div>
            <label className="text-sm font-medium flex justify-between">
              Search Query / Keyword
              {selectedPlaceId && (
                <button 
                  type="button" 
                  onClick={onAutoScanKeywords}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  {scanKeywordsMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                  Auto-detect rankings
                </button>
              )}
            </label>
            <input name="keyword" className="input input-bordered w-full mt-1" required />
          </div>
          
          <input type="hidden" name="businessName" />
`;

content = content.replace(/<form onSubmit=\{handleStartScan\} className="flex flex-col gap-4">\s*<div>\s*<label className="text-sm font-medium">Business Name<\/label>\s*<input name="businessName" className="input input-bordered w-full" required \/>\s*<\/div>\s*<div>\s*<label className="text-sm font-medium">Search Query \/ Keyword<\/label>\s*<input name="keyword" className="input input-bordered w-full" required \/>\s*<\/div>/, formReplacement);

// 4. Add modal UI at the end
const modalUI = `
      {scannedKeywords && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Detected Rankings</h3>
            <p className="text-sm text-gray-500 mb-4">
              {scannedKeywords.length === 0 
                ? "Could not find any top 20 rankings for extracted seeds."
                : "We found this profile ranking for these keywords. Click one to track its heatmap grid."}
            </p>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {scannedKeywords.map((sk) => (
                <button 
                  key={sk.keyword}
                  onClick={() => useScannedKeyword(sk.keyword)}
                  className="flex justify-between items-center p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <span className="font-medium text-sm">{sk.keyword}</span>
                  <span className="badge badge-sm badge-success font-bold text-white px-2">Rank #{sk.rank}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setScannedKeywords(null)} className="btn btn-ghost w-full mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(/<\/div>\s*<\/div>\s*\);\s*}\s*$/, modalUI);

fs.writeFileSync('src/client/features/gmb-grid/GmbGridView.tsx', content);
console.log("View patched");
