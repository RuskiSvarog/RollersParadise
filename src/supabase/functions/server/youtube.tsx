import { Hono } from 'npm:hono';

const app = new Hono();

// Download audio from YouTube video
app.post('/download-audio', async (c) => {
  try {
    const { url } = await c.req.json();

    if (!url) {
      return c.json({ error: 'YouTube URL is required' }, 400);
    }

    console.log('Downloading audio from YouTube:', url);

    // Use yt-dlp to download audio only
    const command = new Deno.Command('yt-dlp', {
      args: [
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '--output', '/tmp/dice-sound.%(ext)s',
        '--no-playlist',
        '--quiet',
        '--no-warnings',
        url
      ],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
      const errorMsg = new TextDecoder().decode(stderr);
      console.error('yt-dlp error:', errorMsg);
      return c.json({ error: 'Failed to download audio', details: errorMsg }, 500);
    }

    // Read the downloaded file
    const audioFile = await Deno.readFile('/tmp/dice-sound.mp3');
    
    // Return the audio file as base64
    const base64Audio = btoa(String.fromCharCode(...audioFile));

    // Clean up
    try {
      await Deno.remove('/tmp/dice-sound.mp3');
    } catch (e) {
      console.log('Failed to clean up temp file:', e);
    }

    return c.json({ 
      success: true, 
      audio: base64Audio,
      mimeType: 'audio/mpeg'
    });

  } catch (error) {
    console.error('Error downloading YouTube audio:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

export default app;
