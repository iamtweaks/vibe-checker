import { Octokit } from '@octokit/rest'
import { scanContent, type Finding } from './rules'

export interface GitHubScanResult {
  findings: Finding[]
  severityCounts: Record<string, number>
  scannedFiles: number
}

// File extensions to scan
const CODE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.rb', '.go', '.java', '.cs', '.php',
  '.html', '.css', '.scss', '.json', '.yaml', '.yml',
  '.sh', '.bash', '.sql', '.md'
]

// Directories to skip
const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '__pycache__', 'vendor', '.venv']

function parseGitHubUrl(url: string): { owner: string; repo: string; branch?: string } | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+?)(?:\/tree\/([^\/]+))?/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', ''),
        branch: match[3] || undefined,
      }
    }
  }
  return null
}

async function fetchRepoTree(octokit: Octokit, owner: string, repo: string, branch?: string): Promise<string[]> {
  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
      ref: branch,
    })
    
    const treeSha = (data as any).default_branch || 'main'
    
    const treeResponse = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: treeSha,
      recursive: 'true',
    })
    
    return (treeResponse.data.tree as any[])
      .filter((item: any) => 
        item.type === 'blob' && 
        CODE_EXTENSIONS.some(ext => item.path.endsWith(ext)) &&
        !SKIP_DIRS.some(dir => item.path.includes(dir))
      )
      .slice(0, 500) // Limit to 500 files
      .map((item: any) => item.path)
  } catch (error) {
    console.error('Error fetching repo tree:', error)
    return []
  }
}

async function fetchFileContent(octokit: Octokit, owner: string, repo: string, path: string, branch?: string): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    }) as any
    
    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8')
    }
    return null
  } catch {
    return null
  }
}

export async function scanGitHubRepo(url: string, githubToken?: string): Promise<GitHubScanResult> {
  const parsed = parseGitHubUrl(url)
  if (!parsed) {
    throw new Error('Invalid GitHub URL')
  }
  
  const { owner, repo, branch } = parsed
  
  const octokit = new Octokit({
    auth: githubToken,
  })
  
  // Check if repo is public
  try {
    await octokit.rest.repos.get({ owner, repo })
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error('Repository not found. Make sure it\'s public.')
    }
    throw new Error('Could not access repository')
  }
  
  const files = await fetchRepoTree(octokit, owner, repo, branch)
  const findings: Finding[] = []
  
  for (const filePath of files) {
    const content = await fetchFileContent(octokit, owner, repo, filePath, branch)
    if (content && content.length < 1_000_000) { // Skip files > 1MB
      const fileFindings = scanContent(content, filePath)
      findings.push(...fileFindings)
    }
  }
  
  // Count severities
  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  for (const f of findings) {
    severityCounts[f.severity] = (severityCounts[f.severity] || 0) + 1
  }
  
  return {
    findings,
    severityCounts,
    scannedFiles: files.length,
  }
}
