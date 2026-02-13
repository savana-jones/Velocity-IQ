import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated. Please login with GitHub first.' },
        { status: 401 }
      );
    }

    // Get access token from session
    const accessToken = (session as any).accessToken;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'GitHub access token not found. Please re-login with GitHub.' },
        { status: 400 }
      );
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`GitHub user API error (${userResponse.status}): ${errorText}`);
    }

    const userData = await userResponse.json();

    // Get user repos
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!reposResponse.ok) {
      const errorText = await reposResponse.text();
      throw new Error(`GitHub repos API error (${reposResponse.status}): ${errorText}`);
    }

    const repos = await reposResponse.json();

    // Console log like SonarQube and Jira
    console.log('\n=== GITHUB API RESPONSE ===');
    console.log(`User: ${userData.login} (${userData.name || 'No name'})`);
    console.log(`Repositories: ${repos.length}`);
    console.log(`Public Repos: ${userData.public_repos}`);
    console.log('\nRecent Repositories:');
    repos.slice(0, 5).forEach((repo: any) => {
      console.log(`  ${repo.name} (${repo.language || 'No language'}) - Updated: ${repo.updated_at}`);
    });
    console.log('===========================\n');

    return NextResponse.json({
      success: true,
      connected: true,
      username: userData.login,
      name: userData.name,
      repoCount: repos.length,
      publicRepos: userData.public_repos,
      repos: repos.slice(0, 5).map((repo: any) => ({
        name: repo.name,
        fullName: repo.full_name,
        language: repo.language,
        updatedAt: repo.updated_at,
      })),
    });
  } catch (error: any) {
    console.error('GitHub API Error:', error);
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