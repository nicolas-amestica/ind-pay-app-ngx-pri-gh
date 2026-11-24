const commonDomainTypos = new Map<string, string>();

function registerDomain(domain: string, misspellings: string[], regionalEndings: string[] = []): void {
  const dot = domain.indexOf('.');
  const provider = domain.slice(0, dot);
  const ending = domain.slice(dot + 1);
  const endingTypos = ending === 'com'
    ? ['con', 'cmo', 'ocm', 'comm', 'comn', 'coom', 'vom', 'xom', 'cm']
    : ending === 'cl' ? ['lc', 'cll'] : ['nte', 'nett'];

  for (const typo of endingTypos) {
    commonDomainTypos.set(provider + '.' + typo, domain);
  }
  for (const typo of misspellings) {
    for (const suffix of [ending, ...regionalEndings, ...endingTypos]) {
      commonDomainTypos.set(typo + '.' + suffix, domain);
    }
  }
}

registerDomain('gmail.com', ['gmial', 'gamil', 'gmaill', 'gmai', 'gmal', 'gmaul', 'gnail', 'gmaik', 'gmsil', 'gemail'], ['cl']);
registerDomain('hotmail.com', ['hotmial', 'hotamil', 'hotmai', 'hotmal', 'hotnail', 'hotmaill', 'hormail', 'hitmail', 'htomail', 'hotmil'], ['cl']);
registerDomain('outlook.com', ['outlok', 'outllok', 'outloook', 'outloo', 'outlouk', 'outloik', 'outlokk', 'otulook', 'oulook'], ['cl']);
registerDomain('icloud.com', ['iclod', 'icluod', 'iclud', 'icoud', 'iclould', 'icloudd', 'iclouc', 'iclound'], ['cl']);
registerDomain('live.com', ['lvei', 'lvie', 'livve', 'llive', 'lve', 'liive', 'livw'], ['cl']);
registerDomain('yahoo.com', ['yaho', 'yhaoo', 'yahooo', 'yahho', 'yajoo'], ['cl']);
registerDomain('protonmail.com', ['protonmial', 'protonmai', 'protomail']);
registerDomain('vtr.net', ['vrt', 'vttr']);
registerDomain('uc.cl', ['ucc']);
registerDomain('uchile.cl', ['uchlie', 'uchille', 'uhcile']);
registerDomain('usach.cl', ['usacch', 'uasch', 'usachh']);

export function receiptEmailSuggestion(email: string): string | null {
  const [mailbox, domain] = email.split('@');
  const correction = commonDomainTypos.get(domain?.toLowerCase());
  return correction ? mailbox + '@' + correction : null;
}
