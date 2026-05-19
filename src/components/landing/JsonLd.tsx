export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "StackInit",
    "url": "https://stack-init-dev.vercel.app",
    "operatingSystem": "Web",
    "applicationCategory": "DeveloperApplication",
    "description": "The ultimate tech-stack boilerplate generator. Visually design your data models and generate production-ready Laravel, React, Next.js, and Express codebases in seconds.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Visual data modeling",
      "AI natural language import",
      "SQL DDL import",
      "ERD canvas with relations",
      "Module library",
      "Production-ready code generation"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
