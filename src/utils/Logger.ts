export class Logger {
  private static format(mensagem: string): string {
    const hora = new Date().toISOString();
    return `[${hora}] ${mensagem}`;
  }

  static info(mensagem: string): void {
    console.log(this.format(`🎮 ${mensagem}`));
  }

  static success(mensagem: string): void {
    console.log(this.format(`✅ ${mensagem}`));
  }

  static warn(mensagem: string): void {
    console.warn(this.format(`⚠️ ${mensagem}`));
  }

  static error(mensagem: string, erro?: Error): void {
    console.error(this.format(`❌ ${mensagem}`));
    if (erro?.stack) {
      console.error(erro.stack);
    }
  }
}
