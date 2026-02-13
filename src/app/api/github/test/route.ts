import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export async function GET() {
  try {
    // 1. Get logged-in user
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2. Get GitHub account from DB
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { accounts: true },
    });

    const github = user?.accounts.find(
      (a) => a.provider === "github"
    );

    if (!github?.access_token) {
      console.log("Accounts in DB:", user?.accounts);

      return NextResponse.json(
        { error: "GitHub token missing in DB" },
        { status: 400 }
      );
    }

    const token = github.access_token;

    // 3. Fetch repo tree
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing repo env variables" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data },
        { status: res.status }
      );
    }

    console.log("\n=== FILES & FOLDERS ===");
    data.forEach((item: any) => {
      console.log(
        `${item.type === "dir" ? "📁" : "📄"} ${item.name}`
      );
    });
    console.log("======================\n");

    return NextResponse.json({
      success: true,
      items: data.map((i: any) => ({
        name: i.name,
        type: i.type,
      })),
    });

  } catch (err: any) {
    console.error("ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
