import type {
  OnPageCategoryScore,
  OnPageIssue,
  OnPageReport,
} from "./onPageTypes";

type PageInput = {
  url: string;
  statusCode: number | null;
  title: string | null;
  metaDescription: string | null;
  h1: string[];
  headings: number[];
  images: { src: string; alt: string | null }[];
  links: {
    targetUrl: string;
    anchor: string | null;
    isInternal: boolean;
    isNofollow: boolean;
  }[];
  wordCount: number | null;
  hasStructuredData: boolean;
  canonical: string | null;
  robotsMeta: string | null;
  responseTimeMs: number | null;
};

export function analyzeOnPage(input: PageInput): OnPageReport {
  const categories = [
    analyzeTitle(input.title),
    analyzeMetaDescription(input.metaDescription),
    analyzeHeadings(input.h1, input.headings),
    analyzeImages(input.images),
    analyzeLinks(input.links),
    analyzeContent(input.wordCount),
    analyzeTechnical(input),
  ];

  const allIssues = categories.flatMap((c) => c.issues);
  const overallScore = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length,
  );

  return {
    url: input.url,
    statusCode: input.statusCode,
    overallScore,
    grade: scoreToGrade(overallScore),
    title: input.title,
    metaDescription: input.metaDescription,
    wordCount: input.wordCount,
    categories,
    issues: allIssues,
    fetchedAt: new Date().toISOString(),
  };
}

function analyzeTitle(title: string | null): OnPageCategoryScore {
  const issues: OnPageIssue[] = [];
  let score = 100;

  if (!title) {
    issues.push({
      category: "title",
      severity: "error",
      message: "Missing page title.",
    });
    return { category: "Title", score: 0, grade: "F", issues };
  }

  const length = title.length;
  if (length < 30) {
    issues.push({
      category: "title",
      severity: "warning",
      message: `Title is too short (${length} chars). Aim for 30-60 characters.`,
      details: title,
    });
    score -= 20;
  } else if (length > 60) {
    issues.push({
      category: "title",
      severity: "warning",
      message: `Title is too long (${length} chars). Aim for 30-60 characters.`,
      details: title,
    });
    score -= 10;
  }

  if (title === title.toUpperCase() && title.length > 5) {
    issues.push({
      category: "title",
      severity: "info",
      message: "Title is all uppercase. Consider using title case.",
    });
    score -= 5;
  }

  return {
    category: "Title",
    score: Math.max(0, score),
    grade: scoreToGrade(score),
    issues,
  };
}

function analyzeMetaDescription(desc: string | null): OnPageCategoryScore {
  const issues: OnPageIssue[] = [];
  let score = 100;

  if (!desc) {
    issues.push({
      category: "meta",
      severity: "error",
      message: "Missing meta description.",
    });
    return { category: "Meta Description", score: 0, grade: "F", issues };
  }

  const length = desc.length;
  if (length < 70) {
    issues.push({
      category: "meta",
      severity: "warning",
      message: `Meta description is too short (${length} chars). Aim for 70-160 characters.`,
    });
    score -= 20;
  } else if (length > 160) {
    issues.push({
      category: "meta",
      severity: "warning",
      message: `Meta description is too long (${length} chars). Aim for 70-160 characters.`,
    });
    score -= 10;
  }

  return {
    category: "Meta Description",
    score: Math.max(0, score),
    grade: scoreToGrade(score),
    issues,
  };
}

function analyzeHeadings(
  h1: string[],
  headings: number[],
): OnPageCategoryScore {
  const issues: OnPageIssue[] = [];
  let score = 100;

  if (h1.length === 0) {
    issues.push({
      category: "headings",
      severity: "error",
      message: "No H1 tag found.",
    });
    score -= 40;
  } else if (h1.length > 1) {
    issues.push({
      category: "headings",
      severity: "warning",
      message: `Multiple H1 tags found (${h1.length}). Use exactly one H1 per page.`,
    });
    score -= 15;
  }

  if (headings.length > 0) {
    const maxLevel = Math.max(...headings);
    if (maxLevel >= 2) {
      const hasH2 = headings.includes(2);
      if (!hasH2 && maxLevel > 2) {
        issues.push({
          category: "headings",
          severity: "warning",
          message: "Heading hierarchy skips H2.",
        });
        score -= 10;
      }
    }
  }

  if (headings.length === 0) {
    issues.push({
      category: "headings",
      severity: "info",
      message:
        "No subheadings found. Consider adding H2-H3 for better structure.",
    });
    score -= 10;
  }

  return {
    category: "Headings",
    score: Math.max(0, score),
    grade: scoreToGrade(score),
    issues,
  };
}

