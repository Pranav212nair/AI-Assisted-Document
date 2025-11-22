import os
import random
from typing import Optional
import json

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")


def mock_generate(prompt: str, max_tokens: int = 200) -> str:
    # Simple mock response for testing/demo
    snippets = [
        "This section covers the main drivers, market size, and trends.",
        "Key takeaways: increasing adoption, regulatory tailwinds, and supply chain pressures.",
        "Recommended actions: prioritize partnerships and product differentiation to capture market share.",
        "Summary: The market is poised for growth, with early movers benefiting most.",
    ]
    return f"[LLM MOCK] For prompt: {prompt}\n\n" + "\n\n".join(random.sample(snippets, k=2))


def _call_google_generate(prompt_text: str, model: str = "text-bison-001", max_output_tokens: int = 512) -> Optional[str]:
    """Call Google Generative API (REST) using an API key.

    Note: set GOOGLE_API_KEY in the environment. The key must not be committed to source control.
    This function expects the public API key (if using API key auth) and calls the generate endpoint.
    """
    if not GOOGLE_API_KEY:
        return None
    try:
        import requests
        # Construct the endpoint. Use v1beta2-style path for text-bison.
        endpoint = f"https://generativelanguage.googleapis.com/v1beta2/models/{model}:generate?key={GOOGLE_API_KEY}"
        body = {
            "prompt": {"text": prompt_text},
            "temperature": 0.2,
            "maxOutputTokens": max_output_tokens,
        }
        resp = requests.post(endpoint, json=body, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        # Google returns candidates with a 'content' field
        if isinstance(data, dict):
            candidates = data.get('candidates') or data.get('outputs') or []
            if candidates:
                # Try a few common shapes
                first = candidates[0]
                if isinstance(first, dict):
                    # historical key names
                    content = first.get('content') or first.get('output') or first.get('text')
                    if content:
                        return content
                elif isinstance(first, str):
                    return first
        return None
    except Exception as e:
        print("Google Generative API call failed:", e)
        return None


def generate_section_text(title: Optional[str], prompt: Optional[str], context: Optional[str] = None) -> str:
    """Generate section text using (in order): Google Generative API (API key), OpenAI (OPENAI_API_KEY), then a mock fallback.

    The function reads API keys from environment variables; do NOT store keys in source control. Prefer setting
    GOOGLE_API_KEY or OPENAI_API_KEY as environment variables in your deployment.
    """
    full_prompt = ""
    if title:
        full_prompt += f"Title: {title}\n"
    if prompt:
        full_prompt += f"User prompt: {prompt}\n"
    if context:
        full_prompt += f"Context: {context}\n"
    full_prompt += "\nPlease generate a clear, professional section for the document."

    # 1) Try Google Generative API via API key
    if GOOGLE_API_KEY:
        try:
            out = _call_google_generate(full_prompt)
            if out:
                return out
        except Exception:
            pass

    # 2) Try OpenAI if configured
    if OPENAI_API_KEY:
        try:
            import openai
            openai.api_key = OPENAI_API_KEY
            resp = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": full_prompt}],
                max_tokens=400,
            )
            return resp.choices[0].message.content
        except Exception as e:
            print("OpenAI call failed, falling back to mock:", e)

    # 3) Final fallback: mock
    return mock_generate(full_prompt)
