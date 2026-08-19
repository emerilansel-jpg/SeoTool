export type Cluster = {
  label: string;
  keywords: string[];
  avgSimilarity: number;
};

export type ClusteringResult = {
  clusters: Cluster[];
  unclustered: string[];
  totalKeywords: number;
  threshold: number;
};

export function extractSerpDomains(
  items: { domain?: string | null }[],
  maxDomains = 10,
): string[] {
  const seen = new Set<string>();
  const domains: string[] = [];
  for (const item of items) {
    if (!item.domain) continue;
    const d = item.domain.toLowerCase();
    if (!seen.has(d)) {
      seen.add(d);
      domains.push(d);
      if (domains.length >= maxDomains) break;
    }
  }
  return domains;
}

export function computeSerpOverlap(
  domainsA: string[],
  domainsB: string[],
): number {
  if (domainsA.length === 0 || domainsB.length === 0) return 0;
  const setA = new Set(domainsA);
  const setB = new Set(domainsB);
  let intersection = 0;
  for (const d of setA) {
    if (setB.has(d)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0;
}

export function buildSimilarityMatrix(keywordDomains: Map<string, string[]>): {
  keywords: string[];
  matrix: number[][];
} {
  const keywords = [...keywordDomains.keys()];
  const n = keywords.length;
  const matrix: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0),
  );

  for (let i = 0; i < n; i++) {
    matrix[i][i] = 1;
    for (let j = i + 1; j < n; j++) {
      const sim = computeSerpOverlap(
        keywordDomains.get(keywords[i]) ?? [],
        keywordDomains.get(keywords[j]) ?? [],
      );
      matrix[i][j] = sim;
      matrix[j][i] = sim;
    }
  }

  return { keywords, matrix };
}

export function clusterKeywords(
  keywordDomains: Map<string, string[]>,
  threshold = 0.3,
): ClusteringResult {
  const { keywords, matrix } = buildSimilarityMatrix(keywordDomains);
  const n = keywords.length;

  if (n === 0) {
    return { clusters: [], unclustered: [], totalKeywords: 0, threshold };
  }

  // Agglomerative clustering: merge most similar pair until below threshold
  const clusters: number[][] = keywords.map((_, i) => [i]);

  while (clusters.length > 1) {
    let bestI = -1;
    let bestJ = -1;
    let bestSim = -1;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const sim = averageLinkage(clusters[i], clusters[j], matrix);
        if (sim > bestSim) {
          bestSim = sim;
          bestI = i;
          bestJ = j;
        }
      }
    }

    if (bestSim < threshold) break;

    clusters[bestI] = [...clusters[bestI], ...clusters[bestJ]];
    clusters.splice(bestJ, 1);
  }

  const result: Cluster[] = [];
  const unclustered: string[] = [];

  for (const members of clusters) {
    const kw = members.map((i) => keywords[i]);
    if (kw.length === 1) {
      unclustered.push(kw[0]);
    } else {
      const avgSim = clusterAvgSimilarity(members, matrix);
      result.push({
        label: generateClusterLabel(kw),
        keywords: kw,
        avgSimilarity: Math.round(avgSim * 1000) / 1000,
      });
    }
  }

  result.sort((a, b) => b.keywords.length - a.keywords.length);

  return {
    clusters: result,
    unclustered,
    totalKeywords: n,
    threshold,
  };
}

function averageLinkage(
  clusterA: number[],
  clusterB: number[],
  matrix: number[][],
): number {
  let total = 0;
  let count = 0;
  for (const a of clusterA) {
    for (const b of clusterB) {
      total += matrix[a][b];
      count++;
    }
  }
  return count > 0 ? total / count : 0;
}

function clusterAvgSimilarity(members: number[], matrix: number[][]): number {
  let total = 0;
  let count = 0;
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      total += matrix[members[i]][members[j]];
      count++;
    }
  }
  return count > 0 ? total / count : 0;
}

export function generateClusterLabel(keywords: string[]): string {
  return keywords.reduce((shortest, kw) =>
    kw.length < shortest.length ? kw : shortest,
  );
}
