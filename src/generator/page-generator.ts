import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import type { PreparedFile } from '../types'
import log from '../utils/logger'
import { generateMetadata } from '../utils/template-utils'

/**
 * Generates an LLM-friendly version of the documentation for each page.
 *
 * @param preparedFiles - An array of prepared files.
 * @param outDir - The output directory.
 * @param domain - The domain to use for links.
 * @param cleanUrls - Whether to use clean URLs.
 */
export async function generateLLMFriendlyPages(
	preparedFiles: PreparedFile[],
	outDir: string,
	domain?: string,
	cleanUrls?: boolean,
): Promise<void> {
	const tasks = preparedFiles.map(async (file) => {
		try {
			const mdFile = file.file
			const targetPath = path.resolve(outDir, file.path)

			await fs.mkdir(path.dirname(targetPath), { recursive: true })

			// @ts-expect-error
			matter.clearCache()

			await fs.writeFile(
				targetPath,
				matter.stringify(
					mdFile.content,
					generateMetadata(mdFile, {
						domain,
						filePath: file.path,
						linksExtension: '.md',
						cleanUrls,
					}),
				),
			)

			log.success(`Processed ${file.path}`)
		} catch (error) {
			log.error(`Failed to process ${file.path}: ${(error as Error).message}`)
		}
	})

	await Promise.all(tasks)
}
