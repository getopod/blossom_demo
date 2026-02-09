
import { GoogleGenAI, Type } from "@google/genai";
import { Dispensary, Strain } from "./types";

export const findDispensaries = async (lat: number, lng: number): Promise<Dispensary[]> => {
  // Always create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      // Maps grounding is only supported in Gemini 2.5 series models.
      model: "gemini-2.5-flash",
      contents: `Find the top 3 highly rated cannabis dispensaries near coordinates latitude ${lat}, longitude ${lng}. Provide their names and website links.`,
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
    
    if (chunks && chunks.length > 0) {
      // Must extract URLs from groundingChunks and list them on the web app.
      return chunks
        .filter((chunk: any) => chunk.maps)
        .map((chunk: any, index: number) => ({
          id: `disp-${index}`,
          name: chunk.maps.title || "Local Dispensary",
          address: chunk.maps.address || "Nearby",
          // Synthetic data combined with grounding result
          rating: 4.5 + Math.random() * 0.5,
          reviewsCount: Math.floor(Math.random() * 500) + 50,
          distance: `${(Math.random() * 3).toFixed(1)} mi`,
          uri: chunk.maps.uri
        }));
    }
    
    return [
      { id: '1', name: 'Fake One', address: 'Nowhere St', rating: 4.8, reviewsCount: 124, distance: '? mi' },
      { id: '2', name: 'Unreal Thing', address: 'Nowhere Rd', rating: 4.7, reviewsCount: 312, distance: '? mi' },
      { id: '3', name: 'Imaginary Place', address: 'Nowhere Pl', rating: 4.9, reviewsCount: 89, distance: '? mi' },
    ];
  } catch (error) {
    console.error("Error fetching dispensaries:", error);
    return [
      { id: 'm1', name: 'Fake (Demo)', address: 'Not Real St', rating: 4.9, reviewsCount: 200, distance: '? mi' },
      { id: 'm2', name: 'Unreal (Demo)', address: 'Made Up Rc', rating: 4.7, reviewsCount: 150, distance: '? mi' },
    ];
  }
};

export const generateFlight = async (effects: string[]): Promise<Strain[]> => {
  // Always create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Curate a "cannabis flight" of 3 distinct strains that help achieve these effects: ${effects.join(', ')}. 
  For each strain, provide: name, brand, THC%, CBD%, list of primary terpenes, and a short 1-sentence description of the experience.`;

  const response = await ai.models.generateContent({
    // Using gemini-3-pro-preview for complex reasoning and curation tasks.
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
          required: ["name", "brand", "thc", "cbd", "terpenes", "description"]
        }
      }
    }
  });

  // Extract text property directly from GenerateContentResponse (not as a method).
  return JSON.parse(response.text || '[]');
};
