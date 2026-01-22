import { GoogleGenerativeAI } from "@google/generative-ai";
import { ToolDefinition } from "./tools";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class GeminiClient {
    private model: any;

    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    }

    async chat(message: string, systemInstruction: string, tools: ToolDefinition[] = [], history: any[] = []) {
        // Convert tools to Gemini format
        const geminiTools = tools.length > 0 ? [{
            functionDeclarations: tools.map(t => ({
                name: t.name.replace(/ /g, '_').replace(/[^a-zA-Z0-9_]/g, ''), // Sanitize name
                description: t.description,
                parameters: t.parameters
            }))
        }] : undefined;

        const chatModel = genAI.getGenerativeModel({
            model: "gemini-1.5-pro-latest",
            systemInstruction: {
                parts: [{ text: systemInstruction }],
                role: "system"
            },
            tools: geminiTools
        });

        const chat = chatModel.startChat({
            history: history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }]
            })),
            generationConfig: {
                maxOutputTokens: 2000,
            },
        });

        let result = await chat.sendMessage(message);
        let response = await result.response;
        let text = response.text();

        // Function Call Loop
        let loops = 0;
        const MAX_LOOPS = 5;

        // Check for function calls
        // Gemini SDK usually helps handle this, but manual loop is safer for complex flows unless using auto-function-calling (not fully stable in all SDK versions yet).
        // Let's inspect response.functionCalls();

        let functionCalls = response.functionCalls();

        while (functionCalls && functionCalls.length > 0 && loops < MAX_LOOPS) {
            loops++;
            console.log(`[Gemini] Tool Usage Detected (Loop ${loops})`);

            const toolParts = [];

            for (const call of functionCalls) {
                const toolDef = tools.find(t =>
                    t.name.replace(/ /g, '_').replace(/[^a-zA-Z0-9_]/g, '') === call.name
                );

                if (toolDef) {
                    console.log(`[Gemini] Executing Tool: ${toolDef.name} with args:`, call.args);
                    try {
                        const toolResult = await toolDef.execute(call.args);
                        toolParts.push({
                            functionResponse: {
                                name: call.name,
                                response: {
                                    name: call.name,
                                    content: toolResult
                                }
                            }
                        });
                    } catch (e: any) {
                        toolParts.push({
                            functionResponse: {
                                name: call.name,
                                response: {
                                    name: call.name,
                                    content: `Error: ${e.message}`
                                }
                            }
                        });
                    }
                }
            }

            // Send tool results back
            if (toolParts.length > 0) {
                result = await chat.sendMessage(toolParts);
                response = await result.response;
                text = response.text();
                functionCalls = response.functionCalls();
            } else {
                break;
            }
        }

        return text;
    }
}

export const geminiClient = new GeminiClient();
