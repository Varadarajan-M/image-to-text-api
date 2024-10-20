const axios = require('axios');

// Converts image data from a URL to a GoogleGenerativeAI.Part object
exports.urlToGenerativePart = async(url, mimeType) => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return {
      inlineData: {
        data: Buffer.from(response.data).toString("base64"),
        mimeType,
      },
    };
  }