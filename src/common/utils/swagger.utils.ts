/**
 * Print beautiful label in console for Swagger-Documentation url
 * @param port
 */
export function printSwaggerDocLabel(port: number, isProd: boolean) {
  console.log(
    isProd
      ? `
    +-------------------------------------------------------------+
    |  ❌ Swagger Documentation is disabled in production env ❌  |
    +-------------------------------------------------------------+
    `
      : `
    +------------------------------------------------------------------------+
    |  ✅ Swagger Documentation is available on http://localhost:${port}/api ✅ |
    +------------------------------------------------------------------------+
    `,
  );
}
