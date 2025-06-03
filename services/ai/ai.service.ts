import apiClient from "@/lib/axios";

export interface GenerateTextRequest {
  prompt: string;
}

export interface GenerateTextResponse {
  text: string;
}

export interface MessageContext {
  aromaDescription?: string;
  fragrance?: string;
  aromaName?: string;
  emotion?: string;
  emotionName?: string;
  mainOptionId?: string;
  mainOptionName?: string;
  placeId?: string;
  placeName?: string;
  container?: string;
  containerName?: string;
  waxColor?: string;
}

/**
 * AI Service for generating inspirational messages
 */
export class AiService {
  /**
   * Generate inspirational text using AI with context-aware prompts
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const response = await apiClient.post<GenerateTextResponse>(
        "/ai/generate-text",
        {
          prompt,
        }
      );
      return response.data.text;
    } catch (error) {
      console.error("Error generating text with AI:", error);
      throw new Error(
        "No se pudo generar el mensaje con IA. Intenta de nuevo."
      );
    }
  }

  /**
   * Generate an inspirational message with context from user's personalization choices
   */
  async generateInspirationalMessage(
    context: MessageContext,
    customPrompt?: string
  ): Promise<string> {
    const basePrompt = this.buildContextualPrompt(context);
    const finalPrompt = customPrompt
      ? `${basePrompt}\n\nPor favor, considera también lo siguiente: ${customPrompt}`
      : basePrompt;

    return await this.generateText(finalPrompt);
  }

  /**
   * Generate candle name suggestions based on user's personalization choices
   */
  async generateCandleNames(
    context: MessageContext,
    count: number = 6
  ): Promise<string[]> {
    const prompt = this.buildCandleNamePrompt(context, count);
    const response = await this.generateText(prompt);

    // Parse the response to extract individual names
    const names = response
      .split("\n")
      .map((line) =>
        line
          .replace(/^\d+\.\s*/, "")
          .replace(/^-\s*/, "")
          .trim()
      )
      .filter((name) => name.length > 0 && name.length <= 30)
      .slice(0, count);

    return names;
  }

  /**
   * Build a contextual prompt based on user's personalization data
   */
  private buildContextualPrompt(context: MessageContext): string {
    let prompt =
      "Genera un mensaje inspirador y motivacional en primera persona (usando 'yo', 'me', 'mi') para una etiqueta de vela personalizada. El mensaje debe ser breve (máximo 15 palabras), positivo y relacionado con la experiencia de la vela.";

    // Add fragrance/aroma context
    if (context.aromaName) {
      prompt += ` La fragancia elegida es "${context.aromaName}".`;
    }

    if (context.aromaDescription) {
      prompt += ` Descripción de la fragancia: ${context.aromaDescription}.`;
    }

    // Add emotion/intended impact context
    if (context.emotionName) {
      prompt += ` El usuario busca una experiencia de ${context.emotionName.toLowerCase()}.`;
    }

    // Add main option context (what the user wants to achieve)
    if (context.mainOptionName) {
      prompt += ` Su objetivo principal es ${context.mainOptionName.toLowerCase()}.`;
    }

    // Add place context
    if (context.placeName) {
      prompt += ` La vela será utilizada en ${context.placeName.toLowerCase()}.`;
    }

    // Add container context
    if (context.containerName) {
      prompt += ` Será presentada en ${context.containerName.toLowerCase()}.`;
    }

    prompt += `
    
Ejemplos de mensajes inspiradores en primera persona:
- "Hoy elijo crear mi propio espacio de paz"
- "Respiro profundo y me permito sentir calma"
- "Transformo mi energía en luz positiva"
- "Me rodeo de aromas que nutren mi alma"
- "Cada momento es una oportunidad para brillar"

El mensaje debe:
1. Estar en primera persona
2. Ser positivo y motivacional
3. Tener máximo 15 palabras
4. Relacionarse con el contexto de la vela y las elecciones del usuario
5. Ser único y personalizado
6. Evocar emociones positivas

Responde únicamente con el mensaje inspirador, sin comillas ni explicaciones adicionales.`;

    return prompt;
  }

  /**
   * Build a prompt for generating candle names based on user's personalization data
   */
  private buildCandleNamePrompt(
    context: MessageContext,
    count: number
  ): string {
    let prompt = `Genera ${count} nombres creativos y únicos para una vela personalizada. Los nombres deben ser:
- Cortos y memorables (máximo 4 palabras)
- Evocativos y emocionales
- Relacionados con el contexto de personalización del usuario
- En español
- Sin comillas

Contexto de la vela:`;

    // Add fragrance/aroma context
    if (context.aromaName) {
      prompt += `\n- Fragancia: ${context.aromaName}`;
    }

    if (context.aromaDescription) {
      prompt += `\n- Descripción del aroma: ${context.aromaDescription}`;
    }

    // Add emotion/intended impact context
    if (context.emotionName) {
      prompt += `\n- Emoción buscada: ${context.emotionName}`;
    }

    // Add main option context
    if (context.mainOptionName) {
      prompt += `\n- Propósito: ${context.mainOptionName}`;
    }

    // Add place context
    if (context.placeName) {
      prompt += `\n- Lugar de uso: ${context.placeName}`;
    }

    // Add container context
    if (context.containerName) {
      prompt += `\n- Tipo de contenedor: ${context.containerName}`;
    }

    prompt += `

Ejemplos de buenos nombres de velas:
- Susurros de Lavanda
- Momento Zen
- Refugio Dorado
- Paz Interior
- Abrazo Cálido
- Serenidad Nocturna
- Rincón Sagrado
- Dulce Calma
- Esencia Vital
- Luz Serena

Genera ${count} nombres únicos, uno por línea, numerados del 1 al ${count}:`;

    return prompt;
  }

  /**
   * Generate image using AI (for future use)
   */
  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await apiClient.post<{ imageUrl: string }>(
        "/ai/generate-image",
        {
          prompt,
        }
      );
      return response.data.imageUrl;
    } catch (error) {
      console.error("Error generating image with AI:", error);
      throw new Error("No se pudo generar la imagen con IA. Intenta de nuevo.");
    }
  }
}

// Export a singleton instance
export const aiService = new AiService();
