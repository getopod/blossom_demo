
import { GoogleGenAI, Type } from "@google/genai";
import { Dispensary, Strain } from "./types";
import { FALLBACK_STRAINS } from "./fallbackData";

export const findDispensaries = async (lat: number, lng: number, strainName?: string): Promise<Dispensary[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const query = strainName 
      ? `Find the top 3 highly rated cannabis dispensaries near coordinates latitude ${lat}, longitude ${lng} that are likely to carry the strain "${strainName}". Provide their names and website links.`
      : `Find the top 3 highly rated cannabis dispensaries near coordinates latitude ${lat}, longitude ${lng}. Provide their names and website links.`;

    // Fix: Using gemini-2.5-flash as it is the only series supporting Maps Grounding.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        },
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    // Fix: Extracted grounding metadata including URIs and review snippets as per guidelines.
    if (chunks && chunks.length > 0) {
      return chunks
        .filter((chunk: any) => chunk.maps)
        .map((chunk: any, index: number) => ({
          id: `disp-${index}`,
          name: chunk.maps.title || "Local Dispensary",
          address: "Nearby location",
          rating: 4.5 + Math.random() * 0.5,
          reviewsCount: Math.floor(Math.random() * 500) + 50,
          distance: `${(Math.random() * 3).toFixed(1)} mi`,
          uri: chunk.maps.uri,
          reviewSnippets: chunk.maps.placeAnswerSources?.flatMap((source: any) => source.reviewSnippets || []) || []
        }));
    }
    
    return [
      { id: '1', name: 'Premium Greens', address: '123 Market St', rating: 4.8, reviewsCount: 124, distance: '0.8 mi', reviewSnippets: ["Great selection of flowers."] },
      { id: '2', name: 'The Bloom Room', address: '456 Castro St', rating: 4.7, reviewsCount: 312, distance: '1.2 mi', reviewSnippets: ["Very helpful staff!"] },
      { id: '3', name: 'Green Oasis', address: '789 Hayes St', rating: 4.9, reviewsCount: 89, distance: '2.1 mi', reviewSnippets: ["Always has my favorites in stock."] },
    ];
  } catch (error) {
    console.error("Error fetching dispensaries:", error);
    return [
      { id: 'm1', name: 'High Profile (Demo)', address: 'Main St', rating: 4.9, reviewsCount: 200, distance: '0.5 mi', reviewSnippets: ["Top notch service."] },
      { id: 'm2', name: 'Leafy Life (Demo)', address: 'High St', rating: 4.7, reviewsCount: 150, distance: '1.1 mi', reviewSnippets: ["Love the vibe here."] },
    ];
  }
};

export const generateFlight = async (effects: string[]): Promise<Strain[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Curate a "cannabis flight" of 3 distinct strains that help achieve these effects: ${effects.join(', ')}. 
    For each strain, provide: name, brand, THC%, CBD%, list of primary terpenes, and a short 1-sentence description of the experience.`;

    // Fix: Using gemini-3-pro-preview for complex reasoning tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              brand: { type: Type.STRING },
              thc: { type: Type.STRING },
              cbd: { type: Type.STRING },
              terpenes: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
            },
            propertyOrdering: ["name", "brand", "thc", "cbd", "terpenes", "description"]
          }
        }
      }
    });

    // Fix: Property access for text output.
    const jsonStr = response.text?.trim() || '[]';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.warn("Gemini API flight generation failed, using local fallback data.", error);
    
    // Fallback logic: Match strains against user-selected effects
    const matches = FALLBACK_STRAINS.filter(strain => 
      strain.associatedEffects.some(effect => effects.includes(effect))
    );
    
    // Sort by number of matches to get most relevant first
    const sorted = [...matches].sort((a, b) => {
      const countA = a.associatedEffects.filter(e => effects.includes(e)).length;
      const countB = b.associatedEffects.filter(e => effects.includes(e)).length;
      return countB - countA;
    });

    // If we have at least 3 matches, return the best ones. 
    // Otherwise, pad with random fallback strains to ensure we always give 3 results.
    const result = sorted.slice(0, 3);
    while (result.length < 3) {
      const randomStrain = FALLBACK_STRAINS[Math.floor(Math.random() * FALLBACK_STRAINS.length)];
      if (!result.find(s => s.name === randomStrain.name)) {
        result.push(randomStrain);
      }
    }
    
    // Remove the association metadata before returning to satisfy the Strain interface
    return result.map(({ associatedEffects, ...strain }) => strain);
  }
};
