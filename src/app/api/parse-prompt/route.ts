import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Dans une implémentation réelle, on appellerait l'API OpenAI ou Anthropic ici.
    // On passerait le schéma Zod des modèles comme instruction de sortie.

    console.log('IA Parsing prompt:', prompt);

    // Simulation de réponse IA pour un prompt "E-commerce"
    if (prompt.toLowerCase().includes('commerce') || prompt.toLowerCase().includes('shop')) {
        return NextResponse.json({
            models: [
                {
                    name: "Product",
                    fields: [
                        { name: "name", type: "string", required: true },
                        { name: "description", type: "text" },
                        { name: "price", type: "decimal", required: true },
                        { name: "stock", type: "integer", default: 0 }
                    ],
                    relations: [{ type: "belongsTo", model: "Category" }],
                    generate: { controller: true, service: true, migration: true }
                },
                {
                    name: "Category",
                    fields: [{ name: "name", type: "string", unique: true }],
                    relations: [{ type: "hasMany", model: "Product" }],
                    generate: { controller: true, migration: true }
                }
            ]
        });
    }

    // Défaut: Retourner une structure vide ou basique
    return NextResponse.json({
        models: [
            {
                name: "User",
                fields: [
                    { name: "email", type: "string", unique: true },
                    { name: "password", type: "string" }
                ],
                relations: [],
                generate: { controller: true, migration: true }
            }
        ]
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
