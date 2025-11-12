import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'

import packageJSON from '../package.json' with { type: 'json' }

interface ObsidianPluginManifest {
  id: string
  name: string
  version: string
  minAppVersion: string
  description: string
  author: string
  authorUrl: string
  isDesktopOnly: boolean
}

export async function generateObsidianPluginManifest() {
  const manifest = {
    id: 'obsidian-bases-more-views',
    name: 'Bases More Views',
    version: packageJSON.version,
    minAppVersion: '1.10.0',
    description: 'Additional view types for Obsidian Bases - Calendar and Timeline views',
    author: 'Maws7140',
    authorUrl: 'https://github.com/Maws7140',
    isDesktopOnly: false,
  } satisfies ObsidianPluginManifest

  await writeFile(join(cwd(), 'dist', 'manifest.json'), JSON.stringify(manifest, null, 2))
}
