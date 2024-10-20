

## Image to Text API

This API is designed specifically to extract key-value pairs from images, enabling users to perform meaningful operations with the extracted data. It leverages Google's [Gemini 1.5 Pro model](https://ai.google.dev/gemini-api/docs/models/gemini#gemini-1.5-pro) for advanced image-to-text conversions.

### Usage

To use this API, follow these steps:

1. **Send a POST request** to the `/process-image` endpoint with the image URL in the request body:

    **Request:**

    ```json
    POST /process-image
    Content-Type: application/json

    {
      "imageUrl": "https://example.com/path-to-image.png"
    }
    ```

2. **Response:** The API will return the extracted key-value pairs as JSON.

    **Response Example:**

    ```json
    {
      "results": {
        "Key1": "Value1",
        "Key2": "Value2",
        "Key3": "Value3"
      }
    }
    ```

3. If no key-value pairs are found, the API returns an empty result:

    **Response Example (No data found):**

    ```json
    {
      "results": {}
    }
    ```

### Error Handling

- If the image URL is missing, the API responds with an error:

    ```json
    {
      "error": "Image URL is required"
    }
    ```

- If there is an issue with processing the image, the API responds with:

    ```json
    {
      "error": "Failed to process image."
    }
    ```

---
