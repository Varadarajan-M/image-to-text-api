require("dotenv").config();
const express = require('express');
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { urlToGenerativePart } = require('./util');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
app.use(express.json());

// Schema for the response
const responseSchema = {
  description: "Extracted key-value pairs from an image",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      key: { type: SchemaType.STRING, description: "The key of the key-value pair" },
      value: { type: SchemaType.STRING, description: "The value of the key-value pair" },
    },
  },
};

// Helper function to generate content from the model
const generateContent = async (prompt, imagePart) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });
  
  const generatedContent = await model.generateContent([prompt, imagePart]);
  return generatedContent.response.text();
};

// Endpoint to process images from URLs
app.post('/process-image', async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required" });
  }


  if (!process.env.API_KEY) {
    return res.status(400).json({ error: "API key is required" });
  }

  try {
    const imagePart = await urlToGenerativePart(imageUrl, "image/png");

    const prompt = `Extract the text content from the given image and return the information in the form of key-value pairs using this schema. If the image or text is not in the form of a key-value pair, return an empty array.`;

    const generatedText = await generateContent(prompt, imagePart);

    // Attempt to parse the generated content
    const json = JSON.parse(generatedText);
    const result = json?.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    return res.json({ results: result });
  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({ error: "Failed to process image." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
