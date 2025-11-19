import { NextResponse } from 'next/server';

export async function GET() {
  const sonarqubeUrl = process.env.SONARQUBE_URL;
  const token = process.env.SONARQUBE_TOKEN;
  const projectKey = process.env.SONARQUBE_PROJECT_KEY;
  const organization = process.env.SONARQUBE_ORGANIZATION;

  if (!token || !projectKey || !organization) {
    return NextResponse.json(
      { 
        error: 'SonarQube credentials not configured',
        missing: {
          token: !token,
          projectKey: !projectKey,
          organization: !organization
        }
      },
      { status: 400 }
    );
  }

  try {
    // Test connection by fetching project measures
    const url = `${sonarqubeUrl}/api/measures/component?component=${projectKey}&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,complexity&organization=${organization}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SonarQube API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      connected: true,
      projectKey,
      organization,
      metrics: data.component.measures,
      projectName: data.component.name,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        connected: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}