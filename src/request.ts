import emojiRegex from 'emoji-regex'
import queryString, { ParsedUrl } from 'query-string'

export class AlterEmojiRequest {
  static createFromCloudflareWorkersRequest(req: Request): AlterEmojiRequest {
    return new AlterEmojiRequest(req.url)
  }

  constructor(
    private requestUrl: string
  ) {}

  get emoji(): string {
    const maybeEmoji = decodeURI(this.paths[1])

    const matched = maybeEmoji.match(emojiRegex())
    if (!matched) {
      throw new Error(`requested ${maybeEmoji} is not a emoji.`)
    }

    return matched[0]
  }

  get count(): number {
    return this.convertNumberOrElse(this.paths[2] || '', 1)
  }

  get size(): number {
    const size = this.parsedUrl.query['size']
    const defaultSize = 24
    if (typeof(size) !== 'string') {
      return defaultSize
    }

    return this.convertNumberOrElse(size, defaultSize)
  }

  private convertNumberOrElse(str: string, fallback: number): number {
    const maybeNumber = Number.parseFloat(str)

    return Number.isNaN(maybeNumber) ? fallback : maybeNumber
  }

  private get paths(): string[] {
    return new URL(this.parsedUrl.url).pathname.split('/')
  }

  private get parsedUrl(): ParsedUrl {
    return queryString.parseUrl(this.requestUrl)
  }
}
