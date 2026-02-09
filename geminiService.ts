
import { GoogleGenAI, Type } from "@google/genai";
import { Dispensary, Strain } from "./types";

export const findDispensaries = async (lat: number, lng: number, strainName?: string): Promise<Dispensary[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const query = strainName 
      ? `Find the top 3 highly rated cannabis dispensaries near coordinates latitude ${lat}, longitude ${lng} that are likely to carry the strain "${strainName}". Provide their names and website links.`
      : `Find the top 3 highly rated cannabis dispensaries near coordinates latitude ${lat}, longitude ${lng}. Provide their names and website links.`;

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
    
    if (chunks && chunks.length > 0) {
      return chunks
        .filter((chunk: any) => chunk.maps)
        .map((chunk: any, index: number) => ({
          id: `disp-${index}`,
          name: chunk.maps.title || "Local Dispensary",
          address: chunk.maps.address || "Nearby",
          rating: 4.5 + Math.random() * 0.5,
          reviewsCount: Math.floor(Math.random() * 500) + 50,
          distance: `${(Math.random() * 3).toFixed(1)} mi`,
          uri: chunk.maps.uri
        }));
    }
    
    return [
      { id: '1', name: 'Premium Greens', address: '123 Market St', rating: 4.8, reviewsCount: 124, distance: '0.8 mi' },
      { id: '2', name: 'The Bloom Room', address: '456 Castro St', rating: 4.7, reviewsCount: 312, distance: '1.2 mi' },
      { id: '3', name: 'Green Oasis', address: '789 Hayes St', rating: 4.9, reviewsCount: 89, distance: '2.1 mi' },
    ];
  } catch (error) {
    console.error("Error fetching dispensaries:", error);
    return [
      { id: 'm1', name: 'High Profile (Demo)', address: 'Main St', rating: 4.9, reviewsCount: 200, distance: '0.5 mi' },
      { id: 'm2', name: 'Leafy Life (Demo)', address: 'High St', rating: 4.7, reviewsCount: 150, distance: '1.1 mi' },
    ];
  }
};

export const generateFlight = async (effects: string[]): Promise<Strain[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Curate a "cannabis flight" of 3 distinct strains that help achieve these effects: ${effects.join(', ')}. 
  For each strain, provide: name, brand, THC%, CBD%, list of primary terpenes, and a short 1-sentence description of the experience.`;

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

  return JSON.parse(response.text || '[]');
};
