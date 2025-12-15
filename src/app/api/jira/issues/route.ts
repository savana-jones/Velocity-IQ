import { NextResponse } from 'next/server';

export async function GET() {
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraApiToken = process.env.JIRA_API_TOKEN;
  const jiraDomain = process.env.JIRA_DOMAIN;

  const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');

  try {
    const response = await fetch(
      `https://${jiraDomain}/rest/api/3/search?jql=order by priority DESC&maxResults=50&fields=summary,description,priority,status,assignee,created,updated`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
      }
    );

    const data = await response.json();

    return NextResponse.json({
      success: true,
      issues: data.issues,
      total: data.total,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}