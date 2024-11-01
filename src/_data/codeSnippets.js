module.exports = async function() {
  const fetch = (await import('node-fetch')).default;

  const codeFiles = {
    manualSensorReading: 'https://raw.githubusercontent.com/ultiblox/SensorAnalog/main/examples/ManualSensorReading/ManualSensorReading.ino'
  };

  const snippets = {};

  for (const [key, url] of Object.entries(codeFiles)) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const code = await response.text();
      snippets[key] = code;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      snippets[key] = `// Error fetching code: ${error.message}`;
    }
  }

  return snippets;
};