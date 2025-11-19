import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated. Please login with GitHub first.' },
        { status: 401 }
      );
    }

    // Get access token from session (you'll need to add this to your NextAuth config)
    const accessToken = (session as any).accessToken;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'GitHub access token not found. Please re-login with GitHub.' },
        { status: 400 }
      );
    }

    // Test connection by fetching user repos
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${errorText}`);
    }

    const repos = await response.json();
    
    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const userData = await userResponse.json();

    return NextResponse.json({
      success: true,
      connected: true,
      username: userData.login,
      repoCount: repos.length,
      repos: repos.slice(0, 5).map((repo: any) => ({
        name: repo.name,
        fullName: repo.full_name,
        language: repo.language,
        updatedAt: repo.updated_at,
      })),
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