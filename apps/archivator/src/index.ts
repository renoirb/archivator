import { directoryNameNormalizer } from 'url-dirname-normalizer'

export default (url: string): string => directoryNameNormalizer(url)
