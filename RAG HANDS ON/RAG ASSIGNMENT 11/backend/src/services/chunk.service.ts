interface ChunkOptions {
  chunkSize: number;
  chunkOverlap: number;
}

export class RecursiveCharacterTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;

  constructor(options: ChunkOptions) {
    this.chunkSize = options.chunkSize;
    this.chunkOverlap = options.chunkOverlap;
  }

  public splitText(text: string): string[] {
    const chunks = this.recursiveSplit(text, [
      "\n\n", // paragraph
      "\n",   // newline
      ".",    // sentence
    ]);
    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  private recursiveSplit(text: string, separators: string[]): string[] {
    if (text.length <= this.chunkSize) {
      return [text.trim()];
    }

    const separator = separators[0];
    if (separator === undefined) {
      return this.forceSplit(text);
    }

    const parts = text.split(separator);

    let chunks: string[] = [];
    let currentChunk = "";

    for (let part of parts) {
      // Check if adding this part (and separator) exceeds chunkSize
      if ((currentChunk + part + separator).length <= this.chunkSize) {
        currentChunk += part + separator;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = part + separator;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    // If any chunk is still too large, go deeper with the next separator
    let finalChunks: string[] = [];

    for (let chunk of chunks) {
      if (chunk.length > this.chunkSize) {
        finalChunks.push(...this.recursiveSplit(chunk, separators.slice(1)));
      } else {
        finalChunks.push(chunk);
      }
    }

    return this.addOverlap(finalChunks);
  }

  private forceSplit(text: string): string[] {
    const chunks: string[] = [];

    for (let i = 0; i < text.length; i += this.chunkSize) {
      chunks.push(text.slice(i, i + this.chunkSize));
    }

    return this.addOverlap(chunks);
  }

  private addOverlap(chunks: string[]): string[] {
    if (this.chunkOverlap === 0 || chunks.length <= 1) return chunks;

    const overlappedChunks: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const current = chunks[i];
      if (current === undefined) continue;

      if (i === 0) {
        overlappedChunks.push(current);
        continue;
      }

      // Take the overlap from the original previous chunk to avoid cumulative overlap
      const prev = chunks[i - 1];
      if (prev === undefined) {
        overlappedChunks.push(current);
        continue;
      }
      const overlapText = prev.slice(-this.chunkOverlap);

      overlappedChunks.push(overlapText + current);
    }

    return overlappedChunks;
  }
}
