import { AlterEmojiRequest } from './request'

export class AlterEmojiResponse {
  static createFromRequest(req: AlterEmojiRequest): AlterEmojiResponse {
    return new AlterEmojiResponse(req.emoji, req.count, req.size)
  }

  static asError(): AlterEmojiResponse {
    return new AlterEmojiResponse('🤮', 1, 24)
  }

  constructor(
    private emoji: string,
    private count: number,
    private size: number
  ) {}

  toString(): string {
    return SVGTemplate.default().render({
      emoji: this.emoji,
      repeatCount: this.count,
      unitSize: this.size,
      // Because sometimes emojis actually be rendered in pixels larger than the specified font size.
      fontSize: Math.floor(this.size * .9),
    })
  }

  toCloudflareWorkersResponse(): Response {
    return new Response(this.toString(), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Vary': 'Accept-Encoding',
      }
    })
  }
}

interface SVGVariables {
  emoji: string,
  repeatCount: number,
  unitSize: number,
  fontSize: number,
}

class SVGTemplate {
  static default(): SVGTemplate {
    return new SVGTemplate()
  }

  render(variables: SVGVariables): string {
    const width = Math.ceil(variables.unitSize * variables.repeatCount)
    const height = Math.ceil(variables.unitSize)

    const textNodes = [];
    const xOffset = variables.unitSize / 2
    for (let i = 0; i < variables.repeatCount; i++) {
      textNodes.push(this.renderEmojiText(variables.emoji, xOffset + variables.unitSize * i, variables.fontSize))
    }

    return this.renderSvgStartTag(width, height)
      + textNodes.join('')
      + this.renderSvgEndTag()
  }

  private renderSvgStartTag(width: number, height: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`
  }

  private renderSvgEndTag(): string {
    return `</svg>`
  }

  private renderEmojiText(emoji: string, x: number, fontSize: number): string {
    return `<text x="${x}" y="50%" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}">${emoji}</text>`
  }
}
