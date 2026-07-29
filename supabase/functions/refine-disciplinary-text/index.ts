import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OpenAI } from "https://esm.sh/openai@4.20.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const systemPrompt = `You are a Senior South African Labor Law Specialist.
Your task is to take structured facts about a restaurant incident and write a simple, clean, paragraph-based disciplinary record.

STRICT OUTPUT FORMAT RULES:
- NO HEADERS (No "Incident Narrative", No "Log Entry", etc).
- Start immediately with: "On [Day], [Date], [Employee Name] ..."
- Use formal times (e.g., 13h45 instead of 13:45).
- Write a single, flowing narrative paragraph.
- End with a clean list: "You are hereby issued with a warning for:" followed by the numbered reasons.
- Professional, objective, and neutral tone.
- NO markdown, NO bolding, NO conversational filler.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { category, facts, reasons, employeeName, date } = await req.json()

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    const userPrompt = `
      Date: ${date}
      Employee: ${employeeName}
      Facts: ${facts}
      Reasons: ${reasons.join(', ')}
    `;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
    })

    const draft = chatCompletion.choices[0].message.content

    return new Response(
      JSON.stringify({ draft }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
