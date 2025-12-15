import { NextResponse } from 'next/server';

export async function GET() {
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraApiToken = process.env.JIRA_API_TOKEN;
  const jiraDomain = process.env.JIRA_DOMAIN;

  const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');

  try {
    // Get all boards
    const boardsResponse = await fetch(
      `https://${jiraDomain}/rest/agile/1.0/board`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
      }
    );

    const boards = await boardsResponse.json();
    const boardId = boards.values[0]?.id;

    if (!boardId) {
      return NextResponse.json({ sprints: [] });
    }

    // Get sprints for this board
    const sprintsResponse = await fetch(
      `https://${jiraDomain}/rest/agile/1.0/board/${boardId}/sprint?state=active`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
      }
    );

    const sprintsData = await sprintsResponse.json();

    return NextResponse.json({
      success: true,
      sprints: sprintsData.values,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}