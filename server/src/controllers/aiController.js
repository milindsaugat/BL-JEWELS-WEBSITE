import { chatWithPriya, getSmartSearchSuggestions, generateProductDescription } from '../services/aiService.js';

export const handleChat = async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Messages array is required.' });
    }

    const reply = await chatWithPriya(messages, context);
    return res.json({ success: true, message: reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleSearchSuggest = async (req, res) => {
  try {
    const { query } = req.body;
    const suggestions = await getSmartSearchSuggestions(query);
    return res.json({ success: true, count: suggestions.length, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGenerateDescription = async (req, res) => {
  try {
    const details = req.body;
    const generated = await generateProductDescription(details);
    return res.json({ success: true, data: generated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

