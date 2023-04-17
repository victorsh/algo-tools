import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
let __dirname = path.dirname(__filename)

__dirname = __dirname.split('/src/helper')[0]

export { __dirname }
