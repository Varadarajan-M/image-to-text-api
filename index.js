require("dotenv").config();
const express = require('express');
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { urlToGenerativePart } = require('./util');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.use(express.json());

// Endpoint to process images from URLs
app.post('/process-image', async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required" });
  }

  try {
    // Convert the image URL to a Part object
    const imagePart = await urlToGenerativePart(imageUrl, "image/png");

    // Define the schema for the response
    const schema = {
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

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const prompt = `Extract the text content from the given image and return the information in the form of key-value pairs using this schema. If the image or text is not in the form of a key-value pair, return an empty array.`;

    // Generate content
    const generatedContent = await model.generateContent([prompt, imagePart]);

    const generatedText = generatedContent.response.text();

    try {
      const json = JSON.parse(generatedText);
      const result = json?.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {});

      return res.json({ results: result });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Failed to parse generated content." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to process image." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});