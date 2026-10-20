async function main() {
  const res = await fetch('http://localhost:3001/');
  const html = await res.text();
  const scriptRegex = /<script\s+src="([^"]+)"/g;
  let match;
  const scripts = [];
  while ((match = scriptRegex.exec(html)) !== null) {
    scripts.push(match[1]);
  }
  console.log('Scripts:', scripts);
}
main().catch(console.error);
