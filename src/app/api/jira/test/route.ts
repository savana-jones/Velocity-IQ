import { NextResponse } from 'next/server';

export async function GET() {
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraApiToken = process.env.JIRA_API_TOKEN;
  const jiraDomain = process.env.JIRA_DOMAIN;
  const jiraProjectKey = process.env.JIRA_PROJECT_KEY;

  if (!jiraEmail || !jiraApiToken || !jiraDomain || !jiraProjectKey) {
    return NextResponse.json(
      {
        error: 'Jira credentials or project key not configured. Check your .env.local file.',
        missing: {
          email: !jiraEmail,
          token: !jiraApiToken,
          domain: !jiraDomain,
          projectKey: !jiraProjectKey,
        },
      },
      { status: 400 }
    );
  }

  try {
    const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');

    // Test connection user info
    const userResponse = await fetch(`https://${jiraDomain}/rest/api/3/myself`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`Jira API error (${userResponse.status}): ${errorText}`);
    }

    const userData = await userResponse.json();

    // Fetch boards for project
    const boardsResponse = await fetch(
      `https://${jiraDomain}/rest/agile/1.0/board?projectKeyOrId=${jiraProjectKey}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
      }
    );

    if (!boardsResponse.ok) {
      const errorText = await boardsResponse.text();
      throw new Error(`Jira boards API error (${boardsResponse.status}): ${errorText}`);
    }

    const boardsData = await boardsResponse.json();

    // For each board, fetch sprints
    const allSprints: any[] = [];
    for (const board of boardsData.values) {
      const sprintsResponse = await fetch(
        `https://${jiraDomain}/rest/agile/1.0/board/${board.id}/sprint`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: 'application/json',
          },
        }
      );

      if (sprintsResponse.ok) {
        const sprintsData = await sprintsResponse.json();
        allSprints.push(...sprintsData.values);
      }
    }

    // Log sprint details to console
    console.log("Sprints:", JSON.stringify(allSprints, null, 2));

    return NextResponse.json({
      success: true,
      connected: true,
      user: {
        displayName: userData.displayName,
        emailAddress: userData.emailAddress,
      },
      projectKey: jiraProjectKey,
      sprintCount: allSprints.length,
      sprints: allSprints,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
