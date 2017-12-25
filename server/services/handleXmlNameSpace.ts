export function xsi(xml: string, xsiType: string) {
  return xml.replace('>', ` xsi:type="${xsiType}">`);
};