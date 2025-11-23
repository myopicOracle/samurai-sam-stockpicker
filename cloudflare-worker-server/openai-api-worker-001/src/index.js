import OpenAI from 'openai'

export default {
	async fetch(request, env, ctx) {
		// Handle CORS preflight requests - note that Cloudflare doesn't require CORS middleware
		if (request.method === 'OPTIONS') {
				return new Response(null, {
						headers: {
								'Access-Control-Allow-Origin': '*',
								'Access-Control-Allow-Methods': 'POST, OPTIONS',
								'Access-Control-Allow-Headers': 'Content-Type'
						}
				});
		}

		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY
		})

		try	{

			const requestData = await request.json()
			console.log(requestData)

			const messages = [
					{
							role: 'system',
							content: 'You are an equity research analyst. Given data on share prices over the past 3 days, write a report of no more than 100 words. Use the examples provided between """ to set the style your response.'
					},
					{
							role: 'user',
							content: `${JSON.stringify(requestData)}

							"""
							Apple’s Q2 earnings showed a 23% revenue decline, but its profit margin held strong at 47%. Despite short-term headwinds from tariffs and AI competition, its $3.12T market cap and consistent free cash flow suggest long-term resilience. Investors may see upside if AI strategy gains traction.
							"""

							"""
							AAPL trades at a forward P/E of 28.7, reflecting premium valuation amid slowing growth. iPhone demand remains solid, but Wall Street is watching for innovation beyond hardware. With a 0.49% dividend and strong brand loyalty, Apple remains a defensive tech play.
							"""

							`
					}
    	]

			const chatCompletion = await openai.chat.completions.create({
				model: 'gpt-4.1-nano',
				// model: 'gpt-5-mini',
				messages: messages,
				temperature: 0.9, 
				presence_penalty: 0,
				frequency_penalty: 0,            
				
			})
			const response = (chatCompletion.choices[0].message.content)

			return new Response(JSON.stringify(response), {
					headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Methods': 'POST, OPTIONS',
							'Access-Control-Allow-Headers': 'Content-Type'
					}
			});

		} catch(error) {
			return new Response(error);
		}

	},
};
