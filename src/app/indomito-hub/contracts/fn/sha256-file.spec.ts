import { sha256File } from './sha256-file';

describe('sha256File', () => {
  it('calculates the browser upload digest before requesting a signed URL', async () => {
    const file = new File(['%PDF-test'], 'contract.pdf', { type: 'application/pdf' });
    await expect(sha256File(file)).resolves.toBe(
      '3c87d37f1dbea6909f917ce437c390fb8e655a774387d9e69301c0b2283d5b63',
    );
  });
});
