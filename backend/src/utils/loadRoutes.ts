import { Router, type Application } from 'express'
import { readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

export async function loadRoutes(app: Application, routesDir: string) {
  const files = getAllFiles(routesDir)

  for (const file of files) {
    // Get path relative to routesDir
    const relativePath = relative(routesDir, file)
    // Remove .ts extension and convert path separators
    const routePath = '/' + relativePath.replace(/\.(ts|js)$/, '').replace(/\\/g, '/').replace(/\/index$/, '')

    // Dynamic import
    const module = await import(file)
    const router: Router = module.default

    // Mount router at constructed path
    app.use(routePath, router)
    console.log(`Loaded route: ${routePath}`)
  }
}

function getAllFiles(dir: string): string[] {
  let files: string[] = []

  const entries = readdirSync(dir)
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(fullPath))
    } else if (entry.endsWith('.ts') || entry.endsWith('.js')) {
      files.push(fullPath)
    }
  }

  return files
}
