import json
import os
import time
import asyncio
from datetime import datetime
from playwright.async_api import async_playwright

# Load the personas
def load_personas(filepath="personas.json"):
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

# Load master prompt template
def load_prompt_template(filepath="master_prompt.txt"):
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()

def inject_persona_to_prompt(template: str, persona: dict, config: dict) -> str:
    """Injects persona and config variables into the Master Prompt template."""
    prompt = template
    
    # Inject config
    for k, v in config.items():
        prompt = prompt.replace(f"{{{{{k}}}}}", str(v))
        
    # Inject persona traits
    for k, v in persona.items():
        prompt = prompt.replace(f"{{{{persona.{k}}}}}", str(v))
        
    return prompt

async def simulate_agent_session(persona, prompt, playwright):
    """
    Spins up an isolated Playwright browser context for the synthetic agent.
    """
    print(f"\n🚀 Starting E2E Agent Run for: {persona['name']} ({persona['role']})")
    
    # Use isolated browser contexts so agents don't share cookies/state
    browser = await playwright.chromium.launch(headless=True) # Set headless=False to watch them work!
    
    # Inject fake geolocation to match the persona's city/locality
    context = await browser.new_context(
        geolocation={"latitude": persona["lat"], "longitude": persona["lng"]},
        permissions=["geolocation"]
    )
    
    page = await context.new_page()
    
    # TODO (LLM Integration): 
    # Here you pass `page` and the `prompt` to your LLM framework of choice 
    # (e.g., browser-use, LangChain Playwright Toolkit, or raw OpenAI Vision loop).
    # 
    # Example pseudo-code for the LLM loop:
    # 
    # step_count = 0
    # while step_count < MAX_STEPS:
    #     screenshot = await page.screenshot()
    #     dom_tree = await page.evaluate("() => document.body.innerHTML")
    #     
    #     action = await openai.ChatCompletion.create(
    #         messages=[{"role": "system", "content": prompt}, {"role": "user", "content": [screenshot, dom_tree]}]
    #     )
    #     
    #     execute_action(page, action)
    #     step_count += 1
    
    print(f"🤖 [Agent {persona['id']}] injected with prompt. Ready to test {config['STAGING_URL']}")
    
    # Simulating the end of an LLM task
    await asyncio.sleep(2) 
    
    await browser.close()
    print(f"✅ Finished session for: {persona['name']}")

async def main():
    personas = load_personas()
    template = load_prompt_template()
    
    # Global runner config
    global config
    config = {
        "STAGING_URL": "https://aravworks.github.io/Spectrum-hackathon/",
        "OTP_INBOX_URL": "https://aravworks.github.io/Spectrum-hackathon/dev-otp",
        "FIXTURE_DIR": "/fixtures/waste_photos/",
        "MAX_STEPS": 30,
        "MAX_MINUTES": 15
    }
    
    async with async_playwright() as p:
        # Run in waves to prevent IP blocking/rate limits. 
        # The prompt recommends 10 concurrent agents. Here we loop sequentially for safety.
        for persona in personas:
            final_prompt = inject_persona_to_prompt(template, persona, config)
            await simulate_agent_session(persona, final_prompt, p)

if __name__ == "__main__":
    asyncio.run(main())
