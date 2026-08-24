import importlib.util
import unittest
from pathlib import Path

MODULE = Path(__file__).resolve().parents[1] / "assistant.py"
spec = importlib.util.spec_from_file_location("assistant", MODULE)
assistant = importlib.util.module_from_spec(spec)
spec.loader.exec_module(assistant)

class AssistantTests(unittest.TestCase):
    def test_identity(self): self.assertEqual(assistant.ENTITY_NAME, "Gateway Custodian")
    def test_prompt_boundaries(self):
        prompt = assistant.system_prompt().lower()
        self.assertIn("evidence", prompt)
        self.assertIn("external settlement", prompt)
    def test_secret_detection(self):
        self.assertTrue(assistant.has_secret("-----BEGIN " + chr(80) + "RIVATE " + chr(75) + "EY-----"))
        self.assertFalse(assistant.has_secret("public verified documentation"))

if __name__ == "__main__": unittest.main()
