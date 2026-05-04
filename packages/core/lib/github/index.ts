import { Octokit } from "@octokit/rest";
import { getKey } from "@heiso/core/modules/dev-center/system/_server/key.service";

// Lazy init：避免 module load 時 throw（缺 token 不該讓整個 app 起不來）
let _octokit: Octokit | null = null;
async function getOctokit(): Promise<Octokit> {
  if (_octokit) return _octokit;
  const token = await getKey("github.access_token", "GITHUB_TOKEN");
  if (!token) {
    throw new Error(
      "github.access_token 未設定（dev-center/key 或 GITHUB_TOKEN env）",
    );
  }
  _octokit = new Octokit({ auth: token });
  return _octokit;
}

export async function createRepoFromTemplate({
  templateOwner,
  templateRepo,
  newRepoName,
  owner,
  description = "A repo generated from template",
  privateRepo = false,
  includeAllBranches = false,
}: {
  templateOwner: string; // Template repository owner
  templateRepo: string; // Template repository name
  newRepoName: string; // New repository name
  owner: string; // User or organization to create the repository under
  description?: string; // Repository description
  privateRepo?: boolean; // Whether the repository is private
  includeAllBranches?: boolean; // Whether to include all branches (true = copy all, false = copy default branch only)
}) {
  const res = await (await getOctokit()).rest.repos.createUsingTemplate({
    template_owner: templateOwner,
    template_repo: templateRepo,
    owner: owner,
    name: newRepoName,
    description,
    private: privateRepo,
    include_all_branches: includeAllBranches,
  });

  return res;
}

export async function listFiles({
  owner,
  repo,
  branch = "main",
  dirPath,
}: {
  owner: string;
  repo: string;
  branch: string;
  dirPath: string;
}) {
  const { data } = await (await getOctokit()).repos.getContent({
    owner,
    repo,
    path: dirPath,
    ref: branch,
  });
  return data;
}

export async function getContent({
  owner,
  repo,
  branch = "main",
  filePath,
}: {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
}) {
  const { data: fileData } = await (await getOctokit()).repos.getContent({
    owner,
    repo,
    path: filePath,
    ref: branch,
  });

  // const originalContent = Buffer.from(
  //   (fileData as any).content,
  //   'base64'
  // ).toString();

  return fileData;
}

export async function updateFile({
  owner,
  repo,
  branch = "main",
  sha,
  filePath,
  content = "Update via API",
  message,
}: {
  owner: string;
  repo: string;
  branch: string;
  sha?: string;
  filePath: string;
  content: string;
  message: string;
}) {
  const encodedContent = Buffer.from(content).toString("base64");
  const res = await (await getOctokit()).repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message,
    content: encodedContent,
    sha,
    branch,
  });

  return res;
}
