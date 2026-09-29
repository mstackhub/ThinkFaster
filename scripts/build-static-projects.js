/**
 * ThinkFaster Static Project Pages Generator for Social Media OG Tags (Requirement #63)
 * Generates static HTML folders for each published project:
 * e.g., /project/spa-booking-system/index.html
 * So social crawlers (Facebook, LINE, Twitter) get 100% correct OpenGraph tags!
 */

const fs = require('fs');
const path = require('path');

const projectsDataPath = path.join(__dirname, '..', 'data', 'projects.json');
const baseTemplatePath = path.join(__dirname, '..', 'project.html');
const outDir = path.join(__dirname, '..', 'project');

if (!fs.existsSync(projectsDataPath)) {
  console.error('projects.json not found');
  process.exit(1);
}

const rawProjects = fs.readFileSync(projectsDataPath, 'utf8');
const projects = JSON.parse(rawProjects);
const baseHtml = fs.readFileSync(baseTemplatePath, 'utf8');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let count = 0;
for (const p of projects) {
  if (p.status !== 'published' && p.status !== 'coming_soon') continue;
  if (!p.slug) continue;

  const projectDir = path.join(outDir, p.slug);
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  const price = p.sale_price || p.regular_price;
  const formattedPrice = '฿' + new Intl.NumberFormat('th-TH').format(price);
  const title = `${p.name} (${formattedPrice}) | ThinkFaster`;
  const description = p.meta_description || p.short_description || `ทดลองใช้งาน Demo ระบบ ${p.name} ราคาเริ่มต้น ${formattedPrice}`;
  const ogImage = p.og_image_url || p.cover_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';
  const ogUrl = `https://thinkfaster.dev/project/${p.slug}`;

  // Replace OpenGraph meta tags in template
  let customizedHtml = baseHtml
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${description}">`)
    .replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}">`)
    .replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${description}">`)
    .replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${ogImage}">`)
    .replace(/<meta property="og:url" content=".*?"\s*\/?>/, `<meta property="og:url" content="${ogUrl}">`)
    .replace(/<meta name="twitter:title" content=".*?"\s*\/?>/, `<meta name="twitter:title" content="${title}">`)
    .replace(/<meta name="twitter:description" content=".*?"\s*\/?>/, `<meta name="twitter:description" content="${description}">`)
    .replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${ogImage}">`);

  // Fix relative paths since page is nested one directory deeper: /project/[slug]/index.html
  customizedHtml = customizedHtml
    .replace(/href="css\//g, 'href="../../css/')
    .replace(/src="js\//g, 'src="../../js/')
    .replace(/href="index\.html"/g, 'href="../../index.html"')
    .replace(/href="projects\.html"/g, 'href="../../projects.html"')
    .replace(/href="contact\.html"/g, 'href="../../contact.html"')
    .replace(/href="about\.html"/g, 'href="../../about.html"')
    .replace(/href="privacy\.html"/g, 'href="../../privacy.html"')
    .replace(/href="terms\.html"/g, 'href="../../terms.html"');

  // Inject automatic pre-fill of slug for the JS loader
  const injectScript = `
    <script>
      window.__PRELOADED_SLUG__ = "${p.slug}";
      const origGet = URLSearchParams.prototype.get;
      URLSearchParams.prototype.get = function(key) {
        if (key === 'slug') return "${p.slug}";
        return origGet.apply(this, arguments);
      };
    </script>
  `;
  customizedHtml = customizedHtml.replace('</head>', `${injectScript}\n</head>`);

  fs.writeFileSync(path.join(projectDir, 'index.html'), customizedHtml, 'utf8');
  count++;
}

console.log(`Generated ${count} static project HTML pages with pre-rendered OG tags!`);
