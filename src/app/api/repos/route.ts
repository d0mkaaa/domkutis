import { NextRequest, NextResponse } from 'next/server'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string | null
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
  private: boolean
  fork: boolean
}

export async function GET() {
  try {
    const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'd0mkaaa'
    
    const response = await fetch(
      `https://api.github.com/users/${username}/repos`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'domkutis-portfolio'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`)
    }

    const repos: GitHubRepo[] = await response.json()

    const filteredRepos = repos
      .filter((repo) => !repo.fork && !repo.private)
      .sort((a, b) => {
        
        const scoreA = a.stargazers_count * 2 + (new Date(a.pushed_at).getTime() / 1000000000)
        const scoreB = b.stargazers_count * 2 + (new Date(b.pushed_at).getTime() / 1000000000)
        return scoreB - scoreA
      })

    return NextResponse.json({
      success: true,
      repos: filteredRepos,
      total: filteredRepos.length
    })

  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch repositories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, repoName, settings } = body

    switch (action) {
      case 'toggle_visibility':
        return NextResponse.json({
          success: true,
          message: `Repository ${repoName} visibility toggled`,
          action: 'toggle_visibility',
          repoName
        })
      
      case 'toggle_featured':
        return NextResponse.json({
          success: true,
          message: `Repository ${repoName} featured status toggled`,
          action: 'toggle_featured',
          repoName
        })
      
      case 'update_settings':
        return NextResponse.json({
          success: true,
          message: 'Repository settings updated',
          settings
        })
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error handling repository action:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process repository action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}