function analyzeImages(
  images: { src: string; alt: string | null }[],
): OnPageCategoryScore {
  const issues: OnPageIssue[] = [];
  let score = 100;

  if (images.length === 0) {
    issues.push({
      category: "images",
      severity: "info",
      message: "No images found on the page.",
    });
    return { category: "Images", score: 70, grade: "C", issues };
  }

  const missingAlt = images.filter((img) => !img.alt || img.alt.trim() === "");
  const altPercentage = Math.round(
    ((images.length - missingAlt.length) / images.length) * 100,
  );

  if (missingAlt.length > 0) {
    const severity = altPercentage < 50 ? "error" : "warning";
    issues.push({
      category: "images",
      severity,
      message: `${missingAlt.length} of ${images.length} images missing alt text (${altPercentage}% have alt).`,
    });
    score -= Math.min(40, missingAlt.length * 5);
  }

  return {
    category: "Images",
    score: Math.max(0, score),
    grade: scoreToGrade(score),
    issues,
  };
}

function analyzeLinks(
  links: { targetUrl: string; isInternal: boolean; isNofollow: boolean }[],
): OnPageCategoryScore {
  const issues: OnPageIssue[] = [];
  let score = 100;

  if (links.length === 0) {
    issues.push({
      category: "links",
      severity: "warning",
      message: "No links found on the page.",
    });
    return { category: "Links", score: 40, grade: "D", issues };
  }

  const internal = links.filter((l) => l.isInternal);
  const external = links.filter((l) => !l.isInternal);

  if (internal.length === 0) {
    issues.push({
      category: "links",
      severity: "warning",
      message:
        "No internal links found. Add links to other pages on your site.",
    });
    score -= 20;
  }

  if (external.length === 0) {
    issues.push({
      category: "links",
      severity: "info",
      message:
        "No external links found. Consider linking to authoritative sources.",
    });
    score -= 5;
  }

  return {
    category: "Links",
    score: Math.max(0, score),
    grade: scoreToGrade(score),
    issues,
  };
}

function analyzeContent(wordCount: number | null): OnPageCategoryScore {
  const issues: OnPageIssue[] = [];
  let score = 100;

  if (wordCount === null || wordCount === 0) {
    issues.push({
      category: "content",
      severity: "error",
      message: "No readable content found.",
    });
    return { category: "Content", score: 0, grade: "F", issues };
  }

  if (wordCount < 300) {
    issues.push({
      category: "content",
      severity: "warning",
      message: `Thin content: only ${wordCount} words. Aim for 300+ words.`,
    });
    score -= 30;
  } else if (wordCount < 600) {
    issues.push({
      category: "content",
      severity: "info",
      message: `Content is ${wordCount} words. 600+ words recommended for better ranking.`,
    });
    score -= 10;
  }

  return {
    category: "Content",
    score: Math.max(0, score),
    grade: scoreToGrade(score),
    issues,
  };
}

function analyzeTechnical(input: PageInput): OnPageCategoryScore {
  const issues: OnPageIssue[] = [];
  let score = 100;

  if (input.statusCode && input.statusCode >= 400) {
    issues.push({
      category: "technical",
      severity: "error",
      message: `Page returns HTTP ${input.statusCode}.`,
    });
    score -= 50;
  }

  if (!input.canonical) {
    issues.push({
      category: "technical",
      severity: "info",
      message: "No canonical tag found.",
    });
    score -= 5;
  }

  if (input.robotsMeta?.includes("noindex")) {
    issues.push({
      category: "technical",
      severity: "warning",
      message: "Page has noindex directive.",
    });
    score -= 20;
  }

  if (!input.hasStructuredData) {
    issues.push({
      category: "technical",
      severity: "info",
      message: "No structured data (JSON-LD) found.",
    });
    score -= 5;
  }

  if (input.responseTimeMs !== null && input.responseTimeMs > 3000) {
    issues.push({
      category: "technical",
      severity: "warning",
      message: `Slow response time: ${input.responseTimeMs}ms.`,
    });
    score -= 15;
  }

  return {
    category: "Technical",
    score: Math.max(0, score),
    grade: scoreToGrade(score),
    issues,
  };
}

function scoreToGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 50) return "D";
  return "F";
}
