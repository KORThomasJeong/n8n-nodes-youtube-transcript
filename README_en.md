# n8n-nodes-youtube-transcript

A community node for n8n that allows you to download YouTube video transcripts directly within your n8n workflows.

**Important!** If YouTube blocks your IP address, there's currently no solution I can provide. It may resolve itself over time.
You'll typically see this error:

```bash
Cannot read properties of undefined (reading 'videoId')
```

This node uses the `youtubei` library to communicate with YouTube's internal API, making it less sensitive to YouTube interface changes.

[n8n](https://n8n.io/) is a workflow automation platform with a [fair-code license](https://docs.n8n.io/reference/license/).

[Prerequisites](#prerequisites)
[Installation](#installation)
[Features](#features)
[Contributing](#contributing)
[Resources](#resources)
[License](#license)

## Prerequisites

- [n8n](https://n8n.io/) must be installed and configured.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

This node uses the `youtubei` package. Dependencies are typically resolved automatically when installing n8n nodes.

If you encounter issues, you may need to manually install `youtubei`:

```bash
npm install youtubei
```

## Features

- **YouTube Transcript Download**: Extracts transcripts from specified YouTube videos and provides them in text or JSON format for use in your workflows.

  **Important**: Not all YouTube videos have transcripts available.

### Supported URLs

This node supports extracting transcripts from YouTube videos using both `youtube.com/watch?v=example` and `youtu.be/example` URL formats. Simply provide the video URL or ID to your n8n workflow, and the node handles the rest.

## Contributing

Pull requests are welcome! If you discover issues or have suggestions for improvements:

1. **Fork the repository** and create a feature branch (`git checkout -b feature/AmazingFeature`).
2. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`).
3. **Push to the branch** (`git push origin feature/AmazingFeature`).
4. **Open a pull request**.

Please ensure your code follows the style guide and includes tests where applicable.

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

This project is licensed under the [n8n fair-code license](https://docs.n8n.io/reference/license/).
