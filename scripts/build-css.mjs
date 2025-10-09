import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile } from 'tailwindcss'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const sourceCssPath = path.join(projectRoot, 'app', 'globals.css')
const outputCssPath = path.join(projectRoot, 'app', 'tailwind.generated.css')

const validExtensions = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mdx',
  '.md',
  '.html',
  '.css',
])

const contentPaths = [
  path.join(projectRoot, 'app'),
  path.join(projectRoot, 'components'),
  path.join(projectRoot, 'hooks'),
  path.join(projectRoot, 'lib'),
]

const classNameRegex = /[A-Za-z0-9-_:\/]+(?<!:)/g

async function collectFiles(dir, files = []) {
  let entries = []
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch (error) {
    return files
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await collectFiles(fullPath, files)
    } else if (validExtensions.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }
  return files
}

async function collectCandidates() {
  const candidates = new Set()

  for (const basePath of contentPaths) {
    const files = await collectFiles(basePath, [])
    for (const file of files) {
      let content = ''
      try {
        content = await fs.readFile(file, 'utf8')
      } catch {
        continue
      }
      const matches = content.match(classNameRegex)
      if (!matches) continue
      for (const match of matches) {
        if (!match) continue
        if (/https?:\/\//i.test(match)) continue
        if (match.startsWith('http')) continue
        if (match.length <= 2) continue
        candidates.add(match)
      }
    }
  }

  return Array.from(candidates)
}

async function main() {
  const [cssSource, candidates] = await Promise.all([
    fs.readFile(sourceCssPath, 'utf8'),
    collectCandidates(),
  ])

  const compiled = await compile(cssSource, { from: sourceCssPath })
  const cssOutput = compiled.build(candidates)

  await fs.writeFile(outputCssPath, cssOutput, 'utf8')

  if (typeof compiled.buildSourceMap === 'function') {
    const sourceMap = compiled.buildSourceMap()
    if (sourceMap) {
      await fs.writeFile(`${outputCssPath}.map`, JSON.stringify(sourceMap), 'utf8')
    }
  }
}

main().catch((error) => {
  console.error('[tailwind build] Failed to generate CSS:', error)
  process.exitCode = 1
})
