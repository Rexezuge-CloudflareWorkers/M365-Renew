abstract class ICryptoManager {
  protected readonly cryptoKey: CryptoKey;

  constructor(cryptoKey: CryptoKey) {
    this.cryptoKey = cryptoKey;
  }
}

export { ICryptoManager };
