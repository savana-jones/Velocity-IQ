import { NextResponse } from 'next/server';

type TechDebtItem = {
  id: string;
  module: string;
  riskScore: number;
  codeQuality: number;
  changeFrequency: number;
  businessPriority: string;
  bugCount: number;
  filesAffected: string[];
  jiraTicket?: string;
  lastUpdated: string;
  complexity: number;
  duplication: number;
};

export async function GET() {
  try {
    const sonarqubeUrl = process.env.SONARQUBE_URL;
    const token = process.env.SONARQUBE_TOKEN;
    const projectKey = process.env.SONARQUBE_PROJECT_KEY;
    const organization = process.env.SONARQUBE_ORGANIZATION;

    if (!sonarqubeUrl || !token || !projectKey) {
      return NextResponse.json(
        { error: 'SonarQube not configured' },
        { status: 400 }
      );
    }

    const issuesUrl =
      `${sonarqubeUrl}/api/issues/search?componentKeys=${projectKey}&resolved=false&ps=500` +
      (organization ? `&organization=${organization}` : '');

    const issuesResponse = await fetch(issuesUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!issuesResponse.ok) {
      throw new Error(`SonarQube issues API error: ${issuesResponse.status}`);
    }

    const issuesData = await issuesResponse.json();
    const issues = issuesData.issues || [];

    const fileGroups = new Map<string, any[]>();

    issues.forEach((issue: any) => {
      const component = issue.component || 'Unknown';
      if (!fileGroups.has(component)) {
        fileGroups.set(component, []);
      }
      fileGroups.get(component)!.push(issue);
    });

    const techDebtItems: TechDebtItem[] = [];
    let itemId = 1;

    for (const [component, componentIssues] of fileGroups.entries()) {
      const fileName = component.split(':').pop() || component;

      const pathParts = fileName.split('/');
      const moduleName =
        pathParts.length > 1
          ? pathParts[pathParts.length - 2]
          : pathParts[0];

      const bugs = componentIssues.filter((i: any) => i.type === 'BUG').length;
      const vulnerabilities = componentIssues.filter(
        (i: any) => i.type === 'VULNERABILITY'
      ).length;
      const codeSmells = componentIssues.filter(
        (i: any) => i.type === 'CODE_SMELL'
      ).length;

      const avgComplexity =
        componentIssues.reduce((sum: number, i: any) => {
          return sum + (i.debt ? parseInt(i.debt) : 0);
        }, 0) / (componentIssues.length || 1);

      const qualityScore = Math.max(
        0,
        10 - (bugs * 0.5 + vulnerabilities * 0.8 + codeSmells * 0.2)
      );

      const changeFreq = Math.min(10, componentIssues.length * 0.5);

      const priority =
        bugs > 5 || vulnerabilities > 0 ? 'P0' :
        bugs > 2 ? 'P1' : 'P2';

      const riskScore = calculateRiskScore(
        qualityScore,
        changeFreq,
        priority,
        bugs
      );

      const dates = componentIssues.map(
        (i: any) => new Date(i.creationDate)
      );
      const latestDate = new Date(
        Math.max(...dates.map(d => d.getTime()))
      );

      techDebtItems.push({
        id: `TD-${String(itemId).padStart(3, '0')}`,
        module: formatModuleName(moduleName),
        riskScore: parseFloat(riskScore.toFixed(1)),
        codeQuality: parseFloat(qualityScore.toFixed(1)),
        changeFrequency: parseFloat(changeFreq.toFixed(1)),
        businessPriority: priority,
        bugCount: bugs + vulnerabilities,
        filesAffected: [fileName],
        lastUpdated: getTimeAgo(latestDate),
        complexity: Math.round(avgComplexity),
        duplication: Math.min(100, codeSmells * 2),
      });

      itemId++;
    }

    techDebtItems.sort((a, b) => b.riskScore - a.riskScore);

    return NextResponse.json({
      success: true,
      count: techDebtItems.length,
      items: techDebtItems,
    });

  } catch (error: any) {
    console.error('Tech Debt API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function calculateRiskScore(
  codeQuality: number,
  changeFreq: number,
  priority: string,
  bugCount: number
): number {
  const priorityWeight = priority === 'P0' ? 3 : priority === 'P1' ? 2 : 1;

  const qualityRisk = (10 - codeQuality) / 10;
  const changeRisk = changeFreq / 10;
  const bugRisk = Math.min(1, bugCount / 10);

  return (
    ((qualityRisk * 0.4) +
      (changeRisk * 0.2) +
      (bugRisk * 0.2) +
      (priorityWeight * 0.2 / 3)) * 10
  );
}

function formatModuleName(name: string): string {
  return name
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}
