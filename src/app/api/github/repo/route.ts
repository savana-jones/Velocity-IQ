import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export async function GET() {
  try {
    // 1. Get session (same as your working test file)
    const session = await getServerSession(authOptions);

    

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2. Get GitHub token FROM DATABASE (same logic as working file)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { accounts: true },
    });

    const githubAccount = user?.accounts.find(
      (acc) => acc.provider === "github"
    );

    const accessToken = githubAccount?.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token not found" },
        { status: 400 }
      );
    }
    // Fetch GitHub username
    const userResponse = await fetch("https://api.github.com/user", {
    headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
    },
    });

    if (!userResponse.ok) {
    const err = await userResponse.text();
    throw new Error(err);
    }

    const userData = await userResponse.json();

    // 3. Target repo (from env)
    const owner = process.env.GITHUB_REPO_OWNER!;
    const repo = process.env.GITHUB_REPO_NAME!;

    // 4. Fetch repo files
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      username: userData.login,
      repo: `${owner}/${repo}`,
      files: data,
    });

  } catch (error: any) {
    console.error("Repo API error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